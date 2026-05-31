/**
 * Dynamic OG image generation via next/og (ImageResponse).
 * Produces a 1200×630 PNG that social platforms render correctly (unlike SVG).
 *
 * Usage:
 *   /api/og                                          → default site OG image
 *   /api/og?title=My+Article&type=article            → article card
 *   /api/og?title=…&type=project                     → project card
 *   /api/og?title=…&type=article&category=Technology → with category label
 *   /api/og?title=…&description=One+sentence+hook    → with excerpt
 */

import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

// Supported page types — controls the label shown above the title
type PageType = "article" | "project" | "page" | "home";

const TYPE_LABELS: Record<PageType, string> = {
  article: "ARTICLE · SHENOYLABS.COM",
  project: "PROJECT · SHENOYLABS.COM",
  page: "SHENOYLABS.COM",
  home: "SHENOYLABS.COM",
};

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  // Query params the caller can pass:
  //   title       — the page or article title (required)
  //   type        — 'article' | 'project' | 'page' | 'home' (optional, default 'page')
  //   category    — e.g. 'Technology', 'Personal Notes' (optional, article only)
  //   description — short excerpt shown below title (optional, max ~120 chars)

  const title = searchParams.get("title") ?? "Think · Learn · Solve";
  const type = (searchParams.get("type") ?? "page") as PageType;
  const category = searchParams.get("category") ?? "";
  const description = searchParams.get("description") ?? "";

  // Clamp title length — very long titles need a smaller font
  const titleFontSize = title.length > 60 ? 44 : title.length > 40 ? 52 : 62;

  const label = category
    ? `${category.toUpperCase()} · SHENOYLABS.COM`
    : (TYPE_LABELS[type] ?? TYPE_LABELS["page"]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "64px 72px",
          background: "#0C0A09",
          position: "relative",
          fontFamily: "Georgia, serif",
        }}
      >
        {/* ── Amber accent bar at top ── */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "5px",
            background: "#D97706",
          }}
        />

        {/* ── Subtle grid texture (pure CSS, no image) ── */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            opacity: 0.6,
          }}
        />

        {/* ── Content layer ── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Category / type label */}
          <p
            style={{
              fontSize: "14px",
              letterSpacing: "0.12em",
              color: "#D97706",
              marginBottom: "20px",
              fontFamily: "ui-monospace, monospace",
              fontWeight: 400,
            }}
          >
            {label}
          </p>

          {/* Title — the most important element */}
          <h1
            style={{
              fontSize: `${titleFontSize}px`,
              color: "#FAFAF8",
              fontStyle: "italic",
              fontWeight: 700,
              lineHeight: 1.15,
              marginBottom: description ? "24px" : "40px",
              maxWidth: "960px",
            }}
          >
            {title}
          </h1>

          {/* Optional excerpt / description */}
          {description && (
            <p
              style={{
                fontSize: "20px",
                color: "#A8A29E",
                lineHeight: 1.5,
                marginBottom: "40px",
                maxWidth: "780px",
                fontFamily: "ui-sans-serif, system-ui, sans-serif",
                fontWeight: 400,
                fontStyle: "normal",
              }}
            >
              {description.length > 120
                ? `${description.slice(0, 120).trimEnd()}…`
                : description}
            </p>
          )}

          {/* Bottom row — author + wordmark */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <p
              style={{
                fontSize: "16px",
                color: "#78716C",
                fontFamily: "ui-sans-serif, system-ui, sans-serif",
                fontStyle: "normal",
              }}
            >
              Lakshman Shenoy
            </p>
            <p
              style={{
                fontSize: "18px",
                color: "#44403C",
                fontFamily: "ui-monospace, monospace",
                letterSpacing: "0.05em",
              }}
            >
              ShenoyLabs
            </p>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
