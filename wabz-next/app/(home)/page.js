"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import { base44 } from "@/lib/base44Client";
import { Image } from "@/components/ui/image";
import MenuItemCard from "@/components/MenuItemCard";
import { useCart } from "@/components/CartContext";
import { Search, ChevronDown, Flame } from "lucide-react";

const HERO_IMG =
  "https://media.base44.com/images/public/6a63bf91a5d037c8051275ea/88848c734_generated_image.png";

const CATEGORIES = [
  { key: "all", label: "All" },
  { key: "local", label: "Local Foods" },
  { key: "fast", label: "Fast Foods" },
];

function useInView(options = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        obs.unobserve(el);
      }
    }, { threshold: 0.1, ...options });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return [ref, inView];
}

function AnimatedSection({ children, className = "" }) {
  const [ref, inView] = useInView();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      } ${className}`}
    >
      {children}
    </div>
  );
}

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const { addItem, setOpen } = useCart();

  useEffect(() => {
    base44.entities.Product.list()
      .then(setProducts)
      .finally(() => setLoading(false));
  }, []);

  const grouped = useMemo(() => {
    let list = products;
    if (filter !== "all") list = list.filter((p) => p.category === filter);
    if (query) list = list.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()));
    const map = new Map();
    for (const p of list) {
      const cat = p.category || "Other";
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat).push(p);
    }
    return map;
  }, [products, filter, query]);

  const featured = useMemo(() => {
    return products.filter((p) => p.featured).slice(0, 3);
  }, [products]);

  const onAdd = (p) => {
    addItem(p);
    setOpen(true);
  };

  return (
    <div>
      <section className="relative bg-carbon text-parchment overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          <Image src={HERO_IMG} alt="Wabz Food" fittingType="fill" className="w-full h-full" />
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
            className="inline-flex items-center gap-2 mt-8 bg-persimmon text-parchment px-7 py-4 text-sm uppercase tracking-[0.2em] rounded-lg hover:bg-parchment hover:text-carbon transition-colors"
          >
            Explore the Menu
            <ChevronDown className="w-4 h-4" />
          </a>
        </div>
      </section>

      {featured.length > 0 && filter === "all" && !query && (
        <section className="max-w-7xl mx-auto px-5 md:px-8 py-16 md:py-24">
          <AnimatedSection>
            <div className="flex items-center gap-3 mb-8">
              <Flame className="w-5 h-5 text-persimmon" />
              <p className="text-xs uppercase tracking-[0.3em] text-artichoke">Chef's picks</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featured.map((p) => (
                <MenuItemCard key={p.id} product={p} onAdd={onAdd} />
              ))}
            </div>
          </AnimatedSection>
        </section>
      )}

      <section id="menu" className="max-w-7xl mx-auto px-5 md:px-8 py-16 md:py-24">
        <AnimatedSection>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-artichoke mb-3">The Menu</p>
              <h2 className="font-display text-4xl md:text-5xl font-light text-carbon">Choose your craving.</h2>
            </div>
            <div className="flex items-center gap-3">
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
          </div>
        </AnimatedSection>

        <AnimatedSection>
          <div className="flex gap-2 mb-12 overflow-x-auto pb-2 -mx-5 px-5 md:mx-0 md:px-0">
            {CATEGORIES.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                  filter === f.key
                    ? "bg-carbon text-parchment shadow-lg shadow-carbon/20"
                    : "bg-card text-carbon/70 border border-carbon/15 hover:border-carbon/40"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </AnimatedSection>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-[4/3] bg-carbon/5 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : grouped.size === 0 ? (
          <p className="text-carbon/50 py-16 text-center">No dishes match your search.</p>
        ) : (
          <div className="space-y-16">
            {[...grouped.entries()].map(([category, items], idx) => (
              <AnimatedSection key={category}>
                <div className="mb-8">
                  <div className="flex items-center gap-4 mb-2">
                    <h3 className="font-display text-2xl md:text-3xl font-light text-carbon">{category}</h3>
                    <div className="flex-1 h-px bg-carbon/10" />
                  </div>
                  <p className="text-sm text-carbon/50">
                    {items.length} item{items.length !== 1 ? "s" : ""}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {items.map((p) => (
                    <MenuItemCard key={p.id} product={p} onAdd={onAdd} />
                  ))}
                </div>
              </AnimatedSection>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
