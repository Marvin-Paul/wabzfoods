"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { X, Search, ImageIcon, Upload, Library, Loader2 } from "lucide-react";
import FOOD_IMAGES from "@/lib/food-images";
import MediaCard from "./MediaCard";
import UploadArea from "./UploadArea";

const ITEMS_PER_PAGE = 20;

export default function MediaLibraryModal({ currentUrl, onSelect, onClose }) {
  const [tab, setTab] = useState("library"); // "library" | "upload"
  const [search, setSearch] = useState("");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [selectedUrl, setSelectedUrl] = useState(currentUrl || null);
  const searchInputRef = useRef(null);

  // Load images on mount
  useEffect(() => {
    setLoading(true);
    // Simulate a short load for realism
    const timer = setTimeout(() => {
      const enriched = FOOD_IMAGES.map((img) => ({
        ...img,
        filename: img.url.split("/").pop(),
        fileSize: null, // We don't know file sizes from static data
      }));
      setImages(enriched);
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Focus search input when tab switches to library
  useEffect(() => {
    if (tab === "library") {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [tab]);

  // Filter by search
  const filtered = search
    ? images.filter(
        (img) =>
          img.name.toLowerCase().includes(search.toLowerCase()) ||
          (img.filename || "").toLowerCase().includes(search.toLowerCase())
      )
    : images;

  // Paginate
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;
  const safePage = Math.min(page, totalPages - 1);
  const paged = filtered.slice(safePage * ITEMS_PER_PAGE, (safePage + 1) * ITEMS_PER_PAGE);

  // Reset page when search changes
  useEffect(() => setPage(0), [search]);

  const handleSelect = (img) => {
    setSelectedUrl(img.url);
  };

  const handleDone = () => {
    if (selectedUrl) onSelect(selectedUrl);
    onClose();
  };

  const handleUploadComplete = useCallback((data) => {
    // Add uploaded image to the list and select it
    const newImg = {
      url: data.url,
      name: data.filename || data.url.split("/").pop(),
      filename: data.filename || data.url.split("/").pop(),
      fileSize: null,
    };
    setImages((prev) => [newImg, ...prev]);
    setSelectedUrl(data.url);
    // Switch to library tab to show the uploaded image
    setTab("library");
    setSearch("");
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === "Escape") onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-ink/30 backdrop-blur-[2px] flex items-center justify-center p-4"
      onKeyDown={handleKeyDown}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-canvas rounded-sm w-full max-w-3xl max-h-[90vh] flex flex-col shadow-level-3 border border-hairline animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-hairline shrink-0">
          <h3 className="text-[16px] font-medium text-ink">Media Library</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-sm flex items-center justify-center text-ink-mute hover:text-ink hover:bg-canvas-soft transition-all"
            aria-label="Close media library"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab bar */}
        <div className="flex border-b border-hairline-cool shrink-0">
          <button
            onClick={() => setTab("library")}
            className={`flex items-center gap-2 px-5 py-2.5 text-xs font-medium transition-all border-b-[1.5px] ${
              tab === "library"
                ? "border-emerald text-ink"
                : "border-transparent text-ink-mute hover:text-ink hover:border-hairline-strong"
            }`}
            aria-label="Image library"
          >
            <Library size={14} />
            Library
          </button>
          <button
            onClick={() => setTab("upload")}
            className={`flex items-center gap-2 px-5 py-2.5 text-xs font-medium transition-all border-b-[1.5px] ${
              tab === "upload"
                ? "border-emerald text-ink"
                : "border-transparent text-ink-mute hover:text-ink hover:border-hairline-strong"
            }`}
            aria-label="Upload new image"
          >
            <Upload size={14} />
            Upload New
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {tab === "library" ? (
            <>
              {/* Search bar */}
              <div className="px-6 py-3 border-b border-hairline-cool shrink-0">
                <div className="relative">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint pointer-events-none"
                  />
                  <input
                    ref={searchInputRef}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search images..."
                    className="w-full pl-9 pr-3 py-2 bg-canvas-soft border border-hairline-strong rounded-sm text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-emerald focus:ring-1 focus:ring-emerald/20 transition-all"
                    aria-label="Search images"
                  />
                </div>
              </div>

              {/* Grid */}
              <div className="flex-1 overflow-y-auto px-6 py-4">
                {loading ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <MediaCard key={i} loading />
                    ))}
                  </div>
                ) : paged.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <div className="w-12 h-12 rounded-sm bg-canvas-soft border border-hairline-cool flex items-center justify-center">
                      <ImageIcon size={22} className="text-ink-faint" />
                    </div>
                    <p className="text-sm font-medium text-ink">
                      {search ? "No images match your search" : "No images yet"}
                    </p>
                    <p className="text-xs text-ink-mute">
                      {search
                        ? "Try a different search term."
                        : "Upload your first image using the Upload tab."}
                    </p>
                    {search && (
                      <button
                        onClick={() => setSearch("")}
                        className="text-xs text-emerald hover:text-emerald-deep transition-colors font-medium"
                      >
                        Clear search
                      </button>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {paged.map((img) => (
                        <MediaCard
                          key={img.url}
                          image={img}
                          isSelected={selectedUrl === img.url}
                          onSelect={handleSelect}
                        />
                      ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-center gap-1 mt-5 pt-4 border-t border-hairline-cool">
                        <button
                          disabled={safePage === 0}
                          onClick={() => setPage((p) => Math.max(0, p - 1))}
                          className="px-3 py-1.5 rounded-[4px] text-xs font-medium text-ink-mute hover:text-ink hover:bg-canvas-soft disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                          aria-label="Previous page"
                        >
                          Previous
                        </button>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => {
                            const pageNum = i;
                            return (
                              <button
                                key={pageNum}
                                onClick={() => setPage(pageNum)}
                                className={`w-7 h-7 rounded-[4px] text-xs font-medium transition-all ${
                                  safePage === pageNum
                                    ? "bg-emerald text-on-emerald"
                                    : "text-ink-mute hover:text-ink hover:bg-canvas-soft"
                                }`}
                                aria-label={`Page ${pageNum + 1}`}
                              >
                                {pageNum + 1}
                              </button>
                            );
                          })}
                        </div>
                        <button
                          disabled={safePage >= totalPages - 1}
                          onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                          className="px-3 py-1.5 rounded-[4px] text-xs font-medium text-ink-mute hover:text-ink hover:bg-canvas-soft disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                          aria-label="Next page"
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </>
          ) : (
            /* Upload tab */
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <UploadArea onUploadComplete={handleUploadComplete} onClose={onClose} />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-hairline shrink-0">
          <span className="text-xs text-ink-faint">
            {selectedUrl ? "1 image selected" : `${filtered.length} images`}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 border border-hairline-strong rounded-sm text-xs font-medium text-ink-mute hover:text-ink hover:bg-canvas-soft transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDone}
              disabled={!selectedUrl}
              className="px-4 py-1.5 rounded-sm bg-emerald text-on-emerald text-xs font-medium hover:bg-emerald-deep disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
