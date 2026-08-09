"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import ImagePreview from "./ImagePreview";
import MediaLibraryModal from "./MediaLibraryModal";
import { useToast } from "@/components/ui/use-toast";
import {
  ImageIcon,
  Upload,
  Trash2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Loader2,
  AlertCircle,
  AlertTriangle,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

export default function MediaPicker({ value, onChange }) {
  const { toast } = useToast();
  const [showLibrary, setShowLibrary] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [advancedUrl, setAdvancedUrl] = useState(value || "");
  const [advancedError, setAdvancedError] = useState(null);
  const [advancedLoading, setAdvancedLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Keep advancedUrl in sync when value changes externally (upload, library selection)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- keep URL in sync when value changes externally
    setAdvancedUrl(value || "");
  }, [value]);

  // Derived metadata from the current image URL
  const filename = value ? value.split("/").pop() : null;

  // Handle image selection from library
  const handleLibrarySelect = useCallback(
    (url) => {
      onChange(url);
      setAdvancedUrl(url);
      setAdvancedError(null);
    },
    [onChange]
  );

  // Handle file upload via hidden input
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file",
        description: "Please select a JPG, PNG, WEBP, or GIF image.",
      });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Maximum file size is 5MB." });
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      onChange(data.url);
      setAdvancedUrl(data.url);
      toast({ title: "Image uploaded", description: "Image has been uploaded successfully." });
    } catch (err) {
      toast({ title: "Upload error", description: err.message });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Handle advanced URL input
  const handleAdvancedUrlChange = (url) => {
    setAdvancedUrl(url);
    setAdvancedError(null);
    setAdvancedLoading(!!url);
  };

  const validateUrl = (url) => {
    if (!url) return null;
    if (!url.startsWith("http") && !url.startsWith("/food/")) {
      return "URL must start with http://, https://, or /food/";
    }
    const ext = url.split("?")[0].split("#")[0].toLowerCase();
    const validExts = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"];
    const hasValidExt = validExts.some((e) => ext.endsWith(e));
    if (!hasValidExt) {
      return "URL should point to an image file (JPG, PNG, WEBP, GIF, or AVIF)";
    }
    return null;
  };

  const handleAdvancedUrlBlur = () => {
    if (advancedUrl && advancedUrl !== value) {
      const err = validateUrl(advancedUrl);
      if (err) {
        setAdvancedError(err);
      } else {
        onChange(advancedUrl);
      }
    }
    setAdvancedLoading(false);
  };

  const [showRemoveDialog, setShowRemoveDialog] = useState(false);

  // Remove image
  const handleRemove = () => {
    if (!value) return;
    onChange("");
    setAdvancedUrl("");
    setAdvancedError(null);
    setShowRemoveDialog(false);
    toast({ title: "Image removed", description: "The image has been removed from this item." });
  };

  // Remove image name for the dialog
  const removeName = filename || "this image";

  return (
    <div className="space-y-3">
      {/* Label */}
      <label className="text-xs font-medium uppercase tracking-wider text-ink-mute">Image</label>

      {/* Preview */}
      <ImagePreview imageUrl={value} filename={filename} dimensions={null} fileSize={null} />

      {/* Action buttons */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setShowLibrary(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-hairline-strong rounded-sm text-sm font-medium text-ink hover:bg-canvas-soft active:bg-canvas-soft transition-all"
          aria-label="Choose image from library"
        >
          <ImageIcon size={15} />
          Choose Image
        </button>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-hairline-strong rounded-sm text-sm font-medium text-ink hover:bg-canvas-soft active:bg-canvas-soft disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          aria-label="Upload new image"
        >
          {uploading ? (
            <Loader2 size={15} className="animate-spin text-emerald" />
          ) : (
            <Upload size={15} />
          )}
          {uploading ? "Uploading…" : "Upload New"}
        </button>

        {value && (
          <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
            <AlertDialogTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-accent-tomato/30 text-accent-tomato rounded-sm text-sm font-medium hover:bg-accent-tomato/5 active:bg-accent-tomato/10 transition-all"
                aria-label="Remove image"
              >
                <Trash2 size={15} />
                Remove
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle size={16} className="text-accent-tomato" />
                  Remove image
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to remove <strong>{removeName}</strong> from this item? The
                  image file will not be deleted from the server.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleRemove}
                  className="bg-accent-tomato text-white hover:bg-accent-tomato/90"
                >
                  Remove
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Advanced: manual URL */}
      <div>
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="inline-flex items-center gap-1.5 text-xs text-ink-mute hover:text-ink transition-colors"
          aria-expanded={showAdvanced}
          aria-label="Toggle advanced URL input"
        >
          {showAdvanced ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          Advanced
        </button>

        {showAdvanced && (
          <div className="mt-2 p-3 rounded-sm bg-canvas-soft border border-hairline-cool animate-in fade-in slide-in-from-top-1 duration-150">
            <div className="relative">
              <input
                value={advancedUrl}
                onChange={(e) => handleAdvancedUrlChange(e.target.value)}
                onBlur={handleAdvancedUrlBlur}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAdvancedUrlBlur();
                  }
                }}
                placeholder="https://example.com/image.jpg"
                className="w-full px-3 py-2 pr-10 bg-canvas border border-hairline-strong rounded-sm text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-emerald focus:ring-1 focus:ring-emerald/20 transition-all"
                aria-label="Image URL"
              />
              {advancedLoading && (
                <Loader2
                  size={14}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald animate-spin"
                />
              )}
              {advancedUrl && !advancedLoading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {advancedError ? (
                    <AlertCircle size={14} className="text-accent-tomato" />
                  ) : advancedUrl.startsWith("http") || advancedUrl.startsWith("/") ? (
                    <ExternalLink size={14} className="text-emerald" />
                  ) : null}
                </div>
              )}
            </div>

            {advancedError && (
              <p className="mt-1.5 text-xs text-accent-tomato flex items-center gap-1">
                <AlertCircle size={11} />
                {advancedError}
              </p>
            )}

            <p className="mt-2 text-[10px] text-ink-faint">
              Paste an external image URL or a local path like{" "}
              <code className="px-1 py-0.5 rounded bg-ink/5 font-mono">/food/beef-luwombo.jpg</code>
            </p>
          </div>
        )}
      </div>

      {/* Library Modal */}
      {showLibrary && (
        <MediaLibraryModal
          currentUrl={value}
          onSelect={handleLibrarySelect}
          onClose={() => setShowLibrary(false)}
        />
      )}
    </div>
  );
}
