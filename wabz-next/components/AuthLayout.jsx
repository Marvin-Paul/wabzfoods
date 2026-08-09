"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { CupSoda, Soup } from "lucide-react";

/* ── Decorations — floating food icons ── */
const DECORATIONS = [
  { Icon: CupSoda, className: "top-[12%] right-[8%] w-8 h-8 text-persimmon/10" },
  { Icon: Soup, className: "bottom-[18%] left-[6%] w-10 h-10 text-amber-500/10" },
];

function useInView() {
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
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
}

function AnimatedWrapper({ children, delay = 0 }) {
  const [ref, inView] = useInView();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export default function AuthLayout({ icon: Icon, title, subtitle, footer, children }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50/80 to-white flex items-center justify-center px-4 py-16 relative overflow-hidden">
      {/* Decorative food icons */}
      {DECORATIONS.map(({ Icon: DecIcon, className }) => (
        <DecIcon key={className} className={`absolute ${className} animate-float`} />
      ))}

      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-persimmon/5 via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-amber-500/5 via-transparent to-transparent pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Icon + Title */}
        <AnimatedWrapper>
          <div className="text-center mb-10">
            <Link href="/" className="inline-flex items-center gap-1.5 mb-6 group">
              <span
                className="text-2xl font-bold tracking-tight bg-gradient-to-r from-stone-900 via-persimmon to-amber-600 bg-clip-text text-transparent animate-shimmer"
                style={{ backgroundSize: "200% auto" }}
              >
                Wabz
              </span>
              <span className="text-2xl font-bold tracking-tight text-stone-900">Foods</span>
            </Link>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-persimmon to-amber-600 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-persimmon/20">
              <Icon className="w-7 h-7 text-white" aria-hidden="true" />
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-light text-stone-900 tracking-tight">
              {title}
            </h1>
            {subtitle && <p className="text-stone-500 text-sm mt-2 max-w-xs mx-auto">{subtitle}</p>}
          </div>
        </AnimatedWrapper>

        {/* Card */}
        <AnimatedWrapper delay={100}>
          <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xl shadow-stone-900/5 p-8">
            {children}
          </div>
        </AnimatedWrapper>

        {/* Footer */}
        {footer && (
          <AnimatedWrapper delay={200}>
            <p className="text-center text-sm text-stone-500 mt-6">{footer}</p>
          </AnimatedWrapper>
        )}

        {/* Brand tagline */}
        <AnimatedWrapper delay={300}>
          <p className="text-center text-[11px] text-stone-400 mt-10">
            From <span className="text-stone-600 font-medium">Ugandan classics</span> to{" "}
            <span className="text-stone-600 font-medium">fast-food favourites</span>
          </p>
        </AnimatedWrapper>
      </div>
    </div>
  );
}
