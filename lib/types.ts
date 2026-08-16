export type Locale = "ne" | "en";

export interface Article {
  id: string;
  slug: string;
  title: Record<Locale, string>;
  excerpt: Record<Locale, string>;
  content: Record<Locale, string>;
  category: Category;
  author: Author;
  image: string;
  publishedAt: string;
  updatedAt?: string;
  tags: Tag[];
  isFeatured?: boolean;
  isBreaking?: boolean;
  isTrending?: boolean;
  viewCount?: number;
}

export interface Category {
  id: string;
  slug: string;
  name: Record<Locale, string>;
  icon?: string;
  color?: string;
}

export interface Author {
  id: string;
  name: Record<Locale, string>;
  avatar?: string;
  bio?: Record<Locale, string>;
}

export interface Tag {
  id: string;
  slug: string;
  name: Record<Locale, string>;
}

export interface NavItem {
  label: Record<Locale, string>;
  href: string;
  icon?: string;
  isNew?: boolean;
  children?: NavItem[];
}

export interface AdPlacement {
  id: string;
  position: "header" | "sidebar" | "inline" | "footer" | "between-sections";
  image?: string;
  link?: string;
  isActive: boolean;
}

export interface HomepageSection {
  id: string;
  type: "breaking" | "featured" | "latest" | "trending" | "category" | "opinion";
  title: Record<Locale, string>;
  articles: Article[];
  category?: Category;
}
