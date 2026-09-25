import type { LocalisedText } from "./article";

export type BlogStatus = "draft" | "published";

/**
 * The persisted shape of a blog post. A blog is a standalone long-form page
 * (unlike an article, it has no category/author/province taxonomy) — just a
 * title, a hero image, and a body. Kept independent of storage and view
 * models, mirroring `ArticleRecord`.
 */
export interface BlogRecord {
  id: string;
  slug: string;
  title: LocalisedText;
  /** Short summary shown on the card and in search results. Optional. */
  excerpt: LocalisedText;
  /** Optional SEO meta description (falls back to excerpt). */
  metaDescription?: LocalisedText;
  /** Hero image URL — an absolute URL or a site-relative /uploads path. */
  heroImage: string;
  heroImageAlt?: string;
  /** Rich-text HTML body (same editor as articles). */
  body: LocalisedText;
  status: BlogStatus;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  isFeatured?: boolean;
  /** Set when moved to Trash; purged after 7 days. */
  deletedAt?: string;
}

/** Fields an editor supplies when creating a post. */
export interface NewBlogInput {
  title: LocalisedText;
  excerpt?: LocalisedText;
  metaDescription?: LocalisedText;
  heroImage: string;
  heroImageAlt?: string;
  body: LocalisedText;
  /** Optional hand-typed slug; auto-generated from the title when blank. */
  slug?: string;
  /** Publish immediately, or leave as a draft (the default). */
  publish?: boolean;
  isFeatured?: boolean;
}

/** Every field an editor is allowed to change after creation. */
export type BlogUpdateInput = Partial<NewBlogInput>;

export interface BlogQuery {
  status?: BlogStatus;
  /** Free-text match against the Nepali and English titles. */
  search?: string;
  /** Trash view: return only trashed posts (default hides them). */
  onlyDeleted?: boolean;
  limit?: number;
  offset?: number;
}
