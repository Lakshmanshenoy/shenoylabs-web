import type { Metadata } from "next";
import Link from "next/link";

import { ContactForm } from "@/components/contact/contact-form";
import { SectionContainer } from "@/components/shared/section-container";
import { SectionHeader } from "@/components/shared/section-header";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact — Shenoy Labs",
  description: "Reach out to Shenoy Labs for collaboration, consulting, and product discussions.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact — Shenoy Labs",
    description:
      "Reach out to Shenoy Labs for collaboration, consulting, and product discussions.",
    type: "website",
    url: "/contact",
    images: ["/og-default.svg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact — Shenoy Labs",
    description:
      "Reach out to Shenoy Labs for collaboration, consulting, and product discussions.",
    images: ["/og-default.svg"],
  },
};

export default function ContactPage() {
  const mailtoHref = `mailto:${siteConfig.contactEmail}`;

  return (
    <SectionContainer>
      <SectionHeader
        badge="Contact"
        title="Let's Build Something Useful"
        description="Share what you're building, where you're stuck, or the outcome you want. The form uses quiet verification and messages are delivered directly by email."
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <ContactForm />

        <Card className="border border-border/80 bg-card/95">
          <CardContent className="space-y-4 p-6 text-sm text-muted-foreground">
            <h3 className="font-heading text-lg font-semibold text-foreground">
              Expected Response
            </h3>
            <p>
              I usually respond within 1-2 business days. For urgent requests,
              mention deadlines in your subject line.
            </p>
            <p>
              If verification or delivery ever fails, email is the fastest fallback.
              For support contributions and optional payments, use the support page.
            </p>
            <div className="rounded-xl border border-dashed border-border/80 bg-secondary/30 p-4">
              <p className="text-sm text-foreground">
                Prefer email directly, or want a no-form fallback?
              </p>
              <p className="mt-2 break-all">{siteConfig.contactEmail}</p>
              <Link href={mailtoHref} className={buttonVariants({ variant: "outline", size: "sm" }) + " mt-3"}>
                Email directly
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </SectionContainer>
  );
}
