-- Advertisement slots. Run this in the Supabase SQL Editor.
-- Independent of the articles/jobs migrations; no ordering dependency.
-- Ad images reuse the existing "media" storage bucket, so no storage
-- migration is needed alongside this.

CREATE TYPE "AdPlacement" AS ENUM (
  'HOME_TOP',
  'HOME_MID',
  'HOME_LEAD_RAIL',
  'HOME_LATEST_RAIL',
  'SIDEBAR'
);

CREATE TABLE "ads" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "placement" "AdPlacement" NOT NULL,
  -- Public URL of an upload in the "media" bucket. Never editor-typed: the
  -- admin uploader produces it after validating the image's dimensions
  -- against the slot, so a mis-sized creative can't reach this table.
  "imageUrl" TEXT NOT NULL,
  "linkUrl" TEXT NOT NULL,
  -- Required rather than nullable: it's the alt attribute the public site
  -- renders, so an ad without one is an accessibility defect.
  "altText" TEXT NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

-- One live ad per slot, enforced by the database and not only by the
-- SetAdActive use case. A partial index is what makes this expressible: many
-- dormant creatives may share a placement, but only one may be active.
CREATE UNIQUE INDEX "idx_ads_one_active_per_placement"
  ON "ads" ("placement")
  WHERE "isActive" = true;

-- Matches the public query shape: the live ad for a given slot.
CREATE INDEX "idx_ads_placement_active" ON "ads" ("placement", "isActive");

ALTER TABLE "ads" ENABLE ROW LEVEL SECURITY;

-- Same split as every other table here: anonymous visitors see only what is
-- live, and all writes require a signed-in admin — which is why the repository
-- keeps a separate session-aware client for writes.
CREATE POLICY "Public read active ads" ON "ads"
  FOR SELECT USING ("isActive" = true);

CREATE POLICY "Admin full access ads" ON "ads"
  FOR ALL USING (auth.role() = 'authenticated');
