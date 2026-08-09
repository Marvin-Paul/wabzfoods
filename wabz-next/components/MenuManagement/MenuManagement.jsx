"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabaseClient";
import StatsCards from "./StatsCards";
import CategorySidebar from "./CategorySidebar";
import FoodTable from "./FoodTable";
import AddFoodDialog from "./AddFoodDialog";
import DeleteDialog from "./DeleteDialog";

// ── Fallback sample data (used when Supabase tables are empty) ──
const FALLBACK_CATEGORIES = [
  { id: "cat-local", name: "Local Foods", slug: "local-foods", itemCount: 5 },
  { id: "cat-fast", name: "Fast Foods", slug: "fast-foods", itemCount: 5 },
  { id: "cat-drinks", name: "Drinks", slug: "drinks", itemCount: 5 },
];

const FALLBACK_FOOD_ITEMS = [
  {
    id: "f1",
    name: "Matooke",
    description: "Steamed green bananas served with rich groundnut sauce and beef stew.",
    price: 10000,
    image: "",
    categoryId: "cat-local",
    available: true,
    featured: true,
    createdAt: "2026-01-15",
  },
  {
    id: "f2",
    name: "Luwombo",
    description: "Traditional steamed groundnut stew with chicken, cooked in banana leaves.",
    price: 15000,
    image: "",
    categoryId: "cat-local",
    available: true,
    featured: true,
    createdAt: "2026-01-20",
  },
  {
    id: "f3",
    name: "Posho & Beef",
    description: "Smooth maize posho served with slow-cooked beef stew and vegetables.",
    price: 8000,
    image: "",
    categoryId: "cat-local",
    available: true,
    featured: false,
    createdAt: "2026-02-01",
  },
  {
    id: "f4",
    name: "Rolex",
    description: "The iconic Kampala street food — eggs & vegetables rolled in a fresh chapati.",
    price: 4000,
    image: "",
    categoryId: "cat-local",
    available: true,
    featured: true,
    createdAt: "2026-02-10",
  },
  {
    id: "f5",
    name: "Groundnut Sauce",
    description: "Rich peanut-butter based sauce, served with rice, posho or matooke.",
    price: 6000,
    image: "",
    categoryId: "cat-local",
    available: false,
    featured: false,
    createdAt: "2026-02-15",
  },
  {
    id: "f6",
    name: "Chicken Burger",
    description: "Crispy chicken fillet with lettuce, tomato, and mayo on a toasted bun.",
    price: 12000,
    image: "",
    categoryId: "cat-fast",
    available: true,
    featured: true,
    createdAt: "2026-02-20",
  },
  {
    id: "f7",
    name: "Beef Burger",
    description: "Juicy beef patty with cheddar, bacon, and special sauce.",
    price: 10000,
    image: "",
    categoryId: "cat-fast",
    available: true,
    featured: false,
    createdAt: "2026-03-01",
  },
  {
    id: "f8",
    name: "Pizza",
    description: "Wood-fired pizza with mozzarella, pepperoni, and fresh basil.",
    price: 25000,
    image: "",
    categoryId: "cat-fast",
    available: true,
    featured: true,
    createdAt: "2026-03-05",
  },
  {
    id: "f9",
    name: "Chips",
    description: "Golden crispy French fries served with ketchup and mayo.",
    price: 5000,
    image: "",
    categoryId: "cat-fast",
    available: true,
    featured: false,
    createdAt: "2026-03-10",
  },
  {
    id: "f10",
    name: "Hot Dog",
    description: "Grilled sausage in a soft bun with onions, mustard, and relish.",
    price: 7000,
    image: "",
    categoryId: "cat-fast",
    available: false,
    featured: false,
    createdAt: "2026-03-15",
  },
  {
    id: "f11",
    name: "Passion Juice",
    description: "Freshly blended passion fruit juice — sweet, tangy, and chilled.",
    price: 4000,
    image: "",
    categoryId: "cat-drinks",
    available: true,
    featured: true,
    createdAt: "2026-03-20",
  },
  {
    id: "f12",
    name: "Mango Juice",
    description: "Sweet ripe mango juice, freshly blended and served over ice.",
    price: 4000,
    image: "",
    categoryId: "cat-drinks",
    available: true,
    featured: false,
    createdAt: "2026-03-25",
  },
  {
    id: "f13",
    name: "Soda",
    description: "Coke, Fanta Orange, Sprite, or Mineral Water — ice cold.",
    price: 2500,
    image: "",
    categoryId: "cat-drinks",
    available: true,
    featured: false,
    createdAt: "2026-04-01",
  },
  {
    id: "f14",
    name: "Coffee",
    description: "Rich Ugandan Arabica coffee, brewed fresh.",
    price: 5000,
    image: "",
    categoryId: "cat-drinks",
    available: true,
    featured: true,
    createdAt: "2026-04-05",
  },
  {
    id: "f15",
    name: "Tea",
    description: "Classic English breakfast or spiced masala chai.",
    price: 3000,
    image: "",
    categoryId: "cat-drinks",
    available: true,
    featured: false,
    createdAt: "2026-04-10",
  },
];

