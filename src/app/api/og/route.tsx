/**
 * Dynamic OG image generation via next/og (ImageResponse).
 * Produces a 1200×630 PNG that social platforms render correctly (unlike SVG).
 *
 * Usage:
 *   /api/og                         → default site OG image
 *   /api/og?title=My+Article        → custom title
 *   /api/og?title=…&type=article    → article badge
 *   /api/og?title=…&type=project    → project badge
 */

import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const title =
    searchParams.get("title") ?? "Research and projects built in public.";
  const type = searchParams.get("type") ?? "site";

  const badgeLabel =
    type === "article"
      ? "Article"
      : type === "project"
        ? "Project"
        : "Shenoy Labs";

  return new ImageResponse(
    (
      <div
        style={{
          background: "#0C0A09",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "64px",
          fontFamily: "Georgia, serif",
          position: "relative",
        }}
      >
        {/* Amber accent bar at top */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: "#D97706",
          }}
        />

        {/* Site label */}
        <p
          style={{
            fontSize: 16,
            color: "#78716C",
            marginBottom: 20,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          {badgeLabel === "Shenoy Labs" ? "SHENOY LABS" : `SHENOY LABS — ${badgeLabel.toUpperCase()}`}
        </p>

        {/* Page title */}
        <h1
          style={{
            fontSize: title.length > 40 ? 42 : 54,
            color: "#FAFAF8",
            fontStyle: "italic",
            fontWeight: 700,
            lineHeight: 1.2,
            marginBottom: 24,
            maxWidth: 900,
          }}
        >
          {title}
        </h1>

        {/* Tagline */}
        <p style={{ fontSize: 18, color: "#A8A29E", fontFamily: "system-ui, sans-serif" }}>
          shenoylabs.com
        </p>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
