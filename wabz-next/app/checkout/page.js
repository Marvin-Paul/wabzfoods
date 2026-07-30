"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { DEFAULT_SETTINGS } from "@/lib/supabase-data";
import { useCart } from "@/components/CartContext";
import { Image } from "@/components/ui/image";
import {
  ArrowLeft,
  Loader2,
  Clock,
  Truck,
  Phone,
  AlertTriangle,
  ShoppingBag,
  Soup,
  Shield,
  ArrowRight,
} from "lucide-react";

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

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const router = useRouter();
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    setSettings(DEFAULT_SETTINGS);
  }, []);

  const [form, setForm] = useState({
    customer_name: "",
    phone: "",
    address: "",
    notes: "",
    order_type: "delivery",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (items.length === 0) return;
    if (!form.customer_name || !form.phone || (form.order_type === "delivery" && !form.address)) {
      setError("Please complete your name, phone and delivery address.");
      return;
    }
    setSubmitting(true);
    try {
      const orderId = "order_" + Date.now();
      const { error: orderError } = await supabase.from("orders").insert({
        order_id: orderId,
        order_type: form.order_type,
        status: "pending",
        payment_status: "unpaid",
        total_amount: total,
        customer_name: form.customer_name,
        phone: form.phone,
        address: form.address,
        notes: form.notes,
      });
      if (orderError) throw orderError;

      // Insert items into the order_items table (separate relation)
      // mapOrder reads item_id as the display name, so we pass the product name there.
      if (items.length > 0) {
        const { error: itemsError } = await supabase.from("order_items").insert(
          items.map((i) => ({
            order_id: orderId,
            item_id: i.name || i.id || "Item",
            price: i.price,
            quantity: i.qty,
          }))
        );
        if (itemsError) throw itemsError;
      }
      clearCart();
      router.push("/order-success?session_id=" + orderId);
    } catch (err) {
      setError(err?.message || "Could not start checkout. Please try again.");
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-stone-50/80 to-white flex items-center justify-center px-5 py-24">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto mb-6">
            <ShoppingBag size={28} className="text-stone-400" />
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-light text-stone-900 mb-3">
            Your cart is empty
          </h1>
          <p className="text-stone-500 text-sm mb-8">
            Add a few dishes before checking out. We have plenty of delicious options waiting for you!
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-stone-900 text-white px-8 py-4 rounded-xl text-sm font-semibold hover:bg-persimmon transition-all duration-300 shadow-lg shadow-stone-900/10 group"
          >
            <Soup size={15} />
            Browse Menu
            <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    );
  }

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
    <div className="min-h-screen bg-gradient-to-b from-stone-50/80 to-white">
      <div className="max-w-5xl mx-auto px-5 md:px-8 py-12 md:py-16">
        <AnimatedSection>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-persimmon transition-colors mb-8 group"
          >
            <ArrowLeft size={15} className="transition-transform duration-300 group-hover:-translate-x-1" />
            Back to menu
          </Link>
        </AnimatedSection>

        <AnimatedSection delay={50}>
          <div className="mb-10">
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-persimmon/70 mb-3 block">
              Secure Checkout
            </span>
            <h1 className="font-display text-4xl md:text-5xl font-light text-stone-900 tracking-tight">
              Complete your order
            </h1>
            <p className="text-stone-500 text-sm mt-2 max-w-lg">
              Fill in your details and we&apos;ll take care of the rest. Fresh ingredients, cooked to order, delivered to your door.
            </p>
          </div>
        </AnimatedSection>

        {openStatus && (
          <AnimatedSection delay={80}>
            <div
              className={`mb-8 rounded-xl border px-5 py-3.5 flex items-center gap-3 text-sm ${
                openStatus.isOpen
                  ? openStatus.minsUntil <= 30
                    ? "bg-amber-50 border-amber-200 text-amber-800"
                    : "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : "bg-stone-100 border-stone-200 text-stone-600"
              }`}
            >
              <div
                className={`w-2.5 h-2.5 rounded-full shrink-0 ${
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
                    {openStatus.minsUntil <= 30 ? "Closing soon!" : "We\u2019re open!"}
                  </span>
                  <span className="opacity-80">
                    {openStatus.minsUntil <= 30
                      ? `Order within ${openStatus.minsUntil} minutes.`
                      : `Open until ${settings?.closing_time || ""}.`}
                  </span>
                </>
              ) : (
                <>
                  <AlertTriangle size={16} className="shrink-0" />
                  <span className="font-semibold">We\u2019re closed</span>
                  <span className="opacity-80">
                    Open {openStatus.hours}. Orders will be processed when we reopen.
                  </span>
                </>
              )}
            </div>
          </AnimatedSection>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          <AnimatedSection delay={100} className="lg:col-span-3">
            <form onSubmit={submit} className="bg-white rounded-2xl border border-stone-200/80 shadow-xl shadow-stone-900/5 p-6 md:p-8 space-y-5">
              <h2 className="font-display text-xl font-semibold text-stone-900 mb-2">Your Details</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-[0.15em] text-stone-500">
                    Full Name
                  </label>
                  <input
                    value={form.customer_name}
                    onChange={(e) => set("customer_name", e.target.value)}
                    placeholder="e.g. John Doe"
                    className="mt-1.5 w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-persimmon focus:ring-1 focus:ring-persimmon/20 transition-all"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-[0.15em] text-stone-500">
                    Phone
                  </label>
                  <input
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    placeholder="+256 700 000 000"
                    className="mt-1.5 w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-persimmon focus:ring-1 focus:ring-persimmon/20 transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                {["delivery", "pickup"].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => set("order_type", t)}
                    className={`flex-1 py-3 rounded-xl text-sm font-medium capitalize transition-all duration-200 ${
                      form.order_type === t
                        ? "bg-stone-900 text-white shadow-lg shadow-stone-900/10"
                        : "bg-stone-50 border border-stone-200 text-stone-600 hover:border-stone-400"
                    }`}
                  >
                    {t === "delivery" ? <><Truck size={13} className="inline mr-1.5" />{t}</> : t}
                  </button>
                ))}
              </div>

              {form.order_type === "delivery" && (
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-[0.15em] text-stone-500">
                    Delivery Address
                  </label>
                  <textarea
                    value={form.address}
                    onChange={(e) => set("address", e.target.value)}
                    rows={2}
                    placeholder="Street, building, landmark…"
                    className="mt-1.5 w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-persimmon focus:ring-1 focus:ring-persimmon/20 transition-all resize-none"
                  />
                </div>
              )}

              <div>
                <label className="text-[11px] font-semibold uppercase tracking-[0.15em] text-stone-500">
                  Notes <span className="font-normal normal-case text-stone-400">(optional)</span>
                </label>
                <input
                  value={form.notes}
                  onChange={(e) => set("notes", e.target.value)}
                  placeholder="Allergies, gate instructions, special requests…"
                  className="mt-1.5 w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-persimmon focus:ring-1 focus:ring-persimmon/20 transition-all"
                />
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-stone-900 text-white py-4 rounded-xl text-sm font-semibold uppercase tracking-[0.15em] hover:bg-persimmon disabled:opacity-60 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-stone-900/10"
              >
                {submitting ? (
                  <><Loader2 size={18} className="animate-spin" /> Preparing payment&hellip;</>
                ) : (
                  `Pay UGX ${total.toLocaleString()}`
                )}
              </button>
              <p className="text-[11px] text-stone-400 text-center flex items-center justify-center gap-1.5">
                <Shield size={11} />
                Secure payment via Stripe. You&apos;ll be redirected to complete your purchase.
              </p>
            </form>
          </AnimatedSection>

          <aside className="lg:col-span-2 space-y-5">
            <AnimatedSection delay={150}>
              <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xl shadow-stone-900/5 p-6">
                <h2 className="font-display text-lg font-semibold text-stone-900 mb-5 flex items-center gap-2">
                  <ShoppingBag size={16} className="text-persimmon" />
                  Order Summary
                </h2>
                <ul className="space-y-4">
                  {items.map((i) => (
                    <li key={i.id} className="flex gap-3">
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
                        <Image src={i.image_url} alt={i.name} fittingType="fill" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-stone-900 truncate">
                          {i.qty}× {i.name}
                        </p>
                        <p className="text-xs text-stone-500 mt-0.5">
                          UGX {(i.price * i.qty).toLocaleString()}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-sm font-medium text-stone-600">Total</span>
                  <span className="font-display text-2xl font-semibold text-stone-900 tabular-nums">
                    UGX {total.toLocaleString()}
                  </span>
                </div>
              </div>
            </AnimatedSection>

            {settings && (
              <AnimatedSection delay={200}>
                <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xl shadow-stone-900/5 p-6">
                  <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-stone-500 mb-4">
                    {settings.name || "Restaurant"}
                  </h3>
                  <div className="space-y-3.5">
                    {settings.opening_time && settings.closing_time && (
                      <div className="flex items-center gap-3 text-sm text-stone-600">
                        <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center shrink-0">
                          <Clock size={14} className="text-stone-500" />
                        </div>
                        <span>
                          Open{" "}
                          <span className="font-medium text-stone-900">
                            {settings.opening_time} &ndash; {settings.closing_time}
                          </span>
                        </span>
                      </div>
                    )}
                    {Number(settings.delivery_fee) > 0 && (
                      <div className="flex items-center gap-3 text-sm text-stone-600">
                        <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center shrink-0">
                          <Truck size={14} className="text-stone-500" />
                        </div>
                        <span>
                          Delivery{" "}
                          <span className="font-medium text-stone-900">
                            UGX {Number(settings.delivery_fee).toLocaleString()}
                          </span>
                        </span>
                      </div>
                    )}
                    {settings.phone && (
                      <div className="flex items-center gap-3 text-sm text-stone-600">
                        <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center shrink-0">
                          <Phone size={14} className="text-stone-500" />
                        </div>
                        <a
                          href={`tel:${settings.phone}`}
                          className="font-medium text-stone-900 hover:text-persimmon transition-colors"
                        >
                          {settings.phone}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </AnimatedSection>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
