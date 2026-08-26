import { mockArticles } from "@/lib/mockData";
import ArticlePageClient from "./ArticlePageClient";
import type { Metadata } from "next";

export function generateStaticParams() {
  return mockArticles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = mockArticles.find((a) => a.slug === slug);
  
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
    }
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ArticlePageClient slug={slug} />;
}
