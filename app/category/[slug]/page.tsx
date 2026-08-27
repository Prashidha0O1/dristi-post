import { categories } from "@/lib/config";
import CategoryPageClient from "./CategoryPageClient";
import type { Metadata } from "next";

export function generateStaticParams() {
  return categories.map((category) => ({ slug: category.slug }));
}

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
    }
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <CategoryPageClient slug={slug} />;
}
