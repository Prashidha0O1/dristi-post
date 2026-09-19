/**
 * The fixed set of advertisement positions on the public site, and the image
 * dimensions each one accepts.
 *
 * This module is deliberately free of both the `"use server"` directive and any
 * Supabase import, so it can be pulled into a Client Component. The browser
 * pre-check in `app/admin/ImageUploadField.tsx` and the server enforcement in
 * `lib/infrastructure/fileStorage.ts` both call `describeAdSlotMismatch`,
 * which is the only way to guarantee the two can't drift on either the rule or
 * the exact wording an editor sees.
 */

export type AdPlacement =
  | "home-top"
  | "home-cat-ad-1"
  | "home-cat-ad-2"
  | "home-cat-ad-3"
  | "home-cat-ad-4"
  | "home-cat-ad-5"
  | "home-latest-rail"
  | "sidebar";

export interface AdSlotSpec {
  /** Shown to editors in the admin, e.g. "Homepage — top banner". */
  label: string;
  /** Human description of where it renders, so the admin doesn't need a map of the site. */
  where: string;
  /** The canonical creative size. Drives both the ratio check and the copy. */
  width: number;
  height: number;
  /**
   * Smallest acceptable width. The ratio check alone would pass a 200px-wide
   * leaderboard that then renders blurry across a 1256px column.
   */
  minWidth: number;
}

/**
 * Widths behind these numbers were measured from the real grid definitions, not
 * estimated: content width is `--max-content` 1320px less `--side-pad` 32px on
 * each side = 1256px, and the two rail slots sit in columns of roughly 463px
 * (`minmax(360px, 1fr)` of the 1.65fr hero grid) and 809px (the 1.95fr ledger
 * column) respectively — which is why they take different ratios despite both
 * having been `variant="rectangle"` before.
 *
 * Sizes are standard IAB units so advertisers can supply existing creatives.
 */
export const AD_SLOTS: Record<AdPlacement, AdSlotSpec> = {
  "home-top": {
    label: "Homepage — top banner",
    where: "Full width, above the lead story",
    width: 1200,
    height: 150,
    minWidth: 728,
  },
  "home-cat-ad-1": {
    label: "Homepage — Category Ad 1",
    where: "Full width, after 3 category blocks",
    width: 1200,
    height: 150,
    minWidth: 728,
  },
  "home-cat-ad-2": {
    label: "Homepage — Category Ad 2",
    where: "Full width, after 6 category blocks",
    width: 1200,
    height: 150,
    minWidth: 728,
  },
  "home-cat-ad-3": {
    label: "Homepage — Category Ad 3",
    where: "Full width, after 9 category blocks",
    width: 1200,
    height: 150,
    minWidth: 728,
  },
  "home-cat-ad-4": {
    label: "Homepage — Category Ad 4",
    where: "Full width, after 12 category blocks",
    width: 1200,
    height: 150,
    minWidth: 728,
  },
  "home-cat-ad-5": {
    label: "Homepage — Category Ad 5",
    where: "Full width, after 15 category blocks",
    width: 1200,
    height: 150,
    minWidth: 728,
  },
  "home-latest-rail": {
    label: "Homepage — latest section banner",
    where: "Full width, below the Latest updates section",
    width: 1200,
    height: 150,
    minWidth: 728,
  },
  sidebar: {
    label: "Sidebar",
    where: "Right sidebar on article, category, latest, trending, and the homepage lead section",
    width: 300,
    height: 250,
    minWidth: 300,
  },
};

export const adPlacements = Object.keys(AD_SLOTS) as AdPlacement[];

export function isAdPlacement(value: string): value is AdPlacement {
  return value in AD_SLOTS;
}

/** `1200x150` — used in admin copy and rejection messages. */
export function formatAdSlotSize(placement: AdPlacement): string {
  const spec = AD_SLOTS[placement];
  return `${spec.width}x${spec.height}`;
}

/**
 * Allow 4% either way. Tight enough that a 4:3 image can't pass as a 6:5
 * medium rectangle, loose enough that an export rounded off by a pixel or two
 * isn't rejected for no reason a human would recognise.
 */
const RATIO_TOLERANCE = 0.04;

/**
 * Returns an editor-facing explanation of why this image doesn't suit the slot,
 * or `null` when it fits. Messages name the expected size, because "invalid
 * image" with no target is the kind of error someone retries three times before
 * giving up.
 */
export function describeAdSlotMismatch(
  placement: AdPlacement,
  dimensions: { width: number; height: number },
): string | null {
  const spec = AD_SLOTS[placement];
  const expected = formatAdSlotSize(placement);
  const got = `${dimensions.width}x${dimensions.height}`;

  if (dimensions.width <= 0 || dimensions.height <= 0) {
    return "That image reports a zero width or height, so it can't be used.";
  }

  // Proportions are checked before size on purpose. When both are wrong — a
  // 300x250 logo dropped into an 8:1 banner — reporting only the width sends
  // the editor off to upscale an image whose shape will be rejected anyway.
  // The shape is the more fundamental mismatch, so it's what gets named.
  const target = spec.width / spec.height;
  const actual = dimensions.width / dimensions.height;
  if (Math.abs(actual - target) / target > RATIO_TOLERANCE) {
    return `The ${spec.label} slot is ${expected}, so the image needs those proportions. This one is ${got}, which would be cropped or letterboxed.`;
  }

  if (dimensions.width < spec.minWidth) {
    return `The ${spec.label} slot needs an image at least ${spec.minWidth}px wide — ${expected} is ideal. This one is only ${got}.`;
  }

  return null;
}
