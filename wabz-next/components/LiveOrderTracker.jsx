"use client";

import React from "react";

const STEPS = [
  { key: "pending", label: "Order Placed" },
  { key: "preparing", label: "Preparing" },
  { key: "ready", label: "Ready" },
  { key: "out_for_delivery", label: "Out for Delivery" },
  { key: "delivered", label: "Delivered" },
];

export default function LiveOrderTracker({ status }) {
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
