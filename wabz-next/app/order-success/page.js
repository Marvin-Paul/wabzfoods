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

export default function OrderSuccess() {
  const [state, setState] = useState("loading");
  const [orderId, setOrderId] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const session_id = params.get("session_id");
    if (!session_id) {
      setState("error");
      return;
    }
    // Mock Stripe payment confirmation — no real backend
    Promise.resolve({ data: { paid: true, order_id: "mock_" + session_id } })
      .then((res) => {
        if (res?.data?.paid) {
          setOrderId(res.data.order_id);
          setState("paid");
        } else {
          setState("pending");
        }
      })
      .catch(() => setState("error"));
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
              Confirming your payment&hellip;
            </h1>
            <p className="text-stone-500 text-sm mt-3 max-w-xs mx-auto">
              Please wait while we verify with Stripe. This should only take a moment.
            </p>
          </AnimatedSection>
        )}

        {state === "paid" && (
          <>
            <AnimatedSection>
              <div className="w-20 h-20 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-6 border-2 border-emerald-200">
                <CheckCircle2 size={44} className="text-emerald-500" />
              </div>
            </AnimatedSection>

            <AnimatedSection delay={100}>
              <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-emerald-600/70 mb-3 block">
                Payment Successful
              </span>
              <h1 className="font-display text-4xl md:text-5xl font-light text-stone-900 tracking-tight mb-4">
                Order confirmed!
              </h1>
              <p className="text-stone-500 text-sm md:text-base leading-relaxed max-w-sm mx-auto">
                Your payment was successful. The kitchen is preparing your order now — fresh ingredients, 
                cooked with care, and coming your way soon.
              </p>
            </AnimatedSection>

            <AnimatedSection delay={200}>
              <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
                <Link
                  href="/orders"
                  className="inline-flex items-center gap-2 bg-stone-900 text-white px-8 py-4 rounded-xl text-sm font-semibold hover:bg-persimmon transition-all duration-300 shadow-lg shadow-stone-900/10 group"
                >
                  Track My Order
                  <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
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
                    Order #{orderId?.slice(0, 8) || "————"} &middot; 
                    Cooking now &middot; Track live above
                  </span>
                </div>
              </div>
            </AnimatedSection>
          </>
        )}

        {state === "pending" && (
          <AnimatedSection>
            <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-6 border-2 border-amber-200">
              <Loader2 size={32} className="animate-spin text-amber-500" />
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-light text-stone-900 tracking-tight mb-3">
              Payment pending
            </h1>
            <p className="text-stone-500 text-sm max-w-sm mx-auto">
              We couldn&apos;t confirm payment yet. If you were charged, your order will update shortly.
            </p>
            <Link
              href="/orders"
              className="inline-block mt-8 text-persimmon font-medium hover:text-stone-900 transition-colors"
            >
              View my orders →
            </Link>
          </AnimatedSection>
        )}

        {state === "error" && (
          <AnimatedSection>
            <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-6 border-2 border-red-200">
              <XCircle size={32} className="text-red-500" />
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-light text-stone-900 tracking-tight mb-3">
              Something went wrong
            </h1>
            <p className="text-stone-500 text-sm max-w-sm mx-auto">
              We couldn&apos;t verify this payment. Please contact us if you were charged.
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
