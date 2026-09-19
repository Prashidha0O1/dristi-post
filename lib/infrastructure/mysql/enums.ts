import type { ArticleStatus } from "@/lib/domain/article";
import type { EmploymentType } from "@/lib/domain/job";
import type { ProvinceSlug } from "@/lib/domain/province";
import type { AdPlacement } from "@/lib/adSlots";

/**
 * Domain <-> database enum mappings.
 *
 * The database keeps the same UPPERCASE values Supabase used (DRAFT, KOSHI,
 * FULL_TIME, HOME_TOP ...), so these mirror the maps that lived in the Supabase
 * repositories — centralised here so the three MySQL adapters share one copy.
 */

export const STATUS_TO_DB: Record<ArticleStatus, string> = { draft: "DRAFT", published: "PUBLISHED" };
export const STATUS_FROM_DB: Record<string, ArticleStatus> = { DRAFT: "draft", PUBLISHED: "published" };

export const PROVINCE_TO_DB: Record<ProvinceSlug, string> = {
  koshi: "KOSHI", madhesh: "MADHESH", bagmati: "BAGMATI", gandaki: "GANDAKI",
  lumbini: "LUMBINI", karnali: "KARNALI", sudurpashchim: "SUDURPASHCHIM",
};
export const PROVINCE_FROM_DB: Record<string, ProvinceSlug> = Object.fromEntries(
  Object.entries(PROVINCE_TO_DB).map(([k, v]) => [v, k]),
) as Record<string, ProvinceSlug>;

export const EMPLOYMENT_TO_DB: Record<EmploymentType, string> = {
  "full-time": "FULL_TIME",
  "part-time": "PART_TIME",
  contract: "CONTRACT",
  internship: "INTERNSHIP",
  freelance: "FREELANCE",
};
export const EMPLOYMENT_FROM_DB: Record<string, EmploymentType> = Object.fromEntries(
  Object.entries(EMPLOYMENT_TO_DB).map(([k, v]) => [v, k]),
) as Record<string, EmploymentType>;

export const PLACEMENT_TO_DB: Record<AdPlacement, string> = {
  "home-top": "HOME_TOP",
  "home-cat-ad-1": "HOME_CAT_AD_1",
  "home-cat-ad-2": "HOME_CAT_AD_2",
  "home-cat-ad-3": "HOME_CAT_AD_3",
  "home-cat-ad-4": "HOME_CAT_AD_4",
  "home-cat-ad-5": "HOME_CAT_AD_5",
  "home-latest-rail": "HOME_LATEST_RAIL",
  sidebar: "SIDEBAR",
};
export const PLACEMENT_FROM_DB: Record<string, AdPlacement> = Object.fromEntries(
  Object.entries(PLACEMENT_TO_DB).map(([k, v]) => [v, k]),
) as Record<string, AdPlacement>;
