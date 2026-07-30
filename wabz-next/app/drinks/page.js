"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { mapFoodProduct, mapProduct } from "@/lib/supabase-data";
import { useCart } from "@/components/CartContext";
import { ArrowLeft, Heart, Clock, Flame, Utensils, Search, X, Star, CupSoda } from "lucide-react";

/* ── Drink category filter tabs ── */
const DRINK_CATEGORIES = [
  { value: "all", label: "All", icon: "Star" },
  { value: "carbonated", label: "Carbonated", icon: "Flame" },
  { value: "juices", label: "Juices", icon: "Utensils" },
  { value: "coffee-tea", label: "Coffee & Tea", icon: "CupSoda" },
  { value: "water", label: "Water", icon: "Heart" },
];

/* ── Fallback drinks data (shown when Supabase table is empty) ── */
const FALLBACK_DRINKS = [
  // Juices
  { id: "jk1", name: "Fresh Passion Juice", description: "Freshly blended passion fruit juice — sweet, tangy, and chilled. No added sugar.", price: 4000, image_url: "https://images.unsplash.com/photo-1546173153-5f6e0d92a09a?w=400&q=80", category: "juices", featured: true, available: true, prep: "5 mins", kcal: "~180 kcal" },
  { id: "jk2", name: "Mango Juice", description: "Sweet ripe mango juice, freshly blended and served over ice.", price: 4000, image_url: "https://images.unsplash.com/photo-1553531766-5e00e22e5c60?w=400&q=80", category: "juices", featured: false, available: true, prep: "5 mins", kcal: "~180 kcal" },
  { id: "jk3", name: "Pineapple Juice", description: "Tropical pineapple juice — zesty, sweet, and incredibly refreshing.", price: 4000, image_url: "https://images.unsplash.com/photo-1622597467836-f3285c6c1bf1?w=400&q=80", category: "juices", featured: false, available: true, prep: "5 mins", kcal: "~170 kcal" },
  { id: "jk4", name: "Watermelon Juice", description: "Chilled fresh watermelon juice — the ultimate thirst quencher on a hot day.", price: 3500, image_url: "https://images.unsplash.com/photo-1586996292896-8a2e1e0c3c1a?w=400&q=80", category: "juices", featured: false, available: true, prep: "5 mins", kcal: "~120 kcal" },
  // Carbonated
  { id: "cb1", name: "Fanta Orange", description: "Fizzy, fruity Fanta Orange — a burst of sunshine in every sip.", price: 2500, image_url: "https://images.unsplash.com/photo-1624517452488-04869289c4ca?w=400&q=80", category: "carbonated", featured: false, available: true, prep: "2 mins", kcal: "~160 kcal" },
  { id: "cb2", name: "Fanta Pineapple", description: "Tropical Fanta Pineapple — sweet, tangy, and ice cold.", price: 2500, image_url: "https://images.unsplash.com/photo-1596018191885-6e4d9f9d8f0a?w=400&q=80", category: "carbonated", featured: false, available: true, prep: "2 mins", kcal: "~160 kcal" },
  { id: "cb3", name: "Sprite", description: "Crisp, lemon-lime Sprite — the clean, refreshingly clear soda.", price: 2500, image_url: "https://images.unsplash.com/photo-1614503187769-3c9d0e64e4b5?w=400&q=80", category: "carbonated", featured: false, available: true, prep: "2 mins", kcal: "~140 kcal" },
  { id: "cb4", name: "Soda Mix & Match", description: "Coke, Fanta, Sprite, or Mineral Water — your choice, ice cold.", price: 2500, image_url: "https://images.unsplash.com/photo-1551326844-4df70f78d0e9?w=400&q=80", category: "carbonated", featured: false, available: true, prep: "2 mins", kcal: "~150 kcal" },
  // Coffee & Tea
  { id: "cf1", name: "Ugandan Arabica Coffee", description: "Rich, full-bodied Ugandan Arabica coffee, brewed fresh to order.", price: 5000, image_url: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&q=80", category: "coffee-tea", featured: true, available: true, prep: "5 mins", kcal: "~120 kcal" },
  { id: "cf2", name: "Masala Chai", description: "Spiced Indian tea brewed with cardamom, cinnamon, ginger, and cloves.", price: 3000, image_url: "https://images.unsplash.com/photo-1563822249366-3efb23b8e0c8?w=400&q=80", category: "coffee-tea", featured: true, available: true, prep: "5 mins", kcal: "~100 kcal" },
  { id: "cf3", name: "English Breakfast Tea", description: "Classic black tea — strong, comforting, and perfect any time of day.", price: 3000, image_url: "https://images.unsplash.com/photo-1597318181409-cf64d0b5d8a2?w=400&q=80", category: "coffee-tea", featured: false, available: true, prep: "4 mins", kcal: "~80 kcal" },
  { id: "cf4", name: "Iced Coffee", description: "Chilled brewed coffee served over ice with a splash of milk.", price: 5500, image_url: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&q=80", category: "coffee-tea", featured: false, available: true, prep: "5 mins", kcal: "~140 kcal" },
  // Water
  { id: "wt1", name: "Mineral Water (500ml)", description: "Pure, natural spring water — still or sparkling.", price: 2000, image_url: "https://images.unsplash.com/photo-1564419320467-68791c5e9ad4?w=400&q=80", category: "water", featured: false, available: true, prep: "1 min", kcal: "0 kcal" },
  { id: "wt2", name: "Mineral Water (1.5L)", description: "Large bottle of natural spring water — perfect for sharing.", price: 3500, image_url: "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=400&q=80", category: "water", featured: false, available: true, prep: "1 min", kcal: "0 kcal" },
  { id: "wt3", name: "Sparkling Water", description: "Crisp, bubbly sparkling water with a hint of lime.", price: 3000, image_url: "https://images.unsplash.com/photo-1563810170-09ff9f27630f?w=400&q=80", category: "water", featured: false, available: true, prep: "1 min", kcal: "0 kcal" },
];

/* ── Guess drink subcategory from name ── */
function guessDrinkCategory(name) {
  const n = name.toLowerCase();
  if (/(fanta|sprite|coke|coca|soda|carbonated)/.test(n)) return "carbonated";
  if (/(juice|passion|mango|pineapple|watermelon)/.test(n)) return "juices";
  if (/(coffee|tea|chai|cappuccino|latte)/.test(n)) return "coffee-tea";
  if (/(water|mineral|sparkling)/.test(n)) return "water";
  return "carbonated";
}

/* ── Intersection Observer hook ── */
function useInView(options = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { setInView(true); obs.unobserve(el); }
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

export default function DrinksPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [specialCategory, setSpecialCategory] = useState("all");
  const { addItem, setOpen } = useCart();

  useEffect(() => {
    (async () => {
      try {
        // Try the new food_items table first
        const { data: fiData } = await supabase
          .from("food_items")
          .select("*, categories!inner(category_code)")
          .eq("is_available", true)
          .eq("categories.category_code", "drinks")
          .order("item_id", { ascending: true });

        if (fiData && fiData.length > 0) {
          setProducts((fiData || []).map(mapFoodProduct));
          return;
        }

        // Fallback: try menu_items for old data (uses mapProduct for old column names)
        const { data: oldData } = await supabase
          .from("menu_items")
          .select("item_id, category_code, name, description, base_price, image, badge, is_active")
          .eq("is_active", true)
          .eq("category_code", "drinks")
          .order("item_id", { ascending: true });

        setProducts(oldData && oldData.length > 0 ? (oldData || []).map(mapProduct) : FALLBACK_DRINKS);
      } catch {
        // Final fallback: inline sample data
        setProducts(FALLBACK_DRINKS);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const allMenuItems = products.map((p) => {
    // When data comes from Supabase via mapFoodProduct, subcategory is "sides"
    // (mapSubcategory fallback). Always use guessDrinkCategory for proper
    // subcategory filtering (carbonated, juices, coffee-tea, water).
    // For fallback data, subcategory is undefined so guessDrinkCategory runs.
    const isSupabaseDrink = p.subcategory === "sides" || !p.subcategory;
    return {
      ...p,
      category: isSupabaseDrink ? guessDrinkCategory(p.name || "") : p.subcategory,
      prep: p.prep || "5 mins",
      kcal: p.kcal || "~150 kcal",
    };
  });

  const filteredItems = allMenuItems.filter((item) => {
    const matchesCategory = specialCategory === "all" || item.category === specialCategory;
    const matchesQuery = !query ||
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
    <div className="bg-gradient-to-b from-blue-50/40 via-white to-white min-h-screen">
      <div className="max-w-7xl mx-auto px-5 md:px-8 py-8 md:py-12">
        {/* Back link */}
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
          <header className="mb-12 text-center max-w-2xl mx-auto">
            <span className="text-persimmon font-semibold tracking-wider uppercase text-sm">
              Quench Your Thirst
            </span>
            <h1 className="font-display text-4xl md:text-5xl font-light text-stone-900 mt-2 mb-4">
              Drinks &amp; Beverages
            </h1>
            <p className="text-stone-500 text-sm md:text-base leading-relaxed">
              From ice-cold sodas and fresh tropical juices to rich Ugandan coffee
              and spiced chai — find your perfect sip to go with your meal.
            </p>
          </header>
        </AnimatedSection>

        {/* ═══ CocaCola Featured Cards ═══ */}
        <AnimatedSection>
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 rounded-lg bg-persimmon/10 flex items-center justify-center">
                <CupSoda size={16} className="text-persimmon" />
              </div>
              <div>
                <h2 className="font-display text-xl font-semibold text-stone-900">
                  CocaCola Classics
                </h2>
                <p className="text-xs text-stone-400 mt-0.5">
                  The world&apos;s favourite cola — served your way
                </p>
              </div>
              <div className="flex-1 h-px bg-stone-100 ml-4" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {/* Plastic Bottle */}
              <div
                className="group relative bg-white rounded-2xl border border-stone-200/80 overflow-hidden hover:border-stone-300 hover:shadow-xl hover:shadow-stone-900/5 transition-all duration-500"
                style={{
                  opacity: 0,
                  animation: gridInView ? `fade-up 0.5s cubic-bezier(0.16,1,0.3,1) 0ms forwards` : "none",
                }}
              >
                <div className="relative h-48 overflow-hidden bg-gradient-to-br from-red-50 to-rose-50">
                  <img
                    src="/food/plastic-cocacola.jpg"
                    alt="CocaCola Plastic Bottle"
                    className="w-full h-full object-contain p-6 group-hover:scale-110 transition-transform duration-700"
                    onError={(e) => { e.target.style.display = "none"; }}
                  />
                  <span className="absolute top-3 left-3 inline-flex items-center gap-1 bg-red-600 text-white text-[9px] font-bold uppercase tracking-[0.15em] px-2.5 py-1 rounded-full shadow-lg">
                    Plastic
                  </span>
                </div>
                <div className="p-5 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-stone-900">CocaCola Plastic Bottle</h3>
                    <p className="text-xs text-stone-400 mt-0.5">Crisp, chilled, resealable</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-base font-bold text-persimmon tabular-nums">UGX 2,500</span>
                    <button
                      onClick={() => onAdd({
                        id: "cocacola-plastic",
                        name: "CocaCola Plastic Bottle",
                        price: 2500,
                        image_url: "/food/plastic-cocacola.jpg",
                        category: "carbonated",
                        available: true,
                        featured: true,
                        prep: "2 mins",
                        kcal: "~150 kcal",
                      })}
                      className="px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-persimmon active:scale-[0.97] transition-all duration-300"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Glass Bottle */}
              <div
                className="group relative bg-white rounded-2xl border border-stone-200/80 overflow-hidden hover:border-stone-300 hover:shadow-xl hover:shadow-stone-900/5 transition-all duration-500"
                style={{
                  opacity: 0,
                  animation: gridInView ? `fade-up 0.5s cubic-bezier(0.16,1,0.3,1) 100ms forwards` : "none",
                }}
              >
                <div className="relative h-48 overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50">
                  <img
                    src="/food/glass-cocacola.jpg"
                    alt="CocaCola Glass Bottle"
                    className="w-full h-full object-contain p-6 group-hover:scale-110 transition-transform duration-700"
                    onError={(e) => { e.target.style.display = "none"; }}
                  />
                  <span className="absolute top-3 left-3 inline-flex items-center gap-1 bg-amber-700 text-white text-[9px] font-bold uppercase tracking-[0.15em] px-2.5 py-1 rounded-full shadow-lg">
                    Glass
                  </span>
                </div>
                <div className="p-5 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-stone-900">CocaCola Glass Bottle</h3>
                    <p className="text-xs text-stone-400 mt-0.5">Nostalgic, colder sip</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-base font-bold text-persimmon tabular-nums">UGX 3,000</span>
                    <button
                      onClick={() => onAdd({
                        id: "cocacola-glass",
                        name: "CocaCola Glass Bottle",
                        price: 3000,
                        image_url: "/food/glass-cocacola.jpg",
                        category: "carbonated",
                        available: true,
                        featured: true,
                        prep: "2 mins",
                        kcal: "~150 kcal",
                      })}
                      className="px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-persimmon active:scale-[0.97] transition-all duration-300"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* ═══ All Beverages Grid ═══ */}
        <AnimatedSection>
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center">
                <CupSoda size={16} className="text-sky-500" />
              </div>
              <div>
                <h2 className="font-display text-xl font-semibold text-stone-900">
                  All Beverages
                </h2>
                <p className="text-xs text-stone-400 mt-0.5">
                  Every drink we serve, all in one place
                </p>
              </div>
              <div className="flex-1 h-px bg-stone-100 ml-4" />
            </div>

            {/* Search */}
            <div className="max-w-md mx-auto mb-6">
              <div className="relative">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search drinks…"
                  className="w-full pl-11 pr-10 py-3 bg-white border border-stone-200 rounded-xl text-sm text-stone-900 placeholder:text-stone-400/70 focus:outline-none focus:border-persimmon focus:ring-2 focus:ring-persimmon/10 transition-all duration-300 shadow-sm"
                />
                {query && (
                  <button onClick={() => setQuery("")} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors" aria-label="Clear search">
                    <X size={15} />
                  </button>
                )}
              </div>
            </div>

            {/* Category filter tabs */}
            <div className="flex flex-wrap items-center gap-2 mb-8">
              {DRINK_CATEGORIES.map((cat) => {
                const ICON_MAP = { Star, Flame, Utensils, CupSoda, Heart };
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
                    <div key={i} className="rounded-2xl overflow-hidden bg-white border border-stone-200 animate-pulse">
                      <div className="h-48 bg-stone-100" />
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
                    {query ? `No drinks matching "${query}"` : "No beverages available yet"}
                  </p>
                  <p className="text-stone-500 text-sm mt-1">
                    {query ? "Try a different search term." : "Check back soon for new additions."}
                  </p>
                  {query && (
                    <button onClick={() => setQuery("")} className="mt-5 text-sm font-medium text-persimmon hover:text-stone-900 transition-colors">
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
                          ? `fade-up 0.5s cubic-bezier(0.16,1,0.3,1) ${idx * 60}ms forwards`
                          : "none",
                      }}
                    >
                      <div className="relative h-48 w-full overflow-hidden bg-stone-100">
                        <img
                          src={dish.image_url}
                          alt={dish.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => { e.target.style.display = "none"; }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        {dish.featured && (
                          <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 text-[10px] font-semibold uppercase tracking-[0.15em] px-2.5 py-1 rounded-full shadow-lg shadow-amber-900/10 border border-amber-200/60">
                            <Star size={10} className="text-amber-500" />
                            Popular
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
                            <h3 className="text-base font-semibold text-stone-900 leading-snug">{dish.name}</h3>
                            <span className="text-base font-bold text-persimmon whitespace-nowrap tabular-nums">
                              UGX {Number(dish.price).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm text-stone-500 leading-relaxed mb-4 line-clamp-2">
                            {dish.description}
                          </p>
                        </div>

                        <div>
                          <div className="flex items-center gap-4 text-xs text-stone-400 border-t border-stone-100 pt-3 mb-4">
                            <div className="flex items-center gap-1.5">
                              <Clock size={13} className="text-persimmon" />
                              <span>{dish.prep}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Flame size={13} className="text-persimmon" />
                              <span>{dish.kcal}</span>
                            </div>
                          </div>

                          <button
                            onClick={() => onAdd(dish)}
                            className="w-full py-2.5 rounded-xl bg-stone-900 text-white text-sm font-semibold hover:bg-persimmon active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 shadow-md shadow-stone-900/15 hover:shadow-lg hover:shadow-persimmon/25"
                          >
                            <CupSoda size={14} />
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

        {/* Footer note */}
        <AnimatedSection>
          <div className="text-center">
            <p className="text-[11px] text-stone-400 italic">
              * CocaCola is a registered trademark of The CocaCola Company.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex items-center gap-2 text-sm text-stone-400 hover:text-persimmon transition-colors"
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
