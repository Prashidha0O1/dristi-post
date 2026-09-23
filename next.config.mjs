const basePath = process.env.SITE_BASE_PATH || "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  basePath,
  experimental: {
    serverActions: {
      bodySizeLimit: "12mb",
    },
  },
  
  compress: true,

  // Next serves public/ with max-age=0, so phones re-validated every image on
  // every visit. Uploads get random UUID filenames and are never overwritten,
  // so they're safe to cache for a year; static brand assets for a week.
  async headers() {
    // Order matters: for the same header key the LAST matching rule wins, so
    // the generic rule comes first and the immutable uploads rule overrides it.
    return [
      {
        source: "/:file(.*\\.(?:png|jpg|jpeg|webp|svg|ico|woff2))",
        headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" }],
      },
      {
        source: "/uploads/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },

  async redirects() {
    return [
      {
        source: '/category/:slug',
        destination: '/:slug',
        permanent: true,
      },
    ];
  },

  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
};

export default nextConfig;
