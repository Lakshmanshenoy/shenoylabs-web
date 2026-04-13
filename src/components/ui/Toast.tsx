"use client";

import React, { useEffect, useState } from "react";

type ToastProps = {
  message: string;
  type?: "success" | "error" | "info";
  onClose?: () => void;
  duration?: number;
  action?: { href: string; label?: string } | null;
};

export default function Toast({ message, type = "info", onClose, duration = 5000, action }: ToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // animate in on next frame to avoid synchronous setState in effect
    const raf = requestAnimationFrame(() => setVisible(true));
    if (!onClose) return () => cancelAnimationFrame(raf);
    const t = setTimeout(() => {
      // fade out then call onClose
      setVisible(false);
      setTimeout(() => onClose(), 220);
    }, duration);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t);
    };
  }, [onClose, duration]);

  const colors: Record<string, string> = {
    success: "#16a34a",
    error: "#dc2626",
    info: "#2563eb",
  };

  const accent = colors[type] || colors.info;

  return (
    <div style={{ position: "fixed", right: 20, bottom: 20, zIndex: 9999 }}>
      <div
        role="status"
        aria-live="polite"
        style={{
          transform: visible ? "translateY(0px)" : "translateY(10px)",
          opacity: visible ? 1 : 0,
          transition: "transform 220ms cubic-bezier(.2,.8,.2,1), opacity 180ms linear",
          background: "#fff",
          borderRadius: 10,
          boxShadow: "0 8px 24px rgba(2,6,23,0.08)",
          padding: "12px 14px",
          display: "flex",
          gap: 12,
          alignItems: "center",
          minWidth: 260,
          border: `1px solid ${accent}`,
        }}
      >
        <div style={{ width: 12, height: 12, borderRadius: 999, background: accent, flex: "0 0 auto" }} />
        <div style={{ flex: 1, color: "#0f172a", fontSize: 14 }}>
          <div>{message}</div>
          {action && (
            <a href={action.href} target="_blank" rel="noreferrer" style={{ display: "inline-block", marginTop: 6, color: accent, fontWeight: 600 }}>
              {action.label ?? "View PR"}
            </a>
          )}
        </div>
        <button
          aria-label="close"
          onClick={() => {
            setVisible(false);
            setTimeout(() => onClose?.(), 180);
          }}
          style={{ background: "transparent", border: "none", fontSize: 18, color: accent, cursor: "pointer" }}
        >
          ×
        </button>
      </div>
    </div>
  );
}
