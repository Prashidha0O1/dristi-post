const basePath = process.env.SITE_BASE_PATH || "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Self-contained build: emits .next/standalone/server.js with only the
  // dependencies it needs, so the server never runs npm install.
  output: "standalone",
  basePath,
  // Server Actions default to a 1MB body limit, which blocked image uploads.
  experimental: {
    serverActions: {
      bodySizeLimit: "12mb",
    },
  },
  images: {
    // cPanel has no `sharp`, so the on-the-fly image optimizer fails there and
    // images don't render. Serve them as-is (uploads are already compressed
    // client-side before upload).
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
};

export default nextConfig;
