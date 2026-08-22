import type { ArticleUpdateInput, NewArticleInput } from "../domain/article";
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
