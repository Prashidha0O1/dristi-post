-- Image upload storage. Run this in the Supabase SQL Editor.
-- Creates the "media" bucket the admin's image upload field writes to
-- (lib/infrastructure/supabaseStorage.ts) and its access policies.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media',
  'media',
  true, -- public read: uploaded images need to render on the public site with no auth
  5242880, -- 5MB, matches the check already enforced in supabaseStorage.ts
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Same split as every other table in this project: anyone can read, only a
-- signed-in admin can write. Scoped to this one bucket via the WHERE clause,
-- not to storage.objects as a whole, so this can't be broadened by adding an
-- unrelated bucket later without a matching policy.
CREATE POLICY "Public read media" ON storage.objects
  FOR SELECT USING (bucket_id = 'media');

CREATE POLICY "Admin upload media" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'media' AND auth.role() = 'authenticated');

CREATE POLICY "Admin update media" ON storage.objects
  FOR UPDATE USING (bucket_id = 'media' AND auth.role() = 'authenticated');

CREATE POLICY "Admin delete media" ON storage.objects
  FOR DELETE USING (bucket_id = 'media' AND auth.role() = 'authenticated');
