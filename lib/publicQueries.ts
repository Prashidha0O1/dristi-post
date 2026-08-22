import type { Article } from "./types";
import type { ProvinceSlug } from "./domain/province";
import { getContainer } from "./container";
import { toArticleViewModels } from "./presenters/articlePresenter";

/**
 * Read-side helpers for the public site.
 *
 * These wrap the application layer and hand back view models, so pages never
 * touch the repository or the domain record shape directly. Because they only
 * read, they are safe to call during `next build` (static generation) as well as
 * at request time.
 */

export async function getArticlesByProvince(
  provinceSlug: ProvinceSlug,
  limit?: number,
): Promise<Article[]> {
  const { listPublishedArticles } = getContainer();
  const { items } = await listPublishedArticles.execute({ provinceSlug, limit });
  return toArticleViewModels(items);
}

export async function countArticlesByProvince(
  provinceSlug: ProvinceSlug,
): Promise<number> {
  const { listPublishedArticles } = getContainer();
  const { total } = await listPublishedArticles.execute({ provinceSlug, limit: 0 });
  return total;
}
