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

      <Card className="mt-8 border border-border/80 bg-card/95">
        <CardContent className="space-y-4 p-6 text-sm leading-7 text-muted-foreground">
          <p>
            Support contributions made through Razorpay, UPI, or equivalent
            channels are voluntary and generally non-refundable.
          </p>
          <p>
            If a payment error occurs (duplicate payment or incorrect amount),
            please contact us within 7 days using the contact page with payment
            proof.
          </p>
          <p>
            For custom paid engagements, refund terms will be specified in the
            relevant written agreement and will override this page where
            applicable.
          </p>
        </CardContent>
      </Card>
    </SectionContainer>
  );
}
