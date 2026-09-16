import { getPublishedBlogs } from "@/lib/publicQueries";
import BlogPageClient from "./BlogPageClient";

// Rendered at request time, not at build: content comes from the database.
export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const blogs = await getPublishedBlogs();
  // Hand only what the client needs (it can't receive class instances/Dates,
  // but these are plain objects already). Serialise to a lean card shape.
  const items = blogs.map((b) => ({
    id: b.id,
    slug: b.slug,
    title: b.title,
    excerpt: b.excerpt,
    heroImage: b.heroImage,
    publishedAt: b.publishedAt ?? b.createdAt,
  }));
  return <BlogPageClient blogs={items} />;
}
