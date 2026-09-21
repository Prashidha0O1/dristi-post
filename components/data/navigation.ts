import type { NavSection, ProvinceItem } from "../types/navigation";

export const primarySections: NavSection[] = [
  { id: "home", np: "गृहपृष्ठ", en: "Home", href: "/" },
  { id: "politics", np: "राजनीति", en: "Politics", href: "/politics" },
  { id: "economy", np: "अर्थ/वाणिज्य", en: "Economy/Business", href: "/economy" },
  { id: "education", np: "शिक्षा", en: "Education", href: "/education" },
  { id: "sports", np: "खेलकुद", en: "Sports", href: "/sports" },
  { id: "science-tech", np: "विज्ञान र प्रविधि", en: "Science & Tech", href: "/science-tech" },
  { id: "blog", np: "ब्लग", en: "Blog", href: "/blog" },
  { id: "jobs", np: "रोजगार", en: "Jobs", href: "/jobs" },
  { id: "tools", np: "उपकरणहरू", en: "Tools", href: "/tools" },
];

export const secondarySections: NavSection[] = [
  { id: "society", np: "समाज", en: "Society", href: "/society", blurb: "सामाजिक गतिविधि" },
  { id: "health", np: "स्वास्थ्य", en: "Health", href: "/health", blurb: "अस्पताल, नीति र सार्वजनिक स्वास्थ्य" },
  { id: "agriculture", np: "कृषि", en: "Agriculture", href: "/agriculture", blurb: "खेतीपाती र किसान" },
  { id: "international", np: "अन्तर्राष्ट्रिय", en: "International", href: "/international", blurb: "विश्वभरका खबर" },
  { id: "law-crime", np: "कानून र अपराध", en: "Law & Crime", href: "/law-crime", blurb: "अदालत र प्रहरी घटना" },
  { id: "tourism", np: "पर्यटन", en: "Tourism", href: "/tourism", blurb: "यात्रा र गन्तव्य" },
  { id: "entertainment", np: "मनोरञ्जन", en: "Entertainment", href: "/entertainment", blurb: "चलचित्र र संगीत" },
  { id: "lifestyle", np: "जीवनशैली", en: "Lifestyle", href: "/lifestyle", blurb: "खाना, यात्रा र सम्बन्ध" },
  { id: "interview", np: "अन्तर्वार्ता", en: "Interview", href: "/interview", blurb: "विशेष कुराकानी" },
];

export const provinces: ProvinceItem[] = [
  { id: "koshi", np: "कोशी", en: "Koshi", href: "/province/koshi" },
  { id: "madhesh", np: "मधेश", en: "Madhesh", href: "/province/madhesh" },
  { id: "bagmati", np: "बागमती", en: "Bagmati", href: "/province/bagmati" },
  { id: "gandaki", np: "गण्डकी", en: "Gandaki", href: "/province/gandaki" },
  { id: "lumbini", np: "लुम्बिनी", en: "Lumbini", href: "/province/lumbini" },
  { id: "karnali", np: "कर्णाली", en: "Karnali", href: "/province/karnali" },
  { id: "sudurpashchim", np: "सुदूरपश्चिम", en: "Sudurpashchim", href: "/province/sudurpashchim" },
];

// Breaking/trending/recent-search placeholders were removed: the header ticker
// now pulls real articles from /api/headlines and the search panel links to
// real category pages instead of showing fabricated data.
