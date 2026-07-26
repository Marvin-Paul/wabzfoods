import React, { useEffect, useState } from "react";
import { base44 } from "@/lib/base44Client";

const STATUSES = ["pending", "preparing", "ready", "out_for_delivery", "delivered", "cancelled"];

const STATUS_STYLE = {
  pending: "bg-amber-100 text-amber-700",
  preparing: "bg-blue-100 text-blue-700",
  ready: "bg-purple-100 text-purple-700",
  out_for_delivery: "bg-indigo-100 text-indigo-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const load = () =>
    base44.entities.Order.list("-created_date", 100).then(setOrders);

  useEffect(() => {
    load().finally(() => setLoading(false));
    const unsubscribe = base44.entities.Order.subscribe(() => load());
    return unsubscribe;
  }, []);

  const updateStatus = async (id, status) => {
    await base44.entities.Order.update(id, { status });
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  };

  const visible = orders.filter((o) => (filter === "all" ? true : o.status === filter));

  return (
    <div>
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {["all", ...STATUSES].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium capitalize whitespace-nowrap transition-colors ${
              filter === s ? "bg-carbon text-parchment" : "bg-card border border-carbon/15 text-carbon/60"
            }`}
          >
            {s.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-36 bg-carbon/5 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <p className="text-carbon/50 py-16 text-center">No orders to display.</p>
      ) : (
        <div className="space-y-4">
          {visible.map((o) => (
            <div key={o.id} className="bg-card border border-carbon/10 rounded-xl p-5">
              <div className="flex flex-wrap justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.25em] text-carbon/40">
                    {new Date(o.created_date).toLocaleString()}
                  </p>
                  <h3 className="font-display text-lg text-carbon mt-1">{o.customer_name || "Customer"}</h3>
                  <p className="text-sm text-carbon/60 mt-0.5">{o.phone} · {o.order_type}</p>
                  {o.address && <p className="text-sm text-carbon/60">{o.address}</p>}
                  {o.notes && <p className="text-sm text-carbon/50 italic mt-1">"{o.notes}"</p>}
                </div>
                <div className="text-right">
                  <p className="font-display text-xl text-carbon">USh {Number(o.total).toLocaleString()}</p>
                  <span
                    className={`inline-block mt-1 text-[10px] uppercase tracking-[0.2em] px-2.5 py-1 rounded-full ${
                      o.payment_status === "paid" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}
                  >
                    {o.payment_status}
                  </span>
                </div>
              </div>

              <ul className="mt-3 text-sm text-carbon/70 space-y-0.5">
                {o.items?.map((it, i) => (
                  <li key={i}>{it.qty}× {it.name}</li>
                ))}
              </ul>

              <div className="mt-4 pt-4 border-t border-carbon/10 flex flex-wrap items-center gap-3">
                <span className={`text-[10px] uppercase tracking-[0.2em] px-2.5 py-1 rounded-full ${STATUS_STYLE[o.status]}`}>
                  {o.status.replace(/_/g, " ")}
                </span>
                <select
                  value={o.status}
                  onChange={(e) => updateStatus(o.id, e.target.value)}
                  className="ml-auto text-sm border border-carbon/15 rounded-md px-3 py-1.5 bg-parchment focus:outline-none focus:border-persimmon"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}