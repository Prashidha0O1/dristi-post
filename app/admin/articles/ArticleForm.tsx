"use client";

import { Flex, SimpleGrid, chakra } from "@chakra-ui/react";
import { categories } from "@/lib/config";
import { provinces } from "@/lib/domain/province";
import { ImageUploadField } from "../ImageUploadField";
import {
  CheckboxField,
  Field,
  FormSection,
  SubmitButton,
  fieldStyles,
} from "../formUi";

interface AuthorOption {
  id: string;
  nameNe: string;
  nameEn?: string;
}

interface Props {
  action: (formData: FormData) => Promise<void>;
  authorOptions: AuthorOption[];
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
    isTrending?: boolean;
  };
  submitLabel: string;
  showPublish?: boolean;
}

export function ArticleForm({ action, authorOptions, defaultValues: d = {}, submitLabel, showPublish }: Props) {
  return (
    <form action={action}>
      <FormSection title="Headline" description="Nepali is required; English is optional and used for the URL when present.">
        <SimpleGrid columns={{ base: 1, md: 2 }} gap="16px">
          <Field label="Title (Nepali)" required>
            <chakra.input name="titleNe" defaultValue={d.titleNe} required {...fieldStyles.input} />
          </Field>
          <Field label="Title (English)">
            <chakra.input name="titleEn" defaultValue={d.titleEn} {...fieldStyles.input} />
          </Field>
        </SimpleGrid>

        <SimpleGrid columns={{ base: 1, md: 2 }} gap="16px">
          <Field label="Excerpt (Nepali)" required>
            <chakra.textarea name="excerptNe" defaultValue={d.excerptNe} required h="86px" {...fieldStyles.textarea} />
          </Field>
          <Field label="Excerpt (English)">
            <chakra.textarea name="excerptEn" defaultValue={d.excerptEn} h="86px" {...fieldStyles.textarea} />
          </Field>
        </SimpleGrid>
      </FormSection>

      <FormSection title="Body" description="Separate paragraphs with a blank line.">
        <SimpleGrid columns={{ base: 1, md: 2 }} gap="16px">
          <Field label="Body (Nepali)" required>
            <chakra.textarea name="bodyNe" defaultValue={d.bodyNe} required h="240px" {...fieldStyles.textarea} />
          </Field>
          <Field label="Body (English)">
            <chakra.textarea name="bodyEn" defaultValue={d.bodyEn} h="240px" {...fieldStyles.textarea} />
          </Field>
        </SimpleGrid>
      </FormSection>

      <FormSection title="Classification">
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} gap="16px">
          <Field label="Category" required>
            <chakra.select name="categorySlug" defaultValue={d.categorySlug} required {...fieldStyles.select}>
              <option value="">Select...</option>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>{c.name.en} / {c.name.ne}</option>
              ))}
            </chakra.select>
          </Field>
          <Field label="Province" hint="Leave as National if not region-specific">
            <chakra.select name="provinceSlug" defaultValue={d.provinceSlug ?? ""} {...fieldStyles.select}>
              <option value="">National</option>
              {provinces.map((p) => (
                <option key={p.slug} value={p.slug}>{p.name.en} / {p.name.ne}</option>
              ))}
            </chakra.select>
          </Field>
          <Field label="Author" required>
            <chakra.select name="authorId" defaultValue={d.authorId} required {...fieldStyles.select}>
              <option value="">Select...</option>
              {authorOptions.map((a) => (
                <option key={a.id} value={a.id}>{a.nameEn ? `${a.nameEn} / ${a.nameNe}` : a.nameNe}</option>
              ))}
            </chakra.select>
          </Field>
        </SimpleGrid>

        <Field label="Featured image" required>
          <ImageUploadField folder="articles" defaultValue={d.imageUrl} />
        </Field>

        <Field label="Tags" hint="Comma-separated slugs">
          <chakra.input name="tagSlugs" defaultValue={d.tagSlugs} placeholder="politics,breaking" {...fieldStyles.input} />
        </Field>
      </FormSection>

      <FormSection title="Placement" description="Controls where this appears on the public site.">
        <Flex gap="12px" flexWrap="wrap">
          <CheckboxField name="isFeatured" label="Featured" hint="Top stories on the homepage" defaultChecked={d.isFeatured} />
          <CheckboxField name="isBreaking" label="Breaking" hint="Shows in the ticker" defaultChecked={d.isBreaking} />
          <CheckboxField name="isTrending" label="Trending" hint="Appears on /trending" defaultChecked={d.isTrending} />
          {showPublish && (
            <CheckboxField name="publish" label="Publish immediately" hint="Otherwise saved as a draft" />
          )}
        </Flex>
      </FormSection>

      <SubmitButton>{submitLabel}</SubmitButton>
    </form>
  );
}
