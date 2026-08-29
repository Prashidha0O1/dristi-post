import type { ArticleUpdateInput, NewArticleInput } from "../domain/article";
import type { JobUpdateInput, NewJobInput } from "../domain/job";
import { isEmploymentType } from "../domain/job";
import { isProvinceSlug } from "../domain/province";
import { categories } from "../config";

/** Raised for input the caller can fix; maps to HTTP 400 at the edge. */
export class ValidationError extends Error {
  constructor(public readonly issues: Record<string, string>) {
    super("Validation failed");
    this.name = "ValidationError";
  }
}

/** Raised when the target of an operation does not exist; maps to HTTP 404. */
export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

const MAX_TITLE = 200;
const MAX_EXCERPT = 400;

const categorySlugs = new Set(categories.map((c) => c.slug));

/**
 * Validation lives here rather than inside the use cases so that the rules are
 * stated once and each use case keeps a single responsibility.
 */
export function validateNewArticle(input: NewArticleInput): void {
  const issues: Record<string, string> = {};

  if (!input.title?.ne?.trim()) {
    issues["title.ne"] = "Nepali title is required";
  } else if (input.title.ne.trim().length > MAX_TITLE) {
    issues["title.ne"] = `Nepali title must be at most ${MAX_TITLE} characters`;
  }

  if (input.title?.en && input.title.en.length > MAX_TITLE) {
    issues["title.en"] = `English title must be at most ${MAX_TITLE} characters`;
  }

  if (!input.excerpt?.ne?.trim()) {
    issues["excerpt.ne"] = "Nepali excerpt is required";
  } else if (input.excerpt.ne.trim().length > MAX_EXCERPT) {
    issues["excerpt.ne"] = `Nepali excerpt must be at most ${MAX_EXCERPT} characters`;
  }

  if (!input.body?.ne?.trim()) {
    issues["body.ne"] = "Nepali body is required";
  }

  if (!input.categorySlug?.trim()) {
    issues.categorySlug = "Category is required";
  } else if (!categorySlugs.has(input.categorySlug)) {
    issues.categorySlug = `Unknown category "${input.categorySlug}"`;
  }

  // Province is optional (national news has none) but must be valid if given.
  if (input.provinceSlug !== undefined && !isProvinceSlug(input.provinceSlug)) {
    issues.provinceSlug = `Unknown province "${input.provinceSlug}"`;
  }

  if (!input.authorId?.trim()) {
    issues.authorId = "Author is required";
  }

  if (!input.imageUrl?.trim()) {
    issues.imageUrl = "Featured image URL is required";
  } else if (!/^https?:\/\//i.test(input.imageUrl) && !input.imageUrl.startsWith("/")) {
    issues.imageUrl = "Image must be an absolute URL or a site-relative path";
  }

  if (Object.keys(issues).length > 0) throw new ValidationError(issues);
}

/**
 * Updates are partial, so only the fields actually present are checked. Reuses
 * the create rules by filling absent fields with known-good placeholders.
 */
export function validateArticleUpdate(input: ArticleUpdateInput): void {
  const issues: Record<string, string> = {};

  if (input.title !== undefined && !input.title.ne?.trim()) {
    issues["title.ne"] = "Nepali title cannot be emptied";
  }
  if (input.excerpt !== undefined && !input.excerpt.ne?.trim()) {
    issues["excerpt.ne"] = "Nepali excerpt cannot be emptied";
  }
  if (input.body !== undefined && !input.body.ne?.trim()) {
    issues["body.ne"] = "Nepali body cannot be emptied";
  }
  if (input.categorySlug !== undefined && !categorySlugs.has(input.categorySlug)) {
    issues.categorySlug = `Unknown category "${input.categorySlug}"`;
  }
  if (input.provinceSlug !== undefined && !isProvinceSlug(input.provinceSlug)) {
    issues.provinceSlug = `Unknown province "${input.provinceSlug}"`;
  }
  if (input.imageUrl !== undefined && !input.imageUrl.trim()) {
    issues.imageUrl = "Featured image URL cannot be emptied";
  }

  if (Object.keys(issues).length > 0) throw new ValidationError(issues);
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Accepts an absolute http(s) URL or a bare email address (rendered as mailto:). */
function isValidApplyTarget(value: string): boolean {
  return /^https?:\/\//i.test(value) || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function validateNewJob(input: NewJobInput): void {
  const issues: Record<string, string> = {};

  if (!input.title?.ne?.trim()) {
    issues["title.ne"] = "Nepali title is required";
  } else if (input.title.ne.trim().length > MAX_TITLE) {
    issues["title.ne"] = `Nepali title must be at most ${MAX_TITLE} characters`;
  }

  if (input.title?.en && input.title.en.length > MAX_TITLE) {
    issues["title.en"] = `English title must be at most ${MAX_TITLE} characters`;
  }

  if (!input.company?.trim()) issues.company = "Company is required";
  if (!input.location?.trim()) issues.location = "Location is required";

  if (!input.description?.ne?.trim()) {
    issues["description.ne"] = "Nepali description is required";
  }

  if (!input.employmentType) {
    issues.employmentType = "Employment type is required";
  } else if (!isEmploymentType(input.employmentType)) {
    issues.employmentType = `Unknown employment type "${input.employmentType}"`;
  }

  if (input.provinceSlug !== undefined && !isProvinceSlug(input.provinceSlug)) {
    issues.provinceSlug = `Unknown province "${input.provinceSlug}"`;
  }

  if (input.deadline !== undefined && input.deadline !== "" && !ISO_DATE.test(input.deadline)) {
    issues.deadline = "Deadline must be a YYYY-MM-DD date";
  }

  if (!input.applyUrl?.trim()) {
    issues.applyUrl = "An application link or email is required";
  } else if (!isValidApplyTarget(input.applyUrl.trim())) {
    issues.applyUrl = "Must be a full http(s) URL or an email address";
  }

  if (Object.keys(issues).length > 0) throw new ValidationError(issues);
}

export function validateJobUpdate(input: JobUpdateInput): void {
  const issues: Record<string, string> = {};

  if (input.title !== undefined && !input.title.ne?.trim()) {
    issues["title.ne"] = "Nepali title cannot be emptied";
  }
  if (input.company !== undefined && !input.company.trim()) {
    issues.company = "Company cannot be emptied";
  }
  if (input.location !== undefined && !input.location.trim()) {
    issues.location = "Location cannot be emptied";
  }
  if (input.description !== undefined && !input.description.ne?.trim()) {
    issues["description.ne"] = "Nepali description cannot be emptied";
  }
  if (input.employmentType !== undefined && !isEmploymentType(input.employmentType)) {
    issues.employmentType = `Unknown employment type "${input.employmentType}"`;
  }
  if (input.provinceSlug !== undefined && !isProvinceSlug(input.provinceSlug)) {
    issues.provinceSlug = `Unknown province "${input.provinceSlug}"`;
  }
  if (input.deadline !== undefined && input.deadline !== "" && !ISO_DATE.test(input.deadline)) {
    issues.deadline = "Deadline must be a YYYY-MM-DD date";
  }
  if (input.applyUrl !== undefined) {
    if (!input.applyUrl.trim()) {
      issues.applyUrl = "Application link cannot be emptied";
    } else if (!isValidApplyTarget(input.applyUrl.trim())) {
      issues.applyUrl = "Must be a full http(s) URL or an email address";
    }
  }

  if (Object.keys(issues).length > 0) throw new ValidationError(issues);
}
