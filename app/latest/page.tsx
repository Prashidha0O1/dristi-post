import { getActiveAds, getRecentArticles, getTrendingArticles, searchArticles } from "@/lib/publicQueries";
import LatestPageClient from "./LatestPageClient";

export const dynamic = "force-dynamic";

export default async function LatestPage(props: { searchParams: Promise<{ search?: string }> }) {
  const params = await props.searchParams;
  const search = params.search || "";

  const [articles, trending, ads] = await Promise.all([
    search ? searchArticles(search) : getRecentArticles(),
    getTrendingArticles(6),
    getActiveAds(),
  ]);

  return <LatestPageClient articles={articles} trending={trending} ads={ads} search={search} />;
}
