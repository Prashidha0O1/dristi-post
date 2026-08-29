import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getJobBySlug, getPublishedJobs } from "@/lib/publicQueries";
import JobDetailClient from "./JobDetailClient";

export async function generateStaticParams() {
  const jobs = await getPublishedJobs();
  return jobs.map((job) => ({ slug: job.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const job = await getJobBySlug(slug);

  if (!job) return { title: "Job Not Found - Dristi Post" };

  return {
    title: `${job.title.ne} — ${job.company} | Dristi Post`,
    description: job.description.ne.slice(0, 160),
    openGraph: {
      title: `${job.title.ne} — ${job.company}`,
      description: job.description.ne.slice(0, 160),
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
