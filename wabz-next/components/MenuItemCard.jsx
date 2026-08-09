"use client";

import React, { useState } from "react";
import { Plus, Minus, Sparkles, ImageIcon, ShoppingCart, Eye, Share2, Heart } from "lucide-react";
import { useCart } from "@/components/CartContext";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";

export default function MenuItemCard({ product, onAdd }) {
  const { addItem, updateQty, items } = useCart();
  const inCart = items.find((i) => i.id === product.id);
  const qty = inCart?.qty || 0;

  const [imgErr, setImgErr] = useState(false);
  const [liked, setLiked] = useState(false);

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <Card className="group relative bg-white rounded-2xl overflow-hidden border border-stone-200/80 hover:border-stone-300 shadow-sm hover:shadow-xl hover:shadow-stone-900/5 transition-all duration-500 ease-out hover:-translate-y-1.5 focus-within:ring-2 focus-within:ring-persimmon/30 focus-within:ring-offset-2">
          {/* Image Container */}
          <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
            {imgErr ? (
              <div className="w-full h-full flex items-center justify-center bg-stone-100">
                <ImageIcon size={32} className="text-stone-300" />
              </div>
            ) : (
              <img
                src={product.image_url}
                alt={product.name}
                onError={() => setImgErr(true)}
                className="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-110 group-hover:rotate-[0.5deg]"
              />
            )}
            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Like button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLiked((v) => !v);
              }}
              className={`absolute top-3.5 right-3.5 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                liked
                  ? "bg-persimmon text-white shadow-lg shadow-persimmon/30 scale-110"
                  : "bg-white/80 backdrop-blur-sm text-stone-500 hover:text-persimmon hover:bg-white shadow-lg shadow-black/10"
              }`}
              aria-label={liked ? "Remove from favourites" : "Add to favourites"}
            >
              <Heart size={14} fill={liked ? "currentColor" : "none"} />
            </button>

            {/* Featured Badge */}
            {product.featured && (
              <span className="absolute top-3.5 left-3.5 inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 text-[10px] font-semibold uppercase tracking-[0.15em] px-3 py-1.5 rounded-full shadow-lg shadow-amber-900/10 border border-amber-200/60">
                <Sparkles size={10} className="text-amber-500" />
                Chef&apos;s Pick
              </span>
            )}

            {/* Quick-add floating button on image hover */}
            <button
              onClick={() => onAdd(product)}
              className="absolute bottom-3.5 right-3.5 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm text-stone-800 shadow-lg shadow-black/10 flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-400 hover:bg-persimmon hover:text-white"
              aria-label="Quick add"
            >
              <Plus size={18} />
            </button>
          </div>

          {/* Card Body */}
          <CardContent className="p-5">
            {/* Category Tag */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-stone-400 bg-stone-100 px-2.5 py-1 rounded-md">
                {product.category || "Other"}
              </span>
            </div>

            {/* Name & Price */}
            <div className="flex items-start justify-between gap-4">
              <h3 className="font-display text-lg font-semibold text-stone-900 leading-snug line-clamp-1">
                {product.name}
              </h3>
              <span className="font-display text-lg font-bold text-persimmon whitespace-nowrap tabular-nums text-right shrink-0">
                UGX {Number(product.price).toLocaleString()}
              </span>
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-sm text-stone-500 mt-2 leading-relaxed line-clamp-2">
                {product.description}
              </p>
            )}
          </CardContent>

          {/* Action Area */}
          <CardFooter className="px-5 pb-5 pt-0">
            {qty > 0 ? (
              <div className="flex items-center justify-between w-full">
                <span className="text-xs text-stone-400 font-medium">Quantity</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updateQty(product.id, -1)}
                    className="w-9 h-9 rounded-xl border border-stone-200 flex items-center justify-center text-stone-500 hover:bg-stone-100 hover:text-stone-800 hover:border-stone-300 active:scale-95 transition-all duration-200"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="text-sm font-semibold text-stone-900 tabular-nums w-6 text-center">
                    {qty}
                  </span>
                  <button
                    onClick={() => addItem(product)}
                    className="w-9 h-9 rounded-xl bg-persimmon text-white flex items-center justify-center hover:bg-stone-900 active:scale-95 transition-all duration-200 shadow-md shadow-persimmon/20"
                    aria-label="Increase quantity"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => onAdd(product)}
                className="w-full py-3 rounded-xl bg-stone-900 text-white text-sm font-semibold hover:bg-persimmon active:scale-[0.98] transition-all duration-300 shadow-md shadow-stone-900/15 hover:shadow-lg hover:shadow-persimmon/25 flex items-center justify-center gap-2 group/btn"
              >
                <Plus
                  size={16}
                  className="transition-transform duration-300 group-hover/btn:rotate-90"
                />
                Add to Order
              </button>
            )}
          </CardFooter>
        </Card>
      </ContextMenuTrigger>

      <ContextMenuContent className="w-52 rounded-xl border-stone-200 p-1.5 shadow-xl">
        <ContextMenuItem
          onSelect={() => onAdd(product)}
          className="rounded-lg text-sm py-2.5 cursor-pointer"
        >
          <ShoppingCart size={15} className="mr-2.5 text-persimmon" />
          Add to Order
        </ContextMenuItem>
        <ContextMenuItem onSelect={() => {}} className="rounded-lg text-sm py-2.5 cursor-pointer">
          <Eye size={15} className="mr-2.5 text-stone-400" />
          View Details
        </ContextMenuItem>
        <ContextMenuSeparator className="my-1 bg-stone-100" />
        <ContextMenuItem
          onSelect={() => setLiked((v) => !v)}
          className="rounded-lg text-sm py-2.5 cursor-pointer"
        >
          <Heart
            size={15}
            className={`mr-2.5 ${liked ? "text-persimmon fill-persimmon" : "text-stone-400"}`}
          />
          {liked ? "Remove from Favourites" : "Add to Favourites"}
        </ContextMenuItem>
        <ContextMenuItem
          onSelect={() => {
            if (navigator.share) {
              navigator.share({
                title: product.name,
                text: product.description || `Check out ${product.name} at Wabz Foods!`,
                url: window.location.href,
              });
            }
          }}
          className="rounded-lg text-sm py-2.5 cursor-pointer"
        >
          <Share2 size={15} className="mr-2.5 text-stone-400" />
          Share
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
