import "server-only";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { readImageDimensions } from "./imageDimensions";
import { describeAdSlotMismatch, type AdPlacement } from "../adSlots";

const MAX_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export class UploadError extends Error {}

/**
 * Where uploaded files are written, and the URL prefix they're served under.
 *
 * Default: <cwd>/public/uploads, served at /uploads. That works in dev and in a
 * standalone build. In production the store should live OUTSIDE the deploy
 * artifact (otherwise each deploy wipes editors' images) — set UPLOADS_DIR to a
 * persistent path and point the web server to serve it at UPLOAD_PUBLIC_BASE.
 */
const UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(process.cwd(), "public", "uploads");
const PUBLIC_BASE = process.env.UPLOAD_PUBLIC_BASE || "/uploads";

/**
 * Writes an admin-supplied image to the local file store and returns its
 * site-relative URL. Replaces the free-text "image URL" field: editors upload a
 * real file, so a stored URL always resolves to actual image bytes.
 */
export async function uploadImage(
  file: File,
  folder: "articles" | "jobs" | "blog" | "ads",
): Promise<string> {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new UploadError("Only JPEG, PNG, WebP or GIF images are allowed.");
  }
  if (file.size > MAX_BYTES) {
    throw new UploadError("Image must be smaller than 5MB.");
  }

  const ext = file.type.split("/")[1] === "jpeg" ? "jpg" : file.type.split("/")[1];
  const name = `${crypto.randomUUID()}.${ext}`;
  const dir = path.join(UPLOADS_DIR, folder);

  try {
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
  } catch (e) {
    throw new UploadError(e instanceof Error ? e.message : "Could not save the image.");
  }

  // Forward slashes in the URL regardless of the OS path separator.
  return `${PUBLIC_BASE}/${folder}/${name}`;
}

/**
 * Rejects an ad image that doesn't suit its slot, before it is stored. Ad slots
 * render at fixed proportions, so a mis-sized creative letterboxes or crops.
 *
 * Fails closed when the header can't be read: all four allowed types carry
 * their dimensions in the opening bytes, so an unparseable buffer means a
 * corrupt file or a lie about file.type (which the browser supplies and is not
 * to be trusted). This sniff is real content validation, unlike the mime check.
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

const UPLOAD_FOLDERS = new Set(["articles", "jobs", "blog", "ads"]);

/**
 * Permanently removes an uploaded image, given the site-relative URL that was
 * stored for it. Returns true when a file was deleted, false when it was
 * already gone.
 *
 * Path-traversal safe: the URL must be under PUBLIC_BASE, name a known folder,
 * and reduce to a plain filename — anything with "..", nested paths, or an
 * unexpected shape is rejected rather than turned into a filesystem path.
 */
export async function deleteImage(url: string): Promise<boolean> {
  const { unlink } = await import("node:fs/promises");

  if (typeof url !== "string" || !url.startsWith(`${PUBLIC_BASE}/`)) {
    throw new UploadError("That doesn't look like an uploaded image.");
  }

  const rel = url.slice(PUBLIC_BASE.length + 1); // "<folder>/<name>"
  const parts = rel.split("/");
  if (parts.length !== 2) {
    throw new UploadError("Unexpected image path.");
  }
  const [folder, name] = parts;
  if (!UPLOAD_FOLDERS.has(folder)) {
    throw new UploadError("Unknown image folder.");
  }
  // Filename only: no separators, no traversal, must be a real image name.
  if (name !== path.basename(name) || name.includes("..") || !name.match(/^[\w.-]+\.(jpg|jpeg|png|webp|gif)$/i)) {
    throw new UploadError("Invalid image name.");
  }

  const filePath = path.join(UPLOADS_DIR, folder, name);
  try {
    await unlink(filePath);
    return true;
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return false;
    throw new UploadError(e instanceof Error ? e.message : "Could not delete the image.");
  }
}

/**
 * Returns a list of all images currently stored in the uploads directory,
 * sorted by newest first. Can be optionally filtered by folder.
 */
export async function listImages(folderPrefix?: string): Promise<{ url: string, time: number }[]> {
  const { readdir, stat } = require("node:fs/promises");
  
  const folders = folderPrefix ? [folderPrefix] : ["articles", "jobs", "blog", "ads"];
  const results: { url: string, time: number }[] = [];

  for (const folder of folders) {
    const dir = path.join(UPLOADS_DIR, folder);
    try {
      const files = await readdir(dir);
      for (const file of files) {
        if (!file.match(/\.(jpg|jpeg|png|webp|gif)$/i)) continue;
        const filePath = path.join(dir, file);
        const stats = await stat(filePath);
        results.push({
          url: `${PUBLIC_BASE}/${folder}/${file}`,
          time: stats.mtimeMs,
        });
      }
    } catch (e) {
      // Folder might not exist yet
    }
  }

  // Sort newest first
  return results.sort((a, b) => b.time - a.time);
}
