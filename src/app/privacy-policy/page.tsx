import type { Metadata } from "next";

import { SectionContainer } from "@/components/shared/section-container";
import { SectionHeader } from "@/components/shared/section-header";
import { Card, CardContent } from "@/components/ui/card";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy — Shenoy Labs",
  description:
    "How Shenoy Labs handles form submissions, analytics, and communication data.",
  alternates: {
    canonical: "/privacy-policy",
  },
  openGraph: {
    title: "Privacy Policy — Shenoy Labs",
    description:
      "How Shenoy Labs handles form submissions, analytics, and communication data.",
    type: "website",
    url: "/privacy-policy",
    images: ["/og-default.svg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy — Shenoy Labs",
    description:
      "How Shenoy Labs handles form submissions, analytics, and communication data.",
    images: ["/og-default.svg"],
  },
};

export default function PrivacyPolicyPage() {
  return (
    <SectionContainer>
      <SectionHeader
        badge="Legal"
        title="Privacy Policy"
        description="How Shenoy Labs handles form submissions, basic analytics, and communication data."
      />

      <p className="mt-2 text-xs text-muted-foreground">Last updated: 2026-04-10</p>

      <Card className="mt-8 border border-border/80 bg-card/95">
        <CardContent className="space-y-6 p-6 text-sm leading-7 text-muted-foreground">
          <div className="space-y-2">
            <h2 className="font-heading text-base font-semibold text-foreground">
              Overview
            </h2>
            <p>
              Shenoy Labs collects the minimum personal information necessary to
              run this website and respond to inquiries. We do not sell your
              personal information to third parties.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="font-heading text-base font-semibold text-foreground">
              Contact Form
            </h2>
            <p>
              If you submit the contact form, we process your name, email,
              subject, and message solely to deliver an email to the site
              operator and respond to your inquiry. Submissions are forwarded
              to a third-party email delivery provider (Resend) for delivery
              and are not stored in a site database. See Resend&apos;s privacy
              information for details on their handling of delivery logs.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="font-heading text-base font-semibold text-foreground">
              Anti-abuse (Cloudflare Turnstile)
            </h2>
            <p>
              The contact form is protected by Cloudflare Turnstile. When you
              complete the form the browser obtains a short-lived Turnstile
              token which we send to Cloudflare for verification. Cloudflare
              may process device and browser signals to assess risk; we do not
              persist Turnstile tokens and only retain a short in-memory
              replay cache to prevent token reuse (approximately 5 minutes).
              For more, see the <a href="https://developers.cloudflare.com/turnstile/" target="_blank" rel="noopener noreferrer" className="underline">Turnstile documentation</a> and <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener noreferrer" className="underline">Cloudflare&apos;s privacy policy</a>.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="font-heading text-base font-semibold text-foreground">
              Analytics
            </h2>
            <p>
              This site uses Google Analytics to collect anonymised, aggregate
              usage data for performance and product improvements. We enable
              IP anonymization (anonymize_ip) and do not link analytics data
              to personal identifiers. You can read Google&apos;s privacy
              information and use the <a href="https://tools.google.com/dlpage/gaoptout/" target="_blank" rel="noopener noreferrer" className="underline">opt-out browser add-on</a> if you wish to opt out.
            </p>
            <p>
              Analytics scripts will only be loaded after you provide explicit
              consent via the cookie banner. See the cookie section below.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="font-heading text-base font-semibold text-foreground">
              Cookies
            </h2>
            <p>
              We use essential cookies required for normal site operation
              (internal routing, UI state). Google Analytics may set
              first-party analytics cookies when you consent. Analytics
              retention is governed by your Google Analytics property settings
              (commonly configurable up to 26 months).
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="font-heading text-base font-semibold text-foreground">
              IP Address & Device Metadata
            </h2>
            <p>
              Standard server logs and our rate-limiting logic may temporarily
              record your IP address to prevent abuse. Rate-limit keys are
              short-lived (the runtime limiter window is approximately 45
              seconds) and Turnstile verification tokens are ephemeral (~5
              minutes). Server logs or hosted provider logs may be retained
              longer depending on the hosting provider; we retain abuse
              prevention metadata only as long as necessary (typically up to
              30 days) unless otherwise required.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="font-heading text-base font-semibold text-foreground">
              Third-party Services
            </h2>
            <p>
              Contact submissions are delivered using Resend. Payment flows on
              the Support page are handled by Razorpay or UPI partners; we do
              not see or store card or UPI credentials. Please review the
              providers&apos; privacy pages for more details.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="font-heading text-base font-semibold text-foreground">
              Your Rights
            </h2>
            <p>
              To request access, correction, or deletion of personal data, or
              to exercise other privacy rights, contact us via the
              <a href="/contact" className="underline underline-offset-2 hover:text-foreground"> contact page</a> or by emailing {siteConfig.contactEmail}. We will ask for reasonable information to verify your identity before responding. We aim to respond within 5 business days and will provide exported copies of personal data where applicable.
            </p>
          </div>
        </CardContent>
      </Card>
    </SectionContainer>
  );
}
