import type { ArticleRecord, ArticleUpdateInput } from "../domain/article";
import type { ArticleRepository, Clock, Slugger } from "../domain/ports";
import { normalizeSlug } from "../domain/article";
import { NotFoundError, validateArticleUpdate } from "./validation";

/** Applies a partial edit to an existing article. */
export class UpdateArticle {
  constructor(
    private readonly articles: ArticleRepository,
    private readonly clock: Clock,
    private readonly slugger: Slugger,
  ) {}

  async execute(id: string, changes: ArticleUpdateInput): Promise<ArticleRecord> {
    validateArticleUpdate(changes);

    const existing = await this.articles.findById(id);
    if (!existing) throw new NotFoundError(`Article "${id}" not found`);

    // The slug is editable, but changing a live URL breaks inbound links — the
    // admin UI warns about that. When a new slug is given, normalise it and keep
    // it unique (ignoring this article's own current slug).
    let slug = existing.slug;
    const wanted = changes.slug?.trim() ? normalizeSlug(changes.slug) : "";
    if (wanted && wanted !== existing.slug) {
      slug = await this.slugger.slugify(wanted, async (candidate) => {
        const found = await this.articles.findBySlug(candidate);
        return found !== null && found.id !== id;
      });
    }

    const updated: ArticleRecord = {
      ...existing,
      ...changes,
      slug, // set after the spread so changes.slug (raw) can't overwrite it
      metaDescription:
        changes.metaDescription !== undefined
          ? changes.metaDescription.trim() || undefined
          : existing.metaDescription,
      updatedAt: this.clock.now().toISOString(),
    };

    // Re-scheduling: a future scheduledAt publishes with a future publishedAt.
    if (changes.scheduledAt !== undefined) {
      const raw = changes.scheduledAt.trim();
      const d = raw ? new Date(raw) : null;
      if (d && !Number.isNaN(d.getTime())) {
        updated.status = "published";
        updated.publishedAt = d.toISOString();
      }
    }

    await this.articles.save(updated);
    return updated;
  }
}
