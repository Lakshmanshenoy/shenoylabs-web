import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

// React requires eval() in development for callstack reconstruction.
// In production the directive is omitted so the strict CSP applies fully.
const scriptSrc = isDev
  ? "'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com"
  : "'self' 'unsafe-inline' https://www.googletagmanager.com";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: true,
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: `default-src 'self'; script-src ${scriptSrc}; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com; font-src 'self' data:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'`,
          },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), browsing-topics=(), usb=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
