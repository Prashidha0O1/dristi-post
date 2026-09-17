import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getActiveAds, getArticleBySlug, getRecentArticles, getRelatedArticles, getTrendingArticles } from "@/lib/publicQueries";
import ArticlePageClient from "./ArticlePageClient";
import { primaryText } from "@/lib/domain/article";

// Rendered at request time, not at build: the content comes from the database
// (only reachable as localhost in production), and a news site wants fresh
// content on each request. Data reads are still cached via unstable_cache.
export const dynamic = "force-dynamic";


export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    return { title: "Article Not Found - Dristi Times" };
  }

  const description = article.metaDescription?.trim() || primaryText(article.excerpt);

  return {
    title: `${primaryText(article.title)} | Dristi Times`,
    description,
    openGraph: {
      title: primaryText(article.title),
      description,
      images: [article.image],
      type: "article",
      publishedTime: article.publishedAt,
    },
    twitter: {
      card: "summary_large_image",
      title: primaryText(article.title),
      description,
      images: [article.image],
    },
    alternates: {
      canonical: `/article/${slug}`,
    }
  };
}

import { siteUrl } from "@/lib/siteUrl";

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const [related, trending, ads] = await Promise.all([
    getRelatedArticles(article),
    getTrendingArticles(6),
    getActiveAds(),
  ]);

  const newsArticleSchema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": primaryText(article.title),
    "image": [article.image],
    "datePublished": article.publishedAt,
    "dateModified": article.updatedAt ?? article.publishedAt,
    "author": [{
      "@type": "Person",
      "name": primaryText(article.author?.name) || "Dristi Times",
    }]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(newsArticleSchema) }}
      />
      <ArticlePageClient article={article} related={related} trending={trending} ads={ads} />
    </>
  );
}
