"use client";

import { useEffect, useState, useRef } from "react";
import { Box, Flex, Text, SimpleGrid, Spinner, IconButton, chakra } from "@chakra-ui/react";
import { X, Upload, Loader2, Trash2 } from "lucide-react";
import Image from "next/image";
import { uploadImageAction, listImagesAction, deleteImageAction } from "./uploadActions";
import { compressImage } from "./ImageUploadField";
import { toaster } from "@/components/ui/toaster";

interface MediaLibraryModalProps {
  onSelect: (url: string) => void;
  onClose: () => void;
  folder?: "articles" | "jobs" | "blog" | "ads";
}

export function MediaLibraryModal({ onSelect, onClose, folder = "articles" }: MediaLibraryModalProps) {
  const [images, setImages] = useState<{ url: string }[] | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleDelete(url: string) {
    if (!window.confirm("Delete this image permanently? This cannot be undone. If it's used by a post, that post will show a broken image.")) {
      return;
    }
    setDeleting(url);
    try {
      const result = await deleteImageAction(url);
      if ("error" in result) {
        toaster.create({ type: "error", title: "Delete failed", description: result.error });
        return;
      }
      setImages((prev) => (prev || []).filter((img) => img.url !== url));
      toaster.create({ type: "success", title: "Deleted", description: "Image removed permanently." });
    } catch {
      toaster.create({ type: "error", title: "Delete failed", description: "Something went wrong." });
    } finally {
      setDeleting(null);
    }
  }

  useEffect(() => {
    let active = true;
    listImagesAction().then((res) => {
      if (active) setImages(res);
    });
    return () => { active = false; };
  }, []);

  async function handleUpload(file: File | undefined) {
    if (!file) return;
    
    // Checked before compression to reject absurdly huge files early,
    // though compressImage will squish most things under the 5MB limit.
    if (file.size > 20 * 1024 * 1024) {
      toaster.create({ type: "error", title: "Upload failed", description: "File is too large (max 20MB before compression)." });
      return;
    }

    setIsUploading(true);
    
    try {
      const toUpload = await compressImage(file);
      if (toUpload.size > 5 * 1024 * 1024) {
        toaster.create({ type: "error", title: "Upload failed", description: "Image is still over 5MB after compression." });
        setIsUploading(false);
        return;
      }

      const formData = new FormData();
      formData.set("file", toUpload);
      formData.set("folder", folder);

      const result = await uploadImageAction(formData);
      if ("error" in result) {
        toaster.create({ type: "error", title: "Upload failed", description: result.error });
      } else {
        // Add to the front of the list
        setImages((prev) => [{ url: result.url }, ...(prev || [])]);
        toaster.create({ type: "success", title: "Upload complete", description: "Image added to library." });
      }
    } catch (e) {
      toaster.create({ type: "error", title: "Upload failed", description: "Something went wrong." });
    } finally {
      setIsUploading(false);
      // Reset input so the same file can be selected again if needed
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <Box position="fixed" inset="0" zIndex="9999" display="flex" alignItems="center" justifyContent="center" bg="rgba(0,0,0,0.6)" p="20px">
      <Box w="100%" maxW="800px" maxH="85vh" bg="var(--color-surface)" borderRadius="12px" display="flex" flexDirection="column" overflow="hidden" boxShadow="0 20px 40px rgba(0,0,0,0.2)">
        <Flex justify="space-between" align="center" p="16px 20px" borderBottom="1px solid var(--color-border)">
          <Flex align="center" gap="16px">
            <Text fontWeight="600" fontSize="18px">Media Library</Text>
            
            <chakra.input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              display="none"
              ref={fileInputRef}
              onChange={(e) => handleUpload(e.target.files?.[0])}
            />
            
            <chakra.button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              display="inline-flex"
              alignItems="center"
              gap="7px"
              px="14px"
              py="8px"
              borderRadius="6px"
              fontSize="13px"
              fontWeight="600"
              bg="var(--color-surface)"
              color="var(--color-body)"
              border="1px solid var(--color-border)"
              cursor={isUploading ? "default" : "pointer"}
              opacity={isUploading ? 0.7 : 1}
              transition="border-color 0.15s"
              _hover={isUploading ? {} : { borderColor: "var(--color-brand)" }}
            >
              {isUploading ? (
                <>
                  <Box css={{ animation: "spin 1s linear infinite" }}>
                    <Loader2 size={14} />
                  </Box>
                  Uploading...
                </>
              ) : (
                <>
                  <Upload size={14} />
                  Upload New
                </>
              )}
            </chakra.button>
          </Flex>
          <IconButton aria-label="Close" size="sm" variant="ghost" onClick={onClose}><X size={20} /></IconButton>
        </Flex>

        <Box p="20px" overflowY="auto" flex="1" bg="var(--color-bg)">
          {images === null ? (
            <Flex justify="center" align="center" py="60px">
              <Spinner color="var(--color-brand)" />
            </Flex>
          ) : images.length === 0 ? (
            <Flex justify="center" align="center" py="60px">
              <Text color="var(--color-muted)">No images found in library.</Text>
            </Flex>
          ) : (
            <SimpleGrid columns={{ base: 2, sm: 3, md: 4 }} gap="16px">
              {images.map((img) => (
                <Box
                  key={img.url}
                  role="group"
                  position="relative"
                  w="100%"
                  pb="100%"
                  bg="var(--color-card-alt)"
                  borderRadius="8px"
                  overflow="hidden"
                  border="2px solid transparent"
                  cursor="pointer"
                  transition="border-color 0.15s"
                  _hover={{ borderColor: "var(--color-brand)" }}
                  onClick={() => onSelect(img.url)}
                >
                  <Image src={img.url} alt="" fill sizes="200px" style={{ objectFit: "cover" }} />
                  <chakra.button
                    type="button"
                    aria-label="Delete image permanently"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(img.url);
                    }}
                    disabled={deleting === img.url}
                    position="absolute"
                    top="6px"
                    right="6px"
                    display="inline-flex"
                    alignItems="center"
                    justifyContent="center"
                    w="30px"
                    h="30px"
                    borderRadius="6px"
                    bg="rgba(0,0,0,0.55)"
                    color="white"
                    opacity={{ base: 1, md: 0.7 }}
                    _hover={{ bg: "var(--color-danger-fg, #dc2626)", opacity: 1 }}
                    transition="opacity 0.15s, background 0.15s"
                  >
                    {deleting === img.url ? (
                      <Box css={{ animation: "spin 1s linear infinite" }}>
                        <Loader2 size={15} />
                      </Box>
                    ) : (
                      <Trash2 size={15} />
                    )}
                  </chakra.button>
                </Box>
              ))}
            </SimpleGrid>
          )}
        </Box>

        <Flex p="16px 20px" borderTop="1px solid var(--color-border)" justify="flex-end" bg="var(--color-surface)">
          <chakra.button
            type="button"
            onClick={onClose}
            px="16px"
            py="8px"
            borderRadius="6px"
            fontSize="13px"
            fontWeight="600"
            bg="var(--color-surface)"
            color="var(--color-body)"
            border="1px solid var(--color-border)"
            cursor="pointer"
            transition="border-color 0.15s"
            _hover={{ borderColor: "var(--color-brand)" }}
          >
            Cancel
          </chakra.button>
        </Flex>
      </Box>
    </Box>
  );
}
