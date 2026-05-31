import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

// React requires eval() in development for callstack reconstruction.
// In production the directive is omitted so the strict CSP applies fully.
// During local development Tina's dev server serves assets on port 4001,
// so allow that origin in the CSP while `isDev` is true.
const tinaDevOrigin = isDev ? ` http://localhost:${process.env.TINA_DATALAYER_PORT ?? 4001}` : "";

const kofiScriptOrigin = "https://storage.ko-fi.com";
const kofiConnectOrigins = "https://storage.ko-fi.com https://ko-fi.com";
const kofiFrameOrigins = "https://ko-fi.com";

const scriptSrc = isDev
  ? `'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://challenges.cloudflare.com https://giscus.app ${kofiScriptOrigin}${tinaDevOrigin}`
  : `'self' 'unsafe-inline' https://www.googletagmanager.com https://challenges.cloudflare.com https://giscus.app ${kofiScriptOrigin}`;

const connectSrc = isDev
  ? `'self' https://www.google-analytics.com https://region1.google-analytics.com https://challenges.cloudflare.com https://giscus.app https://api.github.com ${kofiConnectOrigins}${tinaDevOrigin}`
  : `'self' https://www.google-analytics.com https://region1.google-analytics.com https://challenges.cloudflare.com https://giscus.app https://api.github.com ${kofiConnectOrigins}`;

const frameSrc = `'self' https://challenges.cloudflare.com https://giscus.app ${kofiFrameOrigins}`;

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: true,
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  async headers() {
    const headersList = [
      {
        key: "Content-Security-Policy",
        value: `default-src 'self'; script-src ${scriptSrc}; style-src 'self' 'unsafe-inline' https://storage.ko-fi.com; img-src 'self' data: https:; connect-src ${connectSrc}; frame-src ${frameSrc}; font-src 'self' data: https://storage.ko-fi.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'`,
      },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      {
        key: "Permissions-Policy",
        value:
          "camera=(), microphone=(), geolocation=(), browsing-topics=(), usb=()",
      },
    ];

    // Add HSTS in non-development environments
    if (!isDev) {
      headersList.push({
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
      });
    }

    return [
      {
        source: "/(.*)",
        headers: headersList,
      },
    ];
  },
};

export default nextConfig;
