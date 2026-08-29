"use server";

import { getSupabaseServerClient } from "@/lib/infrastructure/supabaseServer";
import { uploadImage, UploadError } from "@/lib/infrastructure/supabaseStorage";

async function requireAuth() {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

/**
 * Returns `{ url }` on success or `{ error }` on failure rather than throwing.
 * This runs from a client component on file selection, before the surrounding
 * form is submitted — a thrown Server Action error would show as an unhandled
 * rejection there, whereas a returned error can be shown inline next to the
 * upload field.
 */
export async function uploadImageAction(
  formData: FormData,
): Promise<{ url: string } | { error: string }> {
  try {
    await requireAuth();
  } catch {
    return { error: "You must be signed in to upload images." };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "No file provided." };
  }

  const folder = formData.get("folder") === "jobs" ? "jobs" : "articles";

  try {
    const url = await uploadImage(file, folder);
    return { url };
  } catch (e) {
    return { error: e instanceof UploadError ? e.message : "Upload failed." };
  }
}
