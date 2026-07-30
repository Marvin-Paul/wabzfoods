"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { mapOrder } from "@/lib/supabase-data";

const STATUSES = ["pending", "preparing", "ready", "out_for_delivery", "delivered", "cancelled"];

const STATUS_STYLE = {
  pending: "bg-canvas-soft text-ink-mute border-hairline-strong",
  preparing: "bg-emerald/10 text-emerald-deep border-emerald/20",
  ready: "bg-accent-purple/10 text-accent-purple border-accent-purple/20",
  out_for_delivery: "bg-[#644fc1]/10 text-[#644fc1] border-[#644fc1]/20",
  delivered: "bg-emerald/10 text-emerald-deep border-emerald/20",
  cancelled: "bg-accent-tomato/10 text-accent-tomato border-accent-tomato/20",
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const load = () =>
    supabase
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false })
      .limit(100)
      .then(({ data }) => setOrders((data || []).map(mapOrder)))
      .catch((err) => console.error("Admin orders fetch failed:", err));

  useEffect(() => {
    load().finally(() => setLoading(false));
    const interval = setInterval(() => load(), 5000);
    return () => clearInterval(interval);
  }, []);

  const updateStatus = async (id, status) => {
    await supabase.from("orders").update({ status }).eq("order_id", id);
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  };

  const visible = orders.filter((o) => (filter === "all" ? true : o.status === filter));

  return (
    <div>
      {/* Filter pills */}
      <div className="flex gap-1.5 mb-6 overflow-x-auto pb-1 scrollbar-hide">
        {["all", ...STATUSES].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-[4px] text-[11px] font-medium capitalize whitespace-nowrap transition-all duration-150 border ${
              filter === s
                ? "bg-emerald text-on-emerald border-emerald"
                : "bg-canvas text-ink-mute border-hairline hover:border-hairline-strong hover:text-ink"
            }`}
          >
            {s.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-canvas-soft rounded-sm animate-pulse border border-hairline-cool" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <p className="text-sm text-ink-mute-2 py-16 text-center">No orders to display.</p>
      ) : (
        <div className="space-y-3">
          {visible.map((o) => (
            <div key={o.id} className="bg-canvas border border-hairline rounded-sm p-5 hover:shadow-level-1 transition-shadow">
              <div className="flex flex-wrap justify-between gap-3">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-ink-mute">
                    {new Date(o.created_date).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true })}
                  </p>
                  <h3 className="text-[18px] font-medium text-ink mt-1 tracking-tight">{o.customer_name || "Customer"}</h3>
                  <p className="text-xs text-ink-mute mt-0.5">{o.phone} · {o.order_type}</p>
                  {o.address && <p className="text-xs text-ink-mute mt-0.5">{o.address}</p>}
                  {o.notes && <p className="text-xs text-ink-mute-2 italic mt-1">"{o.notes}"</p>}
                </div>
                <div className="text-right">
                  <p className="text-xl font-medium text-ink tabular-nums">UGX {Number(o.total).toLocaleString()}</p>
                  <span className={`inline-block mt-1 text-[10px] font-medium uppercase tracking-wide px-2 py-0.5 rounded-[4px] border ${
                    o.payment_status === "paid"                    ? "bg-emerald/10 text-emerald-deep border-emerald/20" : "bg-accent-tomato/10 text-accent-tomato border-accent-tomato/20"
                  }`}>
                    {o.payment_status}
                  </span>
                </div>
              </div>

              <ul className="mt-3 text-xs text-ink-mute space-y-0.5">
                {o.items?.map((it, i) => (
                  <li key={i} className="tabular-nums">{it.qty}× {it.name}</li>
                ))}
              </ul>

              <div className="mt-4 pt-4 border-t border-hairline-cool flex flex-wrap items-center gap-3">
                <span className={`text-[10px] font-medium uppercase tracking-wide px-2.5 py-1 rounded-[4px] border ${STATUS_STYLE[o.status]}`}>
                  {o.status.replace(/_/g, " ")}
                </span>
                <select
                  value={o.status}
                  onChange={(e) => updateStatus(o.id, e.target.value)}
                  className="ml-auto text-xs border border-hairline-strong rounded-[4px] px-3 py-1.5 bg-canvas text-ink focus:outline-none focus:border-emerald focus:ring-1 focus:ring-emerald/20 transition-all"
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
