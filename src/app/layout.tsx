import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import Script from "next/script";

import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import CookieBanner from "@/components/consent/cookie-banner";
import { SiteShell } from "@/components/layout/site-shell";
import { siteConfig } from "@/lib/site";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  icons: {
    icon: [{ url: "/brand/Favicon_32_light.png", type: "image/png" }],
    shortcut: [{ url: "/brand/Favicon_32_light.png", type: "image/png" }],
    apple: [{ url: "/brand/Favicon_32_light.png", type: "image/png" }],
  },
  title: {
    default: siteConfig.name,
    template: `%s`,
  },
  description: siteConfig.description,
  alternates: {
    canonical: "/",
    types: {
      "application/rss+xml": `${siteConfig.url}/feed.xml`,
    },
  },
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    type: "website",
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} social preview`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: ["/api/og"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`h-full antialiased ${inter.variable} ${plusJakartaSans.variable}`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {`
            try {
              var lightFavicon = "/brand/Favicon_32_light.png";
              var darkFavicon = "/brand/Favicon_32_dark.png";

              function setFavicon(theme) {
                var href = theme === "dark" ? darkFavicon : lightFavicon;
                var rels = ["icon", "shortcut icon", "apple-touch-icon"];

                rels.forEach(function (rel) {
                  var selector = 'link[rel="' + rel + '"]';
                  var link = document.head.querySelector(selector);
                  if (!link) {
                    link = document.createElement("link");
                    link.setAttribute("rel", rel);
                    document.head.appendChild(link);
                  }
                  link.setAttribute("href", href);
                  if (rel !== "apple-touch-icon") {
                    link.setAttribute("type", "image/png");
                  }
                });
              }

              var stored = window.localStorage.getItem("theme");
              var theme = stored === "dark" || stored === "light"
                ? stored
                : (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
              document.documentElement.classList.toggle("dark", theme === "dark");
              document.documentElement.style.colorScheme = theme;

              setFavicon(theme);

              var observer = new MutationObserver(function () {
                var isDark = document.documentElement.classList.contains("dark");
                setFavicon(isDark ? "dark" : "light");
              });
              observer.observe(document.documentElement, {
                attributes: true,
                attributeFilter: ["class"],
              });
            } catch {}
          `}
        </Script>
        <link
          rel="alternate"
          type="application/rss+xml"
          title={`${siteConfig.name} — Articles feed`}
          href="/feed.xml"
        />
      </head>
      {/* suppressHydrationWarning prevents false positives from browser extensions
           that mutate body attributes (e.g. Grammarly) after server render. */}
      <body className="min-h-full" suppressHydrationWarning>
        <CookieBanner />
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
