"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { mapFoodProduct } from "@/lib/supabase-data";
import { Image } from "@/components/ui/image";
import { useToast } from "@/components/ui/use-toast";
import ProductForm from "./ProductForm";

const FALLBACK_PRODUCTS = [
  {
    id: 101,
    name: "Matooke",
    description: "Steamed green bananas served with rich groundnut sauce and beef stew.",
    category: "local",
    price: 10000,
    image_url: "/food/matooke-and-beef.jpg",
    available: true,
    featured: true,
  },
  {
    id: 102,
    name: "Luwombo",
    description: "Traditional steamed groundnut stew with chicken, cooked in banana leaves.",
    category: "local",
    price: 15000,
    image_url: "/food/chicken-luwombo.jpg",
    available: true,
    featured: false,
  },
  {
    id: 103,
    name: "Posho & Beef",
    description: "Creamy maize meal served with a generous portion of beef stew.",
    category: "local",
    price: 8000,
    image_url: "",
    available: true,
    featured: false,
  },
  {
    id: 104,
    name: "Rolex",
    description: "Ugandan classic — eggs rolled with chapati, onions, tomatoes, and cabbage.",
    category: "local",
    price: 5000,
    image_url: "/food/ugandan-rolex.jpg",
    available: true,
    featured: true,
  },
  {
    id: 105,
    name: "Groundnut Sauce",
    description: "Rich peanut-butter based sauce, served with rice, posho or matooke.",
    category: "local",
    price: 6000,
    image_url: "/food/matooke-with-groundnuts.jpg",
    available: false,
    featured: false,
  },
  {
    id: 106,
    name: "Chicken Burger",
    description: "Crispy chicken fillet with lettuce, tomato, and mayo on a toasted bun.",
    category: "fast",
    price: 12000,
    image_url: "/food/air-fryer-tandoori-chicken.jpg",
    available: true,
    featured: false,
  },
  {
    id: 107,
    name: "Beef Burger",
    description: "Juicy beef patty with cheddar, bacon, and special sauce.",
    category: "fast",
    price: 10000,
    image_url: "",
    available: true,
    featured: false,
  },
  {
    id: 108,
    name: "Pizza",
    description: "Stone-baked pizza with mozzarella, pepperoni, and fresh basil.",
    category: "fast",
    price: 25000,
    image_url: "/food/cheesy-bbq-chicken-pizza.webp",
    available: true,
    featured: true,
  },
  {
    id: 109,
    name: "Chips",
    description: "Golden crispy French fries served with ketchup and mayo.",
    category: "fast",
    price: 5000,
    image_url: "/food/chips-and-chicken.jpg",
    available: true,
    featured: false,
  },
  {
    id: 110,
    name: "Hot Dog",
    description: "Grilled sausage in a soft bun with onions, mustard, and relish.",
    category: "fast",
    price: 7000,
    image_url: "",
    available: false,
    featured: false,
  },
  {
    id: 111,
    name: "Passion Juice",
    description: "Freshly blended passion fruit juice — sweet, tangy, and chilled.",
    category: "drinks",
    price: 4000,
    image_url: "",
    available: true,
    featured: false,
  },
  {
    id: 112,
    name: "Mango Juice",
    description: "Sweet ripe mango juice, freshly blended and served over ice.",
    category: "drinks",
    price: 4000,
    image_url: "",
    available: true,
    featured: false,
  },
  {
    id: 113,
    name: "Soda",
    description: "Assorted chilled sodas — Coke, Fanta, Sprite, and more.",
    category: "drinks",
    price: 2500,
    image_url: "/food/coca-cola.jpg",
    available: true,
    featured: false,
  },
  {
    id: 114,
    name: "Coffee",
    description: "Rich Ugandan Arabica coffee, brewed fresh.",
    category: "drinks",
    price: 5000,
    image_url: "",
    available: true,
    featured: false,
  },
  {
    id: 115,
    name: "Tea",
    description: "Hot spiced chai tea with milk and ginger.",
    category: "drinks",
    price: 3000,
    image_url: "",
    available: true,
    featured: false,
  },
];

