import type { ArticleRecord } from "../domain/article";
import { mockArticles } from "../mockData";

/**
 * Seeds the in-memory repository from the existing mock articles so the admin
 * console and province filter have realistic content to work with. Provinces are
 * assigned round-robin over the articles that are region-specific; a few are
 * left without one to represent national news.
 */
const PROVINCE_BY_SLUG: Record<string, ArticleRecord["provinceSlug"]> = {
  "nepal-budget-announcement": undefined, // national
  "nepal-cricket-victory": "bagmati",
  "tech-startup-kathmandu": "bagmati",
  "tourism-boost-pokhara": "gandaki",
  "health-campaign-rural": "karnali",
  "film-award-nepali": "bagmati",
  "earthquake-preparedness": undefined, // national
  "stock-market-surge": "bagmati",
  "education-reform-bill": undefined, // national
  "world-climate-summit": undefined, // international
  "lifestyle-modern-kathmandu": "bagmati",
  "opinion-democracy-challenges": undefined, // national
};

export const seedArticles: readonly ArticleRecord[] = mockArticles.map((a) => ({
  id: a.id,
  slug: a.slug,
  title: { ne: a.title.ne, en: a.title.en },
  excerpt: { ne: a.excerpt.ne, en: a.excerpt.en },
  body: {
    ne: a.content.ne || a.excerpt.ne,
    en: a.content.en || a.excerpt.en,
  },
  categorySlug: a.category.slug,
  provinceSlug: PROVINCE_BY_SLUG[a.slug],
  authorId: a.author.id,
  imageUrl: a.image,
  status: "published" as const,
  tagSlugs: a.tags.map((t) => t.slug),
  isFeatured: a.isFeatured ?? false,
  isBreaking: a.isBreaking ?? false,
  createdAt: a.publishedAt,
  updatedAt: a.updatedAt ?? a.publishedAt,
  publishedAt: a.publishedAt,
}));
