import type {
  ArticleQuery,
  ArticleRecord,
  Paginated,
} from "./article";
import type { JobQuery, JobRecord } from "./job";
import type { AdQuery, AdRecord } from "./ad";
import type { AdPlacement } from "../adSlots";

/**
 * Ports (in the hexagonal-architecture sense): the interfaces the application
 * layer depends on. Concrete adapters live in `lib/infrastructure` and are wired
 * up in the composition root, so use cases never import a database client,
 * `Date`, or `crypto` directly.
 *
 * These are kept as several narrow interfaces rather than one "services" object
 * so a use case only ever depends on what it actually calls.
 */

export interface ArticleRepository {
  findById(id: string): Promise<ArticleRecord | null>;
  findBySlug(slug: string): Promise<ArticleRecord | null>;
  list(query: ArticleQuery): Promise<Paginated<ArticleRecord>>;
  save(article: ArticleRecord): Promise<void>;
  /** Move to trash (soft delete). */
  softDelete(id: string, at: string): Promise<void>;
  /** Bring back from trash. */
  restore(id: string): Promise<void>;
  /** Permanently remove everything trashed before the given ISO time. */
  purgeDeletedBefore(at: string): Promise<void>;
  /** Permanent, immediate removal. */
  delete(id: string): Promise<void>;
}

/** Same shape as `ArticleRepository`, kept as its own port so a use case that
 * only deals in jobs cannot reach article storage (and vice versa). */
export interface JobRepository {
  findById(id: string): Promise<JobRecord | null>;
  findBySlug(slug: string): Promise<JobRecord | null>;
  list(query: JobQuery): Promise<Paginated<JobRecord>>;
  save(job: JobRecord): Promise<void>;
  delete(id: string): Promise<void>;
}

/**
 * Advertisements. No `findBySlug` — ads have no public page — but a
 * placement-scoped lookup instead, since "the live ad for this slot" is the
 * only question the public site ever asks.
 */
export interface AdRepository {
  findById(id: string): Promise<AdRecord | null>;
  list(query: AdQuery): Promise<Paginated<AdRecord>>;
  /** The single active ad for a slot, or null when the slot is unsold. */
  findActiveByPlacement(placement: AdPlacement): Promise<AdRecord | null>;
  save(ad: AdRecord): Promise<void>;
  delete(id: string): Promise<void>;
}

/** Wall-clock access, injected so use cases stay deterministic under test. */
export interface Clock {
  now(): Date;
}

export interface IdGenerator {
  generate(): string;
}

export interface Slugger {
  /**
   * Turn a title into a URL-safe slug. `isTaken` lets the implementation
   * de-duplicate (e.g. append `-2`) without knowing about the repository.
   */
  slugify(source: string, isTaken: (candidate: string) => Promise<boolean>): Promise<string>;
}
