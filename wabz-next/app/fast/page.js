"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { listFastProducts } from "@/lib/supabase-data";
import { useCart } from "@/components/CartContext";
import { ArrowLeft, Heart, Clock, Flame, Utensils, Search, X, Star } from "lucide-react";

/* ── Category labels and icons for the filter tabs ── */
const SPECIAL_CATEGORIES = [
  { value: "all", label: "All", icon: "Star" },
  { value: "grilled", label: "Grilled", icon: "Flame" },
  { value: "fried", label: "Fried", icon: "Utensils" },
  { value: "sides", label: "Sides", icon: "Clock" },
  { value: "local", label: "Local Favourites", icon: "Heart" },
];

/* ── Guess a dish category from its name for API items ── */
function guessCategory(name) {
  const n = name.toLowerCase();
  if (/(grill|roast|bbq|choma|skewer|tandoori|steak|char)/.test(n)) return "grilled";
  if (/(fried|fry|chips|crispy|crunchy|fish|battered)/.test(n)) return "fried";
  if (/(chapati|rice|bread|salad|side|drink)/.test(n)) return "sides";
  if (/(rolex|uganda|local|traditional|stew|role)/.test(n)) return "local";
  return "sides";
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

export default function FastPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [specialCategory, setSpecialCategory] = useState("all");
  const { addItem, setOpen } = useCart();

  useEffect(() => {
    listFastProducts()
      .then(setProducts)
      .finally(() => setLoading(false));
  }, []);

  /* ── All products from the API in one unified list ── */
  const allMenuItems = products.map((p) => ({
    ...p,
    category: p.subcategory || guessCategory(p.name || ""),
    prep: p.prep || "15-20 mins",
    kcal: p.kcal || "~450 kcal",
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

  /* ── Guard card grid animation until it scrolls into view ── */
  const [gridRef, gridInView] = useInView({ threshold: 0.08 });

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      <div className="max-w-7xl mx-auto px-5 md:px-8 py-8 md:py-12">
        <AnimatedSection>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-amber-500 transition-colors mb-8"
          >
            <ArrowLeft size={15} />
            Back to Home
          </Link>
        </AnimatedSection>

        {/* Header */}
        <AnimatedSection>
          <header className="mb-10 text-center max-w-2xl mx-auto">
            <span className="text-amber-500 font-semibold tracking-wider uppercase text-sm">
              Quick & Delicious
            </span>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mt-2 mb-4">
              Fast Favourites
            </h1>
            <p className="text-slate-400 text-sm md:text-base">
              Burgers, pizzas, fries and more — made fresh to order with premium
              ingredients for that perfect bite, every time.
            </p>
          </header>
        </AnimatedSection>

        {/* Unified Menu — search + category filter + all cards */}
        <AnimatedSection>
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center">
                <Star size={16} className="text-amber-500" />
              </div>
              <div>
                <h2 className="font-display text-xl font-semibold text-white">
                  Today&apos;s Menu
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  All our fast food favourites in one place
                </p>
              </div>
              <div className="flex-1 h-px bg-slate-700/50 ml-4" />
            </div>

            {/* Search bar */}
            <div className="max-w-md mx-auto mb-6">
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search menu…"
                  className="w-full pl-11 pr-10 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/10 transition-all duration-300"
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    aria-label="Clear search"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>
            </div>

            {/* Category filter tabs */}
            <div className="flex flex-wrap items-center gap-2 mb-8">
              {SPECIAL_CATEGORIES.map((cat) => {
                const ICON_MAP = { Star, Flame, Utensils, Clock, Heart };
                const Icon = ICON_MAP[cat.icon] || Star;
                return (
                  <button
                    key={cat.value}
                    onClick={() => setSpecialCategory(cat.value)}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
                      specialCategory === cat.value
                        ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 scale-105"
                        : "bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 border border-slate-700/50"
                    }`}
                  >
                    <Icon size={12} className={specialCategory === cat.value ? "text-slate-950" : "text-slate-500"} />
                    {cat.label}
                  </button>
                );
              })}
              <span className="ml-auto text-[11px] text-slate-500">
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
                      className="bg-slate-800/80 rounded-2xl border border-slate-700/50 overflow-hidden animate-pulse"
                    >
                      <div className="h-52 bg-slate-700" />
                      <div className="p-5 space-y-4">
                        <div className="h-5 w-3/4 bg-slate-700 rounded" />
                        <div className="h-3 w-1/2 bg-slate-700 rounded" />
                        <div className="h-12 bg-slate-700 rounded" />
                        <div className="h-10 bg-slate-700 rounded-xl" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mb-4 border border-slate-700">
                    <Search size={24} className="text-slate-500" />
                  </div>
                  <p className="text-white font-semibold text-lg">
                    {query
                      ? `No fast foods matching "${query}"`
                      : "No fast food items available yet"}
                  </p>
                  <p className="text-slate-400 text-sm mt-1">
                    {query ? "Try a different search term." : "Check back soon for new additions."}
                  </p>
                  {query && (
                    <button
                      onClick={() => setQuery("")}
                      className="mt-5 text-sm font-medium text-amber-500 hover:text-white transition-colors"
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
                      className="group relative bg-slate-800/80 rounded-2xl border border-slate-700/50 overflow-hidden hover:border-amber-500/40 hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-500 flex flex-col"
                      style={{
                        opacity: 0,
                        animation: gridInView
                          ? `fade-up 0.5s cubic-bezier(0.16,1,0.3,1) ${idx * 80}ms forwards`
                          : "none",
                      }}
                    >
                      <div className="relative h-52 w-full overflow-hidden bg-slate-950">
                        <img
                          src={dish.image_url}
                          alt={dish.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80" />

                        {dish.featured && (
                          <span className="absolute top-4 left-4 bg-amber-500 text-slate-950 font-bold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                            <Star size={10} />
                            Chef&apos;s Special
                          </span>
                        )}

                        <button
                          onClick={() => toggleFavorite(dish.id)}
                          className="absolute top-4 right-4 p-2.5 rounded-full bg-slate-900/60 backdrop-blur-md border border-white/10 text-slate-300 hover:text-red-500 transition-colors"
                          aria-label={favorites.includes(dish.id) ? "Remove from favorites" : "Add to favorites"}
                        >
                          <Heart
                            className={`w-4 h-4 ${
                              favorites.includes(dish.id) ? "fill-red-500 text-red-500" : ""
                            }`}
                          />
                        </button>
                      </div>

                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-2 gap-2">
                            <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors leading-snug">
                              {dish.name}
                            </h3>
                            <span className="text-base font-bold text-amber-500 whitespace-nowrap">
                              UGX {Number(dish.price).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 leading-relaxed mb-4 line-clamp-2">
                            {dish.description || "A delicious fast food favourite made fresh to order."}
                          </p>
                        </div>

                        <div>
                          <div className="flex items-center gap-4 text-[11px] text-slate-400 border-t border-slate-700/60 pt-3 mb-4">
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3 h-3 text-amber-500" />
                              <span>{dish.prep || "15-20 mins"}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Flame className="w-3 h-3 text-amber-500" />
                              <span>{dish.kcal || "~450 kcal"}</span>
                            </div>
                          </div>

                          <button
                            onClick={() => onAdd(dish)}
                            className="w-full py-2.5 bg-slate-700 hover:bg-amber-500 text-white hover:text-slate-950 font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-sm"
                          >
                            <Utensils className="w-3.5 h-3.5" />
                            <span>Add to Order</span>
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
              className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-amber-500 transition-colors"
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
