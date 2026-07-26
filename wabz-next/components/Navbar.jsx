"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu, X, ShoppingCart } from "lucide-react";
import { useCart } from "@/components/CartContext";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { setOpen: setCartOpen } = useCart();

  const links = [
    { href: "/", label: "Menu" },
    { href: "/orders", label: "My Orders" },
    { href: "/track", label: "Track" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-parchment/80 backdrop-blur border-b border-carbon/10">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="font-display text-xl font-light tracking-tight text-carbon">
            Wabz Foods
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm font-medium text-carbon/70 hover:text-persimmon transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setCartOpen(true)}
              className="relative p-2 rounded-lg hover:bg-carbon/5 transition-colors"
              aria-label="Open cart"
            >
              <ShoppingCart className="w-5 h-5 text-carbon" />
            </button>

            <button
              onClick={() => setOpen((v) => !v)}
              className="md:hidden p-2 rounded-lg hover:bg-carbon/5 transition-colors"
              aria-label="Toggle menu"
            >
              {open ? <X className="w-5 h-5 text-carbon" /> : <Menu className="w-5 h-5 text-carbon" />}
            </button>
          </div>
        </div>

        {open && (
          <nav className="md:hidden pb-4 border-t border-carbon/10 pt-4">
            <div className="flex flex-col gap-2">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="text-sm font-medium text-carbon/70 hover:text-persimmon transition-colors py-2"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
