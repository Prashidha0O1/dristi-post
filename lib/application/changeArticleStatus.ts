import type { ArticleRecord } from "../domain/article";
import type { ArticleRepository, Clock } from "../domain/ports";
import { NotFoundError } from "./validation";

/**
 * Publishes or unpublishes an article.
 *
 * Kept separate from `UpdateArticle` because it is a distinct editorial action
 * with its own rule (`publishedAt` is stamped once, on first publish, and is not
 * overwritten if the article is later unpublished and published again).
 */
export class ChangeArticleStatus {
  constructor(
    private readonly articles: ArticleRepository,
    private readonly clock: Clock,
  ) {}

  async publish(id: string): Promise<ArticleRecord> {
    const article = await this.require(id);
    const updated: ArticleRecord = {
      ...article,
      status: "published",
      publishedAt: article.publishedAt ?? this.clock.now().toISOString(),
      updatedAt: this.clock.now().toISOString(),
    };
    await this.articles.save(updated);
    return updated;
  }

  async unpublish(id: string): Promise<ArticleRecord> {
    const article = await this.require(id);
    const updated: ArticleRecord = {
      ...article,
      status: "draft",
      updatedAt: this.clock.now().toISOString(),
    };
    await this.articles.save(updated);
    return updated;
  }

  private async require(id: string): Promise<ArticleRecord> {
    const article = await this.articles.findById(id);
    if (!article) throw new NotFoundError(`Article "${id}" not found`);
    return article;
  }
}
