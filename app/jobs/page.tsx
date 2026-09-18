import type { Metadata } from "next";
import { getPublishedJobs } from "@/lib/publicQueries";
import JobsPageClient from "./JobsPageClient";

// Rendered at request time, not at build: the content comes from the database
// (only reachable as localhost in production), and a news site wants fresh
// content on each request. Data reads are still cached via unstable_cache.
export const dynamic = "force-dynamic";


export const metadata: Metadata = {
  title: "रोजगार | Dristi Times",
  description: "The latest job openings from across Nepal, on Dristi Times.",
};

export default async function JobsPage(props: { searchParams: Promise<{ page?: string }> }) {
  const params = await props.searchParams;
  const page = parseInt(params.page || "1", 10) || 1;
  const limit = 16;
  const offset = (page - 1) * limit;

  const { items: jobs, total } = await getPublishedJobs({ limit, offset });
  return <JobsPageClient jobs={jobs} total={total} currentPage={page} />;
}
