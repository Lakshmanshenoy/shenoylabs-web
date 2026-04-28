export const siteConfig = {
  name: process.env.NEXT_PUBLIC_SITE_NAME ?? "Shenoy Labs",
  description:
    process.env.NEXT_PUBLIC_SITE_DESCRIPTION ??
    "Research, tools, and projects built in public by Lakshman Shenoy.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://shenoylabs.com",
  ogImage: process.env.NEXT_PUBLIC_OG_IMAGE ?? "/og-default.svg",
  author: process.env.NEXT_PUBLIC_SITE_AUTHOR ?? "Lakshman Shenoy",
  contactEmail:
    process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "shenoylabs@gmail.com",
};
