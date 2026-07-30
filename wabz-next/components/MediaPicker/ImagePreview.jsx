"use client";

import React from "react";
import { Image } from "@/components/ui/image";
import { ImageIcon } from "lucide-react";

export default function ImagePreview({ imageUrl, filename, fileSize, dimensions }) {
  // Format file size
  const formatSize = (bytes) => {
    if (!bytes) return null;
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (!imageUrl) {
    return (
      <div className="w-full aspect-video rounded-sm bg-canvas-soft border-2 border-dashed border-hairline-cool flex flex-col items-center justify-center gap-2 transition-colors">
        <div className="w-12 h-12 rounded-sm bg-canvas border border-hairline-cool flex items-center justify-center">
          <ImageIcon size={22} className="text-ink-faint" />
        </div>
        <p className="text-xs text-ink-mute">No image selected</p>
        <p className="text-[10px] text-ink-faint">Choose, upload, or paste an image URL</p>
      </div>
    );
  }

  return (
    <div className="w-full rounded-sm overflow-hidden bg-canvas-soft border border-hairline group">
      {/* Image */}
      <div className="relative aspect-video bg-ink/5">
        <Image
          src={imageUrl}
          alt={filename || "Selected image"}
          fittingType="fill"
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.style.display = "none";
            e.target.parentElement.classList.add("flex", "items-center", "justify-center");
            const fallback = document.createElement("div");
            fallback.className = "flex flex-col items-center gap-2 text-ink-faint";
            fallback.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg><span class="text-xs">Failed to load image</span>`;
            e.target.parentElement.appendChild(fallback);
          }}
        />
      </div>

      {/* Metadata bar */}
      <div className="px-4 py-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px]">
        {filename && (
          <span className="text-ink-secondary font-medium truncate max-w-[180px]" title={filename}>
            {filename}
          </span>
        )}
        {dimensions && (
          <span className="text-ink-faint whitespace-nowrap">{dimensions}</span>
        )}
        {fileSize && (
          <span className="text-ink-faint whitespace-nowrap">{formatSize(fileSize)}</span>
        )}
      </div>
    </div>
  );
}
