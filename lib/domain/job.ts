import type { LocalisedText } from "./article";
import type { ProvinceSlug } from "./province";

export type JobStatus = "draft" | "published";

/** Employment types a listing can advertise. Closed union so a typo can't reach the DB. */
export type EmploymentType = "full-time" | "part-time" | "contract" | "internship" | "freelance";

export const employmentTypes: readonly {
  value: EmploymentType;
  name: Record<"ne" | "en", string>;
}[] = [
  { value: "full-time", name: { ne: "पूर्णकालीन", en: "Full-time" } },
  { value: "part-time", name: { ne: "आंशिक", en: "Part-time" } },
  { value: "contract", name: { ne: "करार", en: "Contract" } },
  { value: "internship", name: { ne: "इन्टर्नसिप", en: "Internship" } },
  { value: "freelance", name: { ne: "फ्रिल्यान्स", en: "Freelance" } },
];

const employmentTypeValues = new Set(employmentTypes.map((t) => t.value));

export function isEmploymentType(value: string): value is EmploymentType {
  return employmentTypeValues.has(value as EmploymentType);
}

/**
 * The persisted shape of a job listing. Deliberately independent of both the
 * storage schema and any view model, mirroring `ArticleRecord`.
 */
export interface JobRecord {
  id: string;
  slug: string;
  title: LocalisedText;
  /** Hiring organisation. Not localised — company names are used as-is. */
  company: string;
  /** Free-text locality ("काठमाडौं", "Remote"); `provinceSlug` is the filterable one. */
  location: string;
  provinceSlug?: ProvinceSlug;
  employmentType: EmploymentType;
  metaDescription?: LocalisedText;
  description: LocalisedText;
  /** Optional SEO meta description. */
  /** Free text ("रु. ५०,०००–७०,०००", "Negotiable") — deliberately not numeric. */
  salary?: string;
  /** ISO date (YYYY-MM-DD). Absent means open until filled. */
  deadline?: string;
  /** Where to apply — an absolute URL or a mailto-style email address. */
  applyUrl: string;
  status: JobStatus;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

/** Fields an editor supplies when creating a listing. */
export interface NewJobInput {
  title: LocalisedText;
  company: string;
  location: string;
  provinceSlug?: ProvinceSlug;
  employmentType: EmploymentType;
  description: LocalisedText;
  metaDescription?: LocalisedText;
  salary?: string;
  deadline?: string;
  applyUrl: string;
  isFeatured?: boolean;
  /** Publish immediately, or leave as a draft (the default). */
  publish?: boolean;
}

/** Every field an editor is allowed to change after creation. */
export type JobUpdateInput = Partial<Omit<NewJobInput, "publish">>;

export interface JobQuery {
  status?: JobStatus;
  provinceSlug?: ProvinceSlug;
  employmentType?: EmploymentType;
  /** Free-text match against the Nepali and English titles, and the company. */
  search?: string;
  /** Hide listings whose deadline has passed. */
  activeOnly?: boolean;
  limit?: number;
  offset?: number;
}

/** True when the deadline is set and already in the past. */
export function isExpired(job: JobRecord, now: Date): boolean {
  if (!job.deadline) return false;
  // Compare date-only, so a listing stays live through the whole deadline day.
  return job.deadline < now.toISOString().slice(0, 10);
}
