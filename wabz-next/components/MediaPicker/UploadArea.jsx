"use client";

import React, { useState, useRef, useCallback } from "react";
import { Upload, File, X, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export default function UploadArea({ onUploadComplete, onClose }) {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const inputRef = useRef(null);

  const validateFile = (file) => {
    if (!file) return "No file selected.";
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `Invalid file type "${file.type || "unknown"}". Allowed: JPG, PNG, WEBP, GIF, AVIF.`;
    }
    if (file.size > MAX_SIZE) {
      return `File too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum is 5MB.`;
    }
    return null;
  };

  const uploadFile = async (file) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      setTimeout(() => setError(null), 5000);
      return;
    }

    setError(null);
    setSuccess(null);
    setUploading(true);
    setProgress(0);

    // Simulate progress for UX
    const progressInterval = setInterval(() => {
      setProgress((p) => Math.min(p + 15, 85));
    }, 200);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      clearInterval(progressInterval);
      setProgress(100);

      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setSuccess(`"${file.name}" uploaded successfully`);
      setTimeout(() => {
        onUploadComplete(data);
      }, 600);
    } catch (err) {
      clearInterval(progressInterval);
      setError(err.message);
      setUploading(false);
      setProgress(0);
    }
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) uploadFile(file);
  }, []);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleFileInput = (e) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    e.target.value = "";
  };

  return (
    <div className="flex flex-col items-center gap-4 py-6">
      {/* Drag & drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !uploading && inputRef.current?.click()}
        className={`w-full cursor-pointer rounded-sm border-2 border-dashed p-8 text-center transition-all duration-200 ${
          dragOver
            ? "border-emerald bg-emerald/5 scale-[1.01]"
            : uploading
              ? "border-emerald/40 bg-canvas-soft"
              : "border-hairline-cool hover:border-hairline-strong hover:bg-canvas-soft/50"
        }`}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        aria-label="Upload image area"
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
          onChange={handleFileInput}
          className="hidden"
          aria-hidden="true"
        />

        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={28} className="text-emerald animate-spin" />
            <p className="text-sm font-medium text-ink">Uploading...</p>
            {/* Progress bar */}
            <div className="w-full max-w-xs h-1.5 bg-hairline rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-ink-faint">{progress}%</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-sm bg-canvas border border-hairline-cool flex items-center justify-center group-hover:bg-emerald/5 transition-colors">
              <Upload size={22} className="text-ink-mute" />
            </div>
            <div>
              <p className="text-sm font-medium text-ink">
                <span className="text-emerald">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-ink-faint mt-1">
                JPG, PNG, WEBP, GIF, AVIF &mdash; Max 5MB
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="w-full flex items-start gap-2.5 px-4 py-3 rounded-[4px] bg-accent-tomato/5 border border-accent-tomato/20 animate-in fade-in slide-in-from-top-1 duration-200">
          <AlertCircle size={14} className="text-accent-tomato shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-accent-tomato">Upload failed</p>
            <p className="text-[11px] text-accent-tomato/80 mt-0.5">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-accent-tomato/50 hover:text-accent-tomato transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Success message */}
      {success && (
        <div className="w-full flex items-center gap-2.5 px-4 py-3 rounded-[4px] bg-emerald/5 border border-emerald/20 animate-in fade-in slide-in-from-top-1 duration-200">
          <CheckCircle2 size={14} className="text-emerald-deep shrink-0" />
          <p className="text-xs text-emerald-deep">{success}</p>
        </div>
      )}

      {/* File type info */}
      <div className="w-full flex flex-wrap items-center gap-2 text-[10px] text-ink-faint">
        <File size={11} />
        <span>Allowed:</span>
        {ALLOWED_EXTENSIONS.map((ext) => (
          <span
            key={ext}
            className="px-1.5 py-0.5 rounded-[2px] bg-canvas-soft border border-hairline-cool uppercase font-mono"
          >
            {ext}
          </span>
        ))}
        <span className="ml-auto">Max 5 MB</span>
      </div>
    </div>
  );
}
