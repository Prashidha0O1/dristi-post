import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getBlogBySlug } from "@/lib/publicQueries";
import { primaryText } from "@/lib/domain/article";
import BlogDetailClient from "./BlogDetailClient";

// Rendered at request time, not at build: content comes from the database.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);

  if (!blog) return { title: "Blog Not Found — Dristi Times" };

  const description = primaryText(blog.metaDescription || blog.excerpt).slice(0, 160);
  return {
    title: `${primaryText(blog.title)} | Dristi Times`,
    description,
    openGraph: {
      title: primaryText(blog.title),
      description,
      type: "article",
      images: blog.heroImage ? [{ url: blog.heroImage }] : undefined,
    },
    alternates: {
      canonical: `/blog/${slug}`,
    }
  };
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);
  if (!blog) notFound();

  const blogSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": primaryText(blog.title),
    "image": blog.heroImage ? [blog.heroImage] : undefined,
    "datePublished": blog.publishedAt ?? blog.createdAt,
    "dateModified": blog.updatedAt ?? blog.createdAt,
    "author": [{
      "@type": "Person",
      "name": "Dristi Times",
    }]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }}
      />
      <BlogDetailClient
        blog={{
          title: blog.title,
          body: blog.body,
          heroImage: blog.heroImage,
          publishedAt: blog.publishedAt ?? blog.createdAt,
        }}
      />
    </>
  );
}
