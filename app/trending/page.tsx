import { getRecentArticles, getTrendingArticles } from "@/lib/publicQueries";
import TrendingPageClient from "./TrendingPageClient";

export default async function TrendingPage() {
  const [trending, recent] = await Promise.all([
    getTrendingArticles(),
    getRecentArticles(4),
  ]);
  return <TrendingPageClient trending={trending} latest={recent} />;
}
