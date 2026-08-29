import type { Metadata } from "next";
import { getPublishedJobs } from "@/lib/publicQueries";
import JobsPageClient from "./JobsPageClient";

export const metadata: Metadata = {
  title: "रोजगार | Dristi Post",
  description: "The latest job openings from across Nepal, on Dristi Post.",
};

export default async function JobsPage() {
  const jobs = await getPublishedJobs();
  return <JobsPageClient jobs={jobs} />;
}
