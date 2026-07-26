import React, { useEffect, useState } from "react";
import Link from "next/link";
import { base44 } from "@/api/base44Client";
import LiveOrderTracker from "@/components/LiveOrderTracker";
import { Package, ArrowRight, Radio } from "lucide-react";

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
      base44.entities.Order.list("-created_date", 50).then((o) => setOrders(o));
    load().finally(() => setLoading(false));
    const unsubscribe = base44.entities.Order.subscribe(() => load());
    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-5 md:px-8 py-16">
        <div className="h-8 w-40 bg-carbon/5 rounded animate-pulse mb-8" />
        <div className="h-64 bg-carbon/5 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-md mx-auto px-5 py-24 text-center">
        <Package size={36} className="text-carbon/30 mx-auto mb-4" />
        <h1 className="font-display text-3xl font-light text-carbon mb-2">No orders to track yet</h1>
        <p className="text-carbon/60 mb-6">Place an order and watch it travel from our kitchen to you in real time.</p>
        <Link to="/" className="inline-block bg-persimmon text-parchment px-6 py-3 rounded-lg text-sm uppercase tracking-wider">
          Browse Menu
        </Link>
      </div>
    );
  }

  const active = orders.find((o) => !["delivered", "cancelled"].includes(o.status)) || orders[0];
  const rest = orders.filter((o) => o.id !== active.id);

  return (
    <div className="max-w-3xl mx-auto px-5 md:px-8 py-12 md:py-16">
      <div className="flex items-center gap-2 mb-2">
        <Radio size={14} className="text-persimmon animate-pulse" />
        <span className="text-xs uppercase tracking-[0.3em] text-artichoke">Live Tracking</span>
      </div>
      <h1 className="font-display text-4xl md:text-5xl font-light text-carbon mb-8">Track Your Order</h1>

      <div className="bg-card border border-carbon/10 rounded-2xl p-6 md:p-8">
        <div className="flex flex-wrap justify-between items-start gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.25em] text-carbon/40">
              {timeAgo(active.created_date)} · USh {Number(active.total).toLocaleString()}
            </p>
            <h2 className="font-display text-2xl text-carbon mt-1">
              {active.order_type === "delivery" ? "Delivery Order" : "Pickup Order"}
            </h2>
          </div>
          <span
            className={`text-[11px] uppercase tracking-[0.2em] px-3 py-1.5 rounded-full ${
              active.payment_status === "paid"
                ? "bg-artichoke/15 text-artichoke"
                : "bg-red-100 text-red-700"
            }`}
          >
            {active.payment_status === "paid" ? "Paid" : "Payment Pending"}
          </span>
        </div>

        <LiveOrderTracker status={active.status} />

        <div className="mt-6 pt-5 border-t border-carbon/10 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-carbon/40 mb-1">Items</p>
            <ul className="text-carbon/70 space-y-0.5">
              {active.items?.map((it, i) => (
                <li key={i}>{it.qty}× {it.name}</li>
              ))}
            </ul>
          </div>
          {(active.order_type === "delivery" || active.phone) && (
            <div className="space-y-2">
              {active.order_type === "delivery" && active.address && (
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-carbon/40 mb-1">Delivery To</p>
                  <p className="text-carbon/70">{active.address}</p>
                </div>
              )}
              {active.phone && (
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-carbon/40 mb-1">Phone</p>
                  <p className="text-carbon/70">{active.phone}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {rest.length > 0 && (
        <div className="mt-10">
          <h3 className="font-display text-lg text-carbon mb-4">Other orders</h3>
          <div className="space-y-2">
            {rest.map((o) => (
              <div key={o.id} className="flex items-center justify-between bg-card border border-carbon/10 rounded-xl px-4 py-3">
                <div>
                  <p className="text-sm text-carbon font-medium">USh {Number(o.total).toLocaleString()}</p>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-carbon/40">{timeAgo(o.created_date)}</p>
                </div>
                <span
                  className={`text-[11px] uppercase tracking-[0.2em] px-2.5 py-1 rounded-full ${
                    o.status === "delivered"
                      ? "bg-artichoke/15 text-artichoke"
                      : o.status === "cancelled"
                      ? "bg-red-100 text-red-700"
                      : "bg-persimmon/15 text-persimmon"
                  }`}
                >
                  {o.status.replace(/_/g, " ")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-10">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-carbon/60 hover:text-persimmon">
          Back to menu <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  );
}
