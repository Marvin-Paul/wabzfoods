"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { mapFoodProduct } from "@/lib/supabase-data";
import { useCart } from "@/components/CartContext";
import { ArrowLeft, Heart, Clock, Flame, Utensils, Search, X, Star } from "lucide-react";

/* ── Category labels and icons for local food filter ── */
const LOCAL_CATEGORIES = [
  { value: "all", label: "All", icon: "Star" },
  { value: "stews", label: "Stews", icon: "Flame" },
  { value: "grilled", label: "Grilled & Fried", icon: "Utensils" },
  { value: "local", label: "Local Classics", icon: "Heart" },
];

/* ── Guess a dish category from its name for API items ── */
function guessLocalCategory(name) {
  const n = name.toLowerCase();
  if (/(luwombo|stew|groundnut|peanut|soup|curry)/.test(n)) return "stews";
  if (/(grill|roast|fish|tilapia|fried|fry|choma)/.test(n)) return "grilled";
  if (/(matooke|plantain|pilao|pilau|local|traditional|uganda|rolex)/.test(n)) return "local";
  return "stews";
}

/* ── Intersection Observer hook for entrance animations ── */
function useInView(options = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.unobserve(el);
        }
      },
      { threshold: 0.15, ...options }
    );
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
      className={`transition-all duration-800 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      } ${className}`}
    >
      {children}
    </div>
  );
}

