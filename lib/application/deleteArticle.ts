import type { ArticleRepository } from "../domain/ports";
import { NotFoundError } from "./validation";

/** Permanently removes an article. */
export class DeleteArticle {
  constructor(private readonly articles: ArticleRepository) {}

  async execute(id: string): Promise<void> {
    const existing = await this.articles.findById(id);
    if (!existing) throw new NotFoundError(`Article "${id}" not found`);
    await this.articles.delete(id);
  }
}
