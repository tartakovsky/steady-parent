import type { NextConfig } from "next";

import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
import createMDX from "@next/mdx";
import remarkGfm from "remark-gfm";

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
    remarkPlugins: [remarkGfm],
    rehypePlugins: [],
  },
});

export default withMDX(nextConfig);

void initOpenNextCloudflareForDev();
