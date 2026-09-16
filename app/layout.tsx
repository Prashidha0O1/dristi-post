import type { Metadata } from "next";
import { mukta, poppins } from "@/lib/fonts";
import { Providers } from "@/lib/provider";
import { BackToTop } from "@/components/BackToTop";
import { siteUrl } from "@/lib/siteUrl";
import { getFooterSettings, getSeoSettings } from "@/lib/publicQueries";
import { SettingsProvider } from "@/lib/settingsContext";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoSettings();
  return {
    metadataBase: new URL(siteUrl()),
    title: seo.home_title_ne || seo.home_title_en || "Dristi Times - Nepal's Trusted News Portal",
    description: seo.home_desc_ne || seo.home_desc_en || "Dristi Times delivers the latest news from Nepal and around the world in Nepali and English.",
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const footerSettings = await getFooterSettings();
  const seoSettings = await getSeoSettings();
  return (
    <html lang="ne" className={`${mukta.variable} ${poppins.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>
          <SettingsProvider footer={footerSettings} seo={seoSettings}>
          {children}
          <BackToTop />
        </SettingsProvider>
          </Providers>
      </body>
    </html>
  );
}
