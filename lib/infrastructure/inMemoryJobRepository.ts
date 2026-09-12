import type { Paginated } from "../domain/article";
import type { JobQuery, JobRecord } from "../domain/job";
import { isExpired } from "../domain/job";
import type { JobRepository } from "../domain/ports";

/**
 * In-memory `JobRepository` — the fallback used when Supabase env vars are
 * absent, and the fake for unit tests. State is per-process and lost on
 * restart; it is not a production store.
 */
export class InMemoryJobRepository implements JobRepository {
  private readonly byId = new Map<string, JobRecord>();

  constructor(seed: readonly JobRecord[] = []) {
    for (const job of seed) this.byId.set(job.id, { ...job });
  }

  async findById(id: string): Promise<JobRecord | null> {
    const found = this.byId.get(id);
    return found ? { ...found } : null;
  }

  async findBySlug(slug: string): Promise<JobRecord | null> {
    for (const job of this.byId.values()) {
      if (job.slug === slug) return { ...job };
    }
    return null;
  }

  async list(query: JobQuery): Promise<Paginated<JobRecord>> {
    const { status, provinceSlug, employmentType, search, activeOnly, limit, offset } = query;
    const needle = search?.trim().toLowerCase();
    const now = new Date();

    let matches = [...this.byId.values()].filter((j) => {
      if (status && j.status !== status) return false;
      if (provinceSlug && j.provinceSlug !== provinceSlug) return false;
      if (employmentType && j.employmentType !== employmentType) return false;
      if (activeOnly && isExpired(j, now)) return false;
      if (needle) {
        const haystack = `${j.title.ne ?? ""} ${j.title.en ?? ""} ${j.company}`.toLowerCase();
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

    return { items: matches.map((j) => ({ ...j })), total };
  }

  async save(job: JobRecord): Promise<void> {
    this.byId.set(job.id, { ...job });
  }

  async delete(id: string): Promise<void> {
    this.byId.delete(id);
  }
}
