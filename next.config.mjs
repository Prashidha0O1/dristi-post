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
