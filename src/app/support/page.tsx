import type { Metadata } from "next";
import Image from "next/image";
import Script from "next/script";

import { SectionContainer } from "@/components/shared/section-container";
import { SectionHeader } from "@/components/shared/section-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
  const razorpayButtonId = process.env.NEXT_PUBLIC_RAZORPAY_PAYMENT_BUTTON_ID;

  return (
    <SectionContainer>
      <SectionHeader
        badge="Support"
        title="Support the Creator"
        description="If the work helps you, optional support keeps experiments and content moving."
      />

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Card className="border border-border/80 bg-card/95">
          <CardHeader>
            <CardTitle className="font-heading text-xl">Razorpay</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Support via Razorpay using secure checkout.</p>
            {razorpayButtonId ? (
              <div className="rounded-lg border border-border/80 bg-secondary/20 px-4 py-4">
                <form>
                  <Script
                    src="https://checkout.razorpay.com/v1/payment-button.js"
                    data-payment_button_id={razorpayButtonId}
                    async
                  />
                </form>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-border px-4 py-3 text-foreground">
                Set NEXT_PUBLIC_RAZORPAY_PAYMENT_BUTTON_ID to render the Razorpay checkout button.
              </div>
            )}
            <a
              href="https://razorpay.me/@lakshmanshenoy"
              target="_blank"
              rel="noreferrer"
              className="inline-flex text-sm font-medium text-primary hover:underline"
            >
              Open direct Razorpay payment link
            </a>
          </CardContent>
        </Card>

        <Card className="border border-border/80 bg-card/95">
          <CardHeader>
            <CardTitle className="font-heading text-xl">UPI</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Scan the QR code or use the UPI ID below for direct support contributions.</p>
            <div className="overflow-hidden rounded-lg border border-border/80 bg-background p-3">
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
