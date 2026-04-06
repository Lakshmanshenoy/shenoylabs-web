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

      <Card className="mt-8 border border-border/80 bg-card/95">
        <CardContent className="space-y-4 p-6 text-sm leading-7 text-muted-foreground">
          <p>
            Shenoy Labs shares educational and product content on an &quot;as-is&quot;
            basis. While we aim for accuracy, no guarantees are made regarding
            completeness, reliability, or fitness for a specific purpose.
          </p>
          <p>
            You may reference and share publicly available content with credit.
            Redistribution of paid/private materials or source code without
            permission is prohibited.
          </p>
          <p>
            Optional support payments are voluntary and do not create an
            obligation for service delivery unless explicitly agreed in writing.
          </p>
          <p>
            These terms may be updated periodically. Continued use of the site
            indicates acceptance of the latest version.
          </p>
        </CardContent>
      </Card>
    </SectionContainer>
  );
}
