"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";

/* ── Configuration defaults ── */
const DEFAULT_PROPS = {
  phoneNumber: "+256700123456",
  message:
    "Hello! I'm interested in your services and would like more information.",
  tooltip: "Chat with us on WhatsApp",
  position: { bottom: 24, right: 24 },
  mobilePosition: { bottom: 16, right: 16 },
  color: "#25D366",
  size: 56,
  mobileSize: 52,
};

/* ── WhatsApp SVG icon (official logo) ── */
function WhatsAppIcon({ size = 28 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M24 0C10.746 0 0 10.746 0 24c0 4.6 1.302 8.906 3.552 12.582L1.206 44.64a1.5 1.5 0 001.866 1.866l8.058-2.346A23.874 23.874 0 0024 48c13.254 0 24-10.746 24-24S37.254 0 24 0z"
        fill="#25D366"
      />
      <path
        d="M35.604 28.362c-1.332-.666-2.664-.666-4.002 0-.822.42-1.494.96-2.328 1.398-.576.306-1.296.27-1.842-.048-1.254-.738-2.382-1.644-3.402-2.664a15.394 15.394 0 01-2.664-3.402c-.318-.546-.354-1.266-.048-1.842.438-.834.978-1.506 1.398-2.328.666-1.338.666-2.67 0-4.002-.48-.96-1.53-1.572-2.622-1.572h-1.434c-.822 0-1.608.342-2.172.906a7.144 7.144 0 00-2.016 4.512c-.114 1.38.21 2.76.876 3.978a24.878 24.878 0 005.472 6.882 24.878 24.878 0 006.882 5.472c1.218.666 2.598.99 3.978.876a7.144 7.144 0 004.512-2.016c.564-.564.906-1.35.906-2.172v-1.434c0-1.092-.612-2.142-1.572-2.622-.006-.006-.012-.006-.018-.006z"
        fill="#fff"
      />
    </svg>
  );
}

