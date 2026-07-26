import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";
import { X } from "lucide-react";

const EMPTY = {
  name: "",
  description: "",
  category: "local",
  price: "",
  image_url: "",
  available: true,
};

export default function ProductForm({ product, onClose }) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const isEdit = !!product;

  useEffect(() => {
    if (product) {
      setForm({ ...product, price: String(product.price ?? "") });
    }
  }, [product]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      name: form.name,
      description: form.description,
      category: form.category,
      price: Number(form.price),
      image_url: form.image_url,
      available: !!form.available,
    };
    try {
      if (isEdit) {
        await base44.entities.Product.update(product.id, payload);
      } else {
        await base44.entities.Product.create(payload);
      }
      onClose();
    } catch (err) {
      alert("Could not save: " + (err.message || err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[90] bg-carbon/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-parchment rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-parchment flex items-center justify-between px-6 py-4 border-b border-carbon/10">
          <h2 className="font-display text-2xl font-light text-carbon">{isEdit ? "Edit Dish" : "New Dish"}</h2>
          <button onClick={onClose} className="text-carbon/60 hover:text-persimmon">
            <X size={22} />
          </button>
        </div>

        <form onSubmit={submit} className="p-6 space-y-4">
          <div>
            <label className="text-xs uppercase tracking-wider text-carbon/60">Name</label>
            <input
              required
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              className="mt-1 w-full px-3 py-2.5 bg-card border border-carbon/15 rounded-lg focus:outline-none focus:border-persimmon"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-carbon/60">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={2}
              className="mt-1 w-full px-3 py-2.5 bg-card border border-carbon/15 rounded-lg focus:outline-none focus:border-persimmon"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs uppercase tracking-wider text-carbon/60">Category</label>
              <select
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
                className="mt-1 w-full px-3 py-2.5 bg-card border border-carbon/15 rounded-lg focus:outline-none focus:border-persimmon"
              >
                <option value="local">Local</option>
                <option value="fast">Fast Food</option>
              </select>
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-carbon/60">Price (UGX)</label>
              <input
                required
                type="number"
                value={form.price}
                onChange={(e) => set("price", e.target.value)}
                className="mt-1 w-full px-3 py-2.5 bg-card border border-carbon/15 rounded-lg focus:outline-none focus:border-persimmon"
              />
            </div>
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-carbon/60">Image URL</label>
            <input
              value={form.image_url}
              onChange={(e) => set("image_url", e.target.value)}
              placeholder="https://…"
              className="mt-1 w-full px-3 py-2.5 bg-card border border-carbon/15 rounded-lg focus:outline-none focus:border-persimmon"
            />
            {form.image_url && (
              <div className="mt-3 w-28 h-28 rounded-lg overflow-hidden bg-carbon/5">
                <Image src={form.image_url} alt="preview" fittingType="fill" className="w-full h-full" />
              </div>
            )}
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.available}
              onChange={(e) => set("available", e.target.checked)}
              className="w-4 h-4 accent-persimmon"
            />
            <span className="text-sm text-carbon/70">Available on menu</span>
          </label>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-lg border border-carbon/15 text-sm font-medium text-carbon/70 hover:bg-card"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 rounded-lg bg-persimmon text-parchment text-sm font-semibold uppercase tracking-wider hover:bg-carbon disabled:opacity-50 transition-colors"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}