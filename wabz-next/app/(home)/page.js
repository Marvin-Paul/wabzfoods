"use client";

import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

/* ── Staggered entrance animation for grid items ── */
const itemStyle = (idx, base = 0.5) => ({
  opacity: 0,
  animation: `fade-up ${base}s cubic-bezier(0.16,1,0.3,1) ${idx * 60}ms forwards`,
});

/* ── 3D tilt on hover hook for interactive cards ── */
function useTilt(maxTilt = 5) {
  const ref = useRef(null);

  useEffect(() => {
    const card = ref.current;
    if (!card) return;

    const onMouseMove = (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -maxTilt;
      const rotateY = ((x - centerX) / centerX) * maxTilt;
      card.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    };

    const onMouseLeave = () => {
      card.style.transform = "perspective(600px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
    };

    card.addEventListener("mousemove", onMouseMove);
    card.addEventListener("mouseleave", onMouseLeave);

    return () => {
      card.removeEventListener("mousemove", onMouseMove);
      card.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [maxTilt]);

  return ref;
}

/* ── Rich empty-state content cards ── */
const POPULAR_SEARCHES = [
  "Rolex",
  "Chicken",
  "Matooke",
  "Burger",
  "Pizza",
  "Luwombo",
  "Chips",
  "Samosa",
];

const EMPTY_CAT_KEYS = { "Local Foods": "local", "Fast Foods": "fast" };

function EmptyStateContent({ query, filter, onClear, onBrowse, onSearch }) {
  return (
    <div className="py-16 md:py-20">
      {/* Context-aware header */}
      <AnimatedSection>
        <div className="text-center max-w-lg mx-auto mb-14">
          <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto mb-4">
            <Search size={24} className="text-stone-400" />
          </div>
          <p className="text-stone-900 font-semibold text-lg">
            {query ? `No results for "${query}"` : "No dishes in this category yet"}
          </p>
          <p className="text-stone-500 text-sm mt-1.5">
            {query
              ? "Try a different search term or browse the categories below."
              : "Check out our other categories or explore what's popular."}
          </p>
          {(query || filter !== "all") && (
            <button
              onClick={onClear}
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-persimmon hover:text-stone-900 transition-colors"
            >
              <X size={14} />
              Clear all filters
            </button>
          )}
        </div>
      </AnimatedSection>

      {/* Popular searches — quick tags */}
      {query && (
        <AnimatedSection>
          <div className="max-w-2xl mx-auto mb-14 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-400 mb-4">
              Popular searches
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {POPULAR_SEARCHES.map((term) => (
                <button
                  key={term}
                  onClick={() => onSearch(term)}
                  className="px-4 py-2 rounded-full bg-white border border-stone-200 text-sm text-stone-600 hover:border-persimmon hover:text-persimmon hover:shadow-sm transition-all duration-200"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </AnimatedSection>
      )}

      {/* Category browse cards — reuse FEATURED_CATEGORIES data */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 max-w-4xl mx-auto mb-14">
        {FEATURED_CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const catKey = EMPTY_CAT_KEYS[cat.title];
          return (
            <AnimatedSection key={catKey}>
              <div
                className={`group relative rounded-2xl overflow-hidden bg-gradient-to-br ${cat.gradient} border border-stone-200/60 hover:shadow-lg hover:shadow-stone-900/5 transition-all duration-500`}
              >
                <div className="relative p-6 md:p-8 pb-36 md:pb-44">
                  <div
                    className={`inline-flex items-center gap-1.5 ${cat.color} text-[10px] font-semibold uppercase tracking-[0.15em] px-3 py-1.5 rounded-full border mb-3`}
                  >
                    <Icon size={12} />
                    {cat.tag}
                  </div>
                  <h4 className="font-display text-xl md:text-2xl font-semibold text-stone-900 mb-2">
                    {cat.title}
                  </h4>
                  <p className="text-sm text-stone-600 leading-relaxed line-clamp-2">
                    {cat.description}
                  </p>
                  <button
                    onClick={() => onBrowse(catKey)}
                    className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-stone-900 hover:text-persimmon transition-colors group/btn"
                  >
                    Browse {cat.title}
                    <ArrowRight
                      size={14}
                      className="transition-transform duration-300 group-hover/btn:translate-x-1"
                    />
                  </button>
                </div>
                <div className="absolute -bottom-4 -right-4 w-36 h-36 md:w-44 md:h-44 rounded-xl overflow-hidden shadow-lg rotate-6 group-hover:rotate-3 group-hover:scale-105 transition-all duration-700">
                  <img src={cat.image} alt={cat.title} className="w-full h-full object-cover" />
                </div>
              </div>
            </AnimatedSection>
          );
        })}
      </div>

      {/* Getting started guide card */}
      <AnimatedSection>
        <div className="max-w-2xl mx-auto">
          <div className="bg-gradient-to-br from-stone-900 to-stone-800 rounded-2xl p-6 md:p-8 text-stone-50 shadow-xl shadow-stone-900/10">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-persimmon/15 flex items-center justify-center">
                <Flame size={18} className="text-persimmon" />
              </div>
              <div>
                <h4 className="font-display text-lg font-semibold">How to get started</h4>
                <p className="text-xs text-stone-400">Your next meal is just a few taps away</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { step: "1", label: "Browse", desc: "Explore our menu and pick what you love" },
                { step: "2", label: "Order", desc: "Add to cart, checkout, and pay securely" },
                { step: "3", label: "Enjoy", desc: "Track your delivery and dig in hot & fresh" },
              ].map((item) => (
                <div
                  key={item.step}
                  className="bg-white/5 rounded-xl p-4 text-center hover:bg-white/10 transition-colors"
                >
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-persimmon text-white text-[11px] font-bold mb-2">
                    {item.step}
                  </span>
                  <p className="text-sm font-semibold text-stone-100">{item.label}</p>
                  <p className="text-[11px] text-stone-400 mt-0.5">{item.desc}</p>
                </div>
              ))}
            </div>

            <button
              onClick={() =>
                document
                  .getElementById("menu")
                  ?.scrollIntoView({ behavior: "smooth", block: "start" })
              }
              className="mt-5 w-full py-3 rounded-xl bg-persimmon text-white text-sm font-semibold hover:bg-white hover:text-stone-900 transition-all duration-300 flex items-center justify-center gap-2"
            >
              Start Browsing
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </AnimatedSection>
    </div>
  );
}

import { supabase } from "@/lib/supabaseClient";
import { mapFoodProduct, DEFAULT_SETTINGS } from "@/lib/supabase-data";
import { Image } from "@/components/ui/image";
import MenuItemCard from "@/components/MenuItemCard";
import { useCart } from "@/components/CartContext";
import {
  Search,
  ChevronDown,
  Flame,
  ArrowDown,
  Pizza,
  Soup,
  UtensilsCrossed,
  X,
  ShoppingBag,
  ChefHat,
  CupSoda,
  Truck,
  Clock,
  Star,
  Users,
  TrendingUp,
  BadgeCheck,
  Quote,
  ArrowRight,
  Phone,
  Sparkles,
} from "lucide-react";

const HERO_IMG =
  "https://media.base44.com/images/public/6a63bf91a5d037c8051275ea/88848c734_generated_image.png";

const CATEGORIES = [
  { key: "all", label: "All", icon: UtensilsCrossed },
  { key: "local", label: "Local Foods", icon: Soup },
  { key: "fast", label: "Fast Foods", icon: Pizza },
];

const HOW_IT_WORKS = [
  {
    icon: ShoppingBag,
    title: "Choose Your Meal",
    desc: "Browse our menu of Ugandan classics and fast-food favourites. Pick what you're craving and add it to your cart.",
    color: "text-persimmon",
    bg: "bg-persimmon/10",
  },
  {
    icon: ChefHat,
    title: "We Cook Fresh",
    desc: "Our chefs prepare your order from scratch using the freshest ingredients. Every dish is made with care and passion.",
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    icon: Truck,
    title: "Delivered to You",
    desc: "Track your order in real time as it makes its way to your door. Hot, fresh, and on time — every time.",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
];

const STATS = [
  { key: "stat_menu_items", value: "150+", label: "Menu Items", icon: ShoppingBag },
  { key: "stat_orders_delivered", value: "12K+", label: "Orders Delivered", icon: TrendingUp },
  { key: "stat_avg_delivery_time", value: "30m", label: "Avg. Delivery Time", icon: Clock },
  { key: "stat_expert_chefs", value: "15+", label: "Expert Chefs", icon: Users },
];

const TESTIMONIALS = [
  {
    name: "Sarah N.",
    role: "Regular Customer",
    initials: "SN",
    quote:
      "The Ugandan Rolex from Wabz Foods is absolutely incredible! Tastes just like home. Delivery is always on time and the food arrives hot.",
    rating: 5,
  },
  {
    name: "James M.",
    role: "Verified Buyer",
    initials: "JM",
    quote:
      "I order from Wabz at least twice a week. The menu variety is fantastic — from local dishes to fast food, they have it all. Highly recommended!",
    rating: 5,
  },
  {
    name: "Grace A.",
    role: "Food Enthusiast",
    initials: "GA",
    quote:
      "Great online ordering experience. The tracking feature lets me know exactly when my food will arrive. The chicken and chips are a must-try!",
    rating: 5,
  },
];

const FEATURED_CATEGORIES = [
  {
    title: "Local Foods",
    tag: "Taste of Uganda",
    description:
      "From matooke to luwombo, enjoy authentic Ugandan dishes prepared by expert chefs using traditional recipes passed down through generations.",
    icon: Soup,
    color: "bg-amber-50 text-amber-800 border-amber-200",
    gradient: "from-amber-50 to-orange-50",
    image: "https://images.unsplash.com/photo-1559847844-5315695dadae?w=600&q=80",
  },
  {
    title: "Fast Foods",
    tag: "Quick & Delicious",
    description:
      "Craving burgers, pizza, or fries? Our fast-food selection is made fresh to order with premium ingredients for that perfect bite every time.",
    icon: Pizza,
    color: "bg-red-50 text-red-800 border-red-200",
    gradient: "from-red-50 to-rose-50",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80",
  },
];

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
      { threshold: 0.1, ...options }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return [ref, inView];
}

/* ── TiltCard wrapper — 3D tilt on hover (rules-of-hooks safe) ── */
function TiltCard({ children, tilt = 5 }) {
  const ref = useTilt(tilt);
  return (
    <div
      ref={ref}
      className="relative"
      style={{ transition: "transform 0.4s cubic-bezier(0.16,1,0.3,1)" }}
    >
      {children}
    </div>
  );
}

/* ── MenuItemCard with category badge (reused in curated + grouped sections) ── */
function MenuItemCardWrapper({ product, onAdd, tilt = false, activeFilter = "all" }) {
  const hideBadge = activeFilter !== "all" && activeFilter === product.category;

  const badge =
    product.category === "local" ? (
      <span
        className={`absolute top-3 left-3 z-10 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.15em] px-2 py-1 rounded-full shadow-sm transition-all duration-500 ease-out ${
          hideBadge
            ? "opacity-0 scale-75 pointer-events-none"
            : "opacity-100 scale-100 group-hover:scale-110 group-hover:shadow-md bg-amber-50 text-amber-800 border border-amber-200"
        }`}
      >
        <Soup size={10} className={hideBadge ? "opacity-0" : ""} />
        Local
      </span>
    ) : product.category === "fast" ? (
      <span
        className={`absolute top-3 left-3 z-10 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.15em] px-2 py-1 rounded-full shadow-sm transition-all duration-500 ease-out ${
          hideBadge
            ? "opacity-0 scale-75 pointer-events-none"
            : "opacity-100 scale-100 group-hover:scale-110 group-hover:shadow-md bg-red-50 text-red-800 border border-red-200"
        }`}
      >
        <Pizza size={10} className={hideBadge ? "opacity-0" : ""} />
        Fast
      </span>
    ) : null;

  const inner = (
    <div className="relative group">
      {badge}
      <MenuItemCard product={product} onAdd={onAdd} />
    </div>
  );

  return tilt ? <TiltCard>{inner}</TiltCard> : inner;
}

/* ── Marquee row — auto-scrolls right to left ── */
function MarqueeRow({ items, onAdd, activeFilter, speed = 40 }) {
  const [ref, inView] = useInView({ threshold: 0.1 });

  /* ── Duplicate items for seamless loop ── */
  const doubled = useMemo(() => [...items, ...items], [items]);

  return (
    <div ref={ref} className="relative overflow-hidden w-full group">
      <div
        className={`flex gap-5 md:gap-6 ${
          inView ? "animate-marquee" : ""
        } group-hover:[animation-play-state:paused]`}
        style={{
          width: "max-content",
          animationDuration: `${Math.max(speed, items.length * 3)}s`,
        }}
      >
        {doubled.map((p, i) => (
          <div key={`${p.id}-${i}`} className="flex-shrink-0 w-[280px] md:w-[300px]">
            <MenuItemCardWrapper product={p} onAdd={onAdd} activeFilter={activeFilter} />
          </div>
        ))}
      </div>
      {/* Gradient fade on edges */}
      <div className="absolute inset-y-0 left-0 w-20 md:w-32 bg-gradient-to-r from-cream-bg to-transparent pointer-events-none z-10" />
      <div className="absolute inset-y-0 right-0 w-20 md:w-32 bg-gradient-to-l from-cream-bg to-transparent pointer-events-none z-10" />
    </div>
  );
}

/* ── Animated section wrapper ── */
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

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [settings, setSettings] = useState(null);
  const [greetingUser, setGreetingUser] = useState(null);
  const { addItem, setOpen } = useCart();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const name = session.user.user_metadata?.full_name;
        if (name) setGreetingUser(name);
      }
    });
  }, []);

  useEffect(() => {
    Promise.all([
      supabase
        .from("food_items")
        .select("*, categories!inner(category_code)")
        .eq("is_available", true)
        .order("item_id", { ascending: true })
        .then(({ data }) => (data || []).map(mapFoodProduct)),
      Promise.resolve(DEFAULT_SETTINGS),
    ])
      .then(([products, settings]) => {
        setProducts(products);
        setSettings(settings);
      })
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

  /* ── Curated picks: 2 featured local + 2 featured fast ── */
  const curatedCards = useMemo(() => {
    const local = products.filter(
      (p) => p.category === "local" && p.featured && p.available !== false
    );
    const fast = products.filter(
      (p) => p.category === "fast" && p.featured && p.available !== false
    );
    const result = [];
    local.slice(0, 2).forEach((p) => result.push(p));
    fast.slice(0, 2).forEach((p) => result.push(p));
    return result;
  }, [products]);

  const onAdd = useCallback(
    (p) => {
      addItem(p);
      setOpen(true);
    },
    [addItem, setOpen]
  );

  const router = useRouter();

  /* ── Parallax scroll effect for hero background ── */
  const heroRef = useRef(null);
  const bgRef = useRef(null);

  useEffect(() => {
    const hero = heroRef.current;
    const bg = bgRef.current;
    if (!hero || !bg) return;

    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const rect = hero.getBoundingClientRect();
          const scrollOffset = -rect.top;
          const maxTranslate = hero.offsetHeight * 0.12;
          const translate = Math.max(-maxTranslate, Math.min(0, scrollOffset * -0.3));
          bg.style.transform = `translateY(${translate}px)`;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ── Open / closed check ── */
  const openStatus = (() => {
    const { opening_time, closing_time } = settings || {};
    if (!opening_time || !closing_time) return null;
    const now = new Date();
    const cur = now.getHours() * 60 + now.getMinutes();
    const [oh, om] = opening_time.split(":").map(Number);
    const [ch, cm] = closing_time.split(":").map(Number);
    const open = oh * 60 + om;
    const close = ch * 60 + cm;
    const isOpen = close <= open ? cur >= open || cur < close : cur >= open && cur < close;
    let minsUntil = null;
    if (isOpen) {
      minsUntil = close > open ? close - cur : 24 * 60 - cur + close;
    }
    return { isOpen, minsUntil, hours: `${opening_time} \u2013 ${closing_time}` };
  })();

  return (
    <div className="bg-gradient-to-b from-stone-50/50 to-white">
      {/* ════════════════════════════════════════════════
          HERO SECTION  (with parallax background)
      ════════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative min-h-[85vh] flex items-center bg-stone-900 text-stone-50 overflow-hidden"
      >
        <div ref={bgRef} className="absolute inset-0 will-change-transform">
          <Image src={HERO_IMG} alt="Wabz Food" fittingType="fill" className="w-full h-full" />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/85 to-stone-950/40" />
        </div>

        <div className="relative w-full max-w-7xl mx-auto px-5 md:px-8 py-28 md:py-40">
          {greetingUser && (
            <div className="inline-flex items-center gap-2 bg-emerald-500/15 text-emerald-400 text-[10px] font-semibold uppercase tracking-[0.2em] px-4 py-2 rounded-full border border-emerald-500/20 mb-3 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-2 duration-700">
              <Sparkles size={12} />
              Welcome back, {greetingUser}!
            </div>
          )}
          <div className="inline-flex items-center gap-2 bg-persimmon/15 text-persimmon text-[10px] font-semibold uppercase tracking-[0.2em] px-4 py-2 rounded-full border border-persimmon/20 mb-6 backdrop-blur-sm">
            <Flame size={12} />
            {settings?.name || "Wabz Foods"} &middot; Local &middot; Fast &middot; Crafted Fresh
          </div>

          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-light leading-[0.92] tracking-tight max-w-3xl text-balance">
            Taste home.
            <br />
            <span className="text-persimmon">Taste the world.</span>
            <br />
            <span
              className="bg-gradient-to-r from-persimmon via-amber-300 to-amber-400 bg-clip-text text-transparent animate-shimmer"
              style={{ backgroundSize: "200% auto" }}
            >
              Delivered.
            </span>
          </h1>

          <p className="mt-6 text-base md:text-lg text-stone-300/80 max-w-lg leading-relaxed">
            From Ugandan classics to fast-food favourites — order online, pay securely, and track
            your meal in real time.
          </p>

          <div className="flex flex-wrap items-center gap-4 mt-10">
            <a
              href="#menu"
              className="inline-flex items-center gap-2.5 bg-persimmon text-white px-8 py-4 text-sm font-semibold uppercase tracking-[0.15em] rounded-xl hover:bg-white hover:text-stone-900 transition-all duration-300 shadow-xl shadow-persimmon/20 hover:shadow-white/10 group"
            >
              Explore the Menu
              <ChevronDown
                size={16}
                className="transition-transform duration-300 group-hover:translate-y-1"
              />
            </a>
            <a
              href="#menu"
              className="inline-flex items-center gap-2 px-8 py-4 text-sm font-medium text-stone-300/90 hover:text-white border border-stone-700/50 rounded-xl hover:border-stone-500 transition-all duration-300"
            >
              Order Now
            </a>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <span className="text-[9px] uppercase tracking-[0.2em] text-persimmon/60">Scroll</span>
          <ArrowDown size={14} className="text-persimmon/40" />
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          OPEN / CLOSED BANNER
      ════════════════════════════════════════════════ */}
      {openStatus && (
        <AnimatedSection>
          <section className="relative z-10 max-w-7xl mx-auto px-5 md:px-8 mt-8">
            <div
              className={`rounded-xl border px-5 py-3 flex items-center gap-3 text-sm ${
                openStatus.isOpen
                  ? openStatus.minsUntil <= 30
                    ? "bg-amber-50 border-amber-200 text-amber-800"
                    : "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : "bg-stone-100 border-stone-200 text-stone-600"
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full shrink-0 ${
                  openStatus.isOpen
                    ? openStatus.minsUntil <= 30
                      ? "bg-amber-500"
                      : "bg-emerald-500"
                    : "bg-stone-400"
                }`}
              />
              {openStatus.isOpen ? (
                <>
                  <span className="font-semibold">
                    {openStatus.minsUntil <= 30 ? `Closing soon!` : `We\u2019re open!`}
                  </span>
                  <span className="opacity-80">
                    {openStatus.minsUntil <= 30
                      ? `Order within ${openStatus.minsUntil} minutes.`
                      : `Open until ${settings?.closing_time || ""}.`}
                  </span>
                </>
              ) : (
                <>
                  <span className="font-semibold">We\u2019re closed</span>
                  <span className="opacity-80">Open {openStatus.hours}. Come back then!</span>
                </>
              )}
            </div>
          </section>
        </AnimatedSection>
      )}

      {/* ════════════════════════════════════════════════
          RESTAURANT INFO BAR
      ════════════════════════════════════════════════ */}
      {settings && (
        <AnimatedSection>
          <section className="relative z-10 max-w-7xl mx-auto px-5 md:px-8 mt-4">
            <div className="bg-white rounded-xl border border-stone-200 shadow-sm shadow-stone-900/5 px-6 py-3 md:py-4">
              <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-xs md:text-sm">
                {Number(settings.delivery_fee) > 0 && (
                  <div className="flex items-center gap-2 text-stone-500">
                    <Truck size={14} className="text-stone-400" />
                    <span>
                      Delivery{" "}
                      <span className="font-medium text-stone-700">
                        UGX {Number(settings.delivery_fee).toLocaleString()}
                      </span>
                    </span>
                  </div>
                )}
                {settings.phone && (
                  <div className="flex items-center gap-2 text-stone-500">
                    <Phone size={14} className="text-stone-400" />
                    <a
                      href={`tel:${settings.phone}`}
                      className="font-medium text-stone-700 hover:text-persimmon transition-colors"
                    >
                      {settings.phone}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </section>
        </AnimatedSection>
      )}

      {/* ════════════════════════════════════════════════
          STATS / TRUST BAR
      ════════════════════════════════════════════════ */}
      <section className="relative -mt-16 z-10 max-w-7xl mx-auto px-5 md:px-8">
        <AnimatedSection>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px rounded-2xl overflow-hidden shadow-xl shadow-stone-900/5 bg-stone-200">
            {STATS.map((stat, i) => {
              const Icon = stat.icon;
              const statValue = settings?.[stat.key] || stat.value;
              return (
                <div
                  key={stat.label}
                  className="bg-white px-6 py-8 md:py-10 flex flex-col items-center text-center"
                >
                  <div className="w-12 h-12 rounded-xl bg-persimmon/10 flex items-center justify-center mb-4">
                    <Icon size={22} className="text-persimmon" />
                  </div>
                  <span className="font-display text-3xl md:text-4xl font-bold text-stone-900 tabular-nums">
                    {statValue}
                  </span>
                  <span className="text-sm text-stone-500 mt-1.5 font-medium">{stat.label}</span>
                </div>
              );
            })}
          </div>
        </AnimatedSection>
      </section>

      {/* ════════════════════════════════════════════════
          CURATED PICKS — 2 featured local + 2 featured fast
      ════════════════════════════════════════════════ */}
      {curatedCards.length > 0 && !loading && (
        <section className="max-w-7xl mx-auto px-5 md:px-8 pt-24 md:pt-32">
          <AnimatedSection>
            <div className="mb-14">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                  <Flame size={16} className="text-persimmon" />
                </div>
                <div>
                  <h3 className="font-display text-2xl md:text-3xl font-light text-stone-900">
                    Chef&apos;s Picks
                  </h3>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Our most-loved dishes from both menus, handpicked for you
                  </p>
                </div>
                <div className="flex-1 h-px bg-stone-100 ml-4" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
                {curatedCards.map((p, i) => (
                  <div
                    key={p.id}
                    className="transition-all duration-700 ease-out"
                    style={itemStyle(i, 0.6)}
                  >
                    <MenuItemCardWrapper product={p} onAdd={onAdd} tilt activeFilter={filter} />
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-center mt-10">
                <button
                  onClick={() =>
                    document
                      .getElementById("menu")
                      ?.scrollIntoView({ behavior: "smooth", block: "start" })
                  }
                  className="group inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl bg-stone-900 text-white text-sm font-semibold hover:bg-persimmon transition-all duration-300 shadow-lg shadow-stone-900/10"
                >
                  Browse Full Menu
                  <ArrowRight
                    size={15}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </button>
              </div>
            </div>
          </AnimatedSection>
        </section>
      )}

      {/* ════════════════════════════════════════════════
          MENU SECTION (with integrated Chef's Picks)
      ════════════════════════════════════════════════ */}
      <section id="menu" className="max-w-7xl mx-auto px-5 md:px-8 pt-24 md:pt-32 pb-12 md:pb-16">
        {/* Header */}
        <AnimatedSection>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-persimmon/70 mb-3">
                Browse Our Menu
              </p>
              <h2
                className="font-display text-3xl md:text-4xl font-light bg-gradient-to-r from-stone-900 via-persimmon to-amber-600 bg-clip-text text-transparent animate-shimmer"
                style={{ backgroundSize: "200% auto" }}
              >
                What are you craving?
              </h2>
            </div>

            <div className="relative w-full md:w-80">
              <Search
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none"
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search dishes…"
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
        </AnimatedSection>

        {/* Category Filter Pills */}
        <AnimatedSection>
          <div className="flex gap-2.5 mb-12 overflow-x-auto pb-2 -mx-5 px-5 md:mx-0 md:px-0 scrollbar-hide">
            {CATEGORIES.map((f) => {
              const Icon = f.icon;
              return (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                    filter === f.key
                      ? "bg-stone-900 text-white shadow-xl shadow-stone-900/20 scale-105"
                      : "bg-white text-stone-600 border border-stone-200 hover:border-stone-400 hover:text-stone-900 hover:shadow-md hover:shadow-stone-900/5"
                  }`}
                >
                  <Icon size={15} />
                  {f.label}
                </button>
              );
            })}
          </div>
        </AnimatedSection>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden bg-white border border-stone-200">
                <div className="aspect-[4/3] bg-stone-100 animate-pulse" />
                <div className="p-5 space-y-3">
                  <div className="h-3 w-16 bg-stone-100 rounded animate-pulse" />
                  <div className="h-5 w-3/4 bg-stone-100 rounded animate-pulse" />
                  <div className="h-3 w-1/2 bg-stone-100 rounded animate-pulse" />
                  <div className="h-10 w-full bg-stone-100 rounded-xl animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : grouped.size === 0 ? (
          <EmptyStateContent
            query={query}
            filter={filter}
            onClear={() => {
              setQuery("");
              setFilter("all");
            }}
            onBrowse={(cat) => {
              router.push(cat === "local" ? "/local" : "/fast");
            }}
            onSearch={(term) => setQuery(term)}
          />
        ) : (
          <div className="space-y-16 md:space-y-20">
            {[...grouped.entries()].map(([category, items]) => (
              <AnimatedSection key={category}>
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center flex-shrink-0">
                    <Soup size={16} className="text-stone-500" />
                  </div>
                  <div>
                    <h3 className="font-display text-2xl md:text-3xl font-light text-stone-900">
                      {category}
                    </h3>
                    <p className="text-xs text-stone-400 mt-0.5 font-medium">
                      {items.length} item{items.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="flex-1 h-px bg-stone-100 ml-4" />
                </div>

                <MarqueeRow
                  items={items}
                  onAdd={onAdd}
                  activeFilter={filter}
                  speed={items.length * 3}
                />

                <div
                  className="flex items-center justify-center mt-8"
                  style={{
                    opacity: 0,
                    animation: `fade-up 0.6s cubic-bezier(0.16,1,0.3,1) 400ms forwards`,
                  }}
                >
                  {category === "local" ? (
                    <Link
                      href="/local"
                      className="group inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-sm font-semibold hover:bg-amber-100 hover:border-amber-300 transition-all duration-300 shadow-sm"
                    >
                      <Soup size={16} />
                      Browse Local Foods
                      <ArrowRight
                        size={14}
                        className="transition-transform duration-300 group-hover:translate-x-1"
                      />
                    </Link>
                  ) : (
                    <Link
                      href="/fast"
                      className="group inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-red-50 text-red-800 border border-red-200 text-sm font-semibold hover:bg-red-100 hover:border-red-300 transition-all duration-300 shadow-sm"
                    >
                      <Pizza size={16} />
                      Browse Fast Foods
                      <ArrowRight
                        size={14}
                        className="transition-transform duration-300 group-hover:translate-x-1"
                      />
                    </Link>
                  )}
                </div>
              </AnimatedSection>
            ))}
          </div>
        )}
      </section>

      {/* ════════════════════════════════════════════════
          DRINKS — CocaCola Selection
      ════════════════════════════════════════════════ */}
      <section className="bg-gradient-to-b from-stone-50 to-stone-100/40 py-24 md:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <AnimatedSection>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-persimmon/70 mb-4 block">
                Quench Your Thirst
              </span>
              <h2
                className="font-display text-3xl md:text-4xl font-light bg-gradient-to-r from-stone-900 via-persimmon to-amber-600 bg-clip-text text-transparent animate-shimmer mb-5"
                style={{ backgroundSize: "200% auto" }}
              >
                The Classic You Love — Now Served Your Way
              </h2>
              <p className="text-stone-500 text-sm md:text-base leading-relaxed max-w-2xl mx-auto">
                Whether you prefer the crisp refreshment of a chilled plastic bottle or the timeless
                elegance of a glass-bottled CocaCola — we&apos;ve got your perfect sip waiting. Grab
                one with your meal!
              </p>
            </div>
          </AnimatedSection>

          {/* ── CocaCola cards — full bleed ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 max-w-4xl mx-auto">
            {/* Plastic Bottle */}
            <AnimatedSection>
              <TiltCard tilt={8}>
                <div className="group relative bg-white rounded-2xl border border-stone-200/80 overflow-hidden hover:border-stone-300 hover:shadow-2xl hover:shadow-stone-900/10 transition-all duration-700">
                  {/* Full-bleed image */}
                  <div className="absolute inset-0">
                    <img
                      src="/food/plastic-cocacola.jpg"
                      alt="CocaCola Plastic Bottle"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    />
                  </div>
                  {/* Dark gradient overlay — deepest at bottom for text */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 via-50% to-black/5" />
                  {/* Extra tint wash over the image */}
                  <div className="absolute inset-0 bg-gradient-to-br from-red-800/10 to-rose-900/30 mix-blend-overlay" />

                  {/* Content stacked on top */}
                  <div className="relative z-10 flex flex-col justify-end min-h-[36rem] md:min-h-[40rem] p-6 md:p-8">
                    {/* Badge */}
                    <span className="absolute top-5 left-5 inline-flex items-center gap-1.5 bg-red-600/90 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-[0.15em] px-3 py-1.5 rounded-full shadow-lg border border-white/10">
                      <CupSoda size={11} />
                      Plastic Bottle
                    </span>

                    <div className="mt-auto">
                      <h3 className="font-display text-2xl font-semibold text-white drop-shadow-sm">
                        CocaCola &mdash; Plastic Bottle
                      </h3>
                      <p className="text-sm text-white/70 leading-relaxed mt-2 mb-6 max-w-xs drop-shadow-sm">
                        The classic CocaCola taste you know and love, in a convenient resealable
                        plastic bottle. Crisp, chilled, and ready to go.
                      </p>
                      <div className="flex items-center justify-between gap-4">
                        <span className="font-display text-3xl font-bold text-white tabular-nums drop-shadow-lg">
                          UGX 2,500
                        </span>
                        <button
                          onClick={() =>
                            onAdd({
                              id: "cocacola-plastic",
                              name: "CocaCola Plastic Bottle",
                              price: 2500,
                              image_url: "/food/plastic-cocacola.jpg",
                              category: "drinks",
                              available: true,
                              featured: true,
                              prep: "2 mins",
                              kcal: "~150 kcal",
                            })
                          }
                          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/20 backdrop-blur-md text-white text-sm font-semibold hover:bg-white hover:text-stone-900 active:scale-[0.97] transition-all duration-300 shadow-lg border border-white/20 hover:border-white/40"
                        >
                          Add to Order
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </TiltCard>
            </AnimatedSection>

            {/* Glass Bottle */}
            <AnimatedSection>
              <TiltCard tilt={8}>
                <div className="group relative bg-white rounded-2xl border border-stone-200/80 overflow-hidden hover:border-stone-300 hover:shadow-2xl hover:shadow-stone-900/10 transition-all duration-700">
                  {/* Full-bleed image */}
                  <div className="absolute inset-0">
                    <img
                      src="/food/glass-cocacola.jpg"
                      alt="CocaCola Glass Bottle"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    />
                  </div>
                  {/* Dark gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 via-50% to-black/5" />
                  {/* Warm amber tint wash */}
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-800/10 to-orange-900/30 mix-blend-overlay" />

                  {/* Content stacked on top */}
                  <div className="relative z-10 flex flex-col justify-end min-h-[36rem] md:min-h-[40rem] p-6 md:p-8">
                    {/* Badge */}
                    <span className="absolute top-5 left-5 inline-flex items-center gap-1.5 bg-amber-700/90 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-[0.15em] px-3 py-1.5 rounded-full shadow-lg border border-white/10">
                      <CupSoda size={11} />
                      Glass Bottle
                    </span>

                    <div className="mt-auto">
                      <h3 className="font-display text-2xl font-semibold text-white drop-shadow-sm">
                        CocaCola &mdash; Glass Bottle
                      </h3>
                      <p className="text-sm text-white/70 leading-relaxed mt-2 mb-6 max-w-xs drop-shadow-sm">
                        The nostalgic glass bottle experience. Thicker glass, colder sip, and that
                        unmistakable CocaCola fizz you remember from the good old days.
                      </p>
                      <div className="flex items-center justify-between gap-4">
                        <span className="font-display text-3xl font-bold text-white tabular-nums drop-shadow-lg">
                          UGX 3,000
                        </span>
                        <button
                          onClick={() =>
                            onAdd({
                              id: "cocacola-glass",
                              name: "CocaCola Glass Bottle",
                              price: 3000,
                              image_url: "/food/glass-cocacola.jpg",
                              category: "drinks",
                              available: true,
                              featured: true,
                              prep: "2 mins",
                              kcal: "~150 kcal",
                            })
                          }
                          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/20 backdrop-blur-md text-white text-sm font-semibold hover:bg-white hover:text-stone-900 active:scale-[0.97] transition-all duration-300 shadow-lg border border-white/20 hover:border-white/40"
                        >
                          Add to Order
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </TiltCard>
            </AnimatedSection>
          </div>

          {/* Browse all drinks CTA */}
          <AnimatedSection>
            <div className="flex justify-center mt-10">
              <Link
                href="/drinks"
                className="group inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-sky-50 text-sky-800 border border-sky-200 text-sm font-semibold hover:bg-sky-100 hover:border-sky-300 transition-all duration-300 shadow-sm"
              >
                <CupSoda size={16} />
                Browse All Drinks
                <ArrowRight
                  size={14}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>
            </div>
          </AnimatedSection>

          {/* Subtle footer note */}
          <AnimatedSection>
            <p className="text-center text-xs text-stone-400 mt-8 italic">
              * CocaCola is a registered trademark of The CocaCola Company. Served chilled for
              maximum refreshment.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          HOW IT WORKS
      ════════════════════════════════════════════════ */}
      <section className="bg-stone-100/60 py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <AnimatedSection>
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-persimmon/70 mb-4 block">
                How It Works
              </span>
              <h2
                className="font-display text-3xl md:text-4xl font-light bg-gradient-to-r from-stone-900 via-persimmon to-amber-600 bg-clip-text text-transparent animate-shimmer"
                style={{ backgroundSize: "200% auto" }}
              >
                From your craving to your doorstep in three simple steps
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative">
              <div className="hidden md:block absolute top-16 left-[calc(16.66%+2rem)] right-[calc(16.66%+2rem)] h-px bg-gradient-to-r from-persimmon/20 via-amber-400/40 to-emerald-400/20" />

              {HOW_IT_WORKS.map((step, i) => {
                const Icon = step.icon;
                return (
                  <div key={step.title} className="relative text-center" style={itemStyle(i, 0.6)}>
                    <div
                      className={`w-16 h-16 rounded-2xl ${step.bg} flex items-center justify-center mx-auto mb-6 relative z-10 shadow-lg shadow-stone-900/5`}
                    >
                      <Icon size={28} className={step.color} />
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-[0.2em] mb-3 block bg-gradient-to-r from-persimmon via-amber-500 to-emerald-500 bg-clip-text text-transparent">
                      Step {i + 1}
                    </span>
                    <h3 className="font-display text-xl font-semibold text-stone-900 mb-3">
                      {step.title}
                    </h3>
                    <p className="text-sm text-stone-500 leading-relaxed max-w-xs mx-auto">
                      {step.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          TESTIMONIALS
      ════════════════════════════════════════════════ */}
      <section className="bg-stone-100/60 py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <AnimatedSection>
            <div className="text-center max-w-2xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 text-amber-500 mb-4">
                <Quote size={18} />
              </div>
              <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-persimmon/70 mb-4 block">
                What Our Customers Say
              </span>
              <h2
                className="font-display text-3xl md:text-4xl font-light bg-gradient-to-r from-stone-900 via-persimmon to-amber-600 bg-clip-text text-transparent animate-shimmer"
                style={{ backgroundSize: "200% auto" }}
              >
                Loved by thousands across Kampala
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {TESTIMONIALS.map((t, i) => (
                <div
                  key={t.name}
                  className="bg-white rounded-2xl border border-stone-200 p-6 md:p-8 hover:shadow-xl hover:shadow-stone-900/5 hover:border-stone-300 transition-all duration-500"
                  style={itemStyle(i, 0.5)}
                >
                  <div className="flex items-center gap-1 mb-5">
                    {[...Array(t.rating)].map((_, s) => (
                      <Star key={s} size={14} className="fill-amber-400 text-amber-400" />
                    ))}
                  </div>

                  <p className="text-sm text-stone-600 leading-relaxed mb-6 italic">
                    &ldquo;{t.quote}&rdquo;
                  </p>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-xs font-semibold text-stone-500">
                      {t.initials}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-stone-900 flex items-center gap-1.5">
                        {t.name}
                        <BadgeCheck size={12} className="text-emerald-500" />
                      </p>
                      <p className="text-xs text-stone-400">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          CTA BANNER
      ════════════════════════════════════════════════ */}
      <section className="bg-stone-900 text-stone-50">
        <div className="max-w-7xl mx-auto px-5 md:px-8 py-20 md:py-28">
          <AnimatedSection>
            <div className="max-w-3xl mx-auto text-center">
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-amber-500/20 mb-6"
                style={{
                  background:
                    "linear-gradient(to right, rgba(227,66,52,0.15), rgba(251,191,36,0.15))",
                  ...itemStyle(0, 0.5),
                }}
              >
                <Flame size={12} className="text-persimmon" />
                <span className="bg-gradient-to-r from-persimmon to-amber-500 bg-clip-text text-transparent text-[10px] font-semibold uppercase tracking-[0.2em]">
                  Ready to Order?
                </span>
              </div>
              <h2
                className="font-display text-3xl md:text-5xl font-light leading-tight bg-gradient-to-r from-parchment via-amber-200 to-persimmon bg-clip-text text-transparent animate-shimmer"
                style={{ backgroundSize: "200% auto" }}
              >
                Your next favourite meal is just a click away
              </h2>
              <p
                className="mt-4 text-stone-400 text-base max-w-lg mx-auto"
                style={itemStyle(2, 0.5)}
              >
                Join thousands of happy customers enjoying authentic Ugandan cuisine and fast-food
                favourites delivered fresh to your door.
              </p>
              <a
                href="#menu"
                className="inline-flex items-center gap-2 mt-8 bg-persimmon text-white px-8 py-4 text-sm font-semibold uppercase tracking-[0.15em] rounded-xl hover:bg-white hover:text-stone-900 transition-all duration-300 shadow-xl shadow-persimmon/20 animate-glow"
                style={itemStyle(3, 0.5)}
              >
                Order Now
                <ArrowRight size={16} />
              </a>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
}
