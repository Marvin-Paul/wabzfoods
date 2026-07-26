"use client"

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { base44 } from "@/lib/base44Client";
import { useCart } from "@/components/CartContext";
import { Image } from "@/components/ui/image";
import { ArrowLeft, Loader2 } from "lucide-react";
import { CartProvider } from "@/components/CartContext";

function CheckoutInner() {
  const { items, total, clearCart } = useCart();
  const router = useRouter();
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
      const order = await base44.entities.Order.create({
        items: items.map((i) => ({ name: i.name, price: i.price, qty: i.qty })),
        total,
        status: "pending",
        payment_status: "unpaid",
        order_type: form.order_type,
        customer_name: form.customer_name,
        phone: form.phone,
        address: form.address,
        notes: form.notes,
      });

      const res = await base44.functions.invoke("createCheckout", {
        order_id: order.id,
        items,
        total,
      });
      const url = res?.data?.url;
      if (!url) throw new Error("No checkout URL returned");

      if (window.self !== window.top) {
        alert("Checkout works only from the published app. Please open the published app to pay.");
        router.push("/orders");
        return;
      }

      clearCart();
      window.location.href = url;
    } catch (err) {
      setError(err?.message || "Could not start checkout. Please try again.");
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-5 py-24 text-center">
        <h1 className="font-display text-3xl text-carbon mb-3">Your cart is empty</h1>
        <p className="text-carbon/60 mb-6">Add a few dishes before checking out.</p>
        <Link href="/" className="inline-block bg-persimmon text-parchment px-6 py-3 rounded-lg text-sm uppercase tracking-wider">
          Browse Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-5 md:px-8 py-12">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-carbon/60 hover:text-persimmon mb-6">
        <ArrowLeft size={16} /> Back to menu
      </Link>
      <h1 className="font-display text-4xl font-light text-carbon mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <form onSubmit={submit} className="lg:col-span-3 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs uppercase tracking-wider text-carbon/60">Full Name</label>
              <input
                value={form.customer_name}
                onChange={(e) => set("customer_name", e.target.value)}
                className="mt-1 w-full px-3 py-2.5 bg-card border border-carbon/15 rounded-lg focus:outline-none focus:border-persimmon"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-carbon/60">Phone</label>
              <input
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="+256…"
                className="mt-1 w-full px-3 py-2.5 bg-card border border-carbon/15 rounded-lg focus:outline-none focus:border-persimmon"
              />
            </div>
          </div>

          <div className="flex gap-2">
            {["delivery", "pickup"].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => set("order_type", t)}
                className={`flex-1 py-3 rounded-lg text-sm font-medium capitalize transition-colors ${
                  form.order_type === t
                    ? "bg-carbon text-parchment"
                    : "bg-card border border-carbon/15 text-carbon/60"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {form.order_type === "delivery" && (
            <div>
              <label className="text-xs uppercase tracking-wider text-carbon/60">Delivery Address</label>
              <textarea
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
                rows={2}
                className="mt-1 w-full px-3 py-2.5 bg-card border border-carbon/15 rounded-lg focus:outline-none focus:border-persimmon"
              />
            </div>
          )}

          <div>
            <label className="text-xs uppercase tracking-wider text-carbon/60">Notes (optional)</label>
            <input
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Allergies, gate instructions…"
              className="mt-1 w-full px-3 py-2.5 bg-card border border-carbon/15 rounded-lg focus:outline-none focus:border-persimmon"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-persimmon text-parchment py-4 rounded-lg text-sm font-semibold uppercase tracking-[0.2em] hover:bg-carbon disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
          >
            {submitting ? (
              <><Loader2 size={18} className="animate-spin" /> Preparing payment…</>
            ) : (
              `Pay USh ${total.toLocaleString()}`
            )}
          </button>
          <p className="text-[11px] text-carbon/40 text-center">Secure payment via Stripe. You&apos;ll be redirected to complete your purchase.</p>
        </form>

        <aside className="lg:col-span-2 bg-card border border-carbon/10 rounded-xl p-5 h-fit">
          <h2 className="font-display text-xl text-carbon mb-4">Order Summary</h2>
          <ul className="space-y-3">
            {items.map((i) => (
              <li key={i.id} className="flex gap-3">
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-carbon/5 shrink-0">
                  <Image src={i.image_url} alt={i.name} fittingType="fill" className="w-full h-full" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-carbon font-medium">{i.qty}× {i.name}</p>
                  <p className="text-xs text-carbon/50">USh {(i.price * i.qty).toLocaleString()}</p>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-4 pt-4 border-t border-carbon/10 flex justify-between items-baseline">
            <span className="text-sm uppercase tracking-wider text-carbon/60">Total</span>
            <span className="font-display text-2xl text-carbon">USh {total.toLocaleString()}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default function Checkout() {
  return (
    <CartProvider>
      <CheckoutInner />
    </CartProvider>
  );
}
