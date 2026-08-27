import FrontPage from "@/components/frontPage";
import { getRecentArticles } from "@/lib/publicQueries";

export default async function Page() {
  const articles = await getRecentArticles();
  return <FrontPage articles={articles} />;
}
