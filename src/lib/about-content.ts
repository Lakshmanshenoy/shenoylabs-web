import fs from "fs";
import path from "path";

type ProfileLinkKind = "github" | "email" | "articles" | "projects" | "support";

export type AboutProfileContent = {
  person: {
    name: string;
    role: string;
    bio: string;
    availabilityLabel: string;
    location: string;
    timezone: string;
  };
  profileLinks: {
    label: string;
    href: string;
    kind: ProfileLinkKind;
  }[];
  beliefs: {
    title: string;
    description: string;
  }[];
  skills: {
    label: string;
    items: {
      name: string;
      level: number;
    }[];
  }[];
  dailyTools: string[];
  lab: {
    title: string;
    paragraphs: string[];
    quote: string;
    quoteLabel: string;
  };
  navigation: {
    label: string;
    href: string;
  }[];
  source: {
    label: string;
    href: string;
  };
  fallbacks: {
    readingTitle: string;
    readingDetail: string;
    buildingTitle: string;
    buildingDetail: string;
    thinkingTitle: string;
    thinkingDetail: string;
  };
};

export type AboutColophonRow = {
  label: string;
  value: string;
};

const ABOUT_DIR = path.join(process.cwd(), "content", "about");

export function getAboutProfileContent(): AboutProfileContent {
  const raw = fs.readFileSync(path.join(ABOUT_DIR, "profile.json"), "utf-8");
  return JSON.parse(raw) as AboutProfileContent;
}

function normalizeVersion(version: string | undefined): string {
  if (!version) return "Unknown";
  return version.replace(/^[~^]/, "");
}

export function getAboutColophonFromPackage(): AboutColophonRow[] {
  const packageRaw = fs.readFileSync(path.join(process.cwd(), "package.json"), "utf-8");
  const pkg = JSON.parse(packageRaw) as {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };

  const nextVersion = normalizeVersion(pkg.dependencies?.next);
  const tsVersion = normalizeVersion(pkg.devDependencies?.typescript);
  const tinaVersion = normalizeVersion(pkg.dependencies?.tinacms);

  return [
    { label: "Framework", value: `Next.js ${nextVersion}` },
    { label: "Language", value: tsVersion === "Unknown" ? "TypeScript" : `TypeScript ${tsVersion}` },
    { label: "CMS", value: tinaVersion === "Unknown" ? "TinaCMS + MDX" : `TinaCMS ${tinaVersion} + MDX` },
    { label: "Hosting", value: "Vercel" },
  ];
}
