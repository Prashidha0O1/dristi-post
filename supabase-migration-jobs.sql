-- Job board. Run this in the Supabase SQL Editor.
-- Independent of supabase-migration-cms-dynamic.sql; either order is fine,
-- except that the "Province" enum must already exist (it's created by
-- supabase-schema.sql, which this project has already run).

CREATE TYPE "JobStatus" AS ENUM ('DRAFT', 'PUBLISHED');
CREATE TYPE "EmploymentType" AS ENUM (
  'FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE'
);

CREATE TABLE "jobs" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "slug" TEXT NOT NULL UNIQUE,
  "titleNe" TEXT NOT NULL,
  "titleEn" TEXT,
  "company" TEXT NOT NULL,
  "location" TEXT NOT NULL,
  "province" "Province",
  "employmentType" "EmploymentType" NOT NULL DEFAULT 'FULL_TIME',
  "descriptionNe" TEXT NOT NULL,
  "descriptionEn" TEXT,
  -- Free text, not numeric: listings quote ranges, "Negotiable", or nothing.
  "salary" TEXT,
  -- DATE, not TIMESTAMPTZ: a deadline is a calendar day, and comparing it as a
  -- timestamp would expire listings partway through their final day depending
  -- on the server's timezone.
  "deadline" DATE,
  "applyUrl" TEXT NOT NULL,
  "status" "JobStatus" NOT NULL DEFAULT 'DRAFT',
  "isFeatured" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "publishedAt" TIMESTAMPTZ,
  PRIMARY KEY ("id")
);

-- Mirrors how the public board queries: published, unexpired, newest first.
CREATE INDEX "idx_jobs_status_published" ON "jobs" ("status", "publishedAt" DESC);
CREATE INDEX "idx_jobs_status_deadline" ON "jobs" ("status", "deadline");
CREATE INDEX "idx_jobs_status_province" ON "jobs" ("status", "province", "publishedAt" DESC);

ALTER TABLE "jobs" ENABLE ROW LEVEL SECURITY;

-- Same split as articles: anon reads published rows only; admin does everything.
CREATE POLICY "Public read published jobs" ON "jobs"
  FOR SELECT USING ("status" = 'PUBLISHED');

CREATE POLICY "Admin full access jobs" ON "jobs"
  FOR ALL USING (auth.role() = 'authenticated');
