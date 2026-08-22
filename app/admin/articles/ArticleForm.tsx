"use client";

import { Flex, Text, Input, SimpleGrid, chakra } from "@chakra-ui/react";
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
    <chakra.div mb="16px">
      <Text fontSize="13px" fontWeight="600" color="var(--color-body)" mb="4px">{label}</Text>
      {children}
    </chakra.div>
  );
}

const inputStyle = { h: "40px", border: "1px solid var(--color-border)", borderRadius: "4px", px: "12px", fontSize: "14px" } as const;
const textareaStyle = { w: "full" as const, p: "12px", border: "1px solid var(--color-border)", borderRadius: "4px", fontSize: "14px" };
const selectStyle = { w: "full" as const, h: "40px", border: "1px solid var(--color-border)", borderRadius: "4px", px: "8px", fontSize: "14px", bg: "var(--color-surface)" };

export function ArticleForm({ action, defaultValues: d = {}, submitLabel, showPublish }: Props) {
  return (
    <form action={action}>
      <SimpleGrid columns={{ base: 1, md: 2 }} gap="16px">
        <Field label="Title (Nepali) *">
          <Input name="titleNe" defaultValue={d.titleNe} required {...inputStyle} />
        </Field>
        <Field label="Title (English)">
          <Input name="titleEn" defaultValue={d.titleEn} {...inputStyle} />
        </Field>
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, md: 2 }} gap="16px">
        <Field label="Excerpt (Nepali) *">
          <chakra.textarea name="excerptNe" defaultValue={d.excerptNe} required h="80px" {...textareaStyle} />
        </Field>
        <Field label="Excerpt (English)">
          <chakra.textarea name="excerptEn" defaultValue={d.excerptEn} h="80px" {...textareaStyle} />
        </Field>
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, md: 2 }} gap="16px">
        <Field label="Body (Nepali) *">
          <chakra.textarea name="bodyNe" defaultValue={d.bodyNe} required h="200px" {...textareaStyle} />
        </Field>
        <Field label="Body (English)">
          <chakra.textarea name="bodyEn" defaultValue={d.bodyEn} h="200px" {...textareaStyle} />
        </Field>
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} gap="16px">
        <Field label="Category *">
          <chakra.select name="categorySlug" defaultValue={d.categorySlug} required {...selectStyle}>
            <option value="">Select...</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>{c.name.en} / {c.name.ne}</option>
            ))}
          </chakra.select>
        </Field>
        <Field label="Province">
          <chakra.select name="provinceSlug" defaultValue={d.provinceSlug ?? ""} {...selectStyle}>
            <option value="">National</option>
            {provinces.map((p) => (
              <option key={p.slug} value={p.slug}>{p.name.en} / {p.name.ne}</option>
            ))}
          </chakra.select>
        </Field>
        <Field label="Author ID *">
          <Input name="authorId" defaultValue={d.authorId} required {...inputStyle} />
        </Field>
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, sm: 2 }} gap="16px">
        <Field label="Image URL *">
          <Input name="imageUrl" defaultValue={d.imageUrl} required {...inputStyle} />
        </Field>
        <Field label="Tags (comma-separated slugs)">
          <Input name="tagSlugs" defaultValue={d.tagSlugs} {...inputStyle} placeholder="politics,breaking" />
        </Field>
      </SimpleGrid>

      <Flex gap="20px" mb="24px" flexWrap="wrap">
        <chakra.label display="flex" alignItems="center" gap="6px" fontSize="14px" color="var(--color-body)" cursor="pointer">
          <input type="checkbox" name="isFeatured" defaultChecked={d.isFeatured} /> Featured
        </chakra.label>
        <chakra.label display="flex" alignItems="center" gap="6px" fontSize="14px" color="var(--color-body)" cursor="pointer">
          <input type="checkbox" name="isBreaking" defaultChecked={d.isBreaking} /> Breaking
        </chakra.label>
        {showPublish && (
          <chakra.label display="flex" alignItems="center" gap="6px" fontSize="14px" color="var(--color-body)" cursor="pointer">
            <input type="checkbox" name="publish" /> Publish immediately
          </chakra.label>
        )}
      </Flex>

      <chakra.button
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
      </chakra.button>
    </form>
  );
}
