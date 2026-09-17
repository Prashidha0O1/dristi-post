export interface FooterSettings {
  description_ne: string;
  description_en: string;
  companyRegNo: string;
  mediaRegNo: string;
  email: string;
  phone: string;
  whatsapp: string;
  socialFacebook: string;
  socialX: string;
  socialTiktok: string;
}

export interface PageSeoOverride {
  slug: string;
  title_ne: string;
  title_en: string;
  desc_ne: string;
  desc_en: string;
}

export interface SeoSettings {
  home_title_ne: string;
  home_title_en: string;
  home_desc_ne: string;
  home_desc_en: string;
  blog_title_ne: string;
  blog_title_en: string;
  blog_desc_ne: string;
  blog_desc_en: string;
  pageOverrides: PageSeoOverride[];
}

export interface SiteSettings {
  footer: FooterSettings;
  seo: SeoSettings;
}

export interface SettingsRepository {
  getFooterSettings(): Promise<FooterSettings>;
  getSeoSettings(): Promise<SeoSettings>;
  saveFooterSettings(settings: FooterSettings): Promise<void>;
  saveSeoSettings(settings: SeoSettings): Promise<void>;
}
