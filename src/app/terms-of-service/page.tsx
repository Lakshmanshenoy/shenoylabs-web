import type { Metadata } from "next";

import { SectionContainer } from "@/components/shared/section-container";
import { SectionHeader } from "@/components/shared/section-header";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Terms of Service — Shenoy Labs",
  description: "Terms governing your use of Shenoy Labs content, products, and support channels.",
  alternates: {
    canonical: "/terms-of-service",
  },
  openGraph: {
    title: "Terms of Service — Shenoy Labs",
    description:
      "Terms governing your use of Shenoy Labs content, products, and support channels.",
    type: "website",
    url: "/terms-of-service",
    images: ["/og-default.svg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Terms of Service — Shenoy Labs",
    description:
      "Terms governing your use of Shenoy Labs content, products, and support channels.",
    images: ["/og-default.svg"],
  },
};

export default function TermsOfServicePage() {
  return (
    <SectionContainer>
      <SectionHeader
        badge="Legal"
        title="Terms of Service"
        description="By using this site, you agree to the terms below."
      />
      <p className="mt-2 text-xs text-muted-foreground">Last updated: 2026-04-10</p>

      <Card className="mt-8 border border-border/80 bg-card/95">
        <CardContent className="space-y-4 p-6 text-sm leading-7 text-muted-foreground">
          <p>
            Shenoy Labs shares educational and product content on an &quot;as-is&quot;
            basis. While we aim for accuracy, no guarantees are made regarding
            completeness, reliability, or fitness for a specific purpose.
          </p>

          <h3 className="font-heading text-sm font-semibold">License & Use</h3>
          <p>
            You may reference and share publicly available content for personal
            or educational purposes provided you credit Shenoy Labs. Redistribution
            or commercial republishing of paid/private materials or source code
            without explicit permission is prohibited.
          </p>

          <h3 className="font-heading text-sm font-semibold">Acceptable Use</h3>
          <p>
            You agree not to use the site for unlawful purposes, to attempt to
            bypass security, or to submit malicious content. We reserve the
            right to block or refuse service that violates these terms.
          </p>

          <h3 className="font-heading text-sm font-semibold">Payments & Support</h3>
          <p>
            Optional support payments are voluntary and do not create an
            obligation for service delivery unless explicitly agreed in writing
            through a signed statement of work or contract. Refund terms are
            described in the Refund Policy.
          </p>

          <h3 className="font-heading text-sm font-semibold">Disclaimer & Liability</h3>
          <p>
            Content is provided for informational purposes only. To the fullest
            extent permitted by law, Shenoy Labs disclaims all warranties and
            shall not be liable for indirect, incidental, consequential, or
            exemplary damages arising from use of the site. For custom paid
            engagements, liability terms may be set out in the relevant
            contract.
          </p>

          <h3 className="font-heading text-sm font-semibold">Governing Law</h3>
          <p>
            These terms are governed by the laws applicable to the site owner&apos;s
            primary place of business. Any disputes will be handled in the
            appropriate local jurisdiction unless otherwise agreed in writing.
          </p>

          <h3 className="font-heading text-sm font-semibold">Copyright / DMCA</h3>
          <p>
            If you believe content on the site infringes your copyright, please
            contact us via the contact page with sufficient details to locate
            the material and we will respond promptly to investigate and,
            where appropriate, remove infringing content.
          </p>

          <p className="text-xs text-muted-foreground">
            These terms may be updated periodically. Continued use of the site
            indicates acceptance of the latest version.
          </p>
        </CardContent>
      </Card>
    </SectionContainer>
  );
}
