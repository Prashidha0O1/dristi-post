import type { Article } from "./types";
import { categories } from "./config";
import { authors } from "./authors";

function hoursAgo(h: number): string {
  const base = new Date("2026-08-16T12:00:00Z");
  base.setTime(base.getTime() - h * 3600000);
  return base.toISOString();
}

export const mockArticles: Article[] = [
  {
    id: "1",
    slug: "nepal-budget-announcement",
    title: {
      ne: "सरकारले नयाँ बजेट घोषणा गर्यो, शिक्षा र स्वास्थ्यमा ठूलो लगानी",
      en: "Government Announces New Budget with Major Investment in Education and Health",
    },
    excerpt: {
      ne: "अर्थमन्त्रीले आज संसदमा नयाँ आर्थिक वर्षको बजेट प्रस्तुत गरे। शिक्षा र स्वास्थ्य क्षेत्रमा विशेष जोड दिइएको छ।",
      en: "The Finance Minister presented the new fiscal year budget in Parliament today, with special emphasis on education and health sectors.",
    },
    content: { ne: "", en: "" },
    category: categories[0],
    author: authors[0],
    image: "https://picsum.photos/seed/news1/800/500",
    publishedAt: hoursAgo(1),
    tags: [{ id: "t1", slug: "budget", name: { ne: "बजेट", en: "Budget" } }],
    isFeatured: true,
    isBreaking: true,
  },
  {
    id: "2",
    slug: "nepal-cricket-victory",
    title: {
      ne: "नेपाली क्रिकेट टोलीले ऐतिहासिक जित हात पार्यो",
      en: "Nepal Cricket Team Secures Historic Victory",
    },
    excerpt: {
      ne: "नेपालले आज एक रोमाञ्चक खेलमा विजय हासिल गर्दै इतिहास रच्यो। कप्तानको शानदार प्रदर्शन।",
      en: "Nepal made history with an exciting victory today. The captain delivered a brilliant performance.",
    },
    content: { ne: "", en: "" },
    category: categories[2],
    author: authors[2],
    image: "https://picsum.photos/seed/news2/800/500",
    publishedAt: hoursAgo(2),
    tags: [{ id: "t2", slug: "cricket", name: { ne: "क्रिकेट", en: "Cricket" } }],
    isFeatured: true,
    isTrending: true,
  },
  {
    id: "3",
    slug: "tech-startup-kathmandu",
    title: {
      ne: "काठमाडौंमा नयाँ प्रविधि स्टार्टअपले लगानी आकर्षित गर्यो",
      en: "New Tech Startup in Kathmandu Attracts Major Investment",
    },
    excerpt: {
      ne: "काठमाडौं उपत्यकामा सञ्चालित एक प्रविधि स्टार्टअपले अन्तर्राष्ट्रिय लगानीकर्ताबाट ठूलो रकम प्राप्त गरेको छ।",
      en: "A tech startup operating in Kathmandu Valley has secured significant funding from international investors.",
    },
    content: { ne: "", en: "" },
    category: categories[4],
    author: authors[1],
    image: "https://picsum.photos/seed/news3/800/500",
    publishedAt: hoursAgo(3),
    tags: [{ id: "t3", slug: "startup", name: { ne: "स्टार्टअप", en: "Startup" } }],
    isTrending: true,
  },
  {
    id: "4",
    slug: "tourism-boost-pokhara",
    title: {
      ne: "पोखरामा पर्यटन क्षेत्रमा उल्लेख्य वृद्धि",
      en: "Significant Growth in Pokhara's Tourism Sector",
    },
    excerpt: {
      ne: "पोखरा अन्तर्राष्ट्रिय विमानस्थल सञ्चालनपछि पर्यटक आगमनमा उल्लेख्य वृद्धि भएको छ।",
      en: "Tourist arrivals have increased significantly since the operation of Pokhara International Airport.",
    },
    content: { ne: "", en: "" },
    category: categories[1],
    author: authors[3],
    image: "https://picsum.photos/seed/news4/800/500",
    publishedAt: hoursAgo(4),
    tags: [{ id: "t4", slug: "tourism", name: { ne: "पर्यटन", en: "Tourism" } }],
    isFeatured: true,
  },
  {
    id: "5",
    slug: "health-campaign-rural",
    title: {
      ne: "ग्रामीण क्षेत्रमा स्वास्थ्य सचेतना अभियान सुरु",
      en: "Health Awareness Campaign Launched in Rural Areas",
    },
    excerpt: {
      ne: "स्वास्थ्य मन्त्रालयले ग्रामीण क्षेत्रमा व्यापक स्वास्थ्य सचेतना अभियान सुरु गरेको छ।",
      en: "The Ministry of Health has launched a comprehensive health awareness campaign in rural areas.",
    },
    content: { ne: "", en: "" },
    category: categories[6],
    author: authors[1],
    image: "https://picsum.photos/seed/news5/800/500",
    publishedAt: hoursAgo(5),
    tags: [{ id: "t5", slug: "health", name: { ne: "स्वास्थ्य", en: "Health" } }],
  },
  {
    id: "6",
    slug: "film-award-nepali",
    title: {
      ne: "नेपाली चलचित्रले अन्तर्राष्ट्रिय पुरस्कार जित्यो",
      en: "Nepali Film Wins International Award",
    },
    excerpt: {
      ne: "नेपाली चलचित्रले प्रतिष्ठित अन्तर्राष्ट्रिय चलचित्र महोत्सवमा पुरस्कार जितेको छ।",
      en: "A Nepali film has won an award at a prestigious international film festival.",
    },
    content: { ne: "", en: "" },
    category: categories[3],
    author: authors[3],
    image: "https://picsum.photos/seed/news6/800/500",
    publishedAt: hoursAgo(6),
    tags: [{ id: "t6", slug: "cinema", name: { ne: "चलचित्र", en: "Cinema" } }],
    isTrending: true,
  },
  {
    id: "7",
    slug: "earthquake-preparedness",
    title: {
      ne: "भूकम्प तयारी अभियानमा सरकारले नयाँ नीति ल्यायो",
      en: "Government Introduces New Earthquake Preparedness Policy",
    },
    excerpt: {
      ne: "भूकम्पको जोखिम कम गर्न सरकारले नयाँ तयारी नीति तथा कार्ययोजना सार्वजनिक गरेको छ।",
      en: "The government has released a new preparedness policy and action plan to reduce earthquake risks.",
    },
    content: { ne: "", en: "" },
    category: categories[0],
    author: authors[0],
    image: "https://picsum.photos/seed/news7/800/500",
    publishedAt: hoursAgo(8),
    tags: [{ id: "t7", slug: "disaster", name: { ne: "विपद्", en: "Disaster" } }],
  },
  {
    id: "8",
    slug: "stock-market-surge",
    title: {
      ne: "शेयर बजारमा उल्लेख्य उछाल, लगानीकर्ता उत्साहित",
      en: "Stock Market Surges, Investors Optimistic",
    },
    excerpt: {
      ne: "नेप्से परिसूचकमा उल्लेख्य वृद्धि भएको छ। लगानीकर्ताहरू बजारको भविष्यप्रति आशावादी छन्।",
      en: "NEPSE index has seen a significant rise. Investors are optimistic about the market's future.",
    },
    content: { ne: "", en: "" },
    category: categories[1],
    author: authors[2],
    image: "https://picsum.photos/seed/news8/800/500",
    publishedAt: hoursAgo(3.5),
    tags: [{ id: "t8", slug: "stock", name: { ne: "शेयर", en: "Stock" } }],
    isTrending: true,
  },
  {
    id: "9",
    slug: "education-reform-bill",
    title: {
      ne: "शिक्षा सुधार विधेयक संसदमा पेश",
      en: "Education Reform Bill Presented in Parliament",
    },
    excerpt: {
      ne: "शिक्षा मन्त्रालयले तयार पारेको शिक्षा सुधार विधेयक आज संसदमा पेश गरिएको छ।",
      en: "The Education Reform Bill prepared by the Ministry of Education was presented in Parliament today.",
    },
    content: { ne: "", en: "" },
    category: categories[9],
    author: authors[1],
    image: "https://picsum.photos/seed/news9/800/500",
    publishedAt: hoursAgo(10),
    tags: [{ id: "t9", slug: "education", name: { ne: "शिक्षा", en: "Education" } }],
  },
  {
    id: "10",
    slug: "world-climate-summit",
    title: {
      ne: "विश्व जलवायु सम्मेलनमा नेपालको सहभागिता",
      en: "Nepal's Participation in World Climate Summit",
    },
    excerpt: {
      ne: "नेपालले विश्व जलवायु सम्मेलनमा जलवायु परिवर्तनका कारण हिमाली क्षेत्रमा पर्ने प्रभावबारे प्रस्तुति दिएको छ।",
      en: "Nepal presented on the impacts of climate change in mountainous regions at the World Climate Summit.",
    },
    content: { ne: "", en: "" },
    category: categories[7],
    author: authors[0],
    image: "https://picsum.photos/seed/news10/800/500",
    publishedAt: hoursAgo(12),
    tags: [{ id: "t10", slug: "climate", name: { ne: "जलवायु", en: "Climate" } }],
  },
  {
    id: "11",
    slug: "lifestyle-modern-kathmandu",
    title: {
      ne: "आधुनिक काठमाडौंको बदलिँदो जीवनशैली",
      en: "The Changing Lifestyle of Modern Kathmandu",
    },
    excerpt: {
      ne: "काठमाडौंको जीवनशैलीमा पछिल्ला वर्षहरूमा ठूलो परिवर्तन आएको छ। युवा पुस्ताको बानीबेहोरामा उल्लेख्य फरक।",
      en: "Kathmandu's lifestyle has undergone major changes in recent years. Notable differences in youth habits.",
    },
    content: { ne: "", en: "" },
    category: categories[5],
    author: authors[3],
    image: "https://picsum.photos/seed/news11/800/500",
    publishedAt: hoursAgo(7),
    tags: [{ id: "t11", slug: "lifestyle", name: { ne: "जीवनशैली", en: "Lifestyle" } }],
  },
  {
    id: "12",
    slug: "opinion-democracy-challenges",
    title: {
      ne: "लोकतन्त्रका चुनौतीहरू र अगाडिको बाटो",
      en: "Challenges of Democracy and the Way Forward",
    },
    excerpt: {
      ne: "नेपालको लोकतान्त्रिक यात्रामा अझै धेरै चुनौतीहरू छन्। तर आशाका किरणहरू पनि देखिन्छन्।",
      en: "Nepal's democratic journey still faces many challenges. But rays of hope are visible too.",
    },
    content: { ne: "", en: "" },
    category: categories[8],
    author: authors[0],
    image: "https://picsum.photos/seed/news12/800/500",
    publishedAt: hoursAgo(9),
    tags: [{ id: "t12", slug: "democracy", name: { ne: "लोकतन्त्र", en: "Democracy" } }],
  },
];

export function getFeaturedArticles(): Article[] {
  return mockArticles.filter((a) => a.isFeatured);
}

export function getBreakingArticles(): Article[] {
  return mockArticles.filter((a) => a.isBreaking);
}

export function getTrendingArticles(): Article[] {
  return mockArticles.filter((a) => a.isTrending);
}

export function getLatestArticles(): Article[] {
  return [...mockArticles].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}

export function getArticlesByCategory(categorySlug: string): Article[] {
  return mockArticles.filter((a) => a.category.slug === categorySlug);
}

export function getArticleBySlug(slug: string): Article | undefined {
  return mockArticles.find((a) => a.slug === slug);
}

export function getRelatedArticles(article: Article, limit = 4): Article[] {
  return mockArticles
    .filter((a) => a.id !== article.id && a.category.slug === article.category.slug)
    .slice(0, limit);
}