/* ── Component ── */
export default function WhatsAppChatWidget({
  phoneNumber = DEFAULT_PROPS.phoneNumber,
  message = DEFAULT_PROPS.message,
  tooltip = DEFAULT_PROPS.tooltip,
  position = DEFAULT_PROPS.position,
  mobilePosition = DEFAULT_PROPS.mobilePosition,
  color = DEFAULT_PROPS.color,
  size = DEFAULT_PROPS.size,
  mobileSize = DEFAULT_PROPS.mobileSize,
}) {
  const [mounted, setMounted] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const tooltipTimeoutRef = useRef(null);

  /* ── Only render on client (hydration safe) ── */
  useEffect(() => {
    setMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  /* ── Set CSS custom properties for theme support ── */
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--wa-tooltip-bg", "#ffffff");
    root.style.setProperty("--wa-tooltip-color", "#1e1e1e");
    root.style.setProperty("--wa-tooltip-border", "rgba(0, 0, 0, 0.06)");

    return () => {
      root.style.removeProperty("--wa-tooltip-bg");
      root.style.removeProperty("--wa-tooltip-color");
      root.style.removeProperty("--wa-tooltip-border");
    };
  }, []);

  /* ── Clean up timeout on unmount ── */
  useEffect(() => {
    return () => clearTimeout(tooltipTimeoutRef.current);
  }, []);

  /* ── Hover tooltip with delay (desktop only) ── */
  const handleMouseEnter = useCallback(() => {
    if (isMobile) return;
    tooltipTimeoutRef.current = setTimeout(() => setShowTooltip(true), 400);
  }, [isMobile]);

  const handleMouseLeave = useCallback(() => {
    clearTimeout(tooltipTimeoutRef.current);
    setShowTooltip(false);
  }, []);

  /* ── WhatsApp click-to-chat URL ── */
  const waUrl = useCallback(() => {
    const cleanNumber = phoneNumber.replace(/[^0-9]/g, "");
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
  }, [phoneNumber, message]);

  const handleClick = useCallback(() => {
    window.open(waUrl(), "_blank", "noopener,noreferrer");
  }, [waUrl]);

  /* ── Keyboard support ── */
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleClick();
      }
    },
    [handleClick]
  );

  /* ── Return null on SSR to avoid hydration mismatch ── */
  if (!mounted) return null;

  const isDesktop = !isMobile;
  const btnSize = isMobile ? mobileSize : size;
  const pos = isMobile ? mobilePosition : position;

  return (
    <>
      {/* Tooltip */}
      {isDesktop && (
        <div
          role="tooltip"
          className="fixed z-[9999] px-4 py-2 rounded-xl text-sm font-medium shadow-lg shadow-black/10 backdrop-blur-sm transition-all duration-300 ease-out pointer-events-none"
          style={{
            bottom: pos.bottom + btnSize + 12,
            right: pos.right + btnSize / 2,
            transform: showTooltip
              ? "translateX(50%) translateY(0) scale(1)"
              : "translateX(50%) translateY(4px) scale(0.95)",
            opacity: showTooltip ? 1 : 0,
            backgroundColor: "var(--wa-tooltip-bg, #ffffff)",
            color: "var(--wa-tooltip-color, #1e1e1e)",
            border: "1px solid var(--wa-tooltip-border, rgba(0,0,0,0.06))",
          }}
        >
          {/* Arrow pointing down — centered on button */}
          <div
            className="absolute -bottom-1.5 w-3 h-3 rotate-45 left-1/2 -translate-x-1/2"
            style={{
              backgroundColor: "var(--wa-tooltip-bg, #ffffff)",
              borderRight: "1px solid var(--wa-tooltip-border, rgba(0,0,0,0.06))",
              borderBottom: "1px solid var(--wa-tooltip-border, rgba(0,0,0,0.06))",
            }}
          />
          <div className="flex items-center gap-2 whitespace-nowrap">
            <svg width="14" height="14" viewBox="0 0 48 48" fill="none" aria-hidden="true">
              <path d="M24 0C10.746 0 0 10.746 0 24c0 4.6 1.302 8.906 3.552 12.582L1.206 44.64a1.5 1.5 0 001.866 1.866l8.058-2.346A23.874 23.874 0 0024 48c13.254 0 24-10.746 24-24S37.254 0 24 0z" fill="#25D366" />
              <path d="M35.604 28.362c-1.332-.666-2.664-.666-4.002 0-.822.42-1.494.96-2.328 1.398-.576.306-1.296.27-1.842-.048-1.254-.738-2.382-1.644-3.402-2.664a15.394 15.394 0 01-2.664-3.402c-.318-.546-.354-1.266-.048-1.842.438-.834.978-1.506 1.398-2.328.666-1.338.666-2.67 0-4.002-.48-.96-1.53-1.572-2.622-1.572h-1.434c-.822 0-1.608.342-2.172.906a7.144 7.144 0 00-2.016 4.512c-.114 1.38.21 2.76.876 3.978a24.878 24.878 0 005.472 6.882 24.878 24.878 0 006.882 5.472c1.218.666 2.598.99 3.978.876a7.144 7.144 0 004.512-2.016c.564-.564.906-1.35.906-2.172v-1.434c0-1.092-.612-2.142-1.572-2.622-.006-.006-.012-.006-.018-.006z" fill="#fff" />
            </svg>
            <span>{tooltip}</span>
          </div>
        </div>
      )}

      {/* WhatsApp Button */}
      <button
        type="button"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={() => !isMobile && setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
        className="fixed z-[9999] flex items-center justify-center rounded-full shadow-xl shadow-black/20 hover:shadow-2xl hover:shadow-black/30 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#25D366]/50 transition-all duration-300 ease-out animate-fade-up"
        style={{
          bottom: pos.bottom,
          right: pos.right,
          width: btnSize,
          height: btnSize,
          backgroundColor: color,
        }}
        aria-label={`${tooltip} — ${phoneNumber}`}
        title={isDesktop ? tooltip : undefined}
      >
        {/* Ripple ring */}
        <span className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ backgroundColor: color }} />

        {/* Solid background behind icon */}
        <span className="absolute inset-0 rounded-full" style={{ backgroundColor: color }} />

        {/* WhatsApp icon */}
        <span className="relative z-10 flex items-center justify-center">
          <WhatsAppIcon size={Math.round(btnSize * 0.55)} />
        </span>

        {/* Screen-reader-only text */}
        <span className="sr-only">{tooltip}</span>
      </button>
    </>
  );
}
