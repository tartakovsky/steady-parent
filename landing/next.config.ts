import type { NextConfig } from "next";

import createMDX from "@next/mdx";
import remarkGfm from "remark-gfm";
import { remarkAlert } from "remark-github-blockquote-alert";
import remarkBreaks from "remark-breaks";

const nextConfig: NextConfig = {
  // Allow MD/MDX to be imported and used as routes/components.
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],

  // Keep images unoptimized for simpler deployment
  images: {
    unoptimized: true,
  },

  // Required for standalone output on Railway
  output: "standalone",

  // Silence "workspace root" warnings when multiple lockfiles exist elsewhere.
  outputFileTracingRoot: __dirname,

  // Disable automatic scroll restoration
  experimental: {
    scrollRestoration: true,
  },
};

const withMDX = createMDX({
  options: {
    // `remarkAlert` adds GitHub-style callouts: > [!NOTE], > [!TIP], etc.
    // `remarkBreaks` makes soft line breaks render as <br />, matching GitHub's behavior
    // in several contexts and enabling multiline blockquotes without trailing spaces.
    remarkPlugins: [remarkGfm, remarkAlert, remarkBreaks],
    rehypePlugins: [],
  },
});

export default withMDX(nextConfig);
