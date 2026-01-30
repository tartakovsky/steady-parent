import type { NextConfig } from "next";

import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
import createMDX from "@next/mdx";
import remarkGfm from "remark-gfm";
import { remarkAlert } from "remark-github-blockquote-alert";
import remarkBreaks from "remark-breaks";

const nextConfig: NextConfig = {
  // Allow MD/MDX to be imported and used as routes/components.
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],

  // Recommended for OpenNext on Cloudflare unless you configure the image binding.
  images: {
    unoptimized: true,
  },

  // Silence "workspace root" warnings when multiple lockfiles exist elsewhere.
  outputFileTracingRoot: __dirname,
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

// OpenNext's dev shim is only needed when running via Wrangler/OpenNext.
// Running it during plain `next dev` can break Next's asset pipeline (CSS/JS 404s).
if (process.env["OPENNEXT_DEV"] === "1") {
  void initOpenNextCloudflareForDev();
}
