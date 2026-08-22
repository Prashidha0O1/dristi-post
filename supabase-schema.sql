-- Dristi Post schema for Supabase
-- Run this in Supabase SQL Editor

-- Enums
CREATE TYPE "ArticleStatus" AS ENUM ('DRAFT', 'PUBLISHED');
CREATE TYPE "Province" AS ENUM ('KOSHI', 'MADHESH', 'BAGMATI', 'GANDAKI', 'LUMBINI', 'KARNALI', 'SUDURPASHCHIM');

-- Authors
CREATE TABLE "authors" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "nameNe" TEXT NOT NULL,
  "nameEn" TEXT,
  "bioNe" TEXT,
  "bioEn" TEXT,
  "avatarUrl" TEXT,
  "authUserId" TEXT UNIQUE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

-- Categories
CREATE TABLE "categories" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "slug" TEXT NOT NULL UNIQUE,
  "nameNe" TEXT NOT NULL,
  "nameEn" TEXT NOT NULL,
  "color" TEXT,
  "position" INT NOT NULL DEFAULT 0,
  PRIMARY KEY ("id")
);

-- Tags
CREATE TABLE "tags" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "slug" TEXT NOT NULL UNIQUE,
  "nameNe" TEXT NOT NULL,
  "nameEn" TEXT,
  PRIMARY KEY ("id")
);

-- Articles
CREATE TABLE "articles" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "slug" TEXT NOT NULL UNIQUE,
  "titleNe" TEXT NOT NULL,
  "titleEn" TEXT,
  "excerptNe" TEXT NOT NULL,
  "excerptEn" TEXT,
  "bodyNe" TEXT NOT NULL,
  "bodyEn" TEXT,
  "imageUrl" TEXT NOT NULL,
  "status" "ArticleStatus" NOT NULL DEFAULT 'DRAFT',
  "province" "Province",
  "categoryId" UUID NOT NULL REFERENCES "categories"("id") ON DELETE RESTRICT,
  "authorId" UUID NOT NULL REFERENCES "authors"("id") ON DELETE RESTRICT,
  "isFeatured" BOOLEAN NOT NULL DEFAULT false,
  "isBreaking" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "publishedAt" TIMESTAMPTZ,
  PRIMARY KEY ("id")
);

-- Article-Tag join table
CREATE TABLE "_ArticleTags" (
  "A" UUID NOT NULL REFERENCES "articles"("id") ON DELETE CASCADE,
  "B" UUID NOT NULL REFERENCES "tags"("id") ON DELETE CASCADE,
  PRIMARY KEY ("A", "B")
);

-- Indexes
CREATE INDEX "idx_articles_status_published" ON "articles" ("status", "publishedAt" DESC);
CREATE INDEX "idx_articles_status_province" ON "articles" ("status", "province", "publishedAt" DESC);
CREATE INDEX "idx_articles_status_category" ON "articles" ("status", "categoryId", "publishedAt" DESC);
CREATE INDEX "idx_article_tags_b" ON "_ArticleTags" ("B");

-- Seed categories (matches lib/config.ts)
INSERT INTO "categories" ("slug", "nameNe", "nameEn", "position") VALUES
  ('politics', 'राजनीति', 'Politics', 1),
  ('finance', 'व्यापार र अर्थ', 'Business and Finance', 2),
  ('sports', 'खेलकुद', 'Sports', 3),
  ('entertainment', 'मनोरञ्जन', 'Entertainment', 4),
  ('technology', 'प्रविधि', 'Technology', 5),
  ('opinion', 'विचार', 'Opinion', 6),
  ('lifestyle', 'जीवनशैली', 'Lifestyle', 7),
  ('international', 'अन्तर्राष्ट्रिय', 'International', 8);

-- Enable RLS (recommended for Supabase)
ALTER TABLE "authors" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "categories" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tags" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "articles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "_ArticleTags" ENABLE ROW LEVEL SECURITY;

-- Public read policies (anon can read published articles)
CREATE POLICY "Public read categories" ON "categories" FOR SELECT USING (true);
CREATE POLICY "Public read tags" ON "tags" FOR SELECT USING (true);
CREATE POLICY "Public read authors" ON "authors" FOR SELECT USING (true);
CREATE POLICY "Public read published articles" ON "articles" FOR SELECT USING ("status" = 'PUBLISHED');
CREATE POLICY "Public read article tags" ON "_ArticleTags" FOR SELECT USING (true);

-- Authenticated full access (for admin)
CREATE POLICY "Admin full access articles" ON "articles" FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access authors" ON "authors" FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access categories" ON "categories" FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access tags" ON "tags" FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access article tags" ON "_ArticleTags" FOR ALL USING (auth.role() = 'authenticated');
