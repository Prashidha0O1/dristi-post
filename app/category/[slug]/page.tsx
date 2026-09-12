import { categories } from "@/lib/config";
import { getActiveAds, getArticlesByCategory, getTrendingArticles } from "@/lib/publicQueries";
import CategoryPageClient from "./CategoryPageClient";
import type { Metadata } from "next";

// Rendered at request time, not at build: the content comes from the database
// (only reachable as localhost in production), and a news site wants fresh
// content on each request. Data reads are still cached via unstable_cache.
export const dynamic = "force-dynamic";


export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const category = categories.find((c) => c.slug === slug);

  if (!category) return { title: "Category Not Found - Dristi Post" };

  return {
    title: `${category.name.ne} समाचार | Dristi Post`,
    description: `Read the latest ${category.name.en} news on Dristi Post.`,
    openGraph: {
      title: `${category.name.ne} समाचार | Dristi Post`,
      description: `Read the latest ${category.name.en} news on Dristi Post.`,
      type: "website",
    },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [articles, trending, ads] = await Promise.all([
    getArticlesByCategory(slug),
    getTrendingArticles(6),
    getActiveAds(),
  ]);
  return <CategoryPageClient slug={slug} articles={articles} trending={trending} ads={ads} />;
}