import {
  Plus,
  Pencil,
  Trash2,
  Flame,
  Eye,
  EyeOff,
  Search,
  X,
  ChevronDown,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function AdminMenu() {
  const { toast } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;

  const load = () =>
    supabase
      .from("food_items")
      .select("*, categories!inner(category_code)")
      .order("item_id", { ascending: true })
      .then(({ data, error }) => {
        if (error) {
          console.error("Failed to load products:", error.message);
          setProducts(FALLBACK_PRODUCTS);
          return;
        }
        if (data && data.length > 0) {
          setProducts(data.map(mapFoodProduct));
        } else {
          setProducts(FALLBACK_PRODUCTS);
        }
      })
      .catch((err) => {
        console.error("Failed to load products:", err);
        // Only use fallback if we have nothing — don't replace real data
        setProducts((prev) => (prev.length > 0 ? prev : FALLBACK_PRODUCTS));
      });

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  // Reset to first page when search or filter changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset derived UI state on filter change
    setPage(0);
  }, [searchQuery, categoryFilter]);

  const toggleAvailable = async (p) => {
    const isFallback = p.id > 100;
    if (!isFallback) {
      await supabase.from("food_items").update({ is_available: !p.available }).eq("item_id", p.id);
    }
    setProducts((prev) => prev.map((x) => (x.id === p.id ? { ...x, available: !x.available } : x)));
    toast({
      title: p.available ? "Item hidden" : "Item visible",
      description: `"${p.name}" is now ${p.available ? "hidden from" : "visible on"} the menu.`,
    });
  };

  const remove = async (p) => {
    if (!confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    const isFallback = p.id > 100;
    if (!isFallback) {
      await supabase.from("food_items").delete().eq("item_id", p.id);
    }
    setProducts((prev) => prev.filter((x) => x.id !== p.id));
    toast({
      title: "Item deleted",
      description: `"${p.name}" has been removed from the menu.`,
    });
  };

  const onSaved = () => {
    setShowForm(false);
    setEditing(null);
    setPage(0);
    load();
  };

  // ── Filtering & sorting ──
  let filtered = products;
  if (searchQuery)
    filtered = filtered.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
  if (categoryFilter !== "all") filtered = filtered.filter((p) => p.category === categoryFilter);

  filtered = [...filtered].sort((a, b) => {
    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (sortBy === "price") return a.price - b.price;
    if (sortBy === "category") return a.category.localeCompare(b.category);
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(filtered.length / rowsPerPage) || 1;
  const paged = filtered.slice(page * rowsPerPage, (page + 1) * rowsPerPage);

  const categoryLabel = (cat) => {
    switch (cat) {
      case "local":
        return "Local";
      case "fast":
        return "Fast";
      case "drinks":
        return "Drinks";
      default:
        return cat;
    }
  };

  const categoryBadge = (cat) => {
    switch (cat) {
      case "local":
        return "bg-amber-50 text-amber-800 border-amber-200";
      case "fast":
        return "bg-red-50 text-red-800 border-red-200";
      case "drinks":
        return "bg-sky-50 text-sky-800 border-sky-200";
      default:
        return "bg-stone-50 text-stone-600 border-stone-200";
    }
  };

  return (
    <div>
      {/* ── Top bar: search, filters, add button ── */}
      <div className="bg-canvas border border-hairline rounded-sm p-4 mb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-ink-mute">
            <span className="font-medium text-ink">{products.length}</span>
            items total
            <span className="text-hairline-strong mx-1">·</span>
            <span className="text-emerald-deep">{products.filter((p) => p.available).length}</span>
            visible
          </div>
          <button
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
            className="inline-flex items-center gap-2 text-sm font-medium text-on-emerald bg-emerald hover:bg-emerald-deep active:bg-emerald-deep transition-all duration-150 px-4 py-2 rounded-sm shrink-0"
          >
            <Plus size={15} /> Add Food Item
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3 mt-4">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint pointer-events-none"
            />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search food items..."
              className="w-full pl-9 pr-8 py-2 bg-canvas border border-hairline-strong rounded-sm text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-emerald focus:ring-1 focus:ring-emerald/20 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink-mute transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Category filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-canvas border border-hairline-strong rounded-sm text-sm text-ink focus:outline-none focus:border-emerald focus:ring-1 focus:ring-emerald/20 transition-all appearance-none cursor-pointer"
          >
            <option value="all">All Categories</option>
            <option value="local">Local Foods</option>
            <option value="fast">Fast Foods</option>
            <option value="drinks">Drinks</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 bg-canvas border border-hairline-strong rounded-sm text-sm text-ink focus:outline-none focus:border-emerald focus:ring-1 focus:ring-emerald/20 transition-all appearance-none cursor-pointer"
          >
            <option value="name">Sort by Name</option>
            <option value="price">Sort by Price</option>
            <option value="category">Sort by Category</option>
          </select>
        </div>
      </div>

      {/* ── Table ── */}
      {loading ? (
        <div className="bg-canvas border border-hairline rounded-sm overflow-hidden">
          <div className="p-6 space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 animate-pulse">
                <div className="w-12 h-12 bg-stone-100 rounded-sm shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/3 bg-stone-100 rounded" />
                  <div className="h-3 w-1/4 bg-stone-100 rounded" />
                </div>
                <div className="h-4 w-16 bg-stone-100 rounded" />
                <div className="h-4 w-12 bg-stone-100 rounded" />
                <div className="h-6 w-16 bg-stone-100 rounded" />
                <div className="h-6 w-16 bg-stone-100 rounded" />
              </div>
            ))}
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-canvas border border-hairline rounded-sm p-12 text-center">
          <div className="w-14 h-14 rounded-sm bg-canvas-soft flex items-center justify-center mx-auto mb-4 border border-hairline-cool">
            <Search size={22} className="text-ink-faint" />
          </div>
          <p className="text-sm font-medium text-ink mb-1">
            {searchQuery || categoryFilter !== "all"
              ? "No items match your search"
              : "No food items yet"}
          </p>
          <p className="text-xs text-ink-mute mb-5">
            {searchQuery || categoryFilter !== "all"
              ? "Try a different search term or filter."
              : "Add your first food item to get started."}
          </p>
          {!searchQuery && categoryFilter === "all" && (
            <button
              onClick={() => {
                setEditing(null);
                setShowForm(true);
              }}
              className="inline-flex items-center gap-2 text-sm font-medium text-on-emerald bg-emerald hover:bg-emerald-deep transition-all duration-150 px-4 py-2 rounded-sm"
            >
              <Plus size={15} /> Add Food Item
            </button>
          )}
        </div>
      ) : (
        <div className="bg-canvas border border-hairline rounded-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-hairline bg-canvas-soft/80">
                  <th className="text-left px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-ink-mute w-14">
                    Image
                  </th>
                  <th className="text-left px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-ink-mute">
                    Food Name
                  </th>
                  <th className="text-left px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-ink-mute">
                    Category
                  </th>
                  <th className="text-right px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-ink-mute">
                    Price
                  </th>
                  <th className="text-center px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-ink-mute">
                    Available
                  </th>
                  <th className="text-center px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-ink-mute">
                    Featured
                  </th>
                  <th className="text-center px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-ink-mute w-28">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {paged.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-hairline-cool hover:bg-canvas-soft/30 transition-colors group"
                  >
                    {/* Image */}
                    <td className="px-4 py-3">
                      <div className="w-12 h-12 rounded-[4px] overflow-hidden bg-canvas-soft border border-hairline-cool shrink-0">
                        {p.image_url ? (
                          <img
                            src={p.image_url}
                            alt={p.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-[10px] text-ink-faint">—</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Name + Description */}
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-ink truncate max-w-[220px]">
                        {p.name}
                      </p>
                      {p.description && (
                        <p className="text-xs text-ink-mute truncate max-w-[220px] mt-0.5 leading-relaxed">
                          {p.description}
                        </p>
                      )}
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.1em] px-2.5 py-1 rounded-[4px] border ${categoryBadge(p.category)}`}
                      >
                        {categoryLabel(p.category)}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-medium text-ink tabular-nums">
                        UGX {Number(p.price).toLocaleString()}
                      </span>
                    </td>

                    {/* Available */}
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggleAvailable(p)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] text-[10px] font-medium uppercase tracking-wider border transition-all duration-200 ${
                          p.available
                            ? "bg-emerald/10 text-emerald-deep border-emerald/30 hover:bg-emerald/20"
                            : "bg-stone-100 text-stone-400 border-stone-200 hover:bg-stone-200"
                        }`}
                      >
                        {p.available ? <Eye size={11} /> : <EyeOff size={11} />}
                        {p.available ? "Yes" : "No"}
                      </button>
                    </td>

                    {/* Featured */}
                    <td className="px-4 py-3 text-center">
                      {p.featured ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[4px] bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-medium uppercase tracking-wider">
                          <Flame size={10} /> Yes
                        </span>
                      ) : (
                        <span className="text-xs text-ink-faint">—</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => {
                            setEditing(p);
                            setShowForm(true);
                          }}
                          className="p-1.5 rounded-[4px] text-ink-faint hover:text-ink hover:bg-canvas-soft transition-all"
                          aria-label={`Edit ${p.name}`}
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => remove(p)}
                          className="p-1.5 rounded-[4px] text-ink-faint hover:text-accent-tomato hover:bg-red-50 transition-all"
                          aria-label={`Delete ${p.name}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination & Footer */}
          <div className="px-4 py-3 border-t border-hairline-cool flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-3 text-xs text-ink-faint">
              <span>
                {page * rowsPerPage + 1}–{Math.min((page + 1) * rowsPerPage, filtered.length)} of{" "}
                {filtered.length} items
              </span>
              <span className="text-hairline-strong">|</span>
              <span className="text-ink-mute">
                {products.filter((p) => p.available).length} visible ·{" "}
                {products.filter((p) => !p.available).length} hidden ·{" "}
                {products.filter((p) => p.featured).length} featured
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="p-1.5 rounded-[4px] text-ink-mute hover:text-ink hover:bg-canvas-soft disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                aria-label="Previous page"
              >
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  className={`w-7 h-7 rounded-[4px] text-xs font-medium transition-all ${
                    page === i
                      ? "bg-emerald text-on-emerald"
                      : "text-ink-mute hover:text-ink hover:bg-canvas-soft"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                className="p-1.5 rounded-[4px] text-ink-mute hover:text-ink hover:bg-canvas-soft disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                aria-label="Next page"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {showForm && <ProductForm product={editing} onClose={onSaved} />}
    </div>
  );
}
