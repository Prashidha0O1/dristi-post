import type { Metadata } from "next";
import { getSeoSettings } from "@/lib/publicQueries";
import { getPublishedBlogs, getActiveAds } from "@/lib/publicQueries";
import BlogPageClient from "./BlogPageClient";

// Rendered at request time, not at build: content comes from the database.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoSettings();
  const desc = seo.blog_desc_ne || seo.blog_desc_en || "Read the latest blogs on Dristi Times.";
  return {
    title: seo.blog_title_ne ? `${seo.blog_title_ne} | Dristi Times` : "Blog | Dristi Times",
    description: desc,
    openGraph: {
      title: seo.blog_title_ne ? `${seo.blog_title_ne} | Dristi Times` : "Blog | Dristi Times",
      description: desc,
      type: "website",
    }
  };
}

export default async function BlogPage(props: { searchParams: Promise<{ page?: string }> }) {
  const params = await props.searchParams;
  const page = parseInt(params.page || "1", 10) || 1;
  const limit = 16;
  const offset = (page - 1) * limit;

  const [{ items: blogs, total }, ads] = await Promise.all([getPublishedBlogs(limit, offset), getActiveAds()]);
  const items = blogs.map((b) => ({
    id: b.id,
    slug: b.slug,
    title: b.title,
    excerpt: b.excerpt,
    heroImage: b.heroImage,
    publishedAt: b.publishedAt ?? b.createdAt,
    isFeatured: b.isFeatured,
  }));
  return <BlogPageClient blogs={items} ads={ads} total={total} currentPage={page} />;
}
