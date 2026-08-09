"use client";

import React from "react";
import { X } from "lucide-react";

export default function DeleteDialog({ open, onClose, onConfirm, title, description }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-ink/30 backdrop-blur-[2px] flex items-center justify-center p-4">
      <div
        className="bg-canvas rounded-sm w-full max-w-sm shadow-level-3 border border-hairline animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-hairline-cool">
          <h2 className="text-[16px] font-medium text-ink tracking-tight">
            {title || "Confirm Delete"}
          </h2>
          <button
            onClick={onClose}
            className="text-ink-mute hover:text-ink transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-5">
          <p className="text-sm text-ink-secondary leading-relaxed">
            {description ||
              "Are you sure you want to delete this item? This action cannot be undone."}
          </p>
        </div>
        <div className="flex gap-3 px-6 py-4 border-t border-hairline-cool bg-canvas-soft/50">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-sm border border-hairline-strong text-sm font-medium text-ink-mute hover:bg-canvas-soft transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2 rounded-sm bg-accent-tomato text-white text-sm font-medium hover:opacity-90 transition-all"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
