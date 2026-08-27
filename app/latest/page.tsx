import { getRecentArticles, getTrendingArticles } from "@/lib/publicQueries";
import LatestPageClient from "./LatestPageClient";

export default async function LatestPage() {
  const [articles, trending] = await Promise.all([
    getRecentArticles(),
    getTrendingArticles(6),
  ]);
  return <LatestPageClient articles={articles} trending={trending} />;
}
