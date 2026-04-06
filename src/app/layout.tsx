import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";

import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { SiteShell } from "@/components/layout/site-shell";
import { siteConfig } from "@/lib/site";

import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-heading",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s`,
  },
  description: siteConfig.description,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    type: "website",
    images: [
      {
        url: siteConfig.ogImage,
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
    images: [siteConfig.ogImage],
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${manrope.variable} h-full antialiased`}>
      {/* suppressHydrationWarning prevents false positives from browser extensions
           that mutate body attributes (e.g. Grammarly) after server render. */}
      <body className="min-h-full" suppressHydrationWarning>
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
