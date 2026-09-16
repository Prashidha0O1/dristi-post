import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

const env = fs.readFileSync(path.join(process.cwd(), '.env'), 'utf-8');
const rawUrl = env.split('\n').find(l => l.startsWith('DATABASE_URL=')).split('=')[1].trim();
const dbUrl = rawUrl.replace(/^["']|["']$/g, '');

async function run() {
  try {
    const db = await mysql.createConnection(dbUrl);
    await db.query(`
      CREATE TABLE IF NOT EXISTS site_settings (
        setting_key VARCHAR(255) PRIMARY KEY,
        payload JSON NOT NULL,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    // Seed initial values for footer so it doesn't break
    const initialFooter = {
      description_ne: "नेपालका समाचार, विचार र उपयोगी जानकारीलाई स्पष्ट र जिम्मेवार ढंगले प्रस्तुत गर्ने डिजिटल न्यूजरुम।",
      description_en: "A digital newsroom presenting Nepal's news, ideas, and useful information with clarity and responsibility.",
      companyRegNo: "123456/080/081",
      mediaRegNo: "6789/080/081",
      email: "ads@dristitimes.com",
      phone: "+977-1-4123456",
      whatsapp: "+977-9800000000",
      socialFacebook: "https://facebook.com/",
      socialX: "https://x.com/",
      socialTiktok: "https://tiktok.com/"
    };
    
    await db.query(`
      INSERT IGNORE INTO site_settings (setting_key, payload) 
      VALUES ('footer', ?)
    `, [JSON.stringify(initialFooter)]);

    const initialSeo = {
      home_title_ne: "दृष्टि टाइम्स | नेपालको भरपर्दो समाचार",
      home_title_en: "Dristi Times | Nepal's Trusted News",
      home_desc_ne: "नेपालका ताजा र विश्वसनीय समाचार...",
      home_desc_en: "Latest and trusted news from Nepal...",
      blog_title_ne: "ब्लग",
      blog_title_en: "Blog",
    };

    await db.query(`
      INSERT IGNORE INTO site_settings (setting_key, payload) 
      VALUES ('seo', ?)
    `, [JSON.stringify(initialSeo)]);

    console.log("Migration successful!");
    process.exit(0);
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
}
run();
