import { notFound } from "next/navigation";
import { provinces, findProvince } from "@/lib/domain/province";
import { getArticlesByProvince } from "@/lib/publicQueries";
import ProvincePageClient from "./ProvincePageClient";

export function generateStaticParams() {
  return provinces.map((p) => ({ slug: p.slug }));
}

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
