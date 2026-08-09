"use client";

import React from "react";
import { Check, Loader2 } from "lucide-react";

export default function MediaCard({ image, isSelected, onSelect, loading }) {
  if (loading) {
    return (
      <div className="aspect-square rounded-[4px] bg-canvas-soft border border-hairline-cool animate-pulse flex items-center justify-center">
        <Loader2 size={16} className="text-ink-faint animate-spin" />
      </div>
    );
  }

  const filename = image.filename || image.url?.split("/").pop() || "Image";

  return (
    <button
      type="button"
      onClick={() => onSelect(image)}
      className={`group relative aspect-square rounded-[4px] overflow-hidden border-2 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-emerald/40 ${
        isSelected
          ? "border-emerald ring-2 ring-emerald/30 shadow-level-1"
          : "border-hairline-cool hover:border-hairline-strong hover:shadow-level-1"
      }`}
      aria-label={`Select ${image.name || filename}`}
      aria-pressed={isSelected}
    >
      <img
        src={image.url}
        alt={image.name || filename}
        className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
        loading="lazy"
        onError={(e) => {
          e.target.style.display = "none";
          e.target.parentElement.classList.add(
            "bg-canvas-soft",
            "flex",
            "items-center",
            "justify-center"
          );
          const fallback = document.createElement("span");
          fallback.className = "text-[10px] text-ink-faint px-1 text-center leading-tight";
          fallback.textContent = filename;
          e.target.parentElement.appendChild(fallback);
        }}
      />

      {/* Selected checkmark */}
      {isSelected && (
        <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-emerald rounded-full flex items-center justify-center shadow-level-1 animate-in fade-in zoom-in-90 duration-100">
          <Check size={11} className="text-on-emerald" />
        </div>
      )}

      {/* Bottom gradient + name */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent pt-8 pb-2 px-2 translate-y-1 group-hover:translate-y-0 transition-transform duration-150">
        <p className="text-[10px] text-white font-medium truncate leading-tight drop-shadow-sm">
          {image.name || filename.replace(/\.[^/.]+$/, "").replace(/-/g, " ")}
        </p>
        {image.fileSize && (
          <p className="text-[9px] text-white/70 truncate mt-0.5">
            {image.fileSize < 1024
              ? `${image.fileSize} B`
              : image.fileSize < 1024 * 1024
                ? `${(image.fileSize / 1024).toFixed(1)} KB`
                : `${(image.fileSize / (1024 * 1024)).toFixed(1)} MB`}
          </p>
        )}
      </div>
    </button>
  );
}
