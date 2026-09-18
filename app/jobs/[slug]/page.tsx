import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getJobBySlug, getPublishedJobs } from "@/lib/publicQueries";
import JobDetailClient from "./JobDetailClient";
import { primaryText } from "@/lib/domain/article";

// Rendered at request time, not at build: the content comes from the database
// (only reachable as localhost in production), and a news site wants fresh
// content on each request. Data reads are still cached via unstable_cache.
export const dynamic = "force-dynamic";


export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const job = await getJobBySlug(slug);

  if (!job) return { title: "Job Not Found - Dristi Times" };

  return {
    title: `${primaryText(job.title)} — ${job.company} | Dristi Times`,
    description: primaryText(job.description).slice(0, 160),
    openGraph: {
      title: `${primaryText(job.title)} — ${job.company}`,
      description: primaryText(job.description).slice(0, 160),
      type: "article",
    },
    alternates: {
      canonical: `/jobs/${slug}`,
    }
  };
}

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const job = await getJobBySlug(slug);
  if (!job) notFound();

  // Strip HTML from description for schema
  const plainTextDescription = primaryText(job.description).replace(/<[^>]*>?/gm, '');

  const jobSchema = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    "title": primaryText(job.title),
    "description": plainTextDescription,
    "hiringOrganization": {
      "@type": "Organization",
      "name": job.company,
    },
    "jobLocation": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": job.location || "Nepal",
        "addressCountry": "NP"
      }
    },
    "datePosted": job.publishedAt || job.createdAt,
    "validThrough": job.deadline || undefined,
    "employmentType": job.employmentType === "full-time" ? "FULL_TIME" : job.employmentType === "part-time" ? "PART_TIME" : job.employmentType === "contract" ? "CONTRACT" : "OTHER",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jobSchema) }}
      />
      <JobDetailClient job={job} />
    </>
  );
}
