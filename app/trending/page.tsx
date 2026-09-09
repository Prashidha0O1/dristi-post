import { getActiveAds, getRecentArticles, getTrendingArticles } from "@/lib/publicQueries";
import TrendingPageClient from "./TrendingPageClient";

export default async function TrendingPage() {
  const [trending, recent, ads] = await Promise.all([
    getTrendingArticles(),
    getRecentArticles(4),
    getActiveAds(),
  ]);
  return <TrendingPageClient trending={trending} latest={recent} ads={ads} />;
}
