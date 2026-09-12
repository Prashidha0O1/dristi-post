import type { Locale } from "../types";
import type { ProvinceSlug } from "./province";

export type ArticleStatus = "draft" | "published";

/**
 * Localised text. Both sides are optional, but at least one must be present —
 * an invariant the validators enforce rather than the type system.
 *
 * Nepali used to be mandatory, which meant an editor working from an English
 * source could not save at all, even with a translator to hand. Now either
 * language is enough and the other is filled in by fallback at read time.
 */
export interface LocalisedText {
  ne?: string;
  en?: string;
}

/**
 * The text to show when only one language is wanted — an admin list row, a
 * <title>, a slug source. Prefers Nepali (the portal's primary language) and
 * falls back to English, so a single-language article never renders blank.
 */
export function primaryText(text: LocalisedText | undefined): string {
  return text?.ne?.trim() || text?.en?.trim() || "";
}

/** True when at least one language carries content. */
export function hasAnyText(text: LocalisedText | undefined): boolean {
  return primaryText(text) !== "";
}

/**
 * Normalises a stored row pair into a LocalisedText.
 *
 * The database columns are NOT NULL, so an absent language is persisted as an
 * empty string rather than NULL. Treating "" as absent here keeps that storage
 * detail from leaking into the domain — and keeps the fallbacks working.
 */
export function localisedFromRow(ne: unknown, en: unknown): LocalisedText {
  const neText = typeof ne === "string" && ne.trim() ? ne : undefined;
  const enText = typeof en === "string" && en.trim() ? en : undefined;
  return { ne: neText, en: enText };
}

/**
 * The persisted shape of a news article. This is the domain's own model — it is
 * deliberately independent of both the storage schema and the public-facing
 * `Article` view model in `lib/types.ts`, so neither can force a change here.
 */
export interface ArticleRecord {
  id: string;
  slug: string;
  title: LocalisedText;
  excerpt: LocalisedText;
  body: LocalisedText;
  categorySlug: string;
  /** Absent for national/international news that isn't province-specific. */
  provinceSlug?: ProvinceSlug;
  authorId: string;
  imageUrl: string;
  status: ArticleStatus;
  tagSlugs: string[];
  isFeatured: boolean;
  isBreaking: boolean;
  isTrending: boolean;
  createdAt: string;
  updatedAt: string;
  /** Set when the article first transitions to `published`. */
  publishedAt?: string;
  /**
   * Denormalised from the author join at read time (see
   * `SupabaseArticleRepository`'s `SELECT_FIELDS`) so the presenter doesn't
   * need a second query or a static id-lookup fixture to render a byline.
   * Absent for repositories that don't populate it (e.g. the in-memory one).
   */
  authorName?: LocalisedText;
}

/** Fields an editor supplies when creating an article. */
export interface NewArticleInput {
  title: LocalisedText;
  excerpt: LocalisedText;
  body: LocalisedText;
  categorySlug: string;
  provinceSlug?: ProvinceSlug;
  authorId: string;
  imageUrl: string;
  tagSlugs?: string[];
  isFeatured?: boolean;
  isBreaking?: boolean;
  isTrending?: boolean;
  /** Publish immediately, or leave as a draft (the default). */
  publish?: boolean;
}

/** Every field an editor is allowed to change after creation. */
export type ArticleUpdateInput = Partial<Omit<NewArticleInput, "publish">>;

export interface ArticleQuery {
  status?: ArticleStatus;
  categorySlug?: string;
  provinceSlug?: ProvinceSlug;
  /** Free-text match against the Nepali and English titles. */
  search?: string;
  limit?: number;
  offset?: number;
}

export interface Paginated<T> {
  items: T[];
  total: number;
}

/**
 * Fills in whichever language is missing, in both directions.
 *
 * This used to fall back only en <- ne, which is why making Nepali optional is
 * a data-model change rather than a validation tweak: without the ne <- en
 * direction an English-only article renders a blank headline to every reader.
 */
export function localisedTextToRecord(text: LocalisedText): Record<Locale, string> {
  const ne = text.ne?.trim() ? text.ne : undefined;
  const en = text.en?.trim() ? text.en : undefined;
  return { ne: ne ?? en ?? "", en: en ?? ne ?? "" };
}
