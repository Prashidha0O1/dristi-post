"use client";

import { Flex, SimpleGrid, chakra } from "@chakra-ui/react";
import { useActionState } from "react";
import { ImageUploadField } from "../ImageUploadField";
import { RichTextField } from "../RichTextField";
import {
  CheckboxField,
  Field,
  FormError,
  FormSection,
  SubmitButton,
  fieldStyles,
} from "../formUi";
import { idleFormState, type FormState } from "../formState";

interface Props {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  defaultValues?: {
    titleNe?: string;
    titleEn?: string;
    excerptNe?: string;
    excerptEn?: string;
    metaDescNe?: string;
    metaDescEn?: string;
    heroImage?: string;
    bodyNe?: string;
    bodyEn?: string;
    slug?: string;
    isFeatured?: boolean;
  };
  submitLabel: string;
  showPublish?: boolean;
}

export function BlogForm({ action, defaultValues: d = {}, submitLabel, showPublish }: Props) {
  const [state, formAction] = useActionState(action, idleFormState);
  const issues = state.status === "error" ? state.issues : {};

  return (
    <form action={formAction}>
      <FormError state={state} />

      <FormSection title="Title" description="Fill in either language — English is used for the URL when present.">
        <SimpleGrid columns={{ base: 1, md: 2 }} gap="16px">
          <Field label="Title (Nepali)" error={issues["title.ne"]}>
            <chakra.input name="titleNe" defaultValue={d.titleNe} {...fieldStyles.input} />
          </Field>
          <Field label="Title (English)" error={issues["title.en"]}>
            <chakra.input name="titleEn" defaultValue={d.titleEn} {...fieldStyles.input} />
          </Field>
        </SimpleGrid>

        <SimpleGrid columns={{ base: 1, md: 2 }} gap="16px">
          <Field label="Excerpt (Nepali)" hint="Optional — shown on the blog card" error={issues["excerpt.ne"]}>
            <chakra.textarea name="excerptNe" defaultValue={d.excerptNe} h="86px" {...fieldStyles.textarea} />
          </Field>
          <Field label="Excerpt (English)" hint="Optional">
            <chakra.textarea name="excerptEn" defaultValue={d.excerptEn} h="86px" {...fieldStyles.textarea} />
          </Field>
        </SimpleGrid>
      </FormSection>

      <FormSection title="Hero image" description="The banner shown at the top of the post and on the blog card.">
        <Field label="Hero image" required error={issues.heroImage}>
          <ImageUploadField
            name="heroImage"
            folder="blog"
            defaultValue={d.heroImage}
            hint="JPEG, PNG, WebP or GIF, up to 5MB. Recommended 1200×675px (16:9)."
          />
        </Field>
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

      <FormSection title="SEO & URL" description="The slug is the post's web address; the meta description is the snippet shown in search results.">
        <Field
          label="URL slug"
          error={issues.slug}
          hint="English letters, numbers and hyphens only, up to 70 characters. Leave blank to auto-generate from the title. Changing it on a published post changes its link."
        >
          <chakra.input
            name="slug"
            defaultValue={d.slug}
            maxLength={70}
            placeholder="this-is-a-good-headline"
            {...fieldStyles.input}
          />
        </Field>
        <SimpleGrid columns={{ base: 1, md: 2 }} gap="16px">
          <Field label="Meta Description (Nepali)" hint="Optional — used for SEO. Falls back to excerpt." error={issues["metaDescription.ne"]}>
            <chakra.textarea name="metaDescNe" defaultValue={d.metaDescNe} maxLength={200} h="72px" {...fieldStyles.textarea} />
          </Field>
          <Field label="Meta Description (English)" hint="Optional">
            <chakra.textarea name="metaDescEn" defaultValue={d.metaDescEn} maxLength={200} h="72px" {...fieldStyles.textarea} />
          </Field>
        </SimpleGrid>
      </FormSection>

      <FormSection title="Placement" description="Controls where this appears on the public site.">
        <Flex gap="12px" flexWrap="wrap">
          <CheckboxField
            name="isFeatured"
            label="Featured Blog"
            hint="Show this blog at the very top of the blog list"
            defaultChecked={d.isFeatured}
          />
          {showPublish && (
            <CheckboxField name="publish" label="Publish immediately" hint="Otherwise saved as a draft" />
          )}
        </Flex>
      </FormSection>

      <SubmitButton>{submitLabel}</SubmitButton>
    </form>
  );
}