export default function LocalPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [specialCategory, setSpecialCategory] = useState("all");
  const { addItem, setOpen } = useCart();

  useEffect(() => {
    supabase
      .from("food_items")
      .select("*, categories!inner(category_code)")
      .eq("is_available", true)
      .order("item_id", { ascending: true })
      .then(({ data }) => {
        const mapped = (data || []).map(mapFoodProduct);
        setProducts(mapped.filter((p) => p.category === "local"));
      })
      .finally(() => setLoading(false));
  }, []);

  const allMenuItems = products.map((p) => ({
    ...p,
    category: p.subcategory || guessLocalCategory(p.name || ""),
    prep: p.prep || "20-25 mins",
    kcal: p.kcal || "~580 kcal",
  }));

  const filteredItems = allMenuItems.filter((item) => {
    const matchesCategory =
      specialCategory === "all" || item.category === specialCategory;
    const matchesQuery =
      !query ||
      item.name?.toLowerCase().includes(query.toLowerCase()) ||
      item.description?.toLowerCase().includes(query.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const onAdd = (p) => {
    addItem(p);
    setOpen(true);
  };

  const [gridRef, gridInView] = useInView({ threshold: 0.08 });

  return (
    <div className="bg-cream-bg min-h-screen">
      <div className="max-w-7xl mx-auto px-5 md:px-8 py-8 md:py-12">
        <AnimatedSection>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-stone-400 hover:text-persimmon transition-colors mb-8"
          >
            <ArrowLeft size={15} />
            Back to Home
          </Link>
        </AnimatedSection>

        {/* Header */}
        <AnimatedSection>
          <header className="mb-10 text-center max-w-2xl mx-auto">
            <span className="text-persimmon font-semibold tracking-wider uppercase text-sm">
              Taste of Uganda
            </span>
            <h1 className="font-display text-4xl md:text-5xl font-light text-stone-900 mt-2 mb-4">
              Local Specialties
            </h1>
            <p className="text-stone-500 text-sm md:text-base">
              From matooke to luwombo — authentic Ugandan dishes prepared with
              traditional recipes, brought fresh to your table.
            </p>
          </header>
        </AnimatedSection>

        {/* Menu Section */}
        <AnimatedSection>
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 rounded-lg bg-persimmon/10 flex items-center justify-center">
                <Star size={16} className="text-persimmon" />
              </div>
              <div>
                <h2 className="font-display text-xl font-semibold text-stone-900">
                  Today&apos;s Menu
                </h2>
                <p className="text-xs text-stone-400 mt-0.5">
                  Traditional Ugandan dishes made fresh daily
                </p>
              </div>
              <div className="flex-1 h-px bg-stone-100 ml-4" />
            </div>

            {/* Search bar */}
            <div className="max-w-md mx-auto mb-6">
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none"
                />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search local dishes…"
                  className="w-full pl-11 pr-10 py-3 bg-white border border-stone-200 rounded-xl text-sm text-stone-900 placeholder:text-stone-400/70 focus:outline-none focus:border-persimmon focus:ring-2 focus:ring-persimmon/10 transition-all duration-300 shadow-sm"
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                    aria-label="Clear search"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>
            </div>

            {/* Category filter tabs */}
            <div className="flex flex-wrap items-center gap-2 mb-8">
              {LOCAL_CATEGORIES.map((cat) => {
                const ICON_MAP = { Star, Flame, Utensils, Heart, Clock };
                const Icon = ICON_MAP[cat.icon] || Star;
                return (
                  <button
                    key={cat.value}
                    onClick={() => setSpecialCategory(cat.value)}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
                      specialCategory === cat.value
                        ? "bg-stone-900 text-white shadow-lg shadow-stone-900/20 scale-105"
                        : "bg-white text-stone-600 hover:text-stone-900 border border-stone-200 hover:border-stone-400 hover:shadow-md hover:shadow-stone-900/5"
                    }`}
                  >
                    <Icon size={12} className={specialCategory === cat.value ? "text-white" : "text-stone-400"} />
                    {cat.label}
                  </button>
                );
              })}
              <span className="ml-auto text-[11px] text-stone-400">
                {filteredItems.length} item{filteredItems.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Cards Grid */}
            <div ref={gridRef}>
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="rounded-2xl overflow-hidden bg-white border border-stone-200 animate-pulse"
                    >
                      <div className="h-52 bg-stone-100" />
                      <div className="p-5 space-y-4">
                        <div className="h-5 w-3/4 bg-stone-100 rounded" />
                        <div className="h-3 w-1/2 bg-stone-100 rounded" />
                        <div className="h-12 bg-stone-100 rounded" />
                        <div className="h-10 bg-stone-100 rounded-xl" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center mb-4">
                    <Search size={24} className="text-stone-400" />
                  </div>
                  <p className="text-stone-900 font-semibold text-lg">
                    {query
                      ? `No local dishes matching "${query}"`
                      : "No local dishes available yet"}
                  </p>
                  <p className="text-stone-500 text-sm mt-1">
                    {query ? "Try a different search term." : "Check back soon for new additions."}
                  </p>
                  {query && (
                    <button
                      onClick={() => setQuery("")}
                      className="mt-5 text-sm font-medium text-persimmon hover:text-stone-900 transition-colors"
                    >
                      Clear search
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredItems.map((dish, idx) => (
                    <div
                      key={dish.id}
                      className="group relative bg-white rounded-2xl border border-stone-200/80 overflow-hidden hover:border-stone-300 hover:shadow-xl hover:shadow-stone-900/5 transition-all duration-500 flex flex-col"
                      style={{
                        opacity: 0,
                        animation: gridInView
                          ? `fade-up 0.5s cubic-bezier(0.16,1,0.3,1) ${idx * 80}ms forwards`
                          : "none",
                      }}
                    >
                      <div className="relative h-52 w-full overflow-hidden bg-stone-100">
                        <img
                          src={dish.image_url}
                          alt={dish.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => { e.target.style.display = "none"; }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        {dish.featured && (
                          <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 text-[10px] font-semibold uppercase tracking-[0.15em] px-2.5 py-1 rounded-full shadow-lg shadow-amber-900/10 border border-amber-200/60">
                            <Star size={10} className="text-amber-500" />
                            Chef&apos;s Special
                          </span>
                        )}

                        <button
                          onClick={() => toggleFavorite(dish.id)}
                          className={`absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                            favorites.includes(dish.id)
                              ? "bg-persimmon text-white shadow-lg shadow-persimmon/30 scale-110"
                              : "bg-white/80 backdrop-blur-sm text-stone-500 hover:text-persimmon hover:bg-white shadow-lg shadow-black/10"
                          }`}
                          aria-label={favorites.includes(dish.id) ? "Remove from favorites" : "Add to favorites"}
                        >
                          <Heart size={14} fill={favorites.includes(dish.id) ? "currentColor" : "none"} />
                        </button>
                      </div>

                      <div className="p-5 flex-1 flex flex-col">
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2 gap-2">
                            <h3 className="text-base font-semibold text-stone-900 leading-snug">
                              {dish.name}
                            </h3>
                            <span className="text-base font-bold text-persimmon whitespace-nowrap tabular-nums">
                              UGX {Number(dish.price).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm text-stone-500 leading-relaxed mb-4 line-clamp-2">
                            {dish.description || "A delicious local specialty prepared fresh with authentic ingredients."}
                          </p>
                        </div>

                        <div>
                          <div className="flex items-center gap-4 text-xs text-stone-400 border-t border-stone-100 pt-3 mb-4">
                            <div className="flex items-center gap-1.5">
                              <Clock size={13} className="text-persimmon" />
                              <span>{dish.prep || "20-25 mins"}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Flame size={13} className="text-persimmon" />
                              <span>{dish.kcal || "~580 kcal"}</span>
                            </div>
                          </div>

                          <button
                            onClick={() => onAdd(dish)}
                            className="w-full py-2.5 rounded-xl bg-stone-900 text-white text-sm font-semibold hover:bg-persimmon active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 shadow-md shadow-stone-900/15 hover:shadow-lg hover:shadow-persimmon/25"
                          >
                            <Utensils size={14} />
                            Add to Order
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </AnimatedSection>

        {/* Footer back link */}
        <AnimatedSection>
          <div className="mt-8 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-stone-400 hover:text-persimmon transition-colors"
            >
              <ArrowLeft size={14} />
              Back to Full Menu
            </Link>
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
}
