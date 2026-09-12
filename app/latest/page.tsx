import { getActiveAds, getRecentArticles, getTrendingArticles } from "@/lib/publicQueries";
import LatestPageClient from "./LatestPageClient";

// Rendered at request time, not at build: the content comes from the database
// (only reachable as localhost in production), and a news site wants fresh
// content on each request. Data reads are still cached via unstable_cache.
export const dynamic = "force-dynamic";


export default async function LatestPage() {
  const [articles, trending, ads] = await Promise.all([
    getRecentArticles(),
    getTrendingArticles(6),
    getActiveAds(),
  ]);
  return <LatestPageClient articles={articles} trending={trending} ads={ads} />;
}
