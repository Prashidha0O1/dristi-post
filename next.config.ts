import type { NextConfig } from "next";

// The admin console needs Server Actions, a database and auth, so this is a
// Node-runtime app, not a static export. `output: "standalone"` emits a
// self-contained server (.next/standalone/server.js) with only the traced
// dependencies, which is what gets shipped to cPanel/Passenger — no need to
// copy the whole node_modules by hand.
//
// `basePath` is still honoured via env so the public site can be served from a
// subpath if that is ever needed again; it defaults to the domain root.
const basePath = process.env.SITE_BASE_PATH || "";

const nextConfig: NextConfig = {
  output: "standalone",
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
