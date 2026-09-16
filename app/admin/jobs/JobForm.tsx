"use client";

import { Flex, SimpleGrid, chakra } from "@chakra-ui/react";
import { useActionState } from "react";
import { employmentTypes } from "@/lib/domain/job";
import { provinces } from "@/lib/domain/province";
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
    company?: string;
    location?: string;
    provinceSlug?: string;
    employmentType?: string;
    descriptionNe?: string;
    descriptionEn?: string;
    metaDescNe?: string;
    metaDescEn?: string;
    salary?: string;
    deadline?: string;
    applyUrl?: string;
    slug?: string;
    isFeatured?: boolean;
  };
  submitLabel: string;
  showPublish?: boolean;
}

export function JobForm({ action, defaultValues: d = {}, submitLabel, showPublish }: Props) {
  const [state, formAction] = useActionState(action, idleFormState);
  const issues = state.status === "error" ? state.issues : {};

  return (
    <form action={formAction}>
      <FormError state={state} />
      <FormSection title="Role" description="Fill in either language — the other is filled in automatically. English is used for the URL when present.">
        <SimpleGrid columns={{ base: 1, md: 2 }} gap="16px">
          <Field label="Job title (Nepali)" error={issues["title.ne"]}>
            <chakra.input name="titleNe" defaultValue={d.titleNe} {...fieldStyles.input} />
          </Field>
          <Field label="Job title (English)" error={issues["title.en"]}>
            <chakra.input name="titleEn" defaultValue={d.titleEn} {...fieldStyles.input} />
          </Field>
        </SimpleGrid>

        <SimpleGrid columns={{ base: 1, md: 2 }} gap="16px">
          <Field label="Company" required error={issues.company}>
            <chakra.input name="company" defaultValue={d.company} required {...fieldStyles.input} />
          </Field>
          <Field label="Location" required hint="City or area, e.g. काठमाडौं or Remote" error={issues.location}>
            <chakra.input name="location" defaultValue={d.location} required {...fieldStyles.input} />
          </Field>
        </SimpleGrid>
      </FormSection>

      <FormSection title="Terms">
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} gap="16px">
          <Field label="Employment type" required error={issues.employmentType}>
            <chakra.select name="employmentType" defaultValue={d.employmentType} required {...fieldStyles.select}>
              <option value="">Select...</option>
              {employmentTypes.map((t) => (
                <option key={t.value} value={t.value}>{t.name.en} / {t.name.ne}</option>
              ))}
            </chakra.select>
          </Field>
          <Field label="Province" error={issues.provinceSlug}>
            <chakra.select name="provinceSlug" defaultValue={d.provinceSlug ?? ""} {...fieldStyles.select}>
              <option value="">Not province-specific</option>
              {provinces.map((p) => (
                <option key={p.slug} value={p.slug}>{p.name.en} / {p.name.ne}</option>
              ))}
            </chakra.select>
          </Field>
          <Field label="Deadline" hint="Empty means open until filled" error={issues.deadline}>
            {/* min/max matter: without them a date input accepts years up to 275760. */}
            <chakra.input
              type="date"
              name="deadline"
              min="2000-01-01"
              max="2100-12-31"
              defaultValue={d.deadline}
              {...fieldStyles.input}
            />
          </Field>
        </SimpleGrid>

        <SimpleGrid columns={{ base: 1, md: 2 }} gap="16px">
          <Field label="Salary" hint="Free text, e.g. रु. ५०,०००–७०,००० or Negotiable">
            <chakra.input name="salary" defaultValue={d.salary} {...fieldStyles.input} />
          </Field>
          <Field label="Apply link or email" required hint="Full https:// URL, or an email address" error={issues.applyUrl}>
            <chakra.input name="applyUrl" defaultValue={d.applyUrl} required placeholder="https://... or jobs@company.com" {...fieldStyles.input} />
          </Field>
        </SimpleGrid>
      </FormSection>

      <FormSection title="Description" description="Separate paragraphs with a blank line.">
        <SimpleGrid columns={{ base: 1, md: 2 }} gap="16px">
          <Field label="Description (Nepali)" error={issues["description.ne"]}>
            <chakra.textarea name="descriptionNe" defaultValue={d.descriptionNe} h="240px" {...fieldStyles.textarea} />
          </Field>
          <Field label="Description (English)">
            <chakra.textarea name="descriptionEn" defaultValue={d.descriptionEn} h="240px" {...fieldStyles.textarea} />
          </Field>
        </SimpleGrid>
      </FormSection>

      <FormSection title="SEO & URL" description="The slug is the job's web address; the meta description is the snippet shown in search results.">
        <Field
          label="URL slug"
          error={issues.slug}
          hint="English letters, numbers and hyphens only, up to 70 characters. Leave blank to auto-generate from the title. Changing it on a published job changes its link."
        >
          <chakra.input
            name="slug"
            defaultValue={d.slug}
            maxLength={70}
            placeholder="senior-software-engineer"
            {...fieldStyles.input}
          />
        </Field>
        <SimpleGrid columns={{ base: 1, md: 2 }} gap="16px">
          <Field label="Meta Description (Nepali)" hint="Optional — used for SEO. Falls back to description." error={issues["metaDescription.ne"]}>
            <chakra.textarea name="metaDescNe" defaultValue={d.metaDescNe} maxLength={200} h="72px" {...fieldStyles.textarea} />
          </Field>
          <Field label="Meta Description (English)" hint="Optional">
            <chakra.textarea name="metaDescEn" defaultValue={d.metaDescEn} maxLength={200} h="72px" {...fieldStyles.textarea} />
          </Field>
        </SimpleGrid>
      </FormSection>

      <FormSection title="Placement">
        <Flex gap="12px" flexWrap="wrap">
          <CheckboxField name="isFeatured" label="Featured" hint="Highlighted on the job board" defaultChecked={d.isFeatured} />
          {showPublish && (
            <CheckboxField name="publish" label="Publish immediately" hint="Otherwise saved as a draft" />
          )}
        </Flex>
      </FormSection>

      <SubmitButton>{submitLabel}</SubmitButton>
    </form>
  );
}
