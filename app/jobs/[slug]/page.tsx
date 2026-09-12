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

  if (!job) return { title: "Job Not Found - Dristi Post" };

  return {
    title: `${primaryText(job.title)} — ${job.company} | Dristi Post`,
    description: primaryText(job.description).slice(0, 160),
    openGraph: {
      title: `${primaryText(job.title)} — ${job.company}`,
      description: primaryText(job.description).slice(0, 160),
      type: "article",
    },
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

  return <JobDetailClient job={job} />;
}
