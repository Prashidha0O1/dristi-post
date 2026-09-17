import type { FooterSettings, SeoSettings, SettingsRepository } from "../domain/settings";

const DEFAULT_FOOTER: FooterSettings = {
  description_ne: "नेपालका समाचार, विचार र उपयोगी जानकारीलाई स्पष्ट र जिम्मेवार ढंगले प्रस्तुत गर्ने डिजिटल न्यूजरुम।",
  description_en: "A digital newsroom presenting Nepal's news, ideas, and useful information with clarity and responsibility.",
  companyRegNo: "",
  mediaRegNo: "",
  email: "",
  phone: "",
  whatsapp: "",
  socialFacebook: "",
  socialX: "",
  socialTiktok: ""
};

const DEFAULT_SEO: SeoSettings = {
  home_title_ne: "दृष्टि टाइम्स | नेपालको भरपर्दो समाचार",
  home_title_en: "Dristi Times | Nepal's Trusted News",
  home_desc_ne: "",
  home_desc_en: "",
  blog_title_ne: "ब्लग",
  blog_title_en: "Blog",
  blog_desc_ne: "",
  blog_desc_en: "",
  pageOverrides: [],
};

export class InMemorySettingsRepository implements SettingsRepository {
  private footer = { ...DEFAULT_FOOTER };
  private seo = { ...DEFAULT_SEO };

  async getFooterSettings(): Promise<FooterSettings> {
    return { ...this.footer };
  }
  async getSeoSettings(): Promise<SeoSettings> {
    return { ...this.seo };
  }
  async saveFooterSettings(settings: FooterSettings): Promise<void> {
    this.footer = { ...settings };
  }
  async saveSeoSettings(settings: SeoSettings): Promise<void> {
    this.seo = { ...settings };
  }
}
