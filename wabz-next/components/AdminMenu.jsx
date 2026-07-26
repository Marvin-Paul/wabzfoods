import React, { useEffect, useState } from "react";
import { base44 } from "@/lib/base44Client";
import { Image } from "@/components/ui/image";
import { useToast } from "@/components/ui/use-toast";
import ProductForm from "./ProductForm";
import { Plus, Pencil, Trash2, Flame, Database, Loader2 } from "lucide-react";
import {
  FEATURED_FAST_ITEMS as FAST_SEED,
  FEATURED_LOCAL_ITEMS as LOCAL_SEED,
} from "@/lib/featured-data";

export default function AdminMenu() {
  const { toast } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const load = () => base44.entities.Product.list().then(setProducts);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const seedDatabase = async () => {
    if (!confirm("Create all featured dishes in the database? This will NOT overwrite existing dishes with the same name.")) return;
    setSeeding(true);
    const allSeedItems = [...FAST_SEED, ...LOCAL_SEED];
    const existing = await base44.entities.Product.list();
    const existingNames = new Set(existing.map((p) => p.name.toLowerCase()));
    let created = 0;
    let skipped = 0;
    for (const item of allSeedItems) {
      if (existingNames.has(item.name.toLowerCase())) {
        skipped++;
        continue;
      }
      try {
        await base44.entities.Product.create(item);
        created++;
      } catch {
        // skip individual failures
      }
    }
    setSeeding(false);
    await load();
    toast({
      title: "Seeding complete",
      description: `Created ${created} new dish${created !== 1 ? "es" : ""}, skipped ${skipped} existing.`,
    });
  };

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
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-carbon/60">{products.length} dishes on the menu</p>
        <div className="flex items-center gap-3">
          <button
            onClick={seedDatabase}
            disabled={seeding}
            className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border border-carbon/15 text-carbon/60 hover:text-carbon hover:border-carbon/40 transition-colors disabled:opacity-40"
          >
            {seeding ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Database size={14} />
            )}
            Seed Featured Items
          </button>
          <button
            onClick={() => { setEditing(null); setShowForm(true); }}
            className="flex items-center gap-2 bg-persimmon text-parchment px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-carbon transition-colors"
          >
            <Plus size={16} /> Add Dish
          </button>
        </div>
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
                {p.featured && (
                  <span className="absolute top-2 right-2 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider bg-persimmon/90 text-parchment px-2 py-0.5 rounded">
                    <Flame size={10} />
                    Featured
                  </span>
                )}
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