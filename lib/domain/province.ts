import type { Locale } from "../types";

/**
 * Nepal's seven federal provinces.
 *
 * Kept as a closed union rather than a free string so that adding or renaming a
 * province is a single, type-checked edit — every `switch`/lookup over provinces
 * fails to compile until it handles the new member.
 */
export type ProvinceSlug =
  | "koshi"
  | "madhesh"
  | "bagmati"
  | "gandaki"
  | "lumbini"
  | "karnali"
  | "sudurpashchim";

export interface Province {
  /** Stable identifier used in URLs and persisted records. */
  slug: ProvinceSlug;
  /** Official province number (1–7). */
  number: number;
  name: Record<Locale, string>;
  /** Provincial capital, useful for datelines. */
  capital: Record<Locale, string>;
}

export const provinces: readonly Province[] = [
  {
    slug: "koshi",
    number: 1,
    name: { ne: "कोशी", en: "Koshi" },
    capital: { ne: "विराटनगर", en: "Biratnagar" },
  },
  {
    slug: "madhesh",
    number: 2,
    name: { ne: "मधेश", en: "Madhesh" },
    capital: { ne: "जनकपुर", en: "Janakpur" },
  },
  {
    slug: "bagmati",
    number: 3,
    name: { ne: "बागमती", en: "Bagmati" },
    capital: { ne: "हेटौंडा", en: "Hetauda" },
  },
  {
    slug: "gandaki",
    number: 4,
    name: { ne: "गण्डकी", en: "Gandaki" },
    capital: { ne: "पोखरा", en: "Pokhara" },
  },
  {
    slug: "lumbini",
    number: 5,
    name: { ne: "लुम्बिनी", en: "Lumbini" },
    capital: { ne: "देउखुरी", en: "Deukhuri" },
  },
  {
    slug: "karnali",
    number: 6,
    name: { ne: "कर्णाली", en: "Karnali" },
    capital: { ne: "बीरेन्द्रनगर", en: "Birendranagar" },
  },
  {
    slug: "sudurpashchim",
    number: 7,
    name: { ne: "सुदूरपश्चिम", en: "Sudurpashchim" },
    capital: { ne: "गोदावरी", en: "Godawari" },
  },
] as const;

const bySlug = new Map<string, Province>(provinces.map((p) => [p.slug, p]));

export function findProvince(slug: string): Province | undefined {
  return bySlug.get(slug);
}

export function isProvinceSlug(value: string): value is ProvinceSlug {
  return bySlug.has(value);
}
