export const PRIMARY_CATEGORIES = [
  "Research",
  "Automation",
  "Finance",
  "Health",
  "Technology",
  "Travel & Culture",
  "Personal Notes",
] as const;

export type PrimaryCategory = (typeof PRIMARY_CATEGORIES)[number];

export const DEPTH_LEVELS = [
  "introductory",
  "intermediate",
  "deep-dive",
] as const;

export type DepthLevel = (typeof DEPTH_LEVELS)[number];
