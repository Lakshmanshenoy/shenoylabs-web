// tina/config.ts
import { defineConfig } from "tinacms";
var branch = process.env.GITHUB_BRANCH || process.env.VERCEL_GIT_COMMIT_REF || process.env.HEAD || "main";
var config_default = defineConfig({
  branch,
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID || "",
  token: process.env.TINA_TOKEN || "",
  build: {
    outputFolder: "admin",
    publicFolder: "public"
  },
  media: {
    tina: {
      mediaRoot: "",
      publicFolder: "public"
    }
  },
  schema: {
    collections: [
      {
        label: "Articles",
        name: "article",
        path: "content/articles",
        format: "mdx",
        fields: [
          { type: "string", label: "Title", name: "title", required: true },
          { type: "string", label: "Excerpt", name: "excerpt", required: true },
          { type: "datetime", label: "Date", name: "date", required: true },
          { type: "string", label: "Category", name: "category", required: true },
          {
            type: "string",
            label: "Primary Category",
            name: "primaryCategory",
            options: [
              "Research",
              "Automation",
              "Finance",
              "Health",
              "Technology",
              "Travel & Culture",
              "Personal Notes"
            ],
            required: true
          },
          { type: "string", label: "Tags", name: "tags", list: true, required: true },
          { type: "string", label: "Author", name: "author", required: true },
          {
            type: "string",
            label: "Depth Level",
            name: "depthLevel",
            options: ["introductory", "intermediate", "deep-dive"]
          },
          { type: "string", label: "Cover Image", name: "coverImage" },
          { type: "string", label: "Cover Alt", name: "coverAlt" },
          { type: "rich-text", label: "Body", name: "body", isBody: true }
        ]
      },
      {
        label: "Projects",
        name: "project",
        path: "content/projects",
        format: "mdx",
        fields: [
          { type: "string", label: "Title", name: "title", required: true },
          { type: "string", label: "Description", name: "description", required: true },
          { type: "datetime", label: "Date", name: "date", required: true },
          {
            type: "string",
            label: "Primary Category",
            name: "primaryCategory",
            options: [
              "Research",
              "Automation",
              "Finance",
              "Health",
              "Technology",
              "Travel & Culture",
              "Personal Notes"
            ],
            required: true
          },
          { type: "string", label: "Tags", name: "tags", list: true, required: true },
          {
            type: "string",
            label: "Depth Level",
            name: "depthLevel",
            options: ["introductory", "intermediate", "deep-dive"]
          },
          {
            type: "string",
            label: "Status",
            name: "status",
            options: ["shipped", "in-progress", "planning"],
            required: true
          },
          { type: "string", label: "GitHub URL", name: "githubUrl" },
          { type: "string", label: "Live URL", name: "liveUrl" },
          { type: "string", label: "Cover Image", name: "coverImage" },
          { type: "string", label: "Cover Alt", name: "coverAlt" },
          { type: "rich-text", label: "Body", name: "body", isBody: true }
        ]
      },
      {
        label: "Pages",
        name: "page",
        path: "content/pages",
        format: "mdx",
        fields: [
          { type: "string", label: "Title", name: "title", required: true },
          {
            type: "string",
            label: "Description",
            name: "description",
            required: true
          },
          { type: "rich-text", label: "Body", name: "body", isBody: true }
        ]
      },
      {
        label: "Homepage Hero",
        name: "homepageHero",
        path: "content/homepage",
        format: "json",
        match: {
          include: "hero"
        },
        fields: [
          { type: "string", label: "Headline", name: "headline", required: true },
          {
            type: "string",
            label: "Identity Line",
            name: "identityLine",
            required: true
          },
          {
            type: "string",
            label: "Subheadline",
            name: "subheadline",
            required: true
          },
          {
            type: "object",
            label: "Primary CTA",
            name: "primaryCta",
            fields: [
              { type: "string", label: "Label", name: "label", required: true },
              { type: "string", label: "Href", name: "href", required: true }
            ]
          },
          {
            type: "object",
            label: "Secondary CTA",
            name: "secondaryCta",
            fields: [
              { type: "string", label: "Label", name: "label", required: true },
              { type: "string", label: "Href", name: "href", required: true }
            ]
          },
          { type: "string", label: "Status Line", name: "statusLine" },
          { type: "string", label: "Tagline", name: "tagline" },
          { type: "string", label: "Visual Image", name: "visualImage" },
          { type: "string", label: "Visual Alt", name: "visualAlt" },
          {
            type: "object",
            label: "What I Do",
            name: "whatIDo",
            list: true,
            fields: [
              { type: "string", label: "Icon", name: "icon", required: true },
              { type: "string", label: "Label", name: "label", required: true }
            ]
          },
          { type: "string", label: "Credential Footnote", name: "credentialFootnote" }
        ]
      },
      {
        label: "Homepage Featured Projects",
        name: "homepageFeaturedProjects",
        path: "content/homepage",
        format: "json",
        match: {
          include: "featured-projects"
        },
        fields: [
          {
            type: "object",
            label: "Projects",
            name: "projects",
            list: true,
            fields: [
              { type: "string", label: "Slug", name: "slug", required: true },
              { type: "string", label: "Title", name: "title", required: true },
              { type: "string", label: "Problem", name: "problem", required: true },
              {
                type: "string",
                label: "Why It Matters",
                name: "whyItMatters",
                required: true
              },
              { type: "string", label: "Tags", name: "tags", list: true, required: true },
              { type: "string", label: "Thumbnail", name: "thumbnail" },
              { type: "string", label: "Thumbnail Alt", name: "thumbnailAlt" },
              { type: "string", label: "Status", name: "status", required: true },
              { type: "string", label: "Status Color", name: "statusColor", required: true }
            ]
          }
        ]
      },
      {
        label: "Homepage Support Copy",
        name: "homepageSupportCopy",
        path: "content/homepage",
        format: "json",
        match: {
          include: "support-copy"
        },
        fields: [
          { type: "string", label: "Heading", name: "heading", required: true },
          { type: "string", label: "Body", name: "body", required: true },
          {
            type: "string",
            label: "Primary CTA Label",
            name: "primaryCtaLabel",
            required: true
          },
          {
            type: "string",
            label: "Primary CTA Href",
            name: "primaryCtaHref",
            required: true
          },
          {
            type: "string",
            label: "Secondary CTA Label",
            name: "secondaryCtaLabel",
            required: true
          },
          {
            type: "string",
            label: "Secondary CTA Href",
            name: "secondaryCtaHref",
            required: true
          },
          { type: "string", label: "Footnote", name: "footnote", required: true }
        ]
      }
    ]
  }
});
export {
  config_default as default
};
