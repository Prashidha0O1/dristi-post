import type { ArticleQuery, ArticleRecord, Paginated } from "../domain/article";
import type { ArticleRepository, Clock } from "../domain/ports";
import { NotFoundError } from "./validation";

const TRASH_RETENTION_DAYS = 7;

/** Lists trashed articles, purging any that have been in the bin over a week. */
export class ListTrashedArticles {
  constructor(
    private readonly articles: ArticleRepository,
    private readonly clock: Clock,
  ) {}

  async execute(query: Omit<ArticleQuery, "onlyDeleted"> = {}): Promise<Paginated<ArticleRecord>> {
    const cutoff = new Date(this.clock.now().getTime() - TRASH_RETENTION_DAYS * 24 * 60 * 60 * 1000);
    // Auto-purge on view: anything trashed before the cutoff is gone for good.
    await this.articles.purgeDeletedBefore(cutoff.toISOString());
    return this.articles.list({ ...query, onlyDeleted: true, limit: query.limit ?? 100 });
  }
}

/** Brings a trashed article back. */
export class RestoreArticle {
  constructor(private readonly articles: ArticleRepository) {}

  async execute(id: string): Promise<void> {
    const existing = await this.articles.findById(id);
    if (!existing) throw new NotFoundError(`Article "${id}" not found`);
    await this.articles.restore(id);
  }
}

/** Permanently deletes an article (from the trash, or directly). */
export class DeleteArticleForever {
  constructor(private readonly articles: ArticleRepository) {}

  async execute(id: string): Promise<void> {
    await this.articles.delete(id);
  }
}
