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
    heroImage?: string;
    bodyNe?: string;
    bodyEn?: string;
    slug?: string;
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

      <FormSection title="URL & publishing" description="The slug is the post's web address.">
        <Field
          label="URL slug"
          error={issues.slug}
          hint="English letters, numbers and hyphens only, up to 70 characters. Leave blank to auto-generate from the title."
        >
          <chakra.input
            name="slug"
            defaultValue={d.slug}
            maxLength={70}
            placeholder="how-to-get-facebook-ad-clients"
            {...fieldStyles.input}
          />
        </Field>

        <Flex gap="12px" flexWrap="wrap" mt="4px">
          {showPublish && (
            <CheckboxField name="publish" label="Publish immediately" hint="Otherwise saved as a draft" />
          )}
        </Flex>
      </FormSection>

      <SubmitButton>{submitLabel}</SubmitButton>
    </form>
  );
}
