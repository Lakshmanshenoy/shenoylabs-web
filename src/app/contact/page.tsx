import type { Metadata } from "next";
import Link from "next/link";
import { Clock3Icon, FileTextIcon, GitPullRequestArrowIcon, MailIcon, MicIcon } from "lucide-react";

import { ContactForm } from "@/components/contact/contact-form";
import { SectionContainer } from "@/components/shared/section-container";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact — Shenoy Labs",
  description: "Reach out to Shenoy Labs for collaboration, consulting, and product discussions.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact — Shenoy Labs",
    description: "Reach out to Shenoy Labs for collaboration, consulting, and product discussions.",
    type: "website",
    url: "/contact",
    images: ["/api/og?title=Contact"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact — Shenoy Labs",
    description:
      "Reach out to Shenoy Labs for collaboration, consulting, and product discussions.",
    images: ["/api/og?title=Contact"],
  },
};

export default function ContactPage() {
  const mailtoHref = `mailto:${siteConfig.contactEmail}`;
  const contactTopics = [
    {
      name: "Research collaboration",
      description: "Joint deep dives",
      dotClassName: "bg-blue-500",
    },
    {
      name: "Open source contributions",
      description: "PRs, issues, ideas",
      dotClassName: "bg-emerald-500",
    },
    {
      name: "Article feedback",
      description: "Corrections welcome",
      dotClassName: "bg-primary",
    },
    {
      name: "Speaking and writing",
      description: "Talks, guest posts",
      dotClassName: "bg-violet-500",
    },
    {
      name: "General curiosity",
      description: "No agenda needed",
      dotClassName: "bg-amber-500",
    },
  ];

  return (
    <SectionContainer className="max-w-7xl py-10 lg:py-12">
      <div className="grid border-x border-border lg:grid-cols-[380px_1fr]">
        <aside className="border-b border-border p-8 lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:overflow-y-auto lg:border-r lg:border-b-0">
          <p className="mb-3 inline-flex items-center gap-2 text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            <span className="inline-block h-0.5 w-6 bg-primary" />
            Get In Touch
          </p>
          <h1 className="font-heading text-5xl leading-[0.9] tracking-tight sm:text-6xl">
            Let&apos;s
            <br />
            <span className="text-primary italic">talk.</span>
          </h1>
          <p className="mt-5 text-base leading-8 text-muted-foreground italic">
            Everything gets read. Whether it is a question about an article, a bug report, a collaboration idea,
            or just a hello, I will get back to you.
          </p>

          <div className="mt-8">
            <p className="mb-3 text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
              I&apos;m Open To
            </p>
            <div className="divide-y divide-border border-y border-border">
              {contactTopics.map((topic) => (
                <div key={topic.name} className="flex items-center gap-3 py-3">
                  <span className={`inline-block size-2 rounded-full ${topic.dotClassName}`} />
                  <span className="text-sm font-semibold text-foreground">{topic.name}</span>
                  <span className="ml-auto text-xs italic text-muted-foreground">{topic.description}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 rounded-md border border-border bg-secondary/60 p-4">
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
              <Clock3Icon className="size-4 text-emerald-600" />
              Response time
            </p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground italic">
              Usually 48 to 72 hours. For collaboration proposals, allow up to a week.
            </p>
          </div>

          <div className="mt-8 border-t border-border pt-4">
            <p className="mb-3 text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
              Or Reach Me Directly
            </p>
            <div className="divide-y divide-border border-y border-border">
              <a
                href={mailtoHref}
                className="group flex items-center gap-3 py-2.5 text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                <MailIcon className="size-3.5" />
                {siteConfig.contactEmail}
                <span className="ml-auto text-xs opacity-0 transition-opacity group-hover:opacity-100">↗</span>
              </a>
              <a
                href="https://github.com/Lakshmanshenoy/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 py-2.5 text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                <GitPullRequestArrowIcon className="size-3.5" />
                Open a GitHub issue
                <span className="ml-auto text-xs opacity-0 transition-opacity group-hover:opacity-100">↗</span>
              </a>
            </div>
          </div>
        </aside>

        <main className="p-8 lg:p-12">
          <ContactForm />

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <Link
              href="/articles"
              className="inline-flex items-center justify-center gap-2 rounded-sm border border-border px-4 py-2 text-xs font-semibold tracking-[0.08em] text-muted-foreground uppercase transition-colors hover:text-primary"
            >
              <FileTextIcon className="size-3.5" />
              Read Articles →
            </Link>
            <Link
              href="/projects"
              className="inline-flex items-center justify-center gap-2 rounded-sm border border-border px-4 py-2 text-xs font-semibold tracking-[0.08em] text-muted-foreground uppercase transition-colors hover:text-primary"
            >
              <GitPullRequestArrowIcon className="size-3.5" />
              Browse Projects →
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center justify-center gap-2 rounded-sm border border-border px-4 py-2 text-xs font-semibold tracking-[0.08em] text-muted-foreground uppercase transition-colors hover:text-primary"
            >
              <MicIcon className="size-3.5" />
              About →
            </Link>
          </div>
        </main>
      </div>
    </SectionContainer>
  );
}
