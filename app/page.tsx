import FrontPage from "@/components/frontPage";
import { getActiveAds, getRecentArticles } from "@/lib/publicQueries";

export default async function Page() {
  const [articles, ads] = await Promise.all([getRecentArticles(), getActiveAds()]);
  return <FrontPage articles={articles} ads={ads} />;
}
