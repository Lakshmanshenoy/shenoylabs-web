import { SectionContainer } from "@/components/shared/section-container";
import { SectionHeader } from "@/components/shared/section-header";
import { Card, CardContent } from "@/components/ui/card";

export default function PrivacyPolicyPage() {
  return (
    <SectionContainer>
      <SectionHeader
        badge="Legal"
        title="Privacy Policy"
        description="This is a Phase 1 shell. Full privacy disclosures will be completed in Phase 4."
      />

      <Card className="mt-8 border border-border/80 bg-card/95">
        <CardContent className="space-y-4 p-6 text-sm text-muted-foreground">
          <p>
            Shenoy Labs is being built with privacy and trust as core design
            principles.
          </p>
          <p>
            Upcoming details will include analytics, cookies, contact form
            handling, support links, and third-party integrations.
          </p>
        </CardContent>
      </Card>
    </SectionContainer>
  );
}
