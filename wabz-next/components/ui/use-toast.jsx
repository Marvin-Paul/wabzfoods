"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext(null);

// Module-level reference so the exported `toast()` can work outside React components
let toastFn = null;

export function toast({ title, description }) {
  if (toastFn) {
    toastFn({ title, description });
  }
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  toastFn = useCallback(({ title, description }) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, title, description }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ toast: toastFn }}>
      {children}
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-auto z-50 space-y-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="bg-carbon text-parchment px-4 py-3 rounded-lg shadow-lg text-sm w-full md:max-w-sm"
          >
            {t.title && <p className="font-medium">{t.title}</p>}
            {t.description && <p className="text-parchment/80 text-xs mt-1">{t.description}</p>}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
