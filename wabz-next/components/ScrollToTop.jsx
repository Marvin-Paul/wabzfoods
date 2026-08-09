"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    // Check for hash anchor and scroll to it
    if (window.location.hash) {
      const rawHash = window.location.hash.slice(1);
      const id = (() => {
        try {
          return decodeURIComponent(rawHash);
        } catch {
          return rawHash;
        }
      })();
      const timer = setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      }, 50);
      return () => clearTimeout(timer);
    }

    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return null;
}
