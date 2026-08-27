import type { Locale } from "../types";
import type { ProvinceSlug } from "./province";

export type ArticleStatus = "draft" | "published";

/**
 * Localised text. Nepali is mandatory (the portal's primary language);
 * English is optional so an editor can publish without waiting on translation.
 */
export interface LocalisedText {
  ne: string;
  en?: string;
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

export function localisedTextToRecord(text: LocalisedText): Record<Locale, string> {
  return { ne: text.ne, en: text.en?.trim() ? text.en : text.ne };
}
