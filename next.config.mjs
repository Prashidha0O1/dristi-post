const basePath = process.env.SITE_BASE_PATH || "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Self-contained build: emits .next/standalone/server.js with only the
  // dependencies it needs, so the server never runs npm install.
  output: "standalone",
  basePath,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
};

export default nextConfig;
