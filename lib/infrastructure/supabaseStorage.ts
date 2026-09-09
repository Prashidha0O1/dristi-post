import { getSupabaseServerClient } from "./supabaseServer";
import { readImageDimensions } from "./imageDimensions";
import { describeAdSlotMismatch, type AdPlacement } from "../adSlots";

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
export async function uploadImage(
  file: File,
  folder: "articles" | "jobs" | "ads",
): Promise<string> {
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

/**
 * Rejects an ad image that doesn't suit the slot it's destined for, before it
 * is uploaded. Ad slots render at fixed proportions, so a mis-sized creative
 * doesn't just look slightly off — it letterboxes or crops, on every page the
 * slot appears on.
 *
 * Fails **closed** when the header can't be read: all four allowed types carry
 * their dimensions in the opening bytes, so an unparseable buffer means either
 * a corrupt file or a lie about `file.type` — and `file.type` is supplied by
 * the browser, so it is not something to trust. Failing open would make this
 * whole check bypassable by simply mislabelling the upload. As a side benefit
 * the parse is real content sniffing, which the mime-string check is not.
 *
 * Call this *after* the size check in `uploadImage`'s caller so an oversized
 * file is rejected without being buffered into memory first.
 */
export async function assertAdImageFitsSlot(
  file: File,
  placement: AdPlacement,
): Promise<void> {
  if (file.size > MAX_BYTES) {
    throw new UploadError("Image must be smaller than 5MB.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const dimensions = readImageDimensions(buffer);

  if (!dimensions) {
    throw new UploadError(
      "That file couldn't be read as a JPEG, PNG, WebP or GIF image. Try re-exporting it.",
    );
  }

  const mismatch = describeAdSlotMismatch(placement, dimensions);
  if (mismatch) throw new UploadError(mismatch);
}
