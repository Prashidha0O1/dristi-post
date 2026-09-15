import type { Metadata } from "next";
import { mukta, poppins } from "@/lib/fonts";
import { Providers } from "@/lib/provider";
import { BackToTop } from "@/components/BackToTop";
import { siteUrl } from "@/lib/siteUrl";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: "Dristi Times - Nepal's Trusted News Portal",
  description:
    "Dristi Times delivers the latest news from Nepal and around the world in Nepali and English.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ne" className={`${mukta.variable} ${poppins.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>
          {children}
          <BackToTop />
        </Providers>
      </body>
    </html>
  );
}
