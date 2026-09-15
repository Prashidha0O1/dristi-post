"use client";

import { Flex, SimpleGrid, chakra } from "@chakra-ui/react";
import { useActionState } from "react";
import { categories } from "@/lib/config";
import { provinces } from "@/lib/domain/province";
import { ImageUploadField } from "../ImageUploadField";
import { RichTextField } from "../RichTextField";
import { AuthorField } from "./AuthorField";
import {
  CheckboxField,
  Field,
  FormError,
  FormSection,
  SubmitButton,
  fieldStyles,
} from "../formUi";
import { idleFormState, type FormState } from "../formState";

interface AuthorOption {
  id: string;
  nameNe: string;
  nameEn?: string;
}

interface Props {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  authorOptions: AuthorOption[];
  defaultValues?: {
    titleNe?: string;
    titleEn?: string;
    excerptNe?: string;
    excerptEn?: string;
    bodyNe?: string;
    bodyEn?: string;
    slug?: string;
    metaDescription?: string;
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
  /** Owner/admin may create authors inline from the picker. */
  canAddAuthors?: boolean;
}

export function ArticleForm({ action, authorOptions, defaultValues: d = {}, submitLabel, showPublish, canAddAuthors = false }: Props) {
  // useActionState keeps the rejected server response on screen without
  // remounting the form, so the inputs (which are uncontrolled) hold on to
  // whatever the editor typed. Previously a rejected save threw and lost it all.
  const [state, formAction] = useActionState(action, idleFormState);
  const issues = state.status === "error" ? state.issues : {};

  return (
    <form action={formAction}>
      <FormError state={state} />
      <FormSection title="Headline" description="Fill in either language — the other is filled in automatically. English is used for the URL when present.">
        <SimpleGrid columns={{ base: 1, md: 2 }} gap="16px">
          <Field label="Title (Nepali)" error={issues["title.ne"]}>
            <chakra.input name="titleNe" defaultValue={d.titleNe} {...fieldStyles.input} />
          </Field>
          <Field label="Title (English)" error={issues["title.en"]}>
            <chakra.input name="titleEn" defaultValue={d.titleEn} {...fieldStyles.input} />
          </Field>
        </SimpleGrid>

        <SimpleGrid columns={{ base: 1, md: 2 }} gap="16px">
          <Field label="Excerpt (Nepali)" error={issues["excerpt.ne"]}>
            <chakra.textarea name="excerptNe" defaultValue={d.excerptNe} h="86px" {...fieldStyles.textarea} />
          </Field>
          <Field label="Excerpt (English)">
            <chakra.textarea name="excerptEn" defaultValue={d.excerptEn} h="86px" {...fieldStyles.textarea} />
          </Field>
        </SimpleGrid>
      </FormSection>

      <FormSection title="Body" description="Format text, add headings and lists, and insert links with the toolbar.">
        <SimpleGrid columns={{ base: 1, md: 2 }} gap="16px">
          <Field label="Body (Nepali)" error={issues["body.ne"]}>
            <RichTextField name="bodyNe" defaultValue={d.bodyNe} />
          </Field>
          <Field label="Body (English)">
            <RichTextField name="bodyEn" defaultValue={d.bodyEn} />
          </Field>
        </SimpleGrid>
      </FormSection>

      <FormSection title="Classification">
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} gap="16px">
          <Field label="Category" required error={issues.categorySlug}>
            <chakra.select name="categorySlug" defaultValue={d.categorySlug} required {...fieldStyles.select}>
              <option value="">Select...</option>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>{c.name.en} / {c.name.ne}</option>
              ))}
            </chakra.select>
          </Field>
          <Field label="Province" hint="Leave as National if not region-specific" error={issues.provinceSlug}>
            <chakra.select name="provinceSlug" defaultValue={d.provinceSlug ?? ""} {...fieldStyles.select}>
              <option value="">National</option>
              {provinces.map((p) => (
                <option key={p.slug} value={p.slug}>{p.name.en} / {p.name.ne}</option>
              ))}
            </chakra.select>
          </Field>
          <Field label="Author" required error={issues.authorId}>
            <AuthorField options={authorOptions} defaultValue={d.authorId} canAdd={canAddAuthors} />
          </Field>
        </SimpleGrid>

        <Field label="Featured image" required error={issues.imageUrl}>
          <ImageUploadField
            folder="articles"
            defaultValue={d.imageUrl}
            hint="JPEG, PNG, WebP or GIF, up to 5MB. Recommended 1200×675px (16:9)."
          />
        </Field>

        <Field label="Tags" hint="Comma-separated slugs">
          <chakra.input name="tagSlugs" defaultValue={d.tagSlugs} placeholder="politics,breaking" {...fieldStyles.input} />
        </Field>
      </FormSection>

      <FormSection title="SEO & URL" description="The slug is the article's web address; the meta description is the snippet shown in search results.">
        <Field
          label="URL slug"
          error={issues.slug}
          hint="English letters, numbers and hyphens only, up to 70 characters. Leave blank to auto-generate from the title. Changing it on a published article changes its link."
        >
          <chakra.input
            name="slug"
            defaultValue={d.slug}
            maxLength={70}
            placeholder="this-is-a-good-headline"
            {...fieldStyles.input}
          />
        </Field>
        <Field
          label="Meta description"
          error={issues.metaDescription}
          hint="Shown in Google results. Aim for 150–160 characters. Falls back to the excerpt if blank."
        >
          <chakra.textarea
            name="metaDescription"
            defaultValue={d.metaDescription}
            maxLength={200}
            h="72px"
            {...fieldStyles.textarea}
          />
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
