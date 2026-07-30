"use client";

import React from "react";
import {
  LayoutGrid,
  UtensilsCrossed,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export default function StatsCards({ categories, foodItems }) {
  const totalCategories = categories.length;
  const totalItems = foodItems.length;
  const availableItems = foodItems.filter((i) => i.available).length;
  const outOfStock = foodItems.filter((i) => !i.available).length;

  const cards = [
    {
      icon: LayoutGrid,
      value: totalCategories,
      label: "Total Categories",
      color: "text-emerald",
      bg: "bg-emerald/10",
    },
    {
      icon: UtensilsCrossed,
      value: totalItems,
      label: "Total Food Items",
      color: "text-ink",
      bg: "bg-canvas-soft",
    },
    {
      icon: CheckCircle2,
      value: availableItems,
      label: "Available Items",
      color: "text-emerald-deep",
      bg: "bg-emerald/5",
    },
    {
      icon: AlertTriangle,
      value: outOfStock,
      label: "Out of Stock",
      color: "text-accent-tomato",
      bg: "bg-accent-tomato/5",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="bg-canvas border border-hairline rounded-sm p-5 hover:shadow-level-1 hover:-translate-y-0.5 transition-all duration-200 group cursor-default"
          >
            <div
              className={`w-10 h-10 rounded-[4px] ${card.bg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200`}
            >
              <Icon size={18} className={card.color} />
            </div>
            <p className="text-2xl font-medium text-ink tracking-tight tabular-nums">
              {card.value}
            </p>
            <p className="text-xs text-ink-mute mt-0.5">{card.label}</p>
          </div>
        );
      })}
    </div>
  );
}
