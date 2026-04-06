import { SectionContainer } from "@/components/shared/section-container";
import { SectionHeader } from "@/components/shared/section-header";
import { Card, CardContent } from "@/components/ui/card";

export default function PrivacyPolicyPage() {
  return (
    <SectionContainer>
      <SectionHeader
        badge="Legal"
        title="Privacy Policy"
        description="How Shenoy Labs handles form submissions, basic analytics, and communication data."
      />

      <Card className="mt-8 border border-border/80 bg-card/95">
        <CardContent className="space-y-4 p-6 text-sm leading-7 text-muted-foreground">
          <p>
            Shenoy Labs collects the minimum personal information necessary to
            run this website and respond to inquiries.
          </p>
          <p>
            If you submit the contact form, we process your name, email,
            subject, and message for email delivery and response. We use
            anti-spam protections and basic request metadata to keep the form
            secure.
          </p>
          <p>
            We may use privacy-friendly analytics and standard server logs to
            understand site usage and improve performance. We do not sell your
            personal information.
          </p>
          <p>
            Third-party payment providers (for optional support) process
            transaction data under their own policies. Please review their
            privacy terms before making payments.
          </p>
          <p>
            For any privacy requests, data corrections, or deletion requests,
            contact us through the contact page.
          </p>
        </CardContent>
      </Card>
    </SectionContainer>
  );
}
