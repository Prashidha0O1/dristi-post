import type { Article, Author, Tag } from "../types";
import type { ArticleRecord } from "../domain/article";
import { localisedTextToRecord, primaryText } from "../domain/article";
import { categories } from "../config";
import { authors } from "../authors";

/**
 * Maps a domain `ArticleRecord` onto the `Article` view model the existing
 * components already consume.
 *
 * Keeping this translation in one place means the domain model can evolve
 * without touching every component, and the components stay unaware of storage
 * concerns (status, draft timestamps, author ids).
 */
const FALLBACK_CATEGORY = categories[0];

const FALLBACK_AUTHOR: Author = {
  id: "unknown",
  name: { ne: "दृष्टि टाइम्स", en: "Dristi Times" },
};

function toTag(slug: string): Tag {
  return {
    id: slug,
    slug,
    // Tag labels are not stored per-locale yet; show the slug in both until they are.
    name: { ne: slug, en: slug },
  };
}

export function toArticleViewModel(record: ArticleRecord): Article {
  const category = categories.find((c) => c.slug === record.categorySlug) ?? FALLBACK_CATEGORY;
  // Prefer the name resolved by the repository's author join over the static
  // `lib/authors.ts` fixture: real Supabase authors have UUID ids that never
  // match that fixture's "a1".."a4", so an id-lookup here would silently show
  // every real article's byline as the generic fallback. The in-memory
  // repository (mock-data fallback path) doesn't populate `authorName`, so the
  // id-lookup fixture stays as the fallback for that path.
  const author = record.authorName
    ? { id: record.authorId, name: localisedTextToRecord(record.authorName) }
    : authors.find((a) => a.id === record.authorId) ?? FALLBACK_AUTHOR;

  return {
    id: record.id,
    slug: record.slug,
    title: localisedTextToRecord(record.title),
    excerpt: localisedTextToRecord(record.excerpt),
    content: localisedTextToRecord(record.body),
    metaDescription: record.metaDescription ? primaryText(record.metaDescription) : undefined,
    category,
    author,
    image: record.imageUrl,
    publishedAt: record.publishedAt ?? record.createdAt,
    updatedAt: record.updatedAt,
    tags: record.tagSlugs.map(toTag),
    isFeatured: record.isFeatured,
    isBreaking: record.isBreaking,
    isTrending: record.isTrending,
  };
}

export function toArticleViewModels(records: readonly ArticleRecord[]): Article[] {
  return records.map(toArticleViewModel);
}
