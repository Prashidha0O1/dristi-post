import type {
  ArticleQuery,
  ArticleRecord,
  Paginated,
} from "../domain/article";
import type { ArticleRepository } from "../domain/ports";

/**
 * In-memory `ArticleRepository`.
 *
 * Two jobs: it is the fake used by unit tests, and it lets the admin UI and the
 * public province filter run end-to-end before a database is chosen. Swapping in
 * a real adapter is a one-line change in the composition root — no use case or
 * component changes — which is the point of depending on the port.
 *
 * State is per-process and therefore lost on restart, and not shared between
 * serverless instances. It is not a production store.
 */
export class InMemoryArticleRepository implements ArticleRepository {
  private readonly byId = new Map<string, ArticleRecord>();

  constructor(seed: readonly ArticleRecord[] = []) {
    for (const article of seed) this.byId.set(article.id, { ...article });
  }

  async findById(id: string): Promise<ArticleRecord | null> {
    const found = this.byId.get(id);
    return found ? { ...found } : null;
  }

  async findBySlug(slug: string): Promise<ArticleRecord | null> {
    for (const article of this.byId.values()) {
      if (article.slug === slug) return { ...article };
    }
    return null;
  }

  async list(query: ArticleQuery): Promise<Paginated<ArticleRecord>> {
    const { status, categorySlug, provinceSlug, search, publishedBefore, onlyDeleted, limit, offset } = query;
    const needle = search?.trim().toLowerCase();

    let matches = [...this.byId.values()].filter((a) => {
      if (onlyDeleted ? !a.deletedAt : !!a.deletedAt) return false;
      if (status && a.status !== status) return false;
      if (categorySlug && a.categorySlug !== categorySlug) return false;
      if (provinceSlug && a.provinceSlug !== provinceSlug) return false;
      if (publishedBefore && a.publishedAt && a.publishedAt > publishedBefore) return false;
      if (needle) {
        const haystack = `${a.title.ne ?? ""} ${a.title.en ?? ""}`.toLowerCase();
        if (!haystack.includes(needle)) return false;
      }
      return true;
    });

    // Newest first, by publish date where available so drafts sort by creation.
    matches.sort((a, b) => {
      const at = a.publishedAt ?? a.createdAt;
      const bt = b.publishedAt ?? b.createdAt;
      return bt.localeCompare(at);
    });

    const total = matches.length;
    const start = offset ?? 0;
    matches = matches.slice(start, limit === undefined ? undefined : start + limit);

    return { items: matches.map((a) => ({ ...a })), total };
  }

  async save(article: ArticleRecord): Promise<void> {
    this.byId.set(article.id, { ...article });
  }

  async softDelete(id: string, at: string): Promise<void> {
    const found = this.byId.get(id);
    if (found) this.byId.set(id, { ...found, deletedAt: at });
  }

  async restore(id: string): Promise<void> {
    const found = this.byId.get(id);
    if (found) this.byId.set(id, { ...found, deletedAt: undefined });
  }

  async purgeDeletedBefore(at: string): Promise<void> {
    for (const [id, a] of this.byId) {
      if (a.deletedAt && a.deletedAt < at) this.byId.delete(id);
    }
  }

  async delete(id: string): Promise<void> {
    this.byId.delete(id);
  }
}
