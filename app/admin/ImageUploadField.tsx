"use client";

import { Box, Flex, Text, chakra } from "@chakra-ui/react";
import Image from "next/image";
import { useRef, useState } from "react";
import { ImageOff, Loader2, Upload } from "lucide-react";
import { uploadImageAction } from "./uploadActions";
import { describeAdSlotMismatch, type AdPlacement } from "@/lib/adSlots";

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

/**
 * Replaces the old free-text "image URL" input. Uploads on file selection
 * (before the surrounding form is submitted) and carries the resulting
 * Supabase Storage URL in a hidden `name="imageUrl"` field — the create/update
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
  folder: "articles" | "jobs" | "ads";
  defaultValue?: string;
  /** Ads only — the slot this image is for, which sets the size it must match. */
  placement?: AdPlacement;
  /** Overrides the default "JPEG, PNG..." line, e.g. to state a required size. */
  hint?: string;
}) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");
  const [error, setError] = useState("");
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

    const formData = new FormData();
    formData.set("file", file);
    formData.set("folder", folder);
    if (placement) formData.set("placement", placement);

    const result = await uploadImageAction(formData);
    if ("error" in result) {
      setStatus("error");
      setError(result.error);
      return;
    }

    setUrl(result.url);
    setStatus("idle");
  }

  return (
    <Box>
      <chakra.input type="hidden" name={name} value={url} required />

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
