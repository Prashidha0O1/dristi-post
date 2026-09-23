import localFont from "next/font/local";
import { Poppins } from "next/font/google";

// Mukta as subset WOFF2 (Devanagari + Latin, all OpenType layout features kept
// for correct conjunct shaping) — ~120 KB per weight vs ~410 KB for the TTFs.
// Only weights the UI actually uses are loaded; 200/300 were never used.
export const mukta = localFont({
  src: [
    { path: "../public/font/Mukta-Regular.woff2", weight: "400" },
    { path: "../public/font/Mukta-Medium.woff2", weight: "500" },
    { path: "../public/font/Mukta-SemiBold.woff2", weight: "600" },
    { path: "../public/font/Mukta-Bold.woff2", weight: "700" },
    { path: "../public/font/Mukta-ExtraBold.woff2", weight: "800" },
  ],
  variable: "--font-mukta",
  display: "swap",
});

// Latin accent font (numbers, labels). Normal style only — italics are rare and
// the browser synthesizes them; weight 300 was unused.
export const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal"],
  variable: "--font-poppins",
  display: "swap",
});
