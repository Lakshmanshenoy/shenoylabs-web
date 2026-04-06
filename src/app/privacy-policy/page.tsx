import type { Metadata } from "next";

import { SectionContainer } from "@/components/shared/section-container";
import { SectionHeader } from "@/components/shared/section-header";
import { Card, CardContent } from "@/components/ui/card";

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
              subject, and message solely for email delivery and response. We
              use anti-spam protections (honeypot field and IP-based rate
              limiting) to keep the form secure. Form submissions are delivered
              via Resend and are not stored in a database.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="font-heading text-base font-semibold text-foreground">
              Analytics
            </h2>
            <p>
              We use Google Analytics (configured with{" "}
              <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
                lazyOnload
              </code>
              ) to understand aggregate site usage and improve performance.
              Analytics data is anonymised; we do not track personally
              identifiable information via this service.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="font-heading text-base font-semibold text-foreground">
              Cookies
            </h2>
            <p>
              This website uses only the cookies that are strictly necessary for
              basic browser session functionality (e.g., Next.js internal
              routing). We do not set tracking cookies, advertising cookies, or
              third-party profiling cookies. Google Analytics may set its own
              first-party cookies under its standard configuration; you can
              opt-out via your browser settings or the Google Analytics Opt-out
              Add-on.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="font-heading text-base font-semibold text-foreground">
              IP Address & Device Metadata
            </h2>
            <p>
              Standard server logs and our rate-limiting logic may temporarily
              record your IP address to prevent abuse. This metadata is not
              retained long-term, is not linked to your identity, and is not
              shared with third parties beyond what is required for normal
              hosting infrastructure.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="font-heading text-base font-semibold text-foreground">
              Future Tools
            </h2>
            <p>
              All interactive tools on this site (e.g., calculators, analysers)
              process your inputs entirely client-side in your browser. No input
              data is transmitted to our servers or stored. We do not collect
              telemetry from tool usage. Future tools will follow the same
              privacy-first, local-compute model unless explicitly disclosed
              otherwise.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="font-heading text-base font-semibold text-foreground">
              Donations & Payment Links
            </h2>
            <p>
              The Support page links to Razorpay and UPI payment flows for
              optional one-time contributions. These payment transactions are
              processed entirely by Razorpay or your UPI app — we do not see,
              store, or handle your card details, bank account information, or
              UPI credentials. Please review{" "}
              <a
                href="https://razorpay.com/privacy/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-foreground"
              >
                Razorpay&apos;s Privacy Policy
              </a>{" "}
              before making a payment.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="font-heading text-base font-semibold text-foreground">
              Your Rights
            </h2>
            <p>
              For any privacy requests, data corrections, or deletion requests,
              contact us through the{" "}
              <a
                href="/contact"
                className="underline underline-offset-2 hover:text-foreground"
              >
                contact page
              </a>
              . We aim to respond within 5 business days.
            </p>
          </div>
        </CardContent>
      </Card>
    </SectionContainer>
  );
}
