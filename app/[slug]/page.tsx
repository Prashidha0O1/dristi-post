import { categories } from "@/lib/config";
import { getActiveAds, getArticlesByCategory, getTrendingArticles, getSeoSettings } from "@/lib/publicQueries";
import CategoryPageClient from "./CategoryPageClient";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

// Rendered at request time, not at build: the content comes from the database
// (only reachable as localhost in production), and a news site wants fresh
// content on each request. Data reads are still cached via unstable_cache.
export const dynamic = "force-dynamic";


export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  
  // 1. Check custom overrides from the database settings
  try {
    const seoSettings = await getSeoSettings();
    const override = seoSettings.pageOverrides?.find((o) => o.slug === slug);
    if (override && (override.title_ne || override.title_en)) {
      return {
        title: override.title_ne || override.title_en,
        description: override.desc_ne || override.desc_en,
        openGraph: {
          title: override.title_ne || override.title_en,
          description: override.desc_ne || override.desc_en,
          type: "website",
        },
      };
    }
  } catch (e) {
    // silently fallback to static config if settings fail to load
  }

  // 2. Fallback to hardcoded category config
  const category = categories.find((c) => c.slug === slug);
  if (!category) return { title: "Page Not Found - Dristi Times" };

  return {
    title: `${category.name.ne} समाचार | Dristi Times`,
    description: `Read the latest ${category.name.en} news on Dristi Times.`,
    openGraph: {
      title: `${category.name.ne} समाचार | Dristi Times`,
      description: `Read the latest ${category.name.en} news on Dristi Times.`,
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
  
  const category = categories.find((c) => c.slug === slug);
  if (!category) {
    notFound();
  }

  const [articles, trending, ads] = await Promise.all([
    getArticlesByCategory(slug),
    getTrendingArticles(6),
    getActiveAds(),
  ]);
  return <CategoryPageClient slug={slug} articles={articles} trending={trending} ads={ads} />;
}
