import { getArticlesByCategory } from "@/lib/publicQueries";
import BlogPageClient from "./BlogPageClient";

// Rendered at request time, not at build: the content comes from the database
// (only reachable as localhost in production), and a news site wants fresh
// content on each request. Data reads are still cached via unstable_cache.
export const dynamic = "force-dynamic";


export default async function BlogPage() {
  const [opinion, lifestyle] = await Promise.all([
    getArticlesByCategory("opinion"),
    getArticlesByCategory("lifestyle"),
  ]);
  return <BlogPageClient articles={[...opinion, ...lifestyle]} />;
}
