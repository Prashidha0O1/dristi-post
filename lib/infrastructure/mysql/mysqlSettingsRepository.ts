import type { FooterSettings, SeoSettings, SettingsRepository } from "../../domain/settings";
import { getPool } from "./pool";
import type { RowDataPacket } from "mysql2/promise";

interface SettingRow extends RowDataPacket {
  setting_key: string;
  payload: any;
}

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

export class MysqlSettingsRepository implements SettingsRepository {
  async getFooterSettings(): Promise<FooterSettings> {
    const [rows] = await getPool().query<SettingRow[]>("SELECT payload FROM site_settings WHERE setting_key = 'footer'");
    if (rows.length === 0) return DEFAULT_FOOTER;
    return rows[0].payload as FooterSettings;
  }

  async getSeoSettings(): Promise<SeoSettings> {
    const [rows] = await getPool().query<SettingRow[]>("SELECT payload FROM site_settings WHERE setting_key = 'seo'");
    if (rows.length === 0) return DEFAULT_SEO;
    return rows[0].payload as SeoSettings;
  }

  async saveFooterSettings(settings: FooterSettings): Promise<void> {
    await getPool().execute(
      "INSERT INTO site_settings (setting_key, payload) VALUES ('footer', ?) ON DUPLICATE KEY UPDATE payload = VALUES(payload)",
      [JSON.stringify(settings)]
    );
  }

  async saveSeoSettings(settings: SeoSettings): Promise<void> {
    await getPool().execute(
      "INSERT INTO site_settings (setting_key, payload) VALUES ('seo', ?) ON DUPLICATE KEY UPDATE payload = VALUES(payload)",
      [JSON.stringify(settings)]
    );
  }
}
