import type { NextConfig } from "next";

// NOTE: `output: "export"` was removed deliberately. The admin console needs
// Server Actions, a database and auth, none of which a static export supports.
// The site is therefore deployed to a Node runtime (Vercel), not Codeberg Pages
// — see DEPLOYMENT.md.
//
// `basePath` is still honoured via env so the public site can be served from a
// subpath if that is ever needed again; it defaults to the domain root.
const basePath = process.env.SITE_BASE_PATH || "";

const nextConfig: NextConfig = {
  basePath,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
    ],
  },
};

export default nextConfig;
