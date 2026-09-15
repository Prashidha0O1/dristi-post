import type { ArticleRepository, Clock } from "../domain/ports";
import { NotFoundError } from "./validation";

/** Moves an article to trash (soft delete). Purged after a week from Trash. */
export class DeleteArticle {
  constructor(
    private readonly articles: ArticleRepository,
    private readonly clock: Clock,
  ) {}

  async execute(id: string): Promise<void> {
    const existing = await this.articles.findById(id);
    if (!existing) throw new NotFoundError(`Article "${id}" not found`);
    await this.articles.softDelete(id, this.clock.now().toISOString());
  }
}
