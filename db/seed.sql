-- ============================================================================
-- Dristi Times — starter seed (FRESH INSTALL ONLY)
-- ============================================================================
-- Run this ONLY if you are starting with an empty database. Do NOT run it if
-- you are importing an existing export from Supabase — that export already
-- carries its own categories/authors with their own ids, and running this too
-- would create duplicates.
--
-- The database joins categories and authors by their own id, and the app
-- resolves the category *slug* to that id when saving an article, so the ids
-- chosen here are internal and can be any unique value. The slugs must match
-- lib/config.ts (the admin category dropdown), which they do.
--
-- An article cannot be saved without a category row (matched by slug) and at
-- least one author row — that is why a brand-new empty database lets you open
-- the "New article" page but not submit it.
-- ============================================================================

INSERT INTO `categories` (`id`, `slug`) VALUES
  ('cat-politics',      'politics'),
  ('cat-society',       'society'),
  ('cat-economy',       'economy'),
  ('cat-education',     'education'),
  ('cat-health',        'health'),
  ('cat-agriculture',   'agriculture'),
  ('cat-science-tech',  'science-tech'),
  ('cat-environment',   'environment'),
  ('cat-law-crime',     'law-crime'),
  ('cat-tourism',       'tourism'),
  ('cat-sports',        'sports'),
  ('cat-entertainment', 'entertainment'),
  ('cat-lifestyle',     'lifestyle'),
  ('cat-opinion',       'opinion'),
  ('cat-interview',     'interview')
ON DUPLICATE KEY UPDATE `slug` = VALUES(`slug`);

-- One starting author so the "New article" form can be submitted. Add more
-- from the DB later, or through an admin authors screen when one exists.
INSERT INTO `authors` (`id`, `nameNe`, `nameEn`) VALUES
  ('author-desk', 'दृष्टि टाइम्स संवाददाता', 'Dristi Times')
ON DUPLICATE KEY UPDATE `nameEn` = VALUES(`nameEn`);
