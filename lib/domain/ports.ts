import type {
  ArticleQuery,
  ArticleRecord,
  Paginated,
} from "./article";

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
