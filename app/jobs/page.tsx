import type { Metadata } from "next";
import { getPublishedJobs } from "@/lib/publicQueries";
import JobsPageClient from "./JobsPageClient";

// Rendered at request time, not at build: the content comes from the database
// (only reachable as localhost in production), and a news site wants fresh
// content on each request. Data reads are still cached via unstable_cache.
export const dynamic = "force-dynamic";


export const metadata: Metadata = {
  title: "रोजगार | Dristi Post",
  description: "The latest job openings from across Nepal, on Dristi Post.",
};

export default async function JobsPage() {
  const jobs = await getPublishedJobs();
  return <JobsPageClient jobs={jobs} />;
}
