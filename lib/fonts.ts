import localFont from "next/font/local";
import { Poppins } from "next/font/google";

export const mukta = localFont({
  src: [
    { path: "../public/font/Mukta-ExtraLight.ttf", weight: "200" },
    { path: "../public/font/Mukta-Light.ttf", weight: "300" },
    { path: "../public/font/Mukta-Regular.ttf", weight: "400" },
    { path: "../public/font/Mukta-Medium.ttf", weight: "500" },
    { path: "../public/font/Mukta-SemiBold.ttf", weight: "600" },
    { path: "../public/font/Mukta-Bold.ttf", weight: "700" },
    { path: "../public/font/Mukta-ExtraBold.ttf", weight: "800" },
  ],
  variable: "--font-mukta",
  display: "swap",
});

export const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});
