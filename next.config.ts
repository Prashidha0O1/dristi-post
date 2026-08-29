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
    // Editors paste a featured-image URL by hand (see admin/articles/ArticleForm.tsx
    // and admin/jobs/JobForm.tsx) — there's no fixed set of source domains, since a
    // real newsroom hotlinks photos from wire services, other outlets, and anywhere
    // else a story's image comes from. next/image throws for any host not listed
    // here, and that throw isn't caught anywhere in the render tree, so a single
    // unlisted host 500s the entire page it's on (this happened with an
    // nbcnews.com URL — https://nextjs.org/docs/messages/next-image-unconfigured-host).
    // A wildcard is the correct fit for "any editor, any external source" rather
    // than allow-listing hosts one at a time as they come up.
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
};

export default nextConfig;
