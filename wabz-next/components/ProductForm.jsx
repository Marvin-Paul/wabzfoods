"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/components/ui/use-toast";
import MediaPicker from "./MediaPicker/MediaPicker";
import { X } from "lucide-react";

const EMPTY = {
  name: "",
  description: "",
  category: "local",
  price: "",
  image_url: "",
  available: true,
  featured: false,
  subcategory: "",
};

export default function ProductForm({ product, onClose }) {
  const { toast } = useToast();
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [catMap, setCatMap] = useState({});
  const [catLoading, setCatLoading] = useState(true);

  const isEdit = !!product;

  useEffect(() => {
    // Build category code → category_id map on mount
    supabase
      .from("categories")
      .select("category_id, category_code")
      .then(({ data, error }) => {
        if (error) {
          console.error("Failed to load categories:", error.message);
          toast({ title: "Error", description: "Failed to load categories: " + error.message });
          return;
        }
        const map = {};
        for (const c of data || []) map[c.category_code] = c.category_id;
        setCatMap(map);
      })
      .catch((err) => {
        console.error("Failed to load categories:", err);
        toast({ title: "Error", description: "Failed to load categories. Check your connection." });
      })
      .finally(() => setCatLoading(false));
  }, []);

  useEffect(() => {
    if (product) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sync form when editing a different product
      setForm({
        ...product,
        subcategory: product.subcategory || "",
        price: String(product.price ?? ""),
      });
    }
  }, [product]);

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);

    // Wait for categories to load if they haven't yet
    if (catLoading) {
      toast({ title: "Please wait", description: "Categories are still loading..." });
      setSaving(false);
      return;
    }

    const categoryId = catMap[form.category];
    if (!categoryId) {
      toast({ title: "Error", description: "Invalid category selected. Try refreshing the page." });
      setSaving(false);
      return;
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      image_url: form.image_url.trim(),
      category_id: categoryId,
      is_available: !!form.available,
      is_featured: !!form.featured,
    };

    if (!payload.name) {
      toast({ title: "Error", description: "Food name is required." });
      setSaving(false);
      return;
    }
    if (!payload.price || payload.price <= 0) {
      toast({ title: "Error", description: "Please enter a valid price." });
      setSaving(false);
      return;
    }

    try {
      let result;
      if (isEdit) {
        result = await supabase
          .from("food_items")
          .update(payload)
          .eq("item_id", product.id)
          .select();
      } else {
        result = await supabase.from("food_items").insert(payload).select();
      }

      if (result.error) {
        toast({
          title: "Database error",
          description: result.error.message,
        });
        setSaving(false);
        return;
      }

      toast({
        title: isEdit ? "Item updated" : "Item added",
        description: `"${payload.name}" has been ${isEdit ? "updated" : "added to the menu"}.`,
      });
      onClose();
    } catch (err) {
      toast({
        title: "Error",
        description: "Could not save: " + (err?.message || err || "Unknown error"),
      });
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[90] bg-ink/30 flex items-center justify-center p-4">
      <div className="bg-canvas rounded-sm w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-level-3 border border-hairline">
        {/* Header */}
        <div className="sticky top-0 bg-canvas flex items-center justify-between px-6 py-4 border-b border-hairline z-10">
          <h2 className="text-[18px] font-medium text-ink tracking-tight">
            {isEdit ? "Edit Dish" : "New Dish"}
          </h2>
          <button onClick={onClose} className="text-ink-mute hover:text-ink transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={submit} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-medium uppercase tracking-wider text-ink-mute">
              Name
            </label>
            <input
              required
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              className="mt-1.5 w-full px-3 py-2 bg-canvas border border-hairline-strong rounded-sm text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-emerald focus:ring-1 focus:ring-emerald/20 transition-all"
            />
          </div>

          <div>
            <label className="text-xs font-medium uppercase tracking-wider text-ink-mute">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              rows={2}
              className="mt-1.5 w-full px-3 py-2 bg-canvas border border-hairline-strong rounded-sm text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium uppercase tracking-wider text-ink-mute">
                Category
              </label>
              <select
                value={form.category}
                onChange={(e) => setField("category", e.target.value)}
                className="mt-1.5 w-full px-3 py-2 bg-canvas border border-hairline-strong rounded-sm text-sm text-ink focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
              >
                <option value="local">Local</option>
                <option value="fast">Fast Food</option>
                <option value="drinks">Drinks</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium uppercase tracking-wider text-ink-mute">
                Subcategory
              </label>
              <select
                value={form.subcategory}
                onChange={(e) => setField("subcategory", e.target.value)}
                className="mt-1.5 w-full px-3 py-2 bg-canvas border border-hairline-strong rounded-sm text-sm text-ink focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
              >
                <option value="">— Auto-detect —</option>
                <option value="grilled">Grilled</option>
                <option value="fried">Fried</option>
                <option value="stews">Stews</option>
                <option value="sides">Sides</option>
                <option value="local">Local Classics</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium uppercase tracking-wider text-ink-mute">
              Price (UGX)
            </label>
            <input
              required
              type="number"
              value={form.price}
              onChange={(e) => setField("price", e.target.value)}
              className="mt-1.5 w-full px-3 py-2 bg-canvas border border-hairline-strong rounded-sm text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-emerald focus:ring-1 focus:ring-emerald/20 transition-all"
            />
          </div>

          <MediaPicker value={form.image_url} onChange={(url) => setField("image_url", url)} />

          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.available}
                onChange={(e) => setField("available", e.target.checked)}
                className="w-4 h-4 accent-emerald"
              />
              <span className="text-sm text-ink-secondary">Available on menu</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => setField("featured", e.target.checked)}
                className="w-4 h-4 accent-emerald"
              />
              <span className="text-sm text-ink-secondary">
                {" "}
                <span className="text-emerald">Featured</span> (Chef&apos;s Pick)
              </span>
            </label>
          </div>

          <div className="flex gap-3 pt-2 border-t border-hairline">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-sm border border-hairline-strong text-sm font-medium text-ink-mute hover:bg-canvas-soft transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 rounded-sm bg-emerald text-on-emerald text-sm font-medium hover:bg-emerald-deep disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
