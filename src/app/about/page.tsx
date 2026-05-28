import type { Metadata } from "next";
import Link from "next/link";
import {
  BookOpenIcon,
  Clock3Icon,
  Code2Icon,
  FileTextIcon,
  GlobeIcon,
  HeartIcon,
  MailIcon,
  MapPinIcon,
  PencilIcon,
} from "lucide-react";

import { SectionContainer } from "@/components/shared/section-container";
import { GitHubBrandIcon } from "@/components/shared/social-brand-icons";
import { Badge } from "@/components/ui/badge";
import {
  getAboutColophonFromPackage,
  getAboutProfileContent,
} from "@/lib/about-content";
import { getAllArticles, getAllProjects } from "@/lib/content";
import { getGitHubProjectsData } from "@/lib/github-projects";
import { cn } from "@/lib/utils";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "About — Shenoy Labs",
  description:
    "Lakshman Shenoy is a builder and founder behind Shenoy Labs — a hybrid product studio focused on useful software, research, and systems.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About — Shenoy Labs",
    description:
      "Lakshman Shenoy is a builder and founder behind Shenoy Labs — a hybrid product studio focused on useful software, research, and systems.",
    type: "profile",
    url: "/about",
    images: ["/api/og?title=About+Lakshman+Shenoy&type=site"],
  },
  twitter: {
    card: "summary_large_image",
    title: "About — Shenoy Labs",
    description:
      "Lakshman Shenoy is a builder and founder behind Shenoy Labs — a hybrid product studio focused on useful software, research, and systems.",
    images: ["/api/og?title=About+Lakshman+Shenoy&type=site"],
  },
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Lakshman Shenoy",
  url: "https://shenoylabs.com",
  jobTitle: "Founder",
  worksFor: {
    "@type": "Organization",
    name: "Shenoy Labs",
    url: "https://shenoylabs.com",
  },
  sameAs: [
    "https://github.com/lakshmanshenoy",
    "https://twitter.com/lakshmanshenoy",
  ],
};

const ABOUT_FALLBACK_UPDATED_TIMESTAMP = Date.parse("2026-01-01T00:00:00.000Z");

type CurrentlyItem = {
  label: string;
  title: string;
  detail: string;
  dotClassName: string;
};

function levelClass(level: number) {
  if (level === 3) return "bg-primary";
  if (level === 2) return "bg-muted-foreground";
  return "bg-border";
}

