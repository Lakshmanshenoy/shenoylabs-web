import type { Metadata } from "next";

import { SectionContainer } from "@/components/shared/section-container";
import { SectionHeader } from "@/components/shared/section-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Support — Shenoy Labs",
  description: "Optional support channels for Shenoy Labs via Razorpay and UPI.",
};

export default function SupportPage() {
  return (
    <SectionContainer>
      <SectionHeader
        badge="Support"
        title="Support The Studio"
        description="If the work helps you, optional support keeps experiments and content moving."
      />

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Card className="border border-border/80 bg-card/95">
          <CardHeader>
            <CardTitle className="font-heading text-xl">Razorpay</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Payment link integration will be added here in production.</p>
            <div className="rounded-lg border border-dashed border-border px-4 py-3 text-foreground">
              Placeholder: https://razorpay.me/shenoylabs
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/80 bg-card/95">
          <CardHeader>
            <CardTitle className="font-heading text-xl">UPI</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>UPI ID and QR code placeholder for support contributions.</p>
            <div className="rounded-lg border border-dashed border-border px-4 py-3 text-foreground">
              Placeholder: shenoylabs@upi
            </div>
          </CardContent>
        </Card>
      </div>
    </SectionContainer>
  );
}
