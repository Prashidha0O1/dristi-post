import type { Paginated } from "../domain/article";
import type { AdQuery, AdRecord } from "../domain/ad";
import type { AdRepository } from "../domain/ports";
import type { AdPlacement } from "../adSlots";

/**
 * In-memory `AdRepository` — the fallback when Supabase env vars are absent,
 * and the fake for unit tests. State is per-process and lost on restart; not a
 * production store.
 */
export class InMemoryAdRepository implements AdRepository {
  private readonly byId = new Map<string, AdRecord>();

  constructor(seed: readonly AdRecord[] = []) {
    for (const ad of seed) this.byId.set(ad.id, { ...ad });
  }

  async findById(id: string): Promise<AdRecord | null> {
    const found = this.byId.get(id);
    return found ? { ...found } : null;
  }

  async findActiveByPlacement(placement: AdPlacement): Promise<AdRecord | null> {
    for (const ad of this.byId.values()) {
      if (ad.placement === placement && ad.isActive) return { ...ad };
    }
    return null;
  }

  async list(query: AdQuery): Promise<Paginated<AdRecord>> {
    const { placement, isActive, limit, offset } = query;

    let matches = [...this.byId.values()].filter((a) => {
      if (placement && a.placement !== placement) return false;
      if (isActive !== undefined && a.isActive !== isActive) return false;
      return true;
    });

    // Mirrors the Supabase ordering: active first, then newest.
    matches.sort((a, b) => {
      if (a.isActive !== b.isActive) return a.isActive ? -1 : 1;
      return b.createdAt.localeCompare(a.createdAt);
    });

    const total = matches.length;
    const start = offset ?? 0;
    matches = matches.slice(start, limit === undefined ? undefined : start + limit);

    return { items: matches.map((a) => ({ ...a })), total };
  }

  async save(ad: AdRecord): Promise<void> {
    this.byId.set(ad.id, { ...ad });
  }

  async delete(id: string): Promise<void> {
    this.byId.delete(id);
  }
}
