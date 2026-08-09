"use client";

import React, { useState } from "react";
import { LayoutGrid, Wheat, Pizza, Coffee, Plus, Pencil, Trash2, Check, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const CATEGORY_ICONS = {
  "local-foods": Wheat,
  "fast-foods": Pizza,
  drinks: Coffee,
};

function getIconForCategory(slug) {
  return CATEGORY_ICONS[slug] || LayoutGrid;
}

export default function CategorySidebar({
  categories,
  selectedCategory,
  onSelectCategory,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
}) {
  const { toast } = useToast();
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [nameInput, setNameInput] = useState("");
  const [slugInput, setSlugInput] = useState("");

  const handleStartAdd = () => {
    setAdding(true);
    setNameInput("");
    setSlugInput("");
  };

  const handleConfirmAdd = () => {
    const slug = slugInput.trim() || nameInput.trim().toLowerCase().replace(/\s+/g, "-");
    if (!nameInput.trim()) {
      toast({ title: "Error", description: "Category name is required." });
      return;
    }
    if (categories.some((c) => c.slug === slug)) {
      toast({ title: "Error", description: "A category with this slug already exists." });
      return;
    }
    onAddCategory({ name: nameInput.trim(), slug, itemCount: 0 });
    setAdding(false);
    setNameInput("");
    setSlugInput("");
  };

  const handleStartEdit = (cat) => {
    setEditingId(cat.id);
    setNameInput(cat.name);
    setSlugInput(cat.slug);
  };

  const handleConfirmEdit = () => {
    if (!nameInput.trim()) {
      toast({ title: "Error", description: "Category name is required." });
      return;
    }
    onEditCategory(editingId, {
      name: nameInput.trim(),
      slug: slugInput.trim() || nameInput.trim().toLowerCase().replace(/\s+/g, "-"),
    });
    setEditingId(null);
    setNameInput("");
    setSlugInput("");
  };

  const handleDelete = (cat) => {
    if (cat.itemCount > 0) {
      toast({
        title: "Cannot delete",
        description: `"${cat.name}" has ${cat.itemCount} items. Remove them first.`,
      });
      return;
    }
    onDeleteCategory(cat.id);
    toast({ title: "Deleted", description: `"${cat.name}" has been removed.` });
  };

  return (
    <div className="bg-canvas border border-hairline rounded-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-ink">Categories</h3>
        <button
          onClick={handleStartAdd}
          className="text-xs font-medium text-emerald hover:text-emerald-deep transition-colors inline-flex items-center gap-1"
        >
          <Plus size={13} /> Add Category
        </button>
      </div>

      <div className="space-y-1">
        {/* "All Categories" option */}
        <button
          onClick={() => onSelectCategory(null)}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm transition-all duration-150 ${
            !selectedCategory
              ? "bg-emerald/10 text-emerald-deep font-medium"
              : "text-ink-mute hover:text-ink hover:bg-canvas-soft"
          }`}
        >
          <LayoutGrid size={16} className={!selectedCategory ? "text-emerald" : ""} />
          <span className="flex-1 text-left">All Categories</span>
          <span className="text-xs tabular-nums">
            {categories.reduce((s, c) => s + c.itemCount, 0)}
          </span>
        </button>

        {categories.map((cat) => {
          const Icon = getIconForCategory(cat.slug);
          const isSelected = selectedCategory?.id === cat.id;
          const isEditing = editingId === cat.id;

          if (isEditing) {
            return (
              <div
                key={cat.id}
                className="px-3 py-2.5 space-y-2 bg-canvas-soft rounded-sm border border-hairline-cool"
              >
                <input
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="Category name"
                  className="w-full px-2 py-1.5 bg-canvas border border-hairline-strong rounded-sm text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-emerald focus:ring-1 focus:ring-emerald/20"
                  autoFocus
                />
                <input
                  value={slugInput}
                  onChange={(e) => setSlugInput(e.target.value)}
                  placeholder="slug (auto)"
                  className="w-full px-2 py-1.5 bg-canvas border border-hairline-strong rounded-sm text-xs text-ink-mute placeholder:text-ink-faint focus:outline-none focus:border-emerald focus:ring-1 focus:ring-emerald/20"
                />
                <div className="flex gap-1.5">
                  <button
                    onClick={handleConfirmEdit}
                    className="flex-1 inline-flex items-center justify-center gap-1 text-xs font-medium text-on-emerald bg-emerald hover:bg-emerald-deep rounded-sm px-2 py-1.5 transition-all"
                  >
                    <Check size={12} /> Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="flex-1 inline-flex items-center justify-center gap-1 text-xs font-medium text-ink-mute border border-hairline-strong hover:bg-canvas-soft rounded-sm px-2 py-1.5 transition-all"
                  >
                    <X size={12} /> Cancel
                  </button>
                </div>
              </div>
            );
          }

          return (
            <div key={cat.id} className="group relative">
              <button
                onClick={() => onSelectCategory(cat)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm transition-all duration-150 ${
                  isSelected
                    ? "bg-emerald/10 text-emerald-deep font-medium"
                    : "text-ink-mute hover:text-ink hover:bg-canvas-soft"
                }`}
              >
                <Icon size={16} className={isSelected ? "text-emerald" : ""} />
                <span className="flex-1 text-left">{cat.name}</span>
                <span className="text-xs tabular-nums">{cat.itemCount}</span>
              </button>

              {/* Edit/Delete actions on hover */}
              <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartEdit(cat);
                  }}
                  className="p-1 rounded-[4px] text-ink-faint hover:text-ink hover:bg-canvas-soft transition-all"
                  aria-label={`Edit ${cat.name}`}
                >
                  <Pencil size={12} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(cat);
                  }}
                  className="p-1 rounded-[4px] text-ink-faint hover:text-accent-tomato hover:bg-accent-tomato/5 transition-all"
                  aria-label={`Delete ${cat.name}`}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Inline add form */}
      {adding && (
        <div className="mt-3 px-3 py-2.5 space-y-2 bg-canvas-soft rounded-sm border border-hairline-cool">
          <input
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="Category name"
            className="w-full px-2 py-1.5 bg-canvas border border-hairline-strong rounded-sm text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-emerald focus:ring-1 focus:ring-emerald/20"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") handleConfirmAdd();
              if (e.key === "Escape") setAdding(false);
            }}
          />
          <input
            value={slugInput}
            onChange={(e) => setSlugInput(e.target.value)}
            placeholder="slug (auto from name)"
            className="w-full px-2 py-1.5 bg-canvas border border-hairline-strong rounded-sm text-xs text-ink-mute placeholder:text-ink-faint focus:outline-none focus:border-emerald focus:ring-1 focus:ring-emerald/20"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleConfirmAdd();
              if (e.key === "Escape") setAdding(false);
            }}
          />
          <div className="flex gap-1.5">
            <button
              onClick={handleConfirmAdd}
              className="flex-1 inline-flex items-center justify-center gap-1 text-xs font-medium text-on-emerald bg-emerald hover:bg-emerald-deep rounded-sm px-2 py-1.5 transition-all"
            >
              <Plus size={12} /> Add
            </button>
            <button
              onClick={() => setAdding(false)}
              className="flex-1 inline-flex items-center justify-center gap-1 text-xs font-medium text-ink-mute border border-hairline-strong hover:bg-canvas-soft rounded-sm px-2 py-1.5 transition-all"
            >
              <X size={12} /> Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
