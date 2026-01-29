import type { NextConfig } from "next";

import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  // Recommended for OpenNext on Cloudflare unless you configure the image binding.
  images: {
    unoptimized: true,
  },

  // Silence "workspace root" warnings when multiple lockfiles exist elsewhere.
  outputFileTracingRoot: __dirname,
};

export default nextConfig;

void initOpenNextCloudflareForDev();
