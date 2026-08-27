import type { NavSection, ProvinceItem, BreakingItem, TrendingItem } from "../types/navigation";

export const primarySections: NavSection[] = [
  { id: "home", np: "गृहपृष्ठ", en: "Home", href: "/" },
  { id: "politics", np: "राजनीति", en: "Politics", href: "/category/politics" },
  { id: "economy", np: "अर्थ/वाणिज्य", en: "Economy/Business", href: "/category/economy" },
  { id: "education", np: "शिक्षा", en: "Education", href: "/category/education" },
  { id: "sports", np: "खेलकुद", en: "Sports", href: "/category/sports" },
  { id: "science-tech", np: "विज्ञान र प्रविधि", en: "Science & Tech", href: "/category/science-tech" },
];

export const secondarySections: NavSection[] = [
  { id: "society", np: "समाज", en: "Society", href: "/category/society", blurb: "सामाजिक गतिविधि" },
  { id: "health", np: "स्वास्थ्य", en: "Health", href: "/category/health", blurb: "अस्पताल, नीति र सार्वजनिक स्वास्थ्य" },
  { id: "agriculture", np: "कृषि", en: "Agriculture", href: "/category/agriculture", blurb: "खेतीपाती र किसान" },
  { id: "environment", np: "वातावरण", en: "Environment", href: "/category/environment", blurb: "जलवायु र प्रकृति" },
  { id: "law-crime", np: "कानून र अपराध", en: "Law & Crime", href: "/category/law-crime", blurb: "अदालत र प्रहरी घटना" },
  { id: "tourism", np: "पर्यटन", en: "Tourism", href: "/category/tourism", blurb: "यात्रा र गन्तव्य" },
  { id: "entertainment", np: "मनोरञ्जन", en: "Entertainment", href: "/category/entertainment", blurb: "चलचित्र र संगीत" },
  { id: "lifestyle", np: "जीवनशैली", en: "Lifestyle", href: "/category/lifestyle", blurb: "खाना, यात्रा र सम्बन्ध" },
  { id: "opinion", np: "विचार", en: "Opinion", href: "/category/opinion", blurb: "सम्पादकीय र स्तम्भहरू" },
  { id: "interview", np: "अन्तर्वार्ता", en: "Interview", href: "/category/interview", blurb: "विशेष कुराकानी" },
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

export const breakingItems: BreakingItem[] = [
  { id: "1", np: "सरकारले नयाँ बजेट घोषणा गर्‍यो, शिक्षा र स्वास्थ्यमा ठूलो लगानी", en: "Government announces new budget with major investments in education and health", time: "१२:४५" },
  { id: "2", np: "नेपाली क्रिकेट टोलीले ऐतिहासिक जित हात पार्‍यो", en: "Nepal cricket team achieves historic victory", time: "११:३०" },
  { id: "3", np: "पोखरामा पर्यटन क्षेत्रमा उल्लेख्य वृद्धि", en: "Significant growth in tourism sector in Pokhara", time: "१०:१५" },
];

export const trendingItems: TrendingItem[] = [
  { id: "1", np: "बजेट २०८२", en: "Budget 2082", count: "२.४k" },
  { id: "2", np: "क्रिकेट", en: "Cricket", count: "१.८k" },
  { id: "3", np: "पर्यटन", en: "Tourism", count: "१.२k" },
  { id: "4", np: "डिजिटल भुक्तानी", en: "Digital Payments", count: "९५६" },
];

export const recentSearches: string[] = [
  "बजेट",
  "क्रिकेट",
  "मौसम",
  "शिक्षा",
];
