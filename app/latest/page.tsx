import { getActiveAds, getRecentArticles, getTrendingArticles } from "@/lib/publicQueries";
import LatestPageClient from "./LatestPageClient";

export default async function LatestPage() {
  const [articles, trending, ads] = await Promise.all([
    getRecentArticles(),
    getTrendingArticles(6),
    getActiveAds(),
  ]);
  return <LatestPageClient articles={articles} trending={trending} ads={ads} />;
}
