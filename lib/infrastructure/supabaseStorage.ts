import { getSupabaseServerClient } from "./supabaseServer";

const BUCKET = "media";
const MAX_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export class UploadError extends Error {}

/**
 * Uploads an admin-supplied image to Supabase Storage and returns its public
 * URL. Used in place of the old free-text "image URL" field — editors upload
 * a file instead of pasting a link, which is also what stopped a page ever
 * pasting a non-image link (an article page, not a photo) and 500ing on
 * render, since a real file always resolves to actual image bytes.
 *
 * Runs through the same session-aware client as article/job writes: the
 * "authenticated" storage policies need the caller's real JWT, not the
 * anon-key client used for public reads.
 */
export async function uploadImage(file: File, folder: "articles" | "jobs"): Promise<string> {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new UploadError("Only JPEG, PNG, WebP or GIF images are allowed.");
  }
  if (file.size > MAX_BYTES) {
    throw new UploadError("Image must be smaller than 5MB.");
  }

  const supabase = await getSupabaseServerClient();
  const ext = file.type.split("/")[1] === "jpeg" ? "jpg" : file.type.split("/")[1];
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
    cacheControl: "31536000", // 1 year — the random filename means a new upload never collides with a cached old one
  });
  if (error) throw new UploadError(error.message);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
