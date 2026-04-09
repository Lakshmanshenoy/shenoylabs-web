import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SectionContainer } from "@/components/shared/section-container";
import { SectionHeader } from "@/components/shared/section-header";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Support the Creator — Shenoy Labs",
  description: "Optional support channels for Shenoy Labs via Razorpay and UPI.",
  alternates: {
    canonical: "/support",
  },
  openGraph: {
    title: "Support — Shenoy Labs",
    description: "Optional support channels for Shenoy Labs via Razorpay and UPI.",
    type: "website",
    url: "/support",
    images: ["/og-default.svg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Support — Shenoy Labs",
    description: "Optional support channels for Shenoy Labs via Razorpay and UPI.",
    images: ["/og-default.svg"],
  },
};

export default function SupportPage() {
  const razorpayLink = "https://razorpay.me/@lakshmanshenoy";

  return (
    <SectionContainer className="max-w-5xl">
      <SectionHeader
        badge="Support"
        title="Support the Creator"
        description="If the work helps you, optional support keeps experiments and content moving."
      />

      <div className="mt-8 grid gap-5 md:grid-cols-2 md:items-stretch">
        <Card className="mx-auto flex w-full max-w-md flex-col border border-border/80 bg-card/95 md:min-h-[420px]">
          <CardHeader>
            <CardTitle className="font-heading text-xl">Razorpay</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col text-sm text-muted-foreground">
            <div className="space-y-3">
              <p>Support via Razorpay using secure checkout.</p>
            </div>
            <div className="flex flex-1 items-center justify-center py-6">
              <Link
                href={razorpayLink}
                target="_blank"
                rel="noreferrer"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "h-[84px] w-full max-w-[340px] justify-between rounded-2xl border-0 bg-[#072654] px-5 text-white shadow-sm transition-colors hover:bg-[#0b2f68] sm:min-w-[340px]",
                )}
              >
                <span className="flex items-center gap-3">
                  <Image
                    src="/images/support/razorpay-mark.svg"
                    alt="Razorpay"
                    width={36}
                    height={36}
                    className="size-9 rounded-lg"
                  />
                  <span className="flex flex-col items-start">
                    <span className="text-xs font-medium uppercase tracking-[0.18em] text-white/70">
                      Secure checkout
                    </span>
                    <span className="text-base font-semibold text-white">
                      Pay with Razorpay
                    </span>
                  </span>
                </span>
                <span className="text-base text-white/80">↗</span>
              </Link>
            </div>
            <p className="text-center text-xs text-muted-foreground">
              Opens Razorpay-hosted secure checkout in a new tab.
            </p>
          </CardContent>
        </Card>

        <Card className="mx-auto w-full max-w-md border border-border/80 bg-card/95 md:min-h-[420px]">
          <CardHeader>
            <CardTitle className="font-heading text-xl">UPI</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Scan the QR code or use the UPI ID below for direct support contributions.</p>
            <div className="mx-auto max-w-[240px] overflow-hidden rounded-lg border border-border/80 bg-background p-3">
              <Image
                src="/images/support/upi-qr.png"
                alt="UPI QR code for lakshmanshenoy@upi"
                width={768}
                height={768}
                className="h-auto w-full rounded-md"
                sizes="(max-width: 768px) 100vw, 360px"
              />
            </div>
            <div className="rounded-lg border border-dashed border-border px-4 py-3 text-foreground">
              lakshmanshenoy@upi
            </div>
          </CardContent>
        </Card>
      </div>
    </SectionContainer>
  );
}
