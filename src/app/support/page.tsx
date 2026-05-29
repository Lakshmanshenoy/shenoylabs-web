import type { Metadata } from "next";
import { CheckIcon } from "lucide-react";

import { ChapterOpener } from "@/components/shared/chapter-opener";
import { SupportPaymentPanel } from "@/components/support/support-payment-panel";
import { SectionContainer } from "@/components/shared/section-container";
import { getAllArticles } from "@/lib/content";

export const metadata: Metadata = {
  title: "Support the Creator — Shenoy Labs",
  description: "Optional support channels for Shenoy Labs via Razorpay and UPI.",
  alternates: {
    canonical: "/support",
  },
  openGraph: {
    title: "Support — Shenoy Labs",
    description: "Optional support channels for Shenoy Labs via Razorpay and UPI.",
    type: "website",
    url: "/support",
    images: ["/api/og?title=Support+the+Work"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Support — Shenoy Labs",
    description: "Optional support channels for Shenoy Labs via Razorpay and UPI.",
    images: ["/api/og?title=Support+the+Work"],
  },
};

export default function SupportPage() {
  const allArticles = getAllArticles();
  const razorpayLink = "https://razorpay.me/@lakshmanshenoy";
  const upiId = "lakshmanshenoy@upi";

  const totalArticles = allArticles.length;
  const totalReadingMinutes = allArticles.reduce((sum, article) => {
    const match = article.readingTime.match(/\d+/);
    return sum + (match ? Number(match[0]) : 0);
  }, 0);
  const activeSeries = Math.max(
    1,
    new Set(allArticles.map((article) => article.frontmatter.primaryCategory)).size,
  );

  const contributionBreakdown = [
    { icon: "⏱", name: "Research time", description: "Weeks of preparation per article", allocation: "60%", iconClass: "bg-accent" },
    { icon: "🖥", name: "Hosting and infrastructure", description: "Vercel, domains, CDN, media", allocation: "20%", iconClass: "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300" },
    { icon: "📚", name: "Books and research access", description: "Papers, references, source material", allocation: "15%", iconClass: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300" },
    { icon: "🛠", name: "Tools and software", description: "Dev tools and subscriptions", allocation: "5%", iconClass: "bg-secondary" },
  ];

  const principles = [
    "No advertisements, ever",
    "No sponsored content or paid placements",
    "All articles permanently free to read",
    "All projects remain open source",
    "Your data is never shared or sold",
  ];

  return (
    <SectionContainer className="env-support max-w-7xl rounded-2xl py-10 lg:py-12">
      <ChapterOpener
        kicker="Reader Supported"
        title="Keep the work independent"
        deck="No ads, no sponsored narratives, and no paywalled essentials. Contributions directly fund research depth, publishing reliability, and open access."
        links={[
          { href: "/articles", label: "Read Articles" },
          { href: "/projects", label: "Explore Projects" },
          { href: "/about", label: "About the Lab" },
        ]}
        className="mb-8 border-b border-border/60 pb-8"
        headingLevel="h2"
      />

      <div className="grid border-x border-border lg:grid-cols-[380px_1fr]">
        <aside className="border-b border-border p-8 lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:overflow-y-auto lg:border-r lg:border-b-0">
          <p className="mb-3 inline-flex items-center gap-2 text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            <span className="inline-block h-0.5 w-6 bg-primary" />
            Independent and ad-free
          </p>
          <h1 className="font-heading text-5xl leading-[0.9] tracking-tight sm:text-6xl">
            Support
            <br />
            the <span className="text-primary italic">work.</span>
          </h1>
          <p className="mt-5 text-base leading-8 text-muted-foreground italic">
            ShenoyLabs runs without ads, sponsors, or institutional funding. If the articles or projects have been useful, supporting directly keeps it going and keeps it independent.
          </p>

          <div className="mt-8">
            <p className="mb-3 text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
              Where your contribution goes
            </p>
            <div className="divide-y divide-border border-y border-border">
              {contributionBreakdown.map((item) => (
                <div key={item.name} className="flex items-center gap-3 py-3">
                  <span className={`inline-flex size-8 items-center justify-center rounded-sm text-sm ${item.iconClass}`}>
                    {item.icon}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item.name}</p>
                    <p className="text-xs italic text-muted-foreground">{item.description}</p>
                  </div>
                  <span className="ml-auto font-mono text-xs text-muted-foreground">{item.allocation}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 rounded-md border border-border bg-secondary/60 p-4">
            <p className="mb-3 text-sm font-semibold text-foreground">What will never change</p>
            <div className="space-y-2">
              {principles.map((principle) => (
                <p key={principle} className="inline-flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckIcon className="mt-0.5 size-3.5 text-emerald-600" />
                  {principle}
                </p>
              ))}
            </div>
          </div>

          <div className="mt-8 border-t border-border pt-4">
            <p className="text-sm font-semibold text-foreground">Supported by readers</p>
            <p className="text-sm text-muted-foreground">100% reader-funded since day one</p>
          </div>
        </aside>

        <main className="space-y-10 p-8 lg:p-12">
          <SupportPaymentPanel razorpayLink={razorpayLink} upiId={upiId} />

          <section className="border-t border-border pt-8">
            <p className="mb-3 text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
              <span className="mr-2 inline-block h-0.5 w-6 bg-primary align-middle" />
              Impact so far
            </p>
            <div className="grid overflow-hidden rounded-md border border-border sm:grid-cols-3">
              <div className="border-b border-border bg-card p-5 sm:border-r sm:border-b-0">
                <p className="font-heading text-4xl leading-none text-primary">{totalArticles}</p>
                <p className="mt-1 text-[10px] font-semibold tracking-[0.1em] uppercase">Articles published</p>
                <p className="mt-1 text-xs italic text-muted-foreground">Long-form research and explainers</p>
              </div>
              <div className="border-b border-border bg-card p-5 sm:border-r sm:border-b-0">
                <p className="font-heading text-4xl leading-none text-primary">{totalReadingMinutes}</p>
                <p className="mt-1 text-[10px] font-semibold tracking-[0.1em] uppercase">Minutes of reading</p>
                <p className="mt-1 text-xs italic text-muted-foreground">Across all published writing</p>
              </div>
              <div className="bg-card p-5">
                <p className="font-heading text-4xl leading-none text-primary">{activeSeries}</p>
                <p className="mt-1 text-[10px] font-semibold tracking-[0.1em] uppercase">Active themes</p>
                <p className="mt-1 text-xs italic text-muted-foreground">Ongoing areas of exploration</p>
              </div>
            </div>
          </section>

        </main>
      </div>
    </SectionContainer>
  );
}
