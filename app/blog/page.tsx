import { getArticlesByCategory } from "@/lib/publicQueries";
import BlogPageClient from "./BlogPageClient";

export default async function BlogPage() {
  const [opinion, lifestyle] = await Promise.all([
    getArticlesByCategory("opinion"),
    getArticlesByCategory("lifestyle"),
  ]);
  return <BlogPageClient articles={[...opinion, ...lifestyle]} />;
}
