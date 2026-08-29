"use client";

import { Box, Flex, Text, chakra } from "@chakra-ui/react";
import Image from "next/image";
import { useRef, useState } from "react";
import { ImageOff, Loader2, Upload } from "lucide-react";
import { uploadImageAction } from "./uploadActions";

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
}: {
  name?: string;
  folder: "articles" | "jobs";
  defaultValue?: string;
}) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");
  const [error, setError] = useState("");
  const [previewFailed, setPreviewFailed] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;

    setStatus("uploading");
    setError("");
    setPreviewFailed(false);

    const formData = new FormData();
    formData.set("file", file);
    formData.set("folder", folder);

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
            JPEG, PNG, WebP or GIF, up to 5MB.
          </Text>

          {status === "error" && (
            <Text fontSize="12px" color="var(--color-danger-fg)" mt="6px">{error}</Text>
          )}
        </Box>
      </Flex>
    </Box>
  );
}
