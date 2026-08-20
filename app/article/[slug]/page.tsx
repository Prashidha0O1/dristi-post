import { mockArticles } from "@/lib/mockData";
import ArticlePageClient from "./ArticlePageClient";

export function generateStaticParams() {
  return mockArticles.map((article) => ({ slug: article.slug }));
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ArticlePageClient slug={slug} />;
}
