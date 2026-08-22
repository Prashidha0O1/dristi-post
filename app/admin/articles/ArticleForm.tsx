"use client";

import { Box, Flex, Text, Input, SimpleGrid } from "@chakra-ui/react";
import { categories } from "@/lib/config";
import { provinces } from "@/lib/domain/province";

interface Props {
  action: (formData: FormData) => Promise<void>;
  defaultValues?: {
    titleNe?: string;
    titleEn?: string;
    excerptNe?: string;
    excerptEn?: string;
    bodyNe?: string;
    bodyEn?: string;
    categorySlug?: string;
    provinceSlug?: string;
    authorId?: string;
    imageUrl?: string;
    tagSlugs?: string;
    isFeatured?: boolean;
    isBreaking?: boolean;
  };
  submitLabel: string;
  showPublish?: boolean;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Box mb="16px">
      <Text fontSize="13px" fontWeight="600" color="var(--color-body)" mb="4px">{label}</Text>
      {children}
    </Box>
  );
}

export function ArticleForm({ action, defaultValues: d = {}, submitLabel, showPublish }: Props) {
  return (
    <form action={action}>
      <SimpleGrid columns={{ base: 1, md: 2 }} gap="16px">
        <Field label="Title (Nepali) *">
          <Input name="titleNe" defaultValue={d.titleNe} required h="40px" border="1px solid var(--color-border)" borderRadius="4px" px="12px" fontSize="14px" />
        </Field>
        <Field label="Title (English)">
          <Input name="titleEn" defaultValue={d.titleEn} h="40px" border="1px solid var(--color-border)" borderRadius="4px" px="12px" fontSize="14px" />
        </Field>
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, md: 2 }} gap="16px">
        <Field label="Excerpt (Nepali) *">
          <Box as="textarea" name="excerptNe" defaultValue={d.excerptNe} required w="full" h="80px" p="12px" border="1px solid var(--color-border)" borderRadius="4px" fontSize="14px" resize="vertical" />
        </Field>
        <Field label="Excerpt (English)">
          <Box as="textarea" name="excerptEn" defaultValue={d.excerptEn} w="full" h="80px" p="12px" border="1px solid var(--color-border)" borderRadius="4px" fontSize="14px" resize="vertical" />
        </Field>
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, md: 2 }} gap="16px">
        <Field label="Body (Nepali) *">
          <Box as="textarea" name="bodyNe" defaultValue={d.bodyNe} required w="full" h="200px" p="12px" border="1px solid var(--color-border)" borderRadius="4px" fontSize="14px" resize="vertical" />
        </Field>
        <Field label="Body (English)">
          <Box as="textarea" name="bodyEn" defaultValue={d.bodyEn} w="full" h="200px" p="12px" border="1px solid var(--color-border)" borderRadius="4px" fontSize="14px" resize="vertical" />
        </Field>
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} gap="16px">
        <Field label="Category *">
          <Box as="select" name="categorySlug" defaultValue={d.categorySlug} required w="full" h="40px" border="1px solid var(--color-border)" borderRadius="4px" px="8px" fontSize="14px" bg="var(--color-surface)">
            <option value="">Select...</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>{c.name.en} / {c.name.ne}</option>
            ))}
          </Box>
        </Field>
        <Field label="Province">
          <Box as="select" name="provinceSlug" defaultValue={d.provinceSlug ?? ""} w="full" h="40px" border="1px solid var(--color-border)" borderRadius="4px" px="8px" fontSize="14px" bg="var(--color-surface)">
            <option value="">National</option>
            {provinces.map((p) => (
              <option key={p.slug} value={p.slug}>{p.name.en} / {p.name.ne}</option>
            ))}
          </Box>
        </Field>
        <Field label="Author ID *">
          <Input name="authorId" defaultValue={d.authorId} required h="40px" border="1px solid var(--color-border)" borderRadius="4px" px="12px" fontSize="14px" />
        </Field>
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, sm: 2 }} gap="16px">
        <Field label="Image URL *">
          <Input name="imageUrl" defaultValue={d.imageUrl} required h="40px" border="1px solid var(--color-border)" borderRadius="4px" px="12px" fontSize="14px" />
        </Field>
        <Field label="Tags (comma-separated slugs)">
          <Input name="tagSlugs" defaultValue={d.tagSlugs} h="40px" border="1px solid var(--color-border)" borderRadius="4px" px="12px" fontSize="14px" placeholder="politics,breaking" />
        </Field>
      </SimpleGrid>

      <Flex gap="20px" mb="24px" flexWrap="wrap">
        <Flex as="label" align="center" gap="6px" fontSize="14px" color="var(--color-body)" cursor="pointer">
          <input type="checkbox" name="isFeatured" defaultChecked={d.isFeatured} /> Featured
        </Flex>
        <Flex as="label" align="center" gap="6px" fontSize="14px" color="var(--color-body)" cursor="pointer">
          <input type="checkbox" name="isBreaking" defaultChecked={d.isBreaking} /> Breaking
        </Flex>
        {showPublish && (
          <Flex as="label" align="center" gap="6px" fontSize="14px" color="var(--color-body)" cursor="pointer">
            <input type="checkbox" name="publish" /> Publish immediately
          </Flex>
        )}
      </Flex>

      <Box
        as="button"
        type="submit"
        px="24px"
        py="10px"
        bg="var(--color-brand)"
        color="white"
        border="none"
        borderRadius="4px"
        fontSize="15px"
        fontWeight="700"
        cursor="pointer"
        _hover={{ opacity: 0.9 }}
      >
        {submitLabel}
      </Box>
    </form>
  );
}
