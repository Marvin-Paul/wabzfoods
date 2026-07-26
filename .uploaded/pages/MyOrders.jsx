import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Package } from "lucide-react";

const STEPS = [
  { key: "pending", label: "Order Placed" },
  { key: "preparing", label: "Preparing" },
  { key: "ready", label: "Ready" },
  { key: "out_for_delivery", label: "Out for Delivery" },
  { key: "delivered", label: "Delivered" },
];

function StatusTracker({ status }) {
  const order = ["pending", "preparing", "ready", "out_for_delivery", "delivered"];
  const idx = order.indexOf(status);
  const cancelled = status === "cancelled";

  if (cancelled) {
    return <p className="text-sm text-red-600 font-medium">Order cancelled.</p>;
  }

  return (
    <div className="flex flex-col gap-3 mt-4">
      {STEPS.map((s, i) => {
        const done = i <= idx;
        const active = i === idx;
        return (
          <div key={s.key} className="flex items-center gap-3">
            <span
              className={`w-3 h-3 rounded-full transition-colors ${
                done ? "bg-persimmon" : "bg-carbon/15"
              } ${active ? "ring-4 ring-persimmon/20" : ""}`}
            />
            <span className={`text-sm ${done ? "text-carbon font-medium" : "text-carbon/40"}`}>
              {s.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = () =>
      base44.entities.Order.list("-created_date", 50).then((o) => setOrders(o));
    load().finally(() => setLoading(false));

    const unsubscribe = base44.entities.Order.subscribe(() => load());
    return unsubscribe;
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-5 md:px-8 py-16">
      <p className="text-xs uppercase tracking-[0.3em] text-artichoke mb-3">Order Tracking</p>
      <h1 className="font-display text-4xl md:text-5xl font-light text-carbon mb-10">My Orders</h1>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-40 bg-carbon/5 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
          <Package size={36} className="text-carbon/30" />
          <p className="font-display text-xl font-light text-carbon">No orders yet.</p>
          <p className="text-sm text-carbon/60">When you place an order, it will appear here with live tracking.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {orders.map((o) => (
            <div key={o.id} className="bg-card border border-carbon/10 rounded-xl p-5 md:p-6">
              <div className="flex flex-wrap justify-between gap-3 items-start">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.25em] text-carbon/40">
                    {new Date(o.created_date).toLocaleString()}
                  </p>
                  <h3 className="font-display text-xl text-carbon mt-1">
                    Order · USh {Number(o.total).toLocaleString()}
                  </h3>
                </div>
                <span
                  className={`text-[11px] uppercase tracking-[0.2em] px-3 py-1.5 rounded-full ${
                    o.payment_status === "paid"
                      ? "bg-artichoke/15 text-artichoke"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {o.payment_status === "paid" ? "Paid" : "Payment Pending"}
                </span>
              </div>

              <ul className="mt-4 text-sm text-carbon/70 space-y-1">
                {o.items?.map((it, i) => (
                  <li key={i}>
                    {it.qty}× {it.name} — USh {(it.price * it.qty).toLocaleString()}
                  </li>
                ))}
              </ul>

              <div className="mt-2 pt-4 border-t border-carbon/10">
                <p className="text-[11px] uppercase tracking-[0.25em] text-carbon/40 mb-1">Status</p>
                <StatusTracker status={o.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