function formatMonthYear(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

function isExternalHref(href: string): boolean {
  return href.startsWith("http://") || href.startsWith("https://") || href.startsWith("mailto:");
}

function profileLinkIcon(kind: "github" | "email" | "articles" | "projects" | "support") {
  switch (kind) {
    case "github":
      return <GitHubBrandIcon className="size-3.5" />;
    case "email":
      return <MailIcon className="size-3.5" />;
    case "articles":
      return <FileTextIcon className="size-3.5" />;
    case "projects":
      return <Code2Icon className="size-3.5" />;
    default:
      return <HeartIcon className="size-3.5" />;
  }
}

function computeTopTag(tags: string[]): string | null {
  if (tags.length === 0) return null;
  const counts = new Map<string, number>();
  for (const tag of tags) {
    const normalized = tag.trim();
    if (!normalized) continue;
    counts.set(normalized, (counts.get(normalized) ?? 0) + 1);
  }
  let top: string | null = null;
  let max = 0;
  for (const [tag, count] of counts) {
    if (count > max) {
      top = tag;
      max = count;
    }
  }
  return top;
}

function projectStatusLabel(status: "shipped" | "in-progress" | "planning"): string {
  if (status === "shipped") return "Shipped";
  if (status === "in-progress") return "In progress";
  return "Planning";
}

function SectionLabel({ label }: { label: string }) {
  return (
    <p className="mb-3 inline-flex items-center gap-2 text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
      <span className="inline-block h-0.5 w-6 bg-primary" />
      {label}
    </p>
  );
}

export default async function AboutPage() {
  const profile = getAboutProfileContent();
  const colophon = getAboutColophonFromPackage();
  const articles = getAllArticles();
  const projects = getAllProjects();

  let githubStats: Awaited<ReturnType<typeof getGitHubProjectsData>>["stats"] | null = null;
  try {
    const githubData = await getGitHubProjectsData();
    githubStats = githubData.stats;
  } catch {
    githubStats = null;
  }

  const latestArticle = articles[0];
  const latestProject = projects[0];

  const topTag = computeTopTag([
    ...articles.slice(0, 8).flatMap((article) => article.frontmatter.tags ?? []),
    ...projects.slice(0, 8).flatMap((project) => project.frontmatter.tags ?? []),
  ]);

  const currentlyItems: CurrentlyItem[] = [
    latestArticle
      ? {
          label: "Reading",
          title: latestArticle.frontmatter.title,
          detail: `Latest article published ${formatMonthYear(latestArticle.frontmatter.date)}.`,
          dotClassName: "bg-blue-500",
        }
      : {
          label: "Reading",
          title: profile.fallbacks.readingTitle,
          detail: profile.fallbacks.readingDetail,
          dotClassName: "bg-blue-500",
        },
    latestProject
      ? {
          label: "Building",
          title: latestProject.frontmatter.title,
          detail: `${projectStatusLabel(latestProject.frontmatter.status)} project updated ${formatMonthYear(latestProject.frontmatter.date)}.${githubStats ? ` ${githubStats.repoCount} repos and ${githubStats.stars} stars tracked live.` : ""}`,
          dotClassName: "bg-emerald-500",
        }
      : {
          label: "Building",
          title: profile.fallbacks.buildingTitle,
          detail: profile.fallbacks.buildingDetail,
          dotClassName: "bg-emerald-500",
        },
    topTag
      ? {
          label: "Thinking About",
          title: topTag,
          detail: "Most recurring topic across recent writing and project work.",
          dotClassName: "bg-amber-500",
        }
      : {
          label: "Thinking About",
          title: profile.fallbacks.thinkingTitle,
          detail: profile.fallbacks.thinkingDetail,
          dotClassName: "bg-amber-500",
        },
  ];

  const newestDate = [
    latestArticle?.frontmatter.date,
    latestProject?.frontmatter.date,
    githubStats?.lastActive ?? undefined,
  ]
    .filter(Boolean)
    .map((value) => new Date(value as string).getTime())
    .sort((a, b) => b - a)[0];

  const updatedLabel = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(new Date(newestDate ?? ABOUT_FALLBACK_UPDATED_TIMESTAMP));

  return (
    <SectionContainer className="max-w-7xl py-10 lg:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(personJsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <div className="grid border-x border-border lg:grid-cols-[300px_1fr]">
        <aside className="border-b border-border p-8 lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:overflow-y-auto lg:border-r lg:border-b-0">
          <div className="mb-7">
            <div className="relative inline-flex size-20 items-center justify-center rounded-md bg-foreground text-3xl font-black tracking-[-0.08em] text-background">
              LS
              <span className="absolute right-1.5 bottom-1.5 size-3 rounded-full border-2 border-background bg-emerald-500" />
            </div>
            <p className="mt-3 inline-flex items-center gap-2 text-[10px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
              <span className="inline-block size-1.5 rounded-full bg-emerald-500" />
              {profile.person.availabilityLabel}
            </p>
          </div>

          <h1 className="font-heading text-2xl font-bold tracking-tight">{profile.person.name}</h1>
          <p className="mt-1 text-xs text-muted-foreground">{profile.person.role}</p>
          <p className="mt-5 text-sm leading-7 text-muted-foreground italic">
            {profile.person.bio}
          </p>

          <div className="mt-7 space-y-0 border-y border-border">
            {profile.profileLinks.map((profileLink, index) => {
              const className = cn(
                "group flex items-center gap-3 px-0 py-2.5 text-sm text-muted-foreground transition-colors hover:text-primary",
                index < profile.profileLinks.length - 1 && "border-b border-border",
              );
              const tail = isExternalHref(profileLink.href) ? "↗" : "→";

              if (isExternalHref(profileLink.href)) {
                return (
                  <a
                    key={profileLink.label}
                    href={profileLink.href}
                    target={profileLink.href.startsWith("http") ? "_blank" : undefined}
                    rel={profileLink.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className={className}
                  >
                    {profileLinkIcon(profileLink.kind)}
                    {profileLink.label}
                    <span className="ml-auto text-xs opacity-0 transition-opacity group-hover:opacity-100">{tail}</span>
                  </a>
                );
              }

              return (
                <Link key={profileLink.label} href={profileLink.href} className={className}>
                  {profileLinkIcon(profileLink.kind)}
                  {profileLink.label}
                  <span className="ml-auto text-xs opacity-0 transition-opacity group-hover:opacity-100">{tail}</span>
                </Link>
              );
            })}
          </div>

          <div className="mt-7 space-y-2 border-t border-border pt-4 text-xs text-muted-foreground">
            <p className="inline-flex items-center gap-2">
              <MapPinIcon className="size-3" />
              {profile.person.location}
            </p>
            <p className="inline-flex items-center gap-2">
              <Clock3Icon className="size-3" />
              {profile.person.timezone}
            </p>
            <p className="inline-flex items-center gap-2">
              <PencilIcon className="size-3" />
              Updated {updatedLabel}
            </p>
          </div>
        </aside>

        <main className="p-8 lg:p-12">
          <section className="mb-12 border-b border-border pb-12">
            <SectionLabel label="Now" />
            <h2 className="font-heading text-4xl font-bold tracking-tight">Currently</h2>
            <div className="mt-6 grid overflow-hidden rounded-md border border-border sm:grid-cols-3">
              {currentlyItems.map((item, index) => (
                <div
                  key={item.label}
                  className={cn("bg-card p-5", index > 0 && "border-t border-border sm:border-t-0 sm:border-l")}
                >
                  <p className="mb-2 inline-flex items-center gap-2 text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                    <span className={cn("inline-block size-1.5 rounded-full", item.dotClassName)} />
                    {item.label}
                  </p>
                  <p className="font-heading text-lg font-semibold leading-tight">{item.title}</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground italic">{item.detail}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-12 border-b border-border pb-12">
            <SectionLabel label="Principles" />
            <h2 className="font-heading text-4xl font-bold tracking-tight">What I Believe</h2>
            <div className="mt-5 divide-y divide-border border-y border-border">
              {profile.beliefs.map((belief, index) => (
                <article key={belief.title} className="grid gap-4 py-6 sm:grid-cols-[44px_1fr]">
                  <p className="font-heading text-3xl font-black text-muted">{String(index + 1).padStart(2, "0")}</p>
                  <div>
                    <h3 className="font-heading text-xl font-semibold leading-tight">{belief.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">{belief.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="mb-12 border-b border-border pb-12">
            <SectionLabel label="Craft" />
            <h2 className="font-heading text-4xl font-bold tracking-tight">Skills & Tools</h2>

            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              {profile.skills.map((group) => (
                <div key={group.label}>
                  <p className="mb-3 border-b border-border pb-2 text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                    {group.label}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {group.items.map((item) => (
                      <Badge
                        key={item.name}
                        variant="outline"
                        className="gap-1.5 rounded-sm px-2 py-1 font-mono text-[11px] font-normal"
                      >
                        <span className={cn("inline-block size-1.5 rounded-full", levelClass(item.level))} />
                        {item.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <p className="mb-3 border-b border-border pb-2 text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                Daily Tools
              </p>
              <div className="flex flex-wrap gap-2">
                {profile.dailyTools.map((tool) => (
                  <span
                    key={tool}
                    className="inline-flex items-center rounded-full border border-border px-3 py-1 text-xs text-muted-foreground"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          </section>

          <section className="mb-12 border-b border-border pb-12">
            <SectionLabel label="The Lab" />
            <h2 className="font-heading text-4xl font-bold tracking-tight">{profile.lab.title}</h2>
            <div className="mt-5 space-y-4 text-base leading-8 text-muted-foreground">
              {profile.lab.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>

            <blockquote className="mt-7 rounded-r-md border-l-4 border-primary bg-muted/40 px-5 py-4">
              <p className="font-heading text-xl italic leading-relaxed text-foreground">
                &ldquo;{profile.lab.quote}&rdquo;
              </p>
              <p className="mt-2 text-[10px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                {profile.lab.quoteLabel}
              </p>
            </blockquote>
          </section>

          <section>
            <SectionLabel label="Colophon" />
            <div className="grid gap-8 sm:grid-cols-2">
              <div>
                <p className="mb-3 border-b border-border pb-2 text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                  This Site Is Built With
                </p>
                <div className="space-y-2">
                  {colophon.map((item) => (
                    <p key={item.label} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{item.label}</span>
                      <span className="font-mono text-xs text-foreground">{item.value}</span>
                    </p>
                  ))}
                  <p className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{profile.source.label}</span>
                    <a
                      href={profile.source.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-xs text-primary hover:underline"
                    >
                      GitHub ↗
                    </a>
                  </p>
                </div>
              </div>

              <div>
                <p className="mb-3 border-b border-border pb-2 text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                  Navigation
                </p>
                <div className="flex flex-wrap gap-2">
                  {profile.navigation.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="inline-flex rounded-sm border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-primary"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>

                <p className="mt-4 inline-flex items-center gap-2 text-xs text-muted-foreground">
                  <BookOpenIcon className="size-3.5" />
                  Built for deep reading and open building.
                </p>
                <p className="mt-2 inline-flex items-center gap-2 text-xs text-muted-foreground">
                  <GlobeIcon className="size-3.5" />
                  India · Global audience
                </p>
              </div>
            </div>
          </section>
        </main>
      </div>
    </SectionContainer>
  );
}
