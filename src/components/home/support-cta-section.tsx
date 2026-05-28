import { SectionContainer } from "@/components/shared/section-container";
import { SupportCardCta } from "@/components/shared/support-card-cta";
import type { SupportCopyContent } from "@/lib/homepage-content";

type Props = { content: SupportCopyContent };

export function SupportCtaSection({ content }: Props) {
  return (
    <SectionContainer className="below-fold bg-secondary/50">
      <SupportCardCta
        title={content.heading}
        body={content.body}
        primaryCtaLabel={content.primaryCtaLabel}
        primaryCtaHref={content.primaryCtaHref}
        secondaryCtaLabel={content.secondaryCtaLabel}
        secondaryCtaHref={content.secondaryCtaHref}
        footnote={content.footnote}
        className="scroll-reveal"
      />
    </SectionContainer>
  );
}
