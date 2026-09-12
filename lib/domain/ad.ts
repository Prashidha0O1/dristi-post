import type { AdPlacement } from "../adSlots";

/**
 * The persisted shape of an advertisement. Independent of both the storage
 * schema and any view model, mirroring `ArticleRecord` and `JobRecord`.
 *
 * The placement union itself lives in `lib/adSlots.ts` rather than here,
 * because the slot table it belongs to is also needed by Client Components
 * (the uploader's dimension pre-check) and this directory is server-side
 * domain code.
 *
 * No slug: ads have no public page of their own, only a click-through.
 */
export interface AdRecord {
  id: string;
  placement: AdPlacement;
  /** Public URL of the uploaded image, produced by the admin uploader. */
  imageUrl: string;
  /** Where a click goes. Absolute http(s) URL — an advertiser's own site. */
  linkUrl: string;
  /** Required, not optional: it's the alt attribute the frontend renders. */
  altText: string;
  /** Only one ad per placement may be active at a time. */
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Fields an editor supplies when creating an ad. */
export interface NewAdInput {
  placement: AdPlacement;
  imageUrl: string;
  linkUrl: string;
  altText: string;
  /** Go live immediately, taking over the slot, or save it dormant (default). */
  activate?: boolean;
}

/** Every field an editor may change afterwards. */
export type AdUpdateInput = Partial<Omit<NewAdInput, "activate">>;

export interface AdQuery {
  placement?: AdPlacement;
  isActive?: boolean;
  limit?: number;
  offset?: number;
}
