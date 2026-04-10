import type { Metadata } from "next";

import { SectionContainer } from "@/components/shared/section-container";
import { SectionHeader } from "@/components/shared/section-header";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Refund Policy — Shenoy Labs",
  description: "Refund policy for optional support and paid Shenoy Labs offerings.",
  alternates: {
    canonical: "/refund-policy",
  },
  openGraph: {
    title: "Refund Policy — Shenoy Labs",
    description: "Refund policy for optional support and paid Shenoy Labs offerings.",
    type: "website",
    url: "/refund-policy",
    images: ["/og-default.svg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Refund Policy — Shenoy Labs",
    description: "Refund policy for optional support and paid Shenoy Labs offerings.",
    images: ["/og-default.svg"],
  },
};

export default function RefundPolicyPage() {
  return (
    <SectionContainer>
      <SectionHeader
        badge="Legal"
        title="Refund Policy"
        description="Clear expectations for optional support and digital services."
      />
      <p className="mt-2 text-xs text-muted-foreground">Last updated: 2026-04-10</p>

      <Card className="mt-8 border border-border/80 bg-card/95">
        <CardContent className="space-y-4 p-6 text-sm leading-7 text-muted-foreground">
          <p>
            Support contributions made through Razorpay, UPI, or equivalent
            channels are voluntary and generally non-refundable. Donations are
            considered final unless otherwise stated at the time of payment.
          </p>

          <h3 className="font-heading text-sm font-semibold">Payment Errors</h3>
          <p>
            If an accidental duplicate payment or incorrect amount is received,
            contact us via the <a href="/contact" className="underline">contact page</a> within 7 days and provide proof of payment (transaction ID or receipt).
            We will evaluate the request and, when appropriate, issue a refund
            through the original payment provider. Refunds typically take 7–14
            business days to appear on your account depending on the payment
            provider.
          </p>

          <h3 className="font-heading text-sm font-semibold">Custom Engagements</h3>
          <p>
            For paid, custom engagements (consulting, contracts, retainers),
            refund and cancellation terms are defined in the written agreement
            between parties and will override this general policy where
            applicable.
          </p>

          <h3 className="font-heading text-sm font-semibold">Disputes & Chargebacks</h3>
          <p>
            If you dispute a payment with your bank or payment provider, please
            also contact us so we can investigate. Repeated chargebacks may
            result in suspension of services and additional fees if applicable.
          </p>

          <p className="text-xs text-muted-foreground">
            This page is a general policy. Specific exceptions may be made at
            the discretion of Shenoy Labs and will be communicated in writing.
          </p>
        </CardContent>
      </Card>
    </SectionContainer>
  );
}
