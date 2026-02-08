export type BlogCategory =
  | "Tantrums"
  | "Aggression"
  | "Sleep"
  | "Siblings"
  | "Anxiety"
  | "Discipline"
  | "Staying Calm"
  | "Breaking The Cycle"
  | "Big Feelings"
  | "Potty Training"
  | "Eating"
  | "Screens"
  | "Social Skills"
  | "Body Safety"
  | "New Parent"
  | "Teens"
  | "Transitions"
  | "Spirited Kids"
  | "Parenting Approach"
  | "Parenting Science"
  | "Tools";

export interface BlogPostMeta {
  slug: string;
  categorySlug: string;
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

export function postHref(meta: BlogPostMeta): string {
  return `/blog/${meta.categorySlug}/${meta.slug}`;
}

export const blogPosts: BlogPostEntry[] = [
  {
    meta: {
      slug: "bedtime-routines-by-age",
      categorySlug: "sleep",
      title: "Bedtime routines that actually work (by age)",
      description:
        "A bedtime routine works when it matches your kid's actual sleep pressure, not some Pinterest checklist. The magic formula: enough daytime activity, a wind-down that starts earlier than you think, and a predictable sequence that makes your child's nervous system feel safe enough to let go.",
      date: "2026-02-07",
      category: "Sleep",
    },
    load: async () => import("./posts/bedtime-routines-by-age.mdx"),
  },
  {
    meta: {
      slug: "handle-tantrum-scripts",
      categorySlug: "tantrums",
      title:
        "How to handle a tantrum that's already happening (step-by-step scripts)",
      description:
        "When your kid is mid-meltdown, logic is offline and your two jobs are simple: stay calm and keep them safe. Validate the feeling, hold your boundary without a lecture, then wait it out. Save the teaching for after.",
      date: "2026-02-07",
      category: "Tantrums",
    },
    load: async () => import("./posts/handle-tantrum-scripts.mdx"),
  },
  {
    meta: {
      slug: "childhood-fears-by-age",
      categorySlug: "anxiety",
      title:
        "Common childhood fears by age: When to worry and when it's normal",
      description:
        "Every kid gets scared. Toddlers fear loud noises and the dark. Preschoolers conjure monsters under the bed. School-age kids worry about death, storms, and social rejection. Most fears are developmental and temporary, following a predictable pattern tied to brain growth.",
      date: "2026-02-07",
      category: "Anxiety",
    },
    load: async () => import("./posts/childhood-fears-by-age.mdx"),
  },
  {
    meta: {
      slug: "specific-phobias",
      categorySlug: "anxiety",
      title:
        "Bathtime fears, loud noises, dogs, and bugs: Helping kids with specific phobias",
      description:
        "Most childhood phobias are evolutionary leftovers, not signs you broke something. Stop forcing exposure while your kid is terrified. Instead, reduce pressure, use laughter and play to release the stored fear, then reintroduce the scary thing gradually.",
      date: "2026-02-07",
      category: "Anxiety",
    },
    load: async () => import("./posts/specific-phobias.mdx"),
  },
  {
    meta: {
      slug: "welcome",
      categorySlug: "tools",
      title: "Welcome to the Steady Parent blog",
      description:
        "What we'll cover here, how posts are structured, and how to use the tactics in real life.",
      date: "2026-01-29",
      category: "Tools",
    },
    load: async () => import("./posts/welcome.mdx"),
  },
];

export const blogCategories: BlogCategory[] = [
  "Tantrums",
  "Aggression",
  "Sleep",
  "Siblings",
  "Anxiety",
  "Discipline",
  "Staying Calm",
  "Breaking The Cycle",
  "Big Feelings",
  "Potty Training",
  "Eating",
  "Screens",
  "Social Skills",
  "Body Safety",
  "New Parent",
  "Teens",
  "Transitions",
  "Spirited Kids",
  "Parenting Approach",
  "Parenting Science",
  "Tools",
];
