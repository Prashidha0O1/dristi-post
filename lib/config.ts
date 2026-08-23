import type { Category } from "./types";

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

// Navigation lives in components/data/navigation.ts, which the SiteHeader
// tree consumes. The navItems/categoryNavItems/toolNavItems exports that used
// to sit here were read only by the old Chakra header and went unused when it
// was removed; recover them from git history if that nav shape is needed again.
