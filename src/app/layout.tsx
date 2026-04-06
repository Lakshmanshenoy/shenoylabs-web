import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";

import { SiteShell } from "@/components/layout/site-shell";

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
  title: "Shenoy Labs",
  description: "Premium hybrid product studio by Lakshman Shenoy.",
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
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
