"use client";

import { Box, Flex, Text, chakra } from "@chakra-ui/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ImageOff, Loader2, Upload } from "lucide-react";
import { uploadImageAction } from "./uploadActions";
import { describeAdSlotMismatch, type AdPlacement } from "@/lib/adSlots";
import { toaster } from "@/components/ui/toaster";

/** Mirrors the 5MB cap enforced in lib/infrastructure/fileStorage.ts. */
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

/** Best-effort browser-side decode; `null` when the format isn't decodable here. */
async function readLocalDimensions(
  file: File,
): Promise<{ width: number; height: number } | null> {
  try {
    const bitmap = await createImageBitmap(file);
    const { width, height } = bitmap;
    bitmap.close();
    return { width, height };
  } catch {
    return null;
  }
}

const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.82;

/**
 * Compresses/downscales an image in the browser before upload: caps the longest
 * side at 1600px and re-encodes to JPEG. This keeps uploads well under the
 * server limit and makes article images load fast. GIFs (possibly animated) and
 * anything that can't be decoded are returned unchanged.
 */
async function compressImage(file: File): Promise<File> {
  if (file.type === "image/gif" || !file.type.startsWith("image/")) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close();
      return file;
    }
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY),
    );
    if (!blob || blob.size >= file.size) return file; // no win -> keep original
    const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
    return new File([blob], name, { type: "image/jpeg" });
  } catch {
    return file;
  }
}

/**
 * Replaces the old free-text "image URL" input. Uploads on file selection
 * (before the surrounding form is submitted) and carries the resulting
 * uploaded file URL in a hidden `name="imageUrl"` field — the create/update
 * Server Actions and their validation are unchanged, since as far as they're
 * concerned this is still just a URL string in the form data.
 */
export function ImageUploadField({
  name = "imageUrl",
  folder,
  defaultValue,
  placement,
  hint,
}: {
  name?: string;
  folder: "articles" | "jobs" | "blog" | "ads";
  defaultValue?: string;
  /** Ads only — the slot this image is for, which sets the size it must match. */
  placement?: AdPlacement;
  /** Overrides the default "JPEG, PNG..." line, e.g. to state a required size. */
  hint?: string;
}) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");
  const [error, setError] = useState("");

  // Surface upload problems as a toast as well as inline.
  useEffect(() => {
    if (status === "error" && error) {
      toaster.create({ type: "error", title: "Image upload", description: error });
    }
  }, [status, error]);
  const [previewFailed, setPreviewFailed] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;

    setError("");
    setPreviewFailed(false);

    // Pre-flight the slot fit in the browser so a mismatch is reported the
    // instant a file is chosen, rather than after a multi-megabyte upload has
    // already gone over the wire. Purely a UX shortcut — the Server Action
    // re-runs the same check, since anything done here is trivially bypassed.
    if (placement) {
      const local = await readLocalDimensions(file);
      if (local) {
        const mismatch = describeAdSlotMismatch(placement, local);
        if (mismatch) {
          setStatus("error");
          setError(mismatch);
          return;
        }
      }
      // Undecodable locally: say nothing and let the server be the judge.
    }

    setStatus("uploading");

    // Compress article/job images in the browser. Ads keep their exact pixels
    // (the slot has a fixed size), so they are never recompressed.
    const toUpload = placement ? file : await compressImage(file);

    // Checked here as well as in the action: an oversize body can be rejected
    // by the host's proxy before it ever reaches the Server Action.
    if (toUpload.size > MAX_UPLOAD_BYTES) {
      setStatus("error");
      setError(
        `That image is ${(toUpload.size / 1024 / 1024).toFixed(1)}MB even after compressing. ` +
          `The limit is 5MB — try a smaller image.`,
      );
      return;
    }

    const formData = new FormData();
    formData.set("file", toUpload);
    formData.set("folder", folder);
    if (placement) formData.set("placement", placement);

    // `uploadImageAction` returns its failures rather than throwing, but the
    // *call itself* can still reject — a dropped connection, a proxy rejecting
    // the body, an auth redirect. Without this catch the component was left on
    // "Uploading..." forever with only an unhandled rejection in the console,
    // and the only way out was reloading the page and losing the form.
    try {
      const result = await uploadImageAction(formData);
      if ("error" in result) {
        setStatus("error");
        setError(result.error);
        return;
      }

      setUrl(result.url);
      setStatus("idle");
    } catch {
      setStatus("error");
      setError("The upload did not complete. Check your connection and try again.");
    } finally {
      // Whatever happened above, never leave the button spinning.
      setStatus((s) => (s === "uploading" ? "idle" : s));
    }
  }

  return (
    <Box>
      {/*
        No `required` here: browsers skip constraint validation on hidden
        inputs, so it never blocked submission — the form posted with an empty
        imageUrl and failed server-side instead. The server validators are the
        real gate, and their messages are now rendered on the field.
      */}
      <chakra.input type="hidden" name={name} value={url} />

      <Flex gap="14px" align="flex-start" flexWrap="wrap">
        <Box
          w="140px"
          h="100px"
          flexShrink={0}
          borderRadius="6px"
          border="1px solid var(--color-input-border)"
          bg="var(--color-card-alt)"
          overflow="hidden"
          position="relative"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          {url && !previewFailed ? (
            <Image
              src={url}
              alt=""
              fill
              sizes="140px"
              style={{ objectFit: "cover" }}
              onError={() => setPreviewFailed(true)}
              unoptimized
            />
          ) : (
            <ImageOff size={22} strokeWidth={1.6} color="var(--color-faint)" aria-hidden="true" />
          )}
        </Box>

        <Box flex="1" minW="200px">
          <chakra.input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            display="none"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />

          <chakra.button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={status === "uploading"}
            display="inline-flex"
            alignItems="center"
            gap="7px"
            px="14px"
            py="9px"
            borderRadius="6px"
            fontSize="13px"
            fontWeight="600"
            bg="var(--color-surface)"
            color="var(--color-body)"
            border="1px solid var(--color-border)"
            cursor={status === "uploading" ? "default" : "pointer"}
            opacity={status === "uploading" ? 0.7 : 1}
            transition="border-color 0.15s"
            _hover={status === "uploading" ? {} : { borderColor: "var(--color-brand)" }}
          >
            {status === "uploading" ? (
              <>
                <Box css={{ animation: "spin 1s linear infinite" }}>
                  <Loader2 size={15} strokeWidth={2} aria-hidden="true" />
                </Box>
                Uploading...
              </>
            ) : (
              <>
                <Upload size={15} strokeWidth={2} aria-hidden="true" />
                {url ? "Replace image" : "Upload image"}
              </>
            )}
          </chakra.button>

          <Text fontSize="11px" color="var(--color-muted)" mt="7px" lineHeight="1.5">
            {hint ?? "JPEG, PNG, WebP or GIF, up to 5MB."}
          </Text>

          {status === "error" && (
            <Text fontSize="12px" color="var(--color-danger-fg)" mt="6px">{error}</Text>
          )}
        </Box>
      </Flex>
    </Box>
  );
}
