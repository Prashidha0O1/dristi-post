import { unstable_cache } from "next/cache";
import type { Article } from "./types";
import type { ProvinceSlug } from "./domain/province";
import { getContainer } from "./container";
import { toArticleViewModels } from "./presenters/articlePresenter";

/**
 * Read-side helpers for the public site.
 *
 * These wrap the application layer and hand back view models, so pages never
 * touch the repository or the domain record shape directly. Because they only
 * read, they are safe to call during `next build` (static generation) as well
 * as at request time.
 *
 * Every read here is wrapped in `unstable_cache` under a single `"articles"`
 * tag. `app/admin/actions.ts` calls `revalidateTag("articles")` after every
 * create/update/publish/unpublish/delete, which invalidates all of these at
 * once — no per-page path list to keep in sync as pages get added.
 */

/** Generous enough to cover every homepage section without a second round trip. */
const HOMEPAGE_FEED_LIMIT = 60;

const getRecentArticlesCached = unstable_cache(
  async (limit: number): Promise<Article[]> => {
    const { listPublishedArticles } = getContainer();
    const { items } = await listPublishedArticles.execute({ limit });
    return toArticleViewModels(items);
  },
  ["public-recent-articles"],
  { tags: ["articles"] },
);

/** Recently published articles, newest first — the homepage derives every section from this one list. */
export async function getRecentArticles(limit = HOMEPAGE_FEED_LIMIT): Promise<Article[]> {
  return getRecentArticlesCached(limit);
}

const getArticleBySlugCached = unstable_cache(
  async (slug: string): Promise<Article | null> => {
    const { getPublishedArticle } = getContainer();
    const record = await getPublishedArticle.execute(slug);
    return record ? toArticleViewModels([record])[0] : null;
  },
  ["public-article-by-slug"],
  { tags: ["articles"] },
);

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  return getArticleBySlugCached(slug);
}

/** Other published articles in the same category, excluding the article itself. */
export async function getRelatedArticles(article: Article, limit = 4): Promise<Article[]> {
  const inCategory = await getArticlesByCategory(article.category.slug, limit + 1);
  return inCategory.filter((a) => a.id !== article.id).slice(0, limit);
}

const getArticlesByCategoryCached = unstable_cache(
  async (categorySlug: string, limit: number | undefined): Promise<Article[]> => {
    const { listPublishedArticles } = getContainer();
    const { items } = await listPublishedArticles.execute({ categorySlug, limit });
    return toArticleViewModels(items);
  },
  ["public-articles-by-category"],
  { tags: ["articles"] },
);

export async function getArticlesByCategory(categorySlug: string, limit?: number): Promise<Article[]> {
  return getArticlesByCategoryCached(categorySlug, limit);
}

const getArticlesByProvinceCached = unstable_cache(
  async (provinceSlug: ProvinceSlug, limit: number | undefined): Promise<Article[]> => {
    const { listPublishedArticles } = getContainer();
    const { items } = await listPublishedArticles.execute({ provinceSlug, limit });
    return toArticleViewModels(items);
  },
  ["public-articles-by-province"],
  { tags: ["articles"] },
);

export async function getArticlesByProvince(
  provinceSlug: ProvinceSlug,
  limit?: number,
): Promise<Article[]> {
  return getArticlesByProvinceCached(provinceSlug, limit);
}

const countArticlesByProvinceCached = unstable_cache(
  async (provinceSlug: ProvinceSlug): Promise<number> => {
    const { listPublishedArticles } = getContainer();
    const { total } = await listPublishedArticles.execute({ provinceSlug, limit: 0 });
    return total;
  },
  ["public-count-articles-by-province"],
  { tags: ["articles"] },
);

export async function countArticlesByProvince(
  provinceSlug: ProvinceSlug,
): Promise<number> {
  return countArticlesByProvinceCached(provinceSlug);
}

/**
 * Articles marked trending by an editor. `isTrending` isn't indexed in
 * `ArticleQuery` — it's a small editorial flag, not a high-cardinality filter
 * worth adding query-layer support for — so this filters the recent feed in
 * memory rather than adding a new capability to the domain port.
 */
export async function getTrendingArticles(limit?: number): Promise<Article[]> {
  const recent = await getRecentArticles();
  const trending = recent.filter((a) => a.isTrending);
  return limit ? trending.slice(0, limit) : trending;
}
