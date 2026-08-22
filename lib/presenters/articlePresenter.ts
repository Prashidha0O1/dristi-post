import type { Article, Author, Tag } from "../types";
import type { ArticleRecord } from "../domain/article";
import { localisedTextToRecord } from "../domain/article";
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
  name: { ne: "दृष्टि पोस्ट", en: "Dristi Post" },
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
  const author = authors.find((a) => a.id === record.authorId) ?? FALLBACK_AUTHOR;

  return {
    id: record.id,
    slug: record.slug,
    title: localisedTextToRecord(record.title),
    excerpt: localisedTextToRecord(record.excerpt),
    content: localisedTextToRecord(record.body),
    category,
    author,
    image: record.imageUrl,
    publishedAt: record.publishedAt ?? record.createdAt,
    updatedAt: record.updatedAt,
    tags: record.tagSlugs.map(toTag),
    isFeatured: record.isFeatured,
    isBreaking: record.isBreaking,
  };
}

export function toArticleViewModels(records: readonly ArticleRecord[]): Article[] {
  return records.map(toArticleViewModel);
}
