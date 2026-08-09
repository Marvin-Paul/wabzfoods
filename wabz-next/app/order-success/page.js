"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { CheckCircle2, Loader2, XCircle, ArrowRight, Soup, Flame } from "lucide-react";

/* ── Entrance animation hook ── */
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

export default function OrderSuccess() {
  const [state, setState] = useState("loading");
  const [orderId, setOrderId] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const session_id = params.get("session_id");
    if (!session_id) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sync from URL params after hydration
      setState("error");
      return;
    }
    // Confirm the order exists in the database. Payment is collected on
    // delivery/pickup, so there is nothing to "verify" with a payment provider.
    supabase
      .from("orders")
      .select("order_id, order_type, status, payment_status")
      .eq("order_id", session_id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setOrderId(data.order_id);
          // eslint-disable-next-line react-hooks/set-state-in-effect -- async fetch result after hydration
          setState("confirmed");
        } else {
          // eslint-disable-next-line react-hooks/set-state-in-effect -- async fetch result after hydration
          setState("error");
        }
      })
      .catch(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- async fetch result after hydration
        setState("error");
      });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50/80 to-white flex items-center justify-center px-5 py-24">
      <div className="w-full max-w-lg mx-auto text-center relative">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-persimmon/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        {state === "loading" && (
          <AnimatedSection>
            <div className="w-16 h-16 rounded-2xl bg-persimmon/10 flex items-center justify-center mx-auto mb-6">
              <Loader2 size={32} className="animate-spin text-persimmon" />
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-light text-stone-900 tracking-tight">
              Confirming your order&hellip;
            </h1>
            <p className="text-stone-500 text-sm mt-3 max-w-xs mx-auto">
              Just a moment while we pull up your order details.
            </p>
          </AnimatedSection>
        )}

        {state === "confirmed" && (
          <>
            <AnimatedSection>
              <div className="w-20 h-20 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-6 border-2 border-emerald-200">
                <CheckCircle2 size={44} className="text-emerald-500" />
              </div>
            </AnimatedSection>

            <AnimatedSection delay={100}>
              <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-emerald-600/70 mb-3 block">
                Order Received
              </span>
              <h1 className="font-display text-4xl md:text-5xl font-light text-stone-900 tracking-tight mb-4">
                Order confirmed!
              </h1>
              <p className="text-stone-500 text-sm md:text-base leading-relaxed max-w-sm mx-auto">
                Thanks! Your order has been received and the kitchen is getting started. We&apos;ll
                confirm by phone on the number you provided. Payment is collected on delivery or
                pickup — no online payment required.
              </p>
            </AnimatedSection>

            <AnimatedSection delay={200}>
              <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
                <Link
                  href="/orders"
                  className="inline-flex items-center gap-2 bg-stone-900 text-white px-8 py-4 rounded-xl text-sm font-semibold hover:bg-persimmon transition-all duration-300 shadow-lg shadow-stone-900/10 group"
                >
                  Track My Order
                  <ArrowRight
                    size={15}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border border-stone-200 text-sm font-medium text-stone-600 hover:text-stone-900 hover:border-stone-400 transition-all duration-300"
                >
                  <Soup size={15} />
                  Browse Menu
                </Link>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={300}>
              <div className="mt-12 pt-8 border-t border-stone-100">
                <div className="flex items-center justify-center gap-2 text-xs text-stone-400">
                  <Flame size={12} className="text-persimmon" />
                  <span>
                    Order #{orderId?.slice(0, 8) || "————"} &middot; Cooking now &middot; Track live
                    above
                  </span>
                </div>
              </div>
            </AnimatedSection>
          </>
        )}

        {state === "error" && (
          <AnimatedSection>
            <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-6 border-2 border-red-200">
              <XCircle size={32} className="text-red-500" />
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-light text-stone-900 tracking-tight mb-3">
              Order not found
            </h1>
            <p className="text-stone-500 text-sm max-w-sm mx-auto">
              We couldn&apos;t find that order. If you just placed one, try refreshing in a moment
              or contact us directly.
            </p>
            <Link
              href="/"
              className="inline-block mt-8 text-persimmon font-medium hover:text-stone-900 transition-colors"
            >
              Back to menu →
            </Link>
          </AnimatedSection>
        )}
      </div>
    </div>
  );
}
