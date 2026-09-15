import type { ArticleUpdateInput, NewArticleInput } from "../domain/article";
import type { JobUpdateInput, NewJobInput } from "../domain/job";
import type { AdUpdateInput, NewAdInput } from "../domain/ad";
import { isEmploymentType } from "../domain/job";
import { isAdPlacement } from "../adSlots";
import { isProvinceSlug } from "../domain/province";
import { categories } from "../config";
import { hasAnyText, normalizeSlug, MAX_SLUG, type LocalisedText } from "../domain/article";

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
const MAX_META = 200;

const categorySlugs = new Set(categories.map((c) => c.slug));

/**
 * Either language satisfies a localised field, but at least one must be there.
 *
 * The issue is reported against `<field>.ne` because that is the input an
 * editor sees first; the message names both languages so it doesn't read as
 * "Nepali is mandatory", which is exactly the rule we removed.
 */
function checkLocalised(
  issues: Record<string, string>,
  field: string,
  value: LocalisedText | undefined,
  label: string,
  max?: number,
): void {
  if (!hasAnyText(value)) {
    issues[`${field}.ne`] = `${label} is required in Nepali or English`;
    return;
  }
  if (max !== undefined) {
    if ((value?.ne?.trim().length ?? 0) > max) {
      issues[`${field}.ne`] = `Nepali ${label.toLowerCase()} must be at most ${max} characters`;
    }
    if ((value?.en?.trim().length ?? 0) > max) {
      issues[`${field}.en`] = `English ${label.toLowerCase()} must be at most ${max} characters`;
    }
  }
}

/** Optional hand-typed slug: must reduce to a non-empty English slug <= MAX_SLUG. */
function checkSlug(issues: Record<string, string>, slug: string | undefined): void {
  if (slug === undefined || slug.trim() === "") return; // blank -> auto-generated
  const normalized = normalizeSlug(slug);
  if (!normalized) {
    issues.slug = "The slug must contain English letters or numbers.";
  } else if (slug.trim().length > MAX_SLUG) {
    issues.slug = `The slug must be at most ${MAX_SLUG} characters.`;
  }
}

/** Optional SEO meta description length cap. */
function checkMeta(issues: Record<string, string>, meta: string | undefined): void {
  if (meta && meta.trim().length > MAX_META) {
    issues.metaDescription = `The meta description must be at most ${MAX_META} characters.`;
  }
}

/**
 * Validation lives here rather than inside the use cases so that the rules are
 * stated once and each use case keeps a single responsibility.
 */
