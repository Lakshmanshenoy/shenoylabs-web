"use client";

import React, { useEffect } from "react";

type ToastProps = {
  message: string;
  type?: "success" | "error" | "info";
  onClose?: () => void;
  duration?: number;
  action?: { href: string; label?: string } | null;
};

export default function Toast({ message, type = "info", onClose, duration = 5000, action }: ToastProps) {
  useEffect(() => {
    if (!onClose) return;
    const t = setTimeout(() => onClose(), duration);
    return () => clearTimeout(t);
  }, [onClose, duration]);

  const colors: Record<string, string> = {
    success: "#16a34a",
    error: "#dc2626",
    info: "#2563eb",
  };

  const accent = colors[type] || colors.info;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "fixed",
        right: 20,
        bottom: 20,
        background: "white",
        border: `1px solid ${accent}`,
        color: accent,
        padding: "10px 14px",
        borderRadius: 8,
        boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
        zIndex: 9999,
        minWidth: 220,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
        <div style={{ fontSize: 14, display: "flex", gap: 8, alignItems: "center" }}>
          <span>{message}</span>
          {action && (
            <a href={action.href} target="_blank" rel="noreferrer" style={{ color: accent, fontWeight: 600 }}>
              {action.label ?? "View PR"}
            </a>
          )}
        </div>
        <button aria-label="close" onClick={() => onClose?.()} style={{ background: "transparent", border: "none", color: accent, cursor: "pointer" }}>
          ×
        </button>
      </div>
    </div>
  );
}
