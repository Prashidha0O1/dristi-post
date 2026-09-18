import FrontPage from "@/components/frontPage";
import { getActiveAds, getRecentArticles } from "@/lib/publicQueries";

// Rendered at request time, not at build: the content comes from the database
// (only reachable as localhost in production), and a news site wants fresh
// content on each request. Data reads are still cached via unstable_cache.
export const dynamic = "force-dynamic";


import { siteUrl } from "@/lib/siteUrl";

export default async function Page() {
  const [articles, ads] = await Promise.all([getRecentArticles(), getActiveAds()]);

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "NewsMediaOrganization",
    "name": "Dristi Times",
    "url": siteUrl(),
    "logo": {
      "@type": "ImageObject",
      "url": `${siteUrl()}/dristi-logo.png`
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <FrontPage articles={articles} ads={ads} />
    </>
  );
}
