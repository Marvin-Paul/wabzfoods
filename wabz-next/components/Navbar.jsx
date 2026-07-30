"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X, ShoppingCart, User, LogOut } from "lucide-react";
import { useCart } from "@/components/CartContext";
import { supabase } from "@/lib/supabaseClient";

/* ── Generate a unique HSL color from any string (email, name) ── */
function getAvatarColor(str) {
  if (!str) return "#e34234";
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = ((hash % 360) + 360) % 360;
  // Use a moderate saturation (45-55%) and lightness (45-55%) for soft, readable colors
  return `hsl(${hue}, 50%, 50%)`;
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const avatarRef = React.useRef(null);
  const { setOpen: setCartOpen, count } = useCart();

  // Close avatar dropdown on outside click or Escape
  useEffect(() => {
    if (!avatarOpen) return;
    const handleClick = (e) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target)) {
        setAvatarOpen(false);
      }
    };
    const handleKey = (e) => {
      if (e.key === "Escape") setAvatarOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [avatarOpen]);

  const handleSignOut = async () => {
    setAvatarOpen(false);
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
      }
    };
    getSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription?.unsubscribe();
  }, []);

  const links = [
    { href: "/", label: "Menu" },
    { href: "/orders", label: "My Orders" },
    { href: "/track", label: "Track" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-stone-200/60">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="shrink-0">
            <img
              src="/wabzfoodz-logo-sm.png"
              alt="Wabz Foods Logo"
              className="h-9 w-auto object-contain"
            />
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm font-medium text-stone-500 transition-colors duration-300 hover:text-persimmon"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {/* User avatar + name with sign-out dropdown */}
            {user ? (
              <div className="flex items-center gap-2.5 pr-3 border-r border-stone-200 mr-2 relative" ref={avatarRef}>
                <button
                  onClick={() => setAvatarOpen((v) => !v)}
                  className="flex items-center gap-2.5 focus:outline-none group"
                  aria-label="User menu"
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 ring-2 ring-white shadow-sm transition-transform duration-200 hover:scale-105"
                    style={{ backgroundColor: getAvatarColor(user.email || user.user_metadata?.full_name) }}
                    title={user.email || user.user_metadata?.full_name}
                  >
                    {(user.user_metadata?.full_name || user.email || "?").charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-stone-700 max-w-[120px] truncate group-hover:text-stone-900 transition-colors">
                    {user.user_metadata?.full_name || user.email?.split("@")[0] || "User"}
                  </span>
                </button>

                {/* Dropdown */}
                {avatarOpen && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-stone-200 rounded-xl shadow-xl shadow-stone-900/10 py-1.5 z-50 origin-top-right animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-4 py-2 border-b border-stone-100">
                      <p className="text-xs font-semibold text-stone-900 truncate">
                        {user.user_metadata?.full_name || "User"}
                      </p>
                      <p className="text-[10px] text-stone-400 truncate">
                        {user.email || ""}
                      </p>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-stone-600 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={15} />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-persimmon transition-colors pr-3 border-r border-stone-200 mr-2"
              >
                <User size={16} />
                Sign In
              </Link>
            )}

            <button
              onClick={() => setCartOpen(true)}
              className="relative p-2.5 rounded-xl hover:bg-stone-100 transition-colors"
              aria-label="Open cart"
            >
              <ShoppingCart className="w-5 h-5 text-stone-700" />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-persimmon text-white text-[10px] font-bold flex items-center justify-center shadow-md shadow-persimmon/30 tabular-nums">
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </button>

            <button
              onClick={() => setOpen((v) => !v)}
              className="md:hidden p-2.5 rounded-xl hover:bg-stone-100 transition-colors"
              aria-label="Toggle menu"
            >
              {open ? (
                <X className="w-5 h-5 text-stone-700" />
              ) : (
                <Menu className="w-5 h-5 text-stone-700" />
              )}
            </button>
          </div>
        </div>

        {open && (
          <nav className="md:hidden pb-4 border-t border-stone-100 pt-4">
            <div className="flex flex-col gap-1">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="text-sm font-medium text-stone-500 transition-colors duration-300 py-2.5 px-2 rounded-lg hover:bg-stone-50 hover:text-persimmon"
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
