import type { AboutContent } from "@/content/pages/about/types";

const R2_PUBLIC_BASE_URL: string | undefined =
  process.env["NEXT_PUBLIC_R2_PUBLIC_BASE_URL"];

export function r2Public(path: string): string {
  if (typeof R2_PUBLIC_BASE_URL === "string" && R2_PUBLIC_BASE_URL.length > 0) {
    return `${R2_PUBLIC_BASE_URL.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
  }
  return path;
}

export const aboutContent: AboutContent = {
  meta: {
    title: "About us",
    description: "Our story, our approach, and why this exists.",
  },
  load: async () => import("./about.mdx"),
};

