import type { NextConfig } from "next";

// Codeberg Pages serves project sites under https://<owner>.codeberg.page/<repo>/,
// so the production build needs to know its own base path. Left unset (empty)
// by default so `next dev`/local `next build` keep working at the site root;
// the deploy workflow sets CODEBERG_PAGES_BASE_PATH=/news-portal explicitly
// for the build that actually gets published.
const basePath = process.env.CODEBERG_PAGES_BASE_PATH || "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
    ],
  },
};

export default nextConfig;
