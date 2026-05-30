"use client";

import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { X, ZoomIn } from "lucide-react";

import { cn } from "@/lib/utils";

// ─── Image Zoom Lightbox ──────────────────────────────────────────────────────

type LightboxProps = {
  src: string;
  alt: string;
  onClose: () => void;
};

function Lightbox({ src, alt, onClose }: LightboxProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label={`Enlarged image: ${alt}`}
      className="animate-in fade-in fixed inset-0 z-[200] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
    >
      {/* Close button */}
      <button
        onClick={onClose}
        aria-label="Close image"
        className="absolute right-4 top-4 flex items-center justify-center rounded-full border border-white/20 bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
      >
        <X className="size-5" />
      </button>

      {/* Image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
        draggable={false}
      />
    </div>
  );
}

// ─── Zoomable Image ───────────────────────────────────────────────────────────

type ZoomableImageProps = React.ComponentProps<"img"> & {
  zoomable?: boolean;
};

export function ZoomableImage({
  src: srcProp = "",
  alt = "",
  className,
  zoomable = true,
  ...props
}: ZoomableImageProps) {
  const [open, setOpen] = useState(false);
  // Narrow to string for Lightbox; React 19 img src can be string | Blob
  const src = typeof srcProp === "string" ? srcProp : "";

  const handleClick = useCallback(() => {
    if (zoomable) setOpen(true);
  }, [zoomable]);

  return (
    <>
      <span className={cn("group relative inline-block w-full", zoomable && "cursor-zoom-in")}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          onClick={handleClick}
          onKeyDown={(e) => e.key === "Enter" && handleClick()}
          role={zoomable ? "button" : undefined}
          tabIndex={zoomable ? 0 : undefined}
          aria-label={zoomable ? `Click to enlarge: ${alt}` : undefined}
          className={cn(
            "h-auto w-full rounded-lg transition-opacity duration-150",
            zoomable && "group-hover:opacity-95",
            className,
          )}
          {...props}
        />
        {zoomable && (
          <span
            aria-hidden="true"
            className="absolute right-2 top-2 flex items-center justify-center rounded-full border border-white/30 bg-black/40 p-1 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100"
          >
            <ZoomIn className="size-3.5 text-white" />
          </span>
        )}
      </span>

      {open && (
        <Lightbox
          src={src}
          alt={alt}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
