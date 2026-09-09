import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getActiveAds, getArticleBySlug, getRecentArticles, getRelatedArticles, getTrendingArticles } from "@/lib/publicQueries";
import ArticlePageClient from "./ArticlePageClient";

export async function generateStaticParams() {
  const articles = await getRecentArticles();
  return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    return { title: "Article Not Found - Dristi Post" };
  }

  return {
    title: `${article.title.ne} | Dristi Post`,
    description: article.excerpt.ne,
    openGraph: {
      title: article.title.ne,
      description: article.excerpt.ne,
      images: [article.image],
      type: "article",
      publishedTime: article.publishedAt,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title.ne,
      description: article.excerpt.ne,
      images: [article.image],
    },
  };
}

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

  return <ArticlePageClient article={article} related={related} trending={trending} ads={ads} />;
}
