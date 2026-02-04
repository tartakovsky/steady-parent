export type BlogCategory =
  | "Tantrums"
  | "Boundaries"
  | "Repair"
  | "Tools"
  | "Research";

export interface BlogPostMeta {
  slug: string;
  title: string;
  description: string;
  date: string; // ISO yyyy-mm-dd
  category: BlogCategory;
  coverImage?: string;
}

export interface BlogPostEntry {
  meta: BlogPostMeta;
  load: () => Promise<{ default: React.ComponentType }>;
}

export const blogPosts: BlogPostEntry[] = [
  {
    meta: {
      slug: "welcome",
      title: "Welcome to the Steady Parent blog",
      description:
        "What we’ll cover here, how posts are structured, and how to use the tactics in real life.",
      date: "2026-01-29",
      category: "Tools",
    },
    load: async () => import("./posts/welcome.mdx"),
  },
];

export const blogCategories: BlogCategory[] = [
  "Tantrums",
  "Boundaries",
  "Repair",
  "Tools",
  "Research",
];
