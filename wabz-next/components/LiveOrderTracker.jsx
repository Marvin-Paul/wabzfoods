"use client";

import React from "react";
import { Check, Package, CookingPot, Bike, Home } from "lucide-react";

const STEPS = [
  { key: "pending", label: "Order Placed", icon: Package, time: "Just now" },
  { key: "preparing", label: "Preparing", icon: CookingPot, time: "10-20 mins" },
  { key: "ready", label: "Ready", icon: Check, time: "Ready!" },
  { key: "out_for_delivery", label: "Out for Delivery", icon: Bike, time: "On the way" },
  { key: "delivered", label: "Delivered", icon: Home, time: "Arrived!" },
];

export default function LiveOrderTracker({ status }) {
  const order = ["pending", "preparing", "ready", "out_for_delivery", "delivered"];
  const idx = order.indexOf(status);
  const cancelled = status === "cancelled";

  if (cancelled) {
    return (
      <div className="mt-5 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium flex items-center gap-2.5">
        <Package size={16} />
        Order cancelled. If you were charged, please contact us.
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-1">
      {STEPS.map((s, i) => {
        const done = i <= idx;
        const active = i === idx;
        const Icon = s.icon;

        return (
          <div key={s.key} className="flex items-start gap-4 group">
            {/* Step indicator */}
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                  done
                    ? "bg-persimmon text-white shadow-md shadow-persimmon/20"
                    : "bg-stone-100 text-stone-400 border border-stone-200"
                } ${active ? "ring-4 ring-persimmon/20 scale-110" : ""}`}
              >
                <Icon size={16} />
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`w-0.5 h-10 transition-all duration-300 ${
                    done ? "bg-persimmon" : "bg-stone-200"
                  }`}
                />
              )}
            </div>

            {/* Label + time */}
            <div className="flex-1 min-w-0 pt-2.5">
              <p
                className={`text-sm font-medium transition-all duration-300 ${
                  done ? "text-stone-900" : "text-stone-400"
                } ${active ? "text-persimmon font-semibold" : ""}`}
              >
                {s.label}
              </p>
              {done && (
                <p className="text-xs text-stone-500 mt-0.5">
                  {active ? s.time : "Complete"}
                </p>
              )}
            </div>

            {/* Checkmark for completed */}
            {done && !active && (
              <div className="pt-2.5 shrink-0">
                <Check size={14} className="text-emerald-500" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
