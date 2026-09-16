import type { Paginated } from "../domain/article";
import type { BlogQuery, BlogRecord } from "../domain/blog";
import type { BlogRepository } from "../domain/ports";

/**
 * In-memory `BlogRepository` — the fallback used when the database env vars are
 * absent, and the fake for unit tests. State is per-process and lost on
 * restart; not a production store.
 */
export class InMemoryBlogRepository implements BlogRepository {
  private readonly byId = new Map<string, BlogRecord>();

  constructor(seed: readonly BlogRecord[] = []) {
    for (const blog of seed) this.byId.set(blog.id, { ...blog });
  }

  async findById(id: string): Promise<BlogRecord | null> {
    const found = this.byId.get(id);
    return found ? { ...found } : null;
  }

  async findBySlug(slug: string): Promise<BlogRecord | null> {
    for (const blog of this.byId.values()) {
      if (blog.slug === slug) return { ...blog };
    }
    return null;
  }

  async list(query: BlogQuery): Promise<Paginated<BlogRecord>> {
    const { status, search, limit, offset } = query;
    const needle = search?.trim().toLowerCase();

    let matches = [...this.byId.values()].filter((b) => {
      if (status && b.status !== status) return false;
      if (needle) {
        const haystack = `${b.title.ne ?? ""} ${b.title.en ?? ""}`.toLowerCase();
        if (!haystack.includes(needle)) return false;
      }
      return true;
    });

    matches.sort((a, b) => {
      const at = a.publishedAt ?? a.createdAt;
      const bt = b.publishedAt ?? b.createdAt;
      return bt.localeCompare(at);
    });

    const total = matches.length;
    const start = offset ?? 0;
    matches = matches.slice(start, limit === undefined ? undefined : start + limit);

    return { items: matches.map((b) => ({ ...b })), total };
  }

  async save(blog: BlogRecord): Promise<void> {
    this.byId.set(blog.id, { ...blog });
  }

  async delete(id: string): Promise<void> {
    this.byId.delete(id);
  }
}
