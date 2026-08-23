import type { Category, NavItem } from "./types";

export const categories: Category[] = [
  { id: "1", slug: "politics", name: { ne: "राजनीति", en: "Politics" }, color: "#dc2626" },
  { id: "2", slug: "business", name: { ne: "व्यापार र अर्थ", en: "Business and Finance" }, color: "#2563eb" },
  { id: "3", slug: "sports", name: { ne: "खेलकुद", en: "Sports" }, color: "#16a34a" },
  { id: "4", slug: "entertainment", name: { ne: "मनोरन्जन", en: "Entertainment" }, color: "#9333ea" },
  { id: "5", slug: "technology", name: { ne: "प्रविधि", en: "Technology" }, color: "#0891b2" },
  { id: "6", slug: "lifestyle", name: { ne: "जीवनशैली", en: "Lifestyle" }, color: "#ea580c" },
  { id: "7", slug: "health", name: { ne: "स्वास्थ्य", en: "Health" }, color: "#059669" },
  { id: "8", slug: "world", name: { ne: "विश्व", en: "World" }, color: "#4f46e5" },
  { id: "9", slug: "opinion", name: { ne: "विचार", en: "Opinion" }, color: "#b45309" },
  { id: "10", slug: "education", name: { ne: "शिक्षा", en: "Education" }, color: "#0d9488" },
];

export const navItems: NavItem[] = [
  { label: { ne: "गृहपृष्ठ", en: "Home" }, href: "/" },
  {
    label: { ne: "विषयवस्तु", en: "Categories" },
    href: "/category/politics",
    children: [
      { label: { ne: "राजनीति", en: "Politics" }, href: "/category/politics" },
      { label: { ne: "व्यापार र अर्थ", en: "Business & Finance" }, href: "/category/business" },
      { label: { ne: "खेलकुद", en: "Sports" }, href: "/category/sports" },
      { label: { ne: "मनोरन्जन", en: "Entertainment" }, href: "/category/entertainment" },
      { label: { ne: "प्रविधि", en: "Technology" }, href: "/category/technology" },
      { label: { ne: "जीवनशैली", en: "Lifestyle" }, href: "/category/lifestyle" },
      { label: { ne: "स्वास्थ्य", en: "Health" }, href: "/category/health" },
      { label: { ne: "विश्व", en: "World" }, href: "/category/world" },
      { label: { ne: "विचार", en: "Opinion" }, href: "/category/opinion" },
    ],
  },
  { label: { ne: "राशिफल", en: "Rashifal" }, href: "/rashifal" },
  { label: { ne: "पात्रो", en: "Calendar" }, href: "/calendar" },
  { label: { ne: "ब्लग", en: "Blog" }, href: "/blog" },
  {
    label: { ne: "उपकरण", en: "Tools" },
    href: "/date-converter",
    children: [
      { label: { ne: "मिति रूपान्तरक", en: "Date Converter" }, href: "/date-converter" },
      { label: { ne: "युनिकोड → प्रिती", en: "Unicode → Preeti" }, href: "/unicode-preeti" },
    ],
  },
];

export const toolNavItems: NavItem[] =
  navItems.find((item) => item.label.en === "Tools")?.children ?? [];

export const categoryNavItems: NavItem[] =
  navItems.find((item) => item.label.en === "Categories")?.children ?? [];
