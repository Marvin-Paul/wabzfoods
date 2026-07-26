import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";
import ProductForm from "./ProductForm";
import { Plus, Pencil, Trash2 } from "lucide-react";

export default function AdminMenu() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const load = () => base44.entities.Product.list().then(setProducts);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const toggleAvailable = async (p) => {
    await base44.entities.Product.update(p.id, { available: !p.available });
    setProducts((prev) => prev.map((x) => (x.id === p.id ? { ...x, available: !x.available } : x)));
  };

  const remove = async (p) => {
    if (!confirm(`Delete "${p.name}"?`)) return;
    await base44.entities.Product.delete(p.id);
    setProducts((prev) => prev.filter((x) => x.id !== p.id));
  };

  const onSaved = () => {
    setShowForm(false);
    setEditing(null);
    load();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <p className="text-sm text-carbon/60">{products.length} dishes on the menu</p>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="flex items-center gap-2 bg-persimmon text-parchment px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-carbon transition-colors"
        >
          <Plus size={16} /> Add Dish
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-44 bg-carbon/5 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {products.map((p) => (
            <div key={p.id} className="bg-card border border-carbon/10 rounded-xl overflow-hidden">
              <div className="relative aspect-[16/9]">
                <Image src={p.image_url} alt={p.name} fittingType="fill" className="w-full h-full" />
                <span className="absolute top-2 left-2 text-[10px] uppercase tracking-wider bg-parchment/90 px-2 py-0.5 rounded">
                  {p.category === "local" ? "Local" : "Fast"}
                </span>
                {!p.available && (
                  <div className="absolute inset-0 bg-carbon/60 flex items-center justify-center">
                    <span className="text-parchment text-xs uppercase tracking-widest">Hidden</span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="font-display text-lg text-carbon leading-tight">{p.name}</h3>
                  <span className="font-display text-sm text-carbon whitespace-nowrap">USh {Number(p.price).toLocaleString()}</span>
                </div>
                <p className="text-sm text-carbon/55 mt-1 line-clamp-2">{p.description}</p>
                <div className="mt-4 flex items-center gap-2">
                  <button
                    onClick={() => toggleAvailable(p)}
                    className="text-xs px-3 py-1.5 rounded-md border border-carbon/15 hover:border-carbon/40 text-carbon/70"
                  >
                    {p.available ? "Hide" : "Show"}
                  </button>
                  <button
                    onClick={() => { setEditing(p); setShowForm(true); }}
                    className="text-xs px-3 py-1.5 rounded-md border border-carbon/15 hover:border-carbon/40 text-carbon/70 flex items-center gap-1"
                  >
                    <Pencil size={13} /> Edit
                  </button>
                  <button
                    onClick={() => remove(p)}
                    className="ml-auto text-red-600 hover:text-red-700 p-1.5"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <ProductForm product={editing} onClose={onSaved} />
      )}
    </div>
  );
}