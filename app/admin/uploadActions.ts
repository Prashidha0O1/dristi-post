"use server";

import {
  assertAdImageFitsSlot,
  uploadImage,
  UploadError,
} from "@/lib/infrastructure/fileStorage";
import { isAdPlacement } from "@/lib/adSlots";
import { requireUser } from "@/lib/auth/guard";

const FOLDERS = ["articles", "jobs", "blog", "ads"] as const;
type Folder = (typeof FOLDERS)[number];

function readFolder(value: FormDataEntryValue | null): Folder {
  return typeof value === "string" && (FOLDERS as readonly string[]).includes(value)
    ? (value as Folder)
    : "articles";
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
    await requireUser();
  } catch {
    return { error: "You must be signed in to upload images." };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "No file provided." };
  }

  // Previously a two-way ternary (`=== "jobs" ? "jobs" : "articles"`), which
  // silently filed anything else — including "ads" — under articles/.
  const folder = readFolder(formData.get("folder"));

  // Ads are the only upload with a dimension contract, and it depends on which
  // slot the image is for, so the placement has to travel with the file.
  const rawPlacement = formData.get("placement");
  const placement =
    typeof rawPlacement === "string" && isAdPlacement(rawPlacement) ? rawPlacement : null;

  if (folder === "ads" && !placement) {
    return { error: "Choose which ad slot this image is for before uploading." };
  }

  try {
    if (placement) await assertAdImageFitsSlot(file, placement);
    const url = await uploadImage(file, folder);
    return { url };
  } catch (e) {
    return { error: e instanceof UploadError ? e.message : "Upload failed." };
  }
}

export async function deleteImageAction(
  url: string,
): Promise<{ ok: true } | { error: string }> {
  try {
    await requireUser();
  } catch {
    return { error: "You must be signed in to delete images." };
  }
  try {
    const { deleteImage } = await import("@/lib/infrastructure/fileStorage");
    await deleteImage(url);
    return { ok: true };
  } catch (e) {
    return { error: e instanceof UploadError ? e.message : "Could not delete the image." };
  }
}

export async function listImagesAction(folder?: Folder): Promise<{ url: string }[]> {
  try {
    await requireUser();
  } catch {
    return [];
  }
  const { listImages } = await import("@/lib/infrastructure/fileStorage");
  const images = await listImages(folder);
  return images.map(img => ({ url: img.url }));
}
