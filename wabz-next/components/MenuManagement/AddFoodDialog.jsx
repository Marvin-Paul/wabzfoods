"use client";

import React, { useState } from "react";
import {
  X,
  Upload,
  Image as ImageIcon,
} from "lucide-react";

export default function AddFoodDialog({
  open,
  onClose,
  onSave,
  editItem,
  categories,
}) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
    categoryId: categories[0]?.id || "",
    available: true,
    featured: false,
  });
  const [saving, setSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState("");

  const isEdit = !!editItem;

  React.useEffect(() => {
    if (editItem) {
      setForm({
        name: editItem.name,
        description: editItem.description || "",
        price: String(editItem.price || ""),
        image: editItem.image || "",
        categoryId: editItem.categoryId,
        available: editItem.available,
        featured: editItem.featured,
      });
      setImagePreview(editItem.image || "");
    } else {
      setForm({
        name: "",
        description: "",
        price: "",
        image: "",
        categoryId: categories[0]?.id || "",
        available: true,
        featured: false,
      });
      setImagePreview("");
    }
  }, [editItem, open, categories]);

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleImageUrlChange = (url) => {
    setField("image", url);
    setImagePreview(url);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.price) return;

    setSaving(true);
    try {
      await onSave({
        ...form,
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        categoryId: form.categoryId,
      });
      onClose();
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-ink/30 backdrop-blur-[2px] flex items-center justify-center p-4">
      <div className="bg-canvas rounded-sm w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-level-3 border border-hairline animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="sticky top-0 bg-canvas flex items-center justify-between px-6 py-4 border-b border-hairline-cool z-10">
          <h2 className="text-[18px] font-medium text-ink tracking-tight">
            {isEdit ? "Edit Food Item" : "Add Food Item"}
          </h2>
          <button
            onClick={onClose}
            className="text-ink-mute hover:text-ink transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Food Name */}
          <div>
            <label className="text-xs font-medium uppercase tracking-wider text-ink-mute mb-1.5 block">
              Food Name <span className="text-accent-tomato">*</span>
            </label>
            <input
              required
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              placeholder="e.g. Matooke & G-Nut Sauce"
              className="w-full px-3 py-2 bg-canvas border border-hairline-strong rounded-sm text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-emerald focus:ring-1 focus:ring-emerald/20 transition-all"
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-xs font-medium uppercase tracking-wider text-ink-mute mb-1.5 block">
              Category <span className="text-accent-tomato">*</span>
            </label>
            <select
              value={form.categoryId}
              onChange={(e) => setField("categoryId", e.target.value)}
              className="w-full px-3 py-2 bg-canvas border border-hairline-strong rounded-sm text-sm text-ink focus:outline-none focus:border-emerald focus:ring-1 focus:ring-emerald/20 transition-all"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-medium uppercase tracking-wider text-ink-mute mb-1.5 block">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              rows={3}
              placeholder="Describe the dish..."
              className="w-full px-3 py-2 bg-canvas border border-hairline-strong rounded-sm text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-emerald focus:ring-1 focus:ring-emerald/20 transition-all resize-none"
            />
          </div>

          {/* Price */}
          <div>
            <label className="text-xs font-medium uppercase tracking-wider text-ink-mute mb-1.5 block">
              Price (UGX) <span className="text-accent-tomato">*</span>
            </label>
            <input
              required
              type="number"
              min="0"
              value={form.price}
              onChange={(e) => setField("price", e.target.value)}
              placeholder="e.g. 10000"
              className="w-full px-3 py-2 bg-canvas border border-hairline-strong rounded-sm text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-emerald focus:ring-1 focus:ring-emerald/20 transition-all"
            />
          </div>

          {/* Image URL */}
          <div>
            <label className="text-xs font-medium uppercase tracking-wider text-ink-mute mb-1.5 block">
              Image URL
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Upload size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
                <input
                  value={form.image}
                  onChange={(e) => handleImageUrlChange(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full pl-9 pr-3 py-2 bg-canvas border border-hairline-strong rounded-sm text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-emerald focus:ring-1 focus:ring-emerald/20 transition-all"
                />
              </div>
            </div>
            {imagePreview && (
              <div className="mt-3 w-full h-40 rounded-[4px] overflow-hidden bg-canvas-soft border border-hairline-cool relative flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.style.display = "none"; }}
                />
              </div>
            )}
          </div>

          {/* Switches */}
          <div className="flex gap-8 pt-2">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.available}
                onChange={(e) => setField("available", e.target.checked)}
                className="w-4 h-4 accent-emerald rounded-[4px]"
              />
              <span className="text-sm text-ink-secondary">Available</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => setField("featured", e.target.checked)}
                className="w-4 h-4 accent-emerald rounded-[4px]"
              />
              <span className="text-sm text-ink-secondary">
                <span className="text-emerald">Featured</span>
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-hairline-cool">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-sm border border-hairline-strong text-sm font-medium text-ink-mute hover:bg-canvas-soft transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !form.name.trim() || !form.price}
              className="flex-1 py-2.5 rounded-sm bg-emerald text-on-emerald text-sm font-medium hover:bg-emerald-deep disabled:opacity-50 disabled:cursor-not-allowed transition-all inline-flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-on-emerald/30 border-t-on-emerald rounded-full animate-spin" />
                  Saving…
                </>
              ) : (
                isEdit ? "Update Item" : "Save Item"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
