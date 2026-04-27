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
    searchParams.get("title") ?? "Research, tools, and projects built in public.";
  const type = searchParams.get("type") ?? "site";

  const badgeLabel =
    type === "article"
      ? "Article"
      : type === "project"
        ? "Project"
        : type === "tool"
          ? "Tool"
          : "Shenoy Labs";

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          background: "linear-gradient(135deg, #0f172a 0%, #111c2f 60%, #172141 100%)",
          padding: "64px",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
        }}
      >
        {/* Ambient glow top-left */}
        <div
          style={{
            position: "absolute",
            top: "-80px",
            left: "-80px",
            width: "480px",
            height: "480px",
            borderRadius: "50%",
            background: "rgba(59, 130, 246, 0.12)",
            filter: "blur(80px)",
          }}
        />
        {/* Ambient glow bottom-right */}
        <div
          style={{
            position: "absolute",
            bottom: "-60px",
            right: "-60px",
            width: "360px",
            height: "360px",
            borderRadius: "50%",
            background: "rgba(125, 211, 252, 0.08)",
            filter: "blur(60px)",
          }}
        />

        {/* Brand mark */}
        <div
          style={{
            position: "absolute",
            top: "60px",
            left: "64px",
            display: "flex",
            alignItems: "center",
            gap: "14px",
          }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              background: "#3b82f6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: "16px",
              fontWeight: "700",
            }}
          >
            SL
          </div>
          <span
            style={{
              color: "#f8fafc",
              fontSize: "20px",
              fontWeight: "600",
              letterSpacing: "-0.02em",
            }}
          >
            Shenoy Labs
          </span>
        </div>

        {/* Badge */}
        <div
          style={{
            display: "flex",
            marginBottom: "20px",
          }}
        >
          <span
            style={{
              background: "rgba(59, 130, 246, 0.15)",
              border: "1px solid rgba(59, 130, 246, 0.35)",
              borderRadius: "6px",
              color: "#7dd3fc",
              fontSize: "13px",
              fontWeight: "600",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              padding: "4px 12px",
            }}
          >
            {badgeLabel}
          </span>
        </div>

        {/* Title */}
        <div
          style={{
            color: "#f8fafc",
            fontSize: title.length > 60 ? "40px" : "52px",
            fontWeight: "700",
            lineHeight: "1.15",
            letterSpacing: "-0.03em",
            maxWidth: "900px",
          }}
        >
          {title}
        </div>

        {/* Bottom rule */}
        <div
          style={{
            marginTop: "32px",
            height: "1px",
            background: "rgba(248, 250, 252, 0.1)",
            width: "100%",
          }}
        />
        <div
          style={{
            marginTop: "20px",
            color: "rgba(148, 163, 184, 0.8)",
            fontSize: "15px",
          }}
        >
          shenoylabs.com
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
