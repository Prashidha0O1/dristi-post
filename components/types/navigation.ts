export type Lang = "np" | "en";

export interface NavSection {
  id: string;
  np: string;
  en: string;
  href: string;
  blurb?: string;
}

export interface ProvinceItem {
  id: string;
  np: string;
  en: string;
  href: string;
}

export interface BreakingItem {
  id: string;
  np: string;
  en: string;
  time: string;
}

export interface TrendingItem {
  id: string;
  np: string;
  en: string;
  count: string;
}
