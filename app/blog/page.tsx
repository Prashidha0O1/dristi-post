import { getPublishedBlogs, getActiveAds } from "@/lib/publicQueries";
import BlogPageClient from "./BlogPageClient";

// Rendered at request time, not at build: content comes from the database.
export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const [blogs, ads] = await Promise.all([getPublishedBlogs(), getActiveAds()]);
  const items = blogs.map((b) => ({
    id: b.id,
    slug: b.slug,
    title: b.title,
    excerpt: b.excerpt,
    heroImage: b.heroImage,
    publishedAt: b.publishedAt ?? b.createdAt,
  }));
  return <BlogPageClient blogs={items} ads={ads} />;
}
