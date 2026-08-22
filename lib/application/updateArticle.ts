import type { ArticleRecord, ArticleUpdateInput } from "../domain/article";
import type { ArticleRepository, Clock } from "../domain/ports";
import { NotFoundError, validateArticleUpdate } from "./validation";

/** Applies a partial edit to an existing article. */
export class UpdateArticle {
  constructor(
    private readonly articles: ArticleRepository,
    private readonly clock: Clock,
  ) {}

  async execute(id: string, changes: ArticleUpdateInput): Promise<ArticleRecord> {
    validateArticleUpdate(changes);

    const existing = await this.articles.findById(id);
    if (!existing) throw new NotFoundError(`Article "${id}" not found`);

    // The slug is intentionally immutable: it is a published URL, and silently
    // changing it would break inbound links.
    const updated: ArticleRecord = {
      ...existing,
      ...changes,
      updatedAt: this.clock.now().toISOString(),
    };

    await this.articles.save(updated);
    return updated;
  }
}
