import { getActiveAds, getRecentArticles, getTrendingArticles } from "@/lib/publicQueries";
import TrendingPageClient from "./TrendingPageClient";

// Rendered at request time, not at build: the content comes from the database
// (only reachable as localhost in production), and a news site wants fresh
// content on each request. Data reads are still cached via unstable_cache.
export const dynamic = "force-dynamic";


export default async function TrendingPage() {
  const [trending, recent, ads] = await Promise.all([
    getTrendingArticles(),
    getRecentArticles(4),
    getActiveAds(),
  ]);
  return <TrendingPageClient trending={trending} latest={recent} ads={ads} />;
}
