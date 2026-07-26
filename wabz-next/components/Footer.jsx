import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-carbon/10 bg-carbon text-parchment/70">
      <div className="max-w-7xl mx-auto px-5 md:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <Link href="/" className="font-display text-xl font-light text-parchment">
              Wabz Foods
            </Link>
            <p className="mt-3 text-sm text-parchment/60 max-w-xs">
              From Ugandan classics to fast-food favourites — order online, pay securely, and track your meal in real time.
            </p>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] text-parchment/40 mb-4">Menu</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-persimmon transition-colors">All Dishes</Link></li>
              <li><Link href="/" className="hover:text-persimmon transition-colors">Local Foods</Link></li>
              <li><Link href="/" className="hover:text-persimmon transition-colors">Fast Foods</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] text-parchment/40 mb-4">Account</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/orders" className="hover:text-persimmon transition-colors">My Orders</Link></li>
              <li><Link href="/track" className="hover:text-persimmon transition-colors">Track Order</Link></li>
              <li><Link href="/login" className="hover:text-persimmon transition-colors">Log In</Link></li>
              <li><Link href="/register" className="hover:text-persimmon transition-colors">Sign Up</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-parchment/10 flex flex-col md:flex-row justify-between gap-4">
          <p className="text-xs text-parchment/40">© {new Date().getFullYear()} Wabz Foods. All rights reserved.</p>
          <p className="text-xs text-parchment/40">Order online. Delivered fresh.</p>
        </div>
      </div>
    </footer>
  );
}
