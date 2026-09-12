import { notFound } from "next/navigation";
import { findProvince } from "@/lib/domain/province";
import { getArticlesByProvince } from "@/lib/publicQueries";
import ProvincePageClient from "./ProvincePageClient";

// Rendered at request time, not at build: the content comes from the database
// (only reachable as localhost in production), and a news site wants fresh
// content on each request. Data reads are still cached via unstable_cache.
export const dynamic = "force-dynamic";


export default async function ProvincePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const province = findProvince(slug);
  if (!province) notFound();

  const articles = await getArticlesByProvince(province.slug);

  return <ProvincePageClient province={province} articles={articles} />;
}
