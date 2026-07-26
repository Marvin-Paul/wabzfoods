"use client";

import React from "react";
import { Plus, Minus } from "lucide-react";
import { useCart } from "@/components/CartContext";

export default function MenuItemCard({ product, onAdd }) {
  const { addItem, updateQty, items } = useCart();
  const inCart = items.find((i) => i.id === product.id);
  const qty = inCart?.qty || 0;

  return (
    <div className="group bg-card border border-carbon/10 rounded-xl overflow-hidden flex flex-col hover:shadow-xl hover:shadow-carbon/5 hover:border-carbon/20 transition-all duration-300 hover:-translate-y-1">
      <div className="aspect-[4/3] bg-carbon/5 relative overflow-hidden">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {product.featured && (
          <span className="absolute top-3 left-3 bg-persimmon text-parchment text-[10px] uppercase tracking-[0.2em] px-2.5 py-1 rounded-full font-medium">
            Popular
          </span>
        )}
      </div>
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-lg text-carbon leading-tight">{product.name}</h3>
          <span className="font-display text-lg text-carbon whitespace-nowrap">
            USh {Number(product.price).toLocaleString()}
          </span>
        </div>
        <p className="text-sm text-carbon/60 mt-2 line-clamp-2 flex-1">{product.description}</p>
        <div className="mt-4 pt-4 border-t border-carbon/5 flex items-center justify-between">
          <span className="text-[11px] uppercase tracking-[0.2em] text-carbon/40 capitalize">{product.category}</span>
          {qty > 0 ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateQty(product.id, -1)}
                className="w-8 h-8 rounded-full border border-carbon/15 flex items-center justify-center text-carbon hover:bg-carbon/5 transition-colors"
              >
                <Minus size={14} />
              </button>
              <span className="text-sm font-medium text-carbon w-6 text-center">{qty}</span>
              <button
                onClick={() => addItem(product)}
                className="w-8 h-8 rounded-full bg-persimmon text-parchment flex items-center justify-center hover:bg-carbon transition-colors"
              >
                <Plus size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => onAdd(product)}
              className="px-4 py-2 rounded-lg bg-carbon text-parchment text-sm font-medium hover:bg-persimmon transition-colors"
            >
              Add
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
