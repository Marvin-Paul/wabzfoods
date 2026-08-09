"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Plus, Minus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/components/CartContext";
import { DEFAULT_SETTINGS } from "@/lib/supabase-data";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";

export default function CartDrawer() {
  const { items, isOpen, setOpen, addItem, updateQty, removeItem, count, total } = useCart();
  const [deliveryFee] = useState(() => Number(DEFAULT_SETTINGS.delivery_fee) || 0);

  const grandTotal = total + deliveryFee;

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent className="w-full sm:max-w-md bg-white border-l border-stone-200 p-0 flex flex-col">
        {/* Header */}
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-stone-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-persimmon/10 flex items-center justify-center">
                <ShoppingBag size={18} className="text-persimmon" />
              </div>
              <div>
                <SheetTitle className="text-lg font-display font-semibold text-stone-900 text-left">
                  Your Order
                </SheetTitle>
                <p className="text-xs text-stone-400 mt-0.5">
                  {count} item{count !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </div>
        </SheetHeader>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center mb-4">
                <ShoppingBag size={24} className="text-stone-300" />
              </div>
              <p className="text-stone-900 font-semibold text-base">Your cart is empty</p>
              <p className="text-stone-400 text-sm mt-1">Add some dishes to get started.</p>
              <SheetClose asChild>
                <button
                  onClick={() => setOpen(false)}
                  className="mt-6 text-sm font-medium text-persimmon hover:text-stone-900 transition-colors underline underline-offset-4"
                >
                  Browse the Menu
                </button>
              </SheetClose>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex gap-4 p-3 rounded-xl bg-stone-50/80 hover:bg-stone-100 transition-colors group"
                >
                  {/* Image */}
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-stone-200 shrink-0">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag size={18} className="text-stone-300" />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-stone-900 truncate">{item.name}</p>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-persimmon shrink-0"
                        aria-label={`Remove ${item.name}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <p className="text-xs text-stone-400 mt-0.5">
                      UGX {Number(item.price).toLocaleString()} each
                    </p>

                    {/* Quantity controls */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2.5">
                        <button
                          onClick={() => updateQty(item.id, -1)}
                          className="w-7 h-7 rounded-lg border border-stone-200 flex items-center justify-center text-stone-500 hover:bg-white hover:text-stone-800 hover:border-stone-300 active:scale-95 transition-all"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="text-sm font-semibold text-stone-900 tabular-nums w-5 text-center">
                          {item.qty}
                        </span>
                        <button
                          onClick={() => addItem(item)}
                          className="w-7 h-7 rounded-lg bg-persimmon text-white flex items-center justify-center hover:bg-stone-900 active:scale-95 transition-all"
                          aria-label="Increase quantity"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <span className="text-sm font-bold text-persimmon tabular-nums">
                        UGX {(item.price * item.qty).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-stone-100 px-6 py-5 space-y-4 bg-white">
            {/* Totals */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-stone-500">
                <span>Subtotal</span>
                <span className="tabular-nums">UGX {total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-stone-500">
                <span>Delivery</span>
                <span
                  className={
                    deliveryFee > 0 ? "text-stone-500 tabular-nums" : "text-emerald-600 font-medium"
                  }
                >
                  {deliveryFee > 0 ? `UGX ${deliveryFee.toLocaleString()}` : "Free"}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold text-stone-900 pt-2 border-t border-stone-100">
                <span>Total</span>
                <span className="tabular-nums">
                  UGX {deliveryFee > 0 ? grandTotal.toLocaleString() : total.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Checkout button */}
            <Link
              href="/checkout"
              onClick={() => setOpen(false)}
              className="w-full py-3.5 rounded-xl bg-stone-900 text-white text-sm font-semibold hover:bg-persimmon active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-stone-900/15 hover:shadow-lg hover:shadow-persimmon/25 group"
            >
              Checkout
              <ArrowRight
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>

            <SheetClose asChild>
              <button
                onClick={() => setOpen(false)}
                className="w-full text-center text-xs text-stone-400 hover:text-stone-600 transition-colors py-1"
              >
                Continue browsing
              </button>
            </SheetClose>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