/* ── Helpers to convert between UI model and Supabase columns ── */

function catToSupabase(cat) {
  return {
    category_code: cat.slug || cat.name.toLowerCase().replace(/\s+/g, "-"),
    name: cat.name,
    icon: "utensils",
    sort_order: 0,
    is_active: true,
  };
}

function catFromSupabase(row) {
  return { id: String(row.category_id), name: row.name, slug: row.category_code, itemCount: 0 };
}

function foodToSupabase(item) {
  return {
    name: item.name,
    description: item.description || "",
    price: Number(item.price),
    image_url: item.image || "",
    category_id: Number(item.categoryId) || item.categoryId,
    is_available: item.available !== false,
    is_featured: !!item.featured,
    prep_time: item.prep_time || "15-20 mins",
    calories: item.calories || "~450 kcal",
  };
}

function foodFromSupabase(row, catMap) {
  const catId = String(row.category_id);
  const id = String(row.item_id);
  return {
    id,
    name: row.name,
    description: row.description || "",
    price: Number(row.price),
    image: row.image_url || "",
    image_url: row.image_url || "",
    categoryId: catId,
    available: row.is_available !== false,
    featured: !!row.is_featured,
    createdAt: row.created_at || new Date().toISOString().split("T")[0],
  };
}

export default function MenuManagement() {
  const { toast } = useToast();

  const [categories, setCategories] = useState([]);
  const [foodItems, setFoodItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [viewDetails, setViewDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);

  // ── Initial load: try Supabase, fall back to localStorage → sample data ──
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        // Try fetching categories from Supabase
        let { data: supCats, error: catErr } = await supabase
          .from("categories")
          .select("*")
          .order("sort_order", { ascending: true })
          .order("category_id", { ascending: true });

        if (catErr || !supCats || supCats.length === 0) {
          // Fallback: localStorage → sample data
          const stored = localStorage.getItem("mm-categories");
          const cats = stored ? JSON.parse(stored) : FALLBACK_CATEGORIES;
          const items = localStorage.getItem("mm-foodItems")
            ? JSON.parse(localStorage.getItem("mm-foodItems"))
            : FALLBACK_FOOD_ITEMS;
          if (!cancelled) {
            setCategories(cats);
            setFoodItems(items);
            setUsingFallback(true);
            setLoading(false);
          }
          return;
        }

        // Build category map for food item conversion
        const catMap = {};
        supCats.forEach((c) => {
          catMap[c.category_id] = c;
        });

        // Try fetching food items from Supabase
        let { data: supItems, error: itemErr } = await supabase
          .from("food_items")
          .select("*")
          .order("item_id", { ascending: true });

        const items =
          supItems && supItems.length > 0
            ? supItems.map((r) => foodFromSupabase(r, catMap))
            : FALLBACK_FOOD_ITEMS;

        if (!cancelled) {
          setCategories(supCats.map(catFromSupabase));
          setFoodItems(items);
          setUsingFallback(!supItems || supItems.length === 0);
          setLoading(false);
        }
      } catch (err) {
        // Network error or tables don't exist — use fallback
        const stored = localStorage.getItem("mm-categories");
        const cats = stored ? JSON.parse(stored) : FALLBACK_CATEGORIES;
        const items = localStorage.getItem("mm-foodItems")
          ? JSON.parse(localStorage.getItem("mm-foodItems"))
          : FALLBACK_FOOD_ITEMS;
        if (!cancelled) {
          setCategories(cats);
          setFoodItems(items);
          setUsingFallback(true);
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // ── Persist to localStorage when using fallback ──
  useEffect(() => {
    if (usingFallback) {
      localStorage.setItem("mm-categories", JSON.stringify(categories));
    }
  }, [categories, usingFallback]);
  useEffect(() => {
    if (usingFallback) {
      localStorage.setItem("mm-foodItems", JSON.stringify(foodItems));
    }
  }, [foodItems, usingFallback]);

  // ── Derived: filtered food items based on selected category ──
  const filteredItems = useMemo(() => {
    if (!selectedCategory) return foodItems;
    return foodItems.filter(
      (i) => i.categoryId === String(selectedCategory.id) || i.categoryId === selectedCategory.id
    );
  }, [foodItems, selectedCategory]);

  // ── Category CRUD ──
  const handleAddCategory = useCallback(
    async (cat) => {
      if (!usingFallback) {
        const { data, error } = await supabase
          .from("categories")
          .insert(catToSupabase(cat))
          .select()
          .single();
        if (error) {
          toast({ title: "Error", description: error.message });
          return;
        }
        const newCat = catFromSupabase(data);
        setCategories((prev) => [...prev, newCat]);
        toast({ title: "Category added", description: `"${cat.name}" has been created.` });
      } else {
        const newCat = { ...cat, id: "cat-" + Date.now(), itemCount: 0 };
        setCategories((prev) => [...prev, newCat]);
        toast({
          title: "Category added",
          description: `"${cat.name}" has been created (offline).`,
        });
      }
    },
    [usingFallback, toast]
  );

  const handleEditCategory = useCallback(
    async (id, updates) => {
      if (!usingFallback) {
        const { error } = await supabase
          .from("categories")
          .update({ name: updates.name, category_code: updates.slug })
          .eq("category_id", Number(id));
        if (error) {
          toast({ title: "Error", description: error.message });
          return;
        }
      }
      setCategories((prev) =>
        prev.map((c) => (c.id === id ? { ...c, name: updates.name, slug: updates.slug } : c))
      );
      toast({ title: "Category updated", description: `"${updates.name}" has been updated.` });
    },
    [usingFallback, toast]
  );

  const handleDeleteCategory = useCallback(
    async (id) => {
      if (!usingFallback) {
        const { error } = await supabase.from("categories").delete().eq("category_id", Number(id));
        if (error) {
          toast({ title: "Error", description: error.message });
          return;
        }
      }
      setCategories((prev) => prev.filter((c) => c.id !== id));
      if (selectedCategory?.id === id) setSelectedCategory(null);
    },
    [usingFallback, selectedCategory, toast]
  );

  // ── Food Item CRUD ──
  const handleSaveFood = useCallback(
    async (formData) => {
      if (editItem) {
        // Update
        if (!usingFallback) {
          const { error } = await supabase
            .from("food_items")
            .update(foodToSupabase(formData))
            .eq("item_id", Number(editItem.id));
          if (error) {
            toast({ title: "Error", description: error.message });
            return;
          }
        }
        setFoodItems((prev) =>
          prev.map((i) =>
            i.id === editItem.id
              ? { ...i, ...formData, id: editItem.id, createdAt: editItem.createdAt }
              : i
          )
        );
        toast({ title: "Updated", description: `"${formData.name}" has been updated.` });
      } else {
        // Create
        if (!usingFallback) {
          const { data, error } = await supabase
            .from("food_items")
            .insert(foodToSupabase(formData))
            .select()
            .single();
          if (error) {
            toast({ title: "Error", description: error.message });
            return;
          }
          const catMap = {};
          categories.forEach((c) => {
            catMap[String(c.id)] = c;
          });
          const newItem = foodFromSupabase(data, catMap);
          setFoodItems((prev) => [...prev, newItem]);
        } else {
          const newItem = {
            ...formData,
            id: "f" + Date.now(),
            createdAt: new Date().toISOString().split("T")[0],
          };
          setFoodItems((prev) => [...prev, newItem]);
        }
        toast({ title: "Added", description: `"${formData.name}" has been added to the menu.` });
      }
    },
    [editItem, usingFallback, categories, toast]
  );

  const handleDeleteFood = useCallback(async () => {
    if (!deleteItem) return;
    if (!usingFallback) {
      const { error } = await supabase
        .from("food_items")
        .delete()
        .eq("item_id", Number(deleteItem.id));
      if (error) {
        toast({ title: "Error", description: error.message });
        setDeleteItem(null);
        return;
      }
    }
    setFoodItems((prev) => prev.filter((i) => i.id !== deleteItem.id));
    toast({ title: "Deleted", description: `"${deleteItem.name}" has been removed.` });
    setDeleteItem(null);
  }, [deleteItem, usingFallback, toast]);

  const handleToggleAvailable = useCallback(
    async (item) => {
      const newAvailable = !item.available;
      if (!usingFallback) {
        await supabase
          .from("food_items")
          .update({ is_available: newAvailable })
          .eq("item_id", Number(item.id));
      }
      setFoodItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, available: newAvailable } : i))
      );
      toast({
        title: newAvailable ? "Marked as Available" : "Marked as Unavailable",
        description: `"${item.name}" is now ${newAvailable ? "available" : "out of stock"}.`,
      });
    },
    [usingFallback, toast]
  );

  // ── Re-count category item counts when foodItems changes ──
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- derived category counts keyed off foodItems
    setCategories((prev) =>
      prev.map((cat) => ({
        ...cat,
        itemCount: foodItems.filter((i) => String(i.categoryId) === String(cat.id)).length,
      }))
    );
  }, [foodItems]);

  // ── Loading skeletons ──
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="h-6 w-48 bg-canvas-soft rounded animate-pulse" />
            <div className="h-4 w-72 bg-canvas-soft rounded animate-pulse mt-2" />
          </div>
          <div className="h-9 w-32 bg-canvas-soft rounded-sm animate-pulse" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-canvas border border-hairline rounded-sm p-5 animate-pulse">
              <div className="w-10 h-10 rounded-[4px] bg-canvas-soft mb-3" />
              <div className="h-7 w-16 bg-canvas-soft rounded mb-1" />
              <div className="h-3 w-24 bg-canvas-soft rounded" />
            </div>
          ))}
        </div>
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-64 shrink-0">
            <div className="bg-canvas border border-hairline rounded-sm p-5 animate-pulse space-y-3">
              <div className="h-4 w-20 bg-canvas-soft rounded" />
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-9 bg-canvas-soft rounded-sm" />
              ))}
            </div>
          </div>
          <div className="flex-1">
            <div className="bg-canvas border border-hairline rounded-sm animate-pulse">
              <div className="p-4 border-b border-hairline-cool space-y-3">
                <div className="h-9 bg-canvas-soft rounded-sm" />
                <div className="h-8 bg-canvas-soft rounded-sm" />
              </div>
              <div className="p-4 space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 bg-canvas-soft rounded-sm" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-[22px] font-medium text-ink tracking-tight">Menu Management</h2>
          <p className="text-sm text-ink-mute mt-1">
            Manage your restaurant menu — add, edit, and organise food items by category.
            {usingFallback && (
              <span className="text-accent-tomato ml-2 text-xs">
                (offline mode — data saved to browser)
              </span>
            )}
          </p>
        </div>
        <button
          onClick={() => {
            setEditItem(null);
            setShowAddDialog(true);
          }}
          className="inline-flex items-center gap-2 text-sm font-medium text-on-emerald bg-emerald hover:bg-emerald-deep transition-all duration-150 px-4 py-2 rounded-sm shrink-0"
        >
          <Plus size={16} />
          Add Food Item
        </button>
      </div>

      {/* Stats Cards */}
      <StatsCards categories={categories} foodItems={foodItems} />

      {/* Main layout: sidebar + table */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Category Sidebar */}
        <div className="w-full lg:w-64 shrink-0">
          <CategorySidebar
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            onAddCategory={handleAddCategory}
            onEditCategory={handleEditCategory}
            onDeleteCategory={handleDeleteCategory}
          />
        </div>

        {/* Food Table */}
        <div className="flex-1 min-w-0">
          <FoodTable
            foodItems={filteredItems}
            categories={categories}
            onEdit={(item) => {
              setEditItem(item);
              setShowAddDialog(true);
            }}
            onDelete={(item) => setDeleteItem(item)}
            onView={(item) => setViewDetails(item)}
            onToggleAvailable={handleToggleAvailable}
          />

          {/* View Details panel */}
          {viewDetails && (
            <div className="mt-4 bg-canvas border border-hairline rounded-sm p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-medium text-ink">{viewDetails.name}</h3>
                  <p className="text-sm text-ink-mute mt-0.5">
                    {viewDetails.description || "No description"}
                  </p>
                </div>
                <button
                  onClick={() => setViewDetails(null)}
                  className="text-xs font-medium text-ink-mute hover:text-ink transition-colors"
                >
                  Close
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 pt-4 border-t border-hairline-cool">
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-ink-faint font-medium">
                    Price
                  </p>
                  <p className="text-sm font-medium text-ink mt-0.5">
                    UGX {Number(viewDetails.price).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-ink-faint font-medium">
                    Category
                  </p>
                  <p className="text-sm font-medium text-ink mt-0.5">
                    {categories.find((c) => String(c.id) === String(viewDetails.categoryId))
                      ?.name || "\u2014"}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-ink-faint font-medium">
                    Status
                  </p>
                  <p className="text-sm font-medium text-ink mt-0.5">
                    {viewDetails.available ? "Available" : "Out of Stock"}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-ink-faint font-medium">
                    Featured
                  </p>
                  <p className="text-sm font-medium text-ink mt-0.5">
                    {viewDetails.featured ? "Yes" : "No"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <AddFoodDialog
        open={showAddDialog}
        onClose={() => {
          setShowAddDialog(false);
          setEditItem(null);
        }}
        onSave={handleSaveFood}
        editItem={editItem}
        categories={categories}
      />

      {/* Delete Confirmation */}
      <DeleteDialog
        open={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleDeleteFood}
        title="Delete Food Item"
        description={`Are you sure you want to delete "${deleteItem?.name}"? This action cannot be undone.`}
      />
    </div>
  );
}
