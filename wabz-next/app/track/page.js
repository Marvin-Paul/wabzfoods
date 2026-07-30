"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { mapOrder } from "@/lib/supabase-data";
import LiveOrderTracker from "@/components/LiveOrderTracker";
import {
  Package,
  ArrowRight,
  Radio,
  ShoppingBag,
  MapPin,
  Phone,
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

function timeAgo(date) {
  const diff = (Date.now() - new Date(date).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  return new Date(date).toLocaleDateString();
}

export default function Track() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = () =>
      supabase
        .from("orders")
        .select("*, order_items(*)")
        .order("created_at", { ascending: false })
        .limit(50)
        .then(({ data }) => setOrders((data || []).map(mapOrder)));
    load().finally(() => setLoading(false));
    const interval = setInterval(() => load(), 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-stone-50/80 to-white">
        <div className="max-w-3xl mx-auto px-5 md:px-8 py-16">
          <div className="h-5 w-40 bg-stone-100 rounded animate-pulse mb-3" />
          <div className="h-10 w-64 bg-stone-100 rounded animate-pulse mb-10" />
          <div className="h-80 bg-white rounded-2xl border border-stone-200 animate-pulse p-6">
            <div className="h-4 w-1/2 bg-stone-100 rounded mb-4" />
            <div className="h-6 w-1/3 bg-stone-100 rounded mb-6" />
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-stone-100" />
                  <div className="h-4 w-1/3 bg-stone-100 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-stone-50/80 to-white flex items-center justify-center px-5 py-24">
        <AnimatedSection>
          <div className="text-center max-w-md mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto mb-6 border border-stone-200">
              <Package size={28} className="text-stone-400" />
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-light text-stone-900 tracking-tight mb-3">
              No orders to track yet
            </h1>
            <p className="text-stone-500 text-sm mb-8 max-w-xs mx-auto">
              Place an order and watch it travel from our kitchen to you in real time.
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
      </div>
    );
  }

  const active = orders.find((o) => !["delivered", "cancelled"].includes(o.status)) || orders[0];
  const rest = orders.filter((o) => o.id !== active.id);

  /* ── Status label & color ── */
  const statusMeta = (() => {
    switch (active.status) {
      case "pending":
        return { label: "Awaiting confirmation", color: "bg-amber-500" };
      case "preparing":
        return { label: "Being prepared", color: "bg-persimmon" };
      case "ready":
        return { label: "Ready for pickup/delivery", color: "bg-emerald-500" };
      case "out_for_delivery":
        return { label: "On its way!", color: "bg-blue-500" };
      case "delivered":
        return { label: "Delivered", color: "bg-emerald-500" };
      default:
        return { label: active.status, color: "bg-stone-400" };
    }
  })();

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50/80 to-white">
      <div className="max-w-3xl mx-auto px-5 md:px-8 py-12 md:py-16">
        {/* Live Tracking header */}
        <AnimatedSection>
          <div className="flex items-center gap-2 mb-2">
            <Radio size={14} className="text-persimmon animate-pulse" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-persimmon/70">
              Live Tracking
            </span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-light text-stone-900 tracking-tight mb-10">
            Track Your Order
          </h1>
        </AnimatedSection>

        {/* Main tracking card */}
        <AnimatedSection delay={80}>
          <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xl shadow-stone-900/5 p-6 md:p-8">
            {/* Header */}
            <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-persimmon/10 flex items-center justify-center shrink-0">
                  <ShoppingBag size={22} className="text-persimmon" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.15em] text-stone-400">
                    {timeAgo(active.created_date)} &middot; UGX{" "}
                    {Number(active.total).toLocaleString()}
                  </p>
                  <h2 className="font-display text-2xl font-semibold text-stone-900 mt-0.5">
                    {active.order_type === "delivery" ? "Delivery Order" : "Pickup Order"}
                  </h2>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${statusMeta.color} animate-pulse`} />
                <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-stone-600">
                  {statusMeta.label}
                </span>
              </div>
            </div>

            {/* Payment badge */}
            <div className="mb-2">
              <span
                className={`inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] px-3 py-1 rounded-full border ${
                  active.payment_status === "paid"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-red-50 text-red-700 border-red-200"
                }`}
              >
                {active.payment_status === "paid" ? "Paid" : "Payment Pending"}
              </span>
            </div>

            {/* Live tracker */}
            <LiveOrderTracker status={active.status} />

            {/* Order details */}
            <div className="mt-6 pt-5 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-stone-500 mb-2">
                  Items
                </p>
                <ul className="text-stone-600 space-y-1">
                  {active.items?.map((it, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="text-stone-400">&bull;</span>
                      {it.qty}× {it.name}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-3">
                {active.order_type === "delivery" && active.address && (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-stone-500 mb-1.5 flex items-center gap-1.5">
                      <MapPin size={12} className="text-persimmon" />
                      Delivery To
                    </p>
                    <p className="text-stone-600">{active.address}</p>
                  </div>
                )}
                {active.phone && (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-stone-500 mb-1.5 flex items-center gap-1.5">
                      <Phone size={12} className="text-persimmon" />
                      Phone
                    </p>
                    <a
                      href={`tel:${active.phone}`}
                      className="text-stone-900 font-medium hover:text-persimmon transition-colors"
                    >
                      {active.phone}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* Other orders */}
        {rest.length > 0 && (
          <AnimatedSection delay={160}>
            <div className="mt-10">
              <h3 className="font-display text-lg font-semibold text-stone-900 mb-4">
                Other Orders
              </h3>
              <div className="space-y-2">
                {rest.map((o) => (
                  <div
                    key={o.id}
                    className="flex items-center justify-between bg-white border border-stone-200/80 rounded-xl px-5 py-4 hover:shadow-md hover:border-stone-300 transition-all duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center">
                        <Clock size={14} className="text-stone-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-stone-900">
                          UGX {Number(o.total).toLocaleString()}
                        </p>
                        <p className="text-[11px] text-stone-400">{timeAgo(o.created_date)}</p>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-semibold uppercase tracking-[0.1em] px-3 py-1 rounded-full ${
                        o.status === "delivered"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : o.status === "cancelled"
                          ? "bg-red-50 text-red-700 border border-red-200"
                          : "bg-persimmon/10 text-persimmon border border-persimmon/20"
                      }`}
                    >
                      {o.status.replace(/_/g, " ")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </AnimatedSection>
        )}

        {/* Back link */}
        <AnimatedSection delay={240}>
          <div className="mt-10">
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