export function validateNewArticle(input: NewArticleInput): void {
  const issues: Record<string, string> = {};

  checkLocalised(issues, "title", input.title, "Title", MAX_TITLE);
  checkLocalised(issues, "excerpt", input.excerpt, "Excerpt", MAX_EXCERPT);
  checkLocalised(issues, "body", input.body, "Body");
  checkSlug(issues, input.slug);
  checkMeta(issues, input.metaDescription);

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

  if (input.title !== undefined) checkLocalised(issues, "title", input.title, "Title", MAX_TITLE);
  if (input.excerpt !== undefined) {
    checkLocalised(issues, "excerpt", input.excerpt, "Excerpt", MAX_EXCERPT);
  }
  if (input.body !== undefined) checkLocalised(issues, "body", input.body, "Body");
  checkSlug(issues, input.slug);
  checkMeta(issues, input.metaDescription);
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

/** Widest year the date inputs and the UI accept. Mirrored as min/max on the field. */
const MIN_YEAR = 2000;
const MAX_YEAR = 2100;

/**
 * Shape alone is not enough: ISO_DATE happily accepts "9999-99-99". This also
 * round-trips through Date so impossible days (2025-02-31) are rejected, and
 * clamps the year to a sane range — an <input type="date"> with no min/max lets
 * a browser submit years up to 275760.
 */
function isRealIsoDate(value: string): boolean {
  if (!ISO_DATE.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  if (y < MIN_YEAR || y > MAX_YEAR) return false;
  const date = new Date(Date.UTC(y, m - 1, d));
  return (
    date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d
  );
}

/** Accepts an absolute http(s) URL or a bare email address (rendered as mailto:). */
function isValidApplyTarget(value: string): boolean {
  return /^https?:\/\//i.test(value) || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function validateNewJob(input: NewJobInput): void {
  const issues: Record<string, string> = {};

  checkLocalised(issues, "title", input.title, "Job title", MAX_TITLE);

  if (!input.company?.trim()) issues.company = "Company is required";
  if (!input.location?.trim()) issues.location = "Location is required";

  checkLocalised(issues, "description", input.description, "Description");

  if (!input.employmentType) {
    issues.employmentType = "Employment type is required";
  } else if (!isEmploymentType(input.employmentType)) {
    issues.employmentType = `Unknown employment type "${input.employmentType}"`;
  }

  if (input.provinceSlug !== undefined && !isProvinceSlug(input.provinceSlug)) {
    issues.provinceSlug = `Unknown province "${input.provinceSlug}"`;
  }

  if (input.deadline !== undefined && input.deadline !== "" && !isRealIsoDate(input.deadline)) {
    issues.deadline = `Deadline must be a real date between ${MIN_YEAR} and ${MAX_YEAR}`;
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

  if (input.title !== undefined) checkLocalised(issues, "title", input.title, "Job title", MAX_TITLE);
  if (input.company !== undefined && !input.company.trim()) {
    issues.company = "Company cannot be emptied";
  }
  if (input.location !== undefined && !input.location.trim()) {
    issues.location = "Location cannot be emptied";
  }
  if (input.description !== undefined) {
    checkLocalised(issues, "description", input.description, "Description");
  }
  if (input.employmentType !== undefined && !isEmploymentType(input.employmentType)) {
    issues.employmentType = `Unknown employment type "${input.employmentType}"`;
  }
  if (input.provinceSlug !== undefined && !isProvinceSlug(input.provinceSlug)) {
    issues.provinceSlug = `Unknown province "${input.provinceSlug}"`;
  }
  if (input.deadline !== undefined && input.deadline !== "" && !isRealIsoDate(input.deadline)) {
    issues.deadline = `Deadline must be a real date between ${MIN_YEAR} and ${MAX_YEAR}`;
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

const MAX_ALT_TEXT = 160;

/**
 * Ads carry no free-text image URL — the uploader produces it — so the URL
 * rules here only guard the click-through, plus the alt text that the public
 * `<img>` needs to be accessible at all.
 */
export function validateNewAd(input: NewAdInput): void {
  const issues: Record<string, string> = {};

  if (!input.placement) {
    issues.placement = "Choose which slot this ad fills";
  } else if (!isAdPlacement(input.placement)) {
    issues.placement = `Unknown ad slot "${input.placement}"`;
  }

  if (!input.imageUrl?.trim()) {
    issues.imageUrl = "Upload an image for this ad";
  }

  if (!input.linkUrl?.trim()) {
    issues.linkUrl = "A click-through link is required";
  } else if (!/^https?:\/\//i.test(input.linkUrl.trim())) {
    issues.linkUrl = "The link must be a full http(s):// URL";
  }

  if (!input.altText?.trim()) {
    issues.altText = "Alt text is required so the ad is accessible";
  } else if (input.altText.trim().length > MAX_ALT_TEXT) {
    issues.altText = `Alt text must be at most ${MAX_ALT_TEXT} characters`;
  }

  if (Object.keys(issues).length > 0) throw new ValidationError(issues);
}

export function validateAdUpdate(input: AdUpdateInput): void {
  const issues: Record<string, string> = {};

  if (input.placement !== undefined && !isAdPlacement(input.placement)) {
    issues.placement = `Unknown ad slot "${input.placement}"`;
  }
  if (input.imageUrl !== undefined && !input.imageUrl.trim()) {
    issues.imageUrl = "Image cannot be removed — upload a replacement instead";
  }
  if (input.linkUrl !== undefined) {
    if (!input.linkUrl.trim()) {
      issues.linkUrl = "Click-through link cannot be emptied";
    } else if (!/^https?:\/\//i.test(input.linkUrl.trim())) {
      issues.linkUrl = "The link must be a full http(s):// URL";
    }
  }
  if (input.altText !== undefined && !input.altText.trim()) {
    issues.altText = "Alt text cannot be emptied";
  }

  if (Object.keys(issues).length > 0) throw new ValidationError(issues);
}
