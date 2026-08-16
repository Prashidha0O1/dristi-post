import type { Metadata } from "next";
import { mukta, poppins } from "@/lib/fonts";
import { Providers } from "@/lib/provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dristi Post - Nepal's Trusted News Portal",
  description:
    "Dristi Post delivers the latest news from Nepal and around the world in Nepali and English.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ne" className={`${mukta.variable} ${poppins.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
