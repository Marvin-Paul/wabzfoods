"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

/* ── Tiny helper to interpolate a hex colour with white for opacity variants ── */
function hexWithOpacity(hex, opacity) {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

export default function Footer() {
  const [accent, setAccent] = useState("#e34234");
  const [accentSecondary, setAccentSecondary] = useState("#fbbf24");

  useEffect(() => {
    // Try fetching site settings from Supabase (table may not exist yet)
    const fetchSettings = async () => {
      try {
        const { data } = await supabase.from("site_settings").select("*").single();
        if (data) {
          if (data.footer_accent) setAccent(data.footer_accent);
          if (data.footer_accent_secondary) setAccentSecondary(data.footer_accent_secondary);
        }
      } catch {
        // Table not created yet — use defaults
      }
    };
    fetchSettings();
  }, []);

  const gradDuo = `linear-gradient(to right, ${accent}, ${accentSecondary})`;
  const gradDuoHover = `linear-gradient(to right, ${accentSecondary}, ${accent})`;

  return (
    <footer className="border-t border-carbon/10 bg-carbon text-parchment/70">
      <div className="max-w-7xl mx-auto px-5 md:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <Link href="/" className="inline-block group">
              <svg
                width="140"
                height="36"
                viewBox="0 0 140 36"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="transition-opacity duration-300 group-hover:opacity-80"
                role="img"
                aria-label="Wabz Foods Logo"
              >
                <title>Wabz Foods Logo</title>
                <text
                  x="0"
                  y="26"
                  fontFamily="system-ui, -apple-system, sans-serif"
                  fontSize="22"
                  fontWeight="700"
                  fill="white"
                  letterSpacing="1.5"
                >
                  WABZ
                </text>
                <text
                  x="64"
                  y="26"
                  fontFamily="system-ui, -apple-system, sans-serif"
                  fontSize="22"
                  fontWeight="300"
                  fill="rgba(255,255,255,0.6)"
                  letterSpacing="0.5"
                >
                  FOODS
                </text>
              </svg>
            </Link>
            <p className="mt-3 text-sm text-parchment/60 max-w-xs leading-relaxed">
              From{" "}
              <span className="font-medium" style={{ color: hexWithOpacity(accentSecondary, 0.8) }}>
                Ugandan classics
              </span>{" "}
              to{" "}
              <span className="font-medium" style={{ color: hexWithOpacity(accent, 0.8) }}>
                fast-food favourites
              </span>{" "}
              — <span className="font-medium text-emerald-400/70">order online</span>, pay securely,
              and <span className="font-medium text-sky-400/70">track your meal</span> in real time.
            </p>
          </div>

          <div>
            <h4
              className="text-xs uppercase tracking-[0.2em] mb-4"
              style={{ color: hexWithOpacity(accent, 0.6) }}
            >
              <span
                className="inline-block pb-1"
                style={{ borderBottom: `1px solid ${hexWithOpacity(accent, 0.2)}` }}
              >
                Menu
              </span>
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/"
                  className="transition-colors duration-300"
                  style={{ color: "inherit" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = accentSecondary)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "inherit")}
                >
                  All Dishes
                </Link>
              </li>
              <li>
                <Link
                  href="/local"
                  className="transition-colors duration-300"
                  style={{ color: "inherit" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = accentSecondary)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "inherit")}
                >
                  Local Foods
                </Link>
              </li>
              <li>
                <Link
                  href="/fast"
                  className="transition-colors duration-300"
                  style={{ color: "inherit" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = accentSecondary)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "inherit")}
                >
                  Fast Foods
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4
              className="text-xs uppercase tracking-[0.2em] mb-4"
              style={{ color: hexWithOpacity(accentSecondary, 0.6) }}
            >
              <span
                className="inline-block pb-1"
                style={{ borderBottom: `1px solid ${hexWithOpacity(accentSecondary, 0.2)}` }}
              >
                Account
              </span>
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/orders"
                  className="transition-colors duration-300"
                  style={{ color: "inherit" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = accent)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "inherit")}
                >
                  My Orders
                </Link>
              </li>
              <li>
                <Link
                  href="/track"
                  className="transition-colors duration-300"
                  style={{ color: "inherit" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = accent)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "inherit")}
                >
                  Track Order
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="transition-colors duration-300"
                  style={{ color: "inherit" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = accent)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "inherit")}
                >
                  Log In
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="transition-colors duration-300"
                  style={{ color: "inherit" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = accent)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "inherit")}
                >
                  Sign Up
                </Link>
              </li>
              <li>
                <Link
                  href="/admin"
                  className="font-semibold transition-all duration-500 animate-shimmer"
                  style={{
                    backgroundImage: gradDuo,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    backgroundSize: "200% auto",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundImage = gradDuoHover)}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundImage = gradDuo)}
                >
                  Admin Panel
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-parchment/10 flex flex-col md:flex-row justify-between gap-4">
          <p className="text-xs text-parchment/40">
            &copy; {new Date().getFullYear()}{" "}
            <span style={{ color: hexWithOpacity(accent, 0.6) }}>Wabz Foods</span>. All rights
            reserved.
          </p>
          <p className="text-xs">
            <span style={{ color: hexWithOpacity(accentSecondary, 0.7) }}>Order</span>{" "}
            <span className="text-parchment/40">online.</span>{" "}
            <span style={{ color: hexWithOpacity(accent, 0.7) }}>Delivered</span>{" "}
            <span className="text-parchment/40">fresh.</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
