"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { mapOrder } from "@/lib/supabase-data";
import {
  Package,
  ArrowRight,
  ShoppingBag,
  Check,
  CookingPot,
  Bike,
  Home,
  Clock,
  Soup,
} from "lucide-react";

/* ── Entrance animation hook ── */
function useInView(options = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.unobserve(el); } },
      { threshold: 0.1, ...options }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
}

function AnimatedSection({ children, className = "", delay = 0 }) {
  const [ref, inView] = useInView();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/* ── Status step tracker (icon-based, reused from LiveOrderTracker) ── */
const STATUS_STEPS = [
  { key: "pending", label: "Order Placed", icon: ShoppingBag },
  { key: "preparing", label: "Preparing", icon: CookingPot },
  { key: "ready", label: "Ready", icon: Check },
  { key: "out_for_delivery", label: "Out for Delivery", icon: Bike },
  { key: "delivered", label: "Delivered", icon: Home },
];

function StatusTracker({ status }) {
  const orderIdx = STATUS_STEPS.findIndex((s) => s.key === status);
  const cancelled = status === "cancelled";

  if (cancelled) {
    return <p className="text-sm text-red-600 font-medium">Order cancelled.</p>;
  }

  return (
    <div className="flex items-center gap-2 mt-3">
      {STATUS_STEPS.map((s, i) => {
        const Icon = s.icon;
        const done = i <= orderIdx;
        const active = i === orderIdx;
        return (
          <React.Fragment key={s.key}>
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 ${
                  done
                    ? "bg-persimmon text-white shadow-sm shadow-persimmon/20"
                    : "bg-stone-100 text-stone-400 border border-stone-200"
                } ${active ? "ring-3 ring-persimmon/20 scale-110" : ""}`}
              >
                <Icon size={14} />
              </div>
              <span
                className={`text-[9px] font-medium uppercase tracking-[0.1em] text-center leading-tight ${
                  done ? "text-stone-700" : "text-stone-400"
                }`}
              >
                {s.label.split(" ")[0]}
              </span>
            </div>
            {i < STATUS_STEPS.length - 1 && (
              <div
                className={`flex-1 h-0.5 self-center transition-all duration-300 ${
                  done ? "bg-persimmon" : "bg-stone-200"
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = () =>
      supabase
        .from("orders")
        .select("*, order_items(*)")
        .order("created_at", { ascending: false })
        .limit(50)
        .then(({ data }) => setOrders((data || []).map(mapOrder)))
        .catch((err) => console.error("Orders fetch failed:", err));
    load().finally(() => setLoading(false));

    const interval = setInterval(() => load(), 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50/80 to-white">
      <div className="max-w-4xl mx-auto px-5 md:px-8 py-12 md:py-16">
        {/* Header */}
        <AnimatedSection>
          <div className="mb-10">
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-persimmon/70 mb-3 block">
              Order Tracking
            </span>
            <h1 className="font-display text-4xl md:text-5xl font-light text-stone-900 tracking-tight">
              My Orders
            </h1>
            <p className="text-stone-500 text-sm mt-2 max-w-lg">
              Track all your orders in real time — from the kitchen to your doorstep.
            </p>
          </div>
        </AnimatedSection>

        {/* Loading */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-44 bg-white rounded-2xl border border-stone-200 animate-pulse p-6"
              >
                <div className="h-4 w-1/3 bg-stone-100 rounded mb-4" />
                <div className="h-6 w-1/2 bg-stone-100 rounded mb-3" />
                <div className="h-3 w-full bg-stone-100 rounded" />
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          /* Empty state */
          <AnimatedSection delay={100}>
            <div className="flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center mb-6 border border-stone-200">
                <Package size={28} className="text-stone-400" />
              </div>
              <h2 className="font-display text-2xl font-light text-stone-900 mb-2">
                No orders yet
              </h2>
              <p className="text-sm text-stone-500 mb-8">
                When you place an order, it will appear here with live tracking so you can
                follow it from the kitchen to your door.
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 bg-stone-900 text-white px-8 py-4 rounded-xl text-sm font-semibold hover:bg-persimmon transition-all duration-300 shadow-lg shadow-stone-900/10 group"
              >
                <Soup size={15} />
                Browse Menu
                <ArrowRight
                  size={15}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>
            </div>
          </AnimatedSection>
        ) : (
          /* Orders list */
          <div className="space-y-5">
            {orders.map((o, idx) => (
              <AnimatedSection key={o.id} delay={Math.min(idx * 80, 400)}>
                <div className="bg-white rounded-2xl border border-stone-200/80 shadow-md shadow-stone-900/5 p-5 md:p-6 hover:shadow-lg hover:border-stone-300 transition-all duration-300">
                  {/* Header */}
                  <div className="flex flex-wrap justify-between gap-3 items-start">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.15em] text-stone-400 flex items-center gap-1.5">
                        <Clock size={11} />
                        {new Date(o.created_date).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true })}
                      </p>
                      <h3 className="font-display text-xl font-semibold text-stone-900 mt-1">
                        Order &middot; UGX {Number(o.total).toLocaleString()}
                      </h3>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] px-3 py-1.5 rounded-full border ${
                        o.payment_status === "paid"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-red-50 text-red-700 border-red-200"
                      }`}
                    >
                      {o.payment_status === "paid" ? "Paid" : "Unpaid"}
                    </span>
                  </div>

                  {/* Items */}
                  <ul className="mt-4 text-sm text-stone-600 space-y-1.5">
                    {o.items?.map((it, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="text-stone-400">&bull;</span>
                        {it.qty}× {it.name}
                        <span className="text-stone-400 ml-auto tabular-nums">
                          UGX {(it.price * it.qty).toLocaleString()}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* Status tracker */}
                  <div className="mt-4 pt-4 border-t border-stone-100">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-stone-500 mb-1">
                      Status
                    </p>
                    <StatusTracker status={o.status} />
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        )}

        {/* Footer link */}
        <AnimatedSection delay={300}>
          <div className="mt-12 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-persimmon transition-colors group"
            >
              Back to menu{" "}
              <ArrowRight
                size={14}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
}
