import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";
import MenuItemCard from "@/components/MenuItemCard";
import { useCart } from "@/components/CartContext";
import { Search } from "lucide-react";

const HERO_IMG =
  "https://media.base44.com/images/public/6a63bf91a5d037c8051275ea/88848c734_generated_image.png";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "local", label: "Local Foods" },
  { key: "fast", label: "Fast Foods" },
];

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const { addItem, setOpen } = useCart();

  useEffect(() => {
    base44.entities.Product.list()
      .then(setProducts)
      .finally(() => setLoading(false));
  }, []);

  const visible = useMemo(() => {
    return products
      .filter((p) => (filter === "all" ? true : p.category === filter))
      .filter((p) => (query ? p.name.toLowerCase().includes(query.toLowerCase()) : true));
  }, [products, filter, query]);

  const onAdd = (p) => {
    addItem(p);
    setOpen(true);
  };

  return (
    <div>
      <section className="relative bg-carbon text-parchment overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          <Image src={HERO_IMG} alt="Wabs Food" fittingType="fill" className="w-full h-full" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-carbon via-carbon/80 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-5 md:px-8 py-24 md:py-36">
          <p className="text-xs uppercase tracking-[0.3em] text-persimmon mb-5">Local · Fast · Crafted Fresh</p>
          <h1 className="font-display text-5xl md:text-7xl font-light leading-[0.95] max-w-2xl text-balance">
            Taste home. Taste the world. Delivered.
          </h1>
          <p className="mt-6 text-base md:text-lg text-parchment/75 max-w-md">
            From Ugandan classics to fast-food favourites — order online, pay securely, and track your meal in real time.
          </p>
          <a
            href="#menu"
            className="inline-block mt-8 bg-persimmon text-parchment px-7 py-4 text-sm uppercase tracking-[0.2em] rounded-lg hover:bg-parchment hover:text-carbon transition-colors"
          >
            Explore the Menu
          </a>
        </div>
      </section>

      <section id="menu" className="max-w-7xl mx-auto px-5 md:px-8 py-16 md:py-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-artichoke mb-3">The Menu</p>
            <h2 className="font-display text-4xl md:text-5xl font-light text-carbon">Choose your craving.</h2>
          </div>
          <div className="relative w-full md:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-carbon/40" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search dishes…"
              className="w-full pl-9 pr-4 py-2.5 bg-card border border-carbon/15 rounded-lg text-sm text-carbon placeholder:text-carbon/40 focus:outline-none focus:border-persimmon"
            />
          </div>
        </div>

        <div className="flex gap-2 mb-8">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-colors ${
                filter === f.key
                  ? "bg-carbon text-parchment"
                  : "bg-card text-carbon/70 border border-carbon/15 hover:border-carbon/40"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-[4/3] bg-carbon/5 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <p className="text-carbon/50 py-16 text-center">No dishes match your search.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {visible.map((p) => (
              <MenuItemCard key={p.id} product={p} onAdd={onAdd} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
