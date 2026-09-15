import type { ArticleQuery, ArticleRecord, Paginated } from "../domain/article";
import type { ArticleRepository } from "../domain/ports";

/** Lists articles for the admin console, where drafts are visible. */
export class ListArticles {
  constructor(private readonly articles: ArticleRepository) {}

  execute(query: ArticleQuery = {}): Promise<Paginated<ArticleRecord>> {
    return this.articles.list(query);
  }
}

/**
 * Lists articles for the public site.
 *
 * A separate use case rather than a flag on `ListArticles` so that the public
 * path cannot be made to leak drafts: the status filter is forced here and is
 * not part of the caller's query.
 */
export class ListPublishedArticles {
  constructor(private readonly articles: ArticleRepository) {}

  execute(query: Omit<ArticleQuery, "status"> = {}): Promise<Paginated<ArticleRecord>> {
    // Force status + hide scheduled (future publishedAt) and trashed articles.
    return this.articles.list({
      ...query,
      status: "published",
      publishedBefore: new Date().toISOString(),
    });
  }
}

/** Fetches one published article by slug, for the public article page. */
export class GetPublishedArticle {
  constructor(private readonly articles: ArticleRepository) {}

  async execute(slug: string): Promise<ArticleRecord | null> {
    const article = await this.articles.findBySlug(slug);
    if (!article || article.status !== "published" || article.deletedAt) return null;
    // Scheduled (future publishedAt) or trashed articles are not public yet.
    if (article.publishedAt && new Date(article.publishedAt) > new Date()) return null;
    return article;
  }
}
