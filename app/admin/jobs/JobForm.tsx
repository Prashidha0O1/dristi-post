"use client";

import { Flex, SimpleGrid, chakra } from "@chakra-ui/react";
import { employmentTypes } from "@/lib/domain/job";
import { provinces } from "@/lib/domain/province";
import {
  CheckboxField,
  Field,
  FormSection,
  SubmitButton,
  fieldStyles,
} from "../formUi";

interface Props {
  action: (formData: FormData) => Promise<void>;
  defaultValues?: {
    titleNe?: string;
    titleEn?: string;
    company?: string;
    location?: string;
    provinceSlug?: string;
    employmentType?: string;
    descriptionNe?: string;
    descriptionEn?: string;
    salary?: string;
    deadline?: string;
    applyUrl?: string;
    isFeatured?: boolean;
  };
  submitLabel: string;
  showPublish?: boolean;
}

export function JobForm({ action, defaultValues: d = {}, submitLabel, showPublish }: Props) {
  return (
    <form action={action}>
      <FormSection title="Role" description="Nepali is required; English is optional and used for the URL when present.">
        <SimpleGrid columns={{ base: 1, md: 2 }} gap="16px">
          <Field label="Job title (Nepali)" required>
            <chakra.input name="titleNe" defaultValue={d.titleNe} required {...fieldStyles.input} />
          </Field>
          <Field label="Job title (English)">
            <chakra.input name="titleEn" defaultValue={d.titleEn} {...fieldStyles.input} />
          </Field>
        </SimpleGrid>

        <SimpleGrid columns={{ base: 1, md: 2 }} gap="16px">
          <Field label="Company" required>
            <chakra.input name="company" defaultValue={d.company} required {...fieldStyles.input} />
          </Field>
          <Field label="Location" required hint="City or area, e.g. काठमाडौं or Remote">
            <chakra.input name="location" defaultValue={d.location} required {...fieldStyles.input} />
          </Field>
        </SimpleGrid>
      </FormSection>

      <FormSection title="Terms">
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} gap="16px">
          <Field label="Employment type" required>
            <chakra.select name="employmentType" defaultValue={d.employmentType} required {...fieldStyles.select}>
              <option value="">Select...</option>
              {employmentTypes.map((t) => (
                <option key={t.value} value={t.value}>{t.name.en} / {t.name.ne}</option>
              ))}
            </chakra.select>
          </Field>
          <Field label="Province">
            <chakra.select name="provinceSlug" defaultValue={d.provinceSlug ?? ""} {...fieldStyles.select}>
              <option value="">Not province-specific</option>
              {provinces.map((p) => (
                <option key={p.slug} value={p.slug}>{p.name.en} / {p.name.ne}</option>
              ))}
            </chakra.select>
          </Field>
          <Field label="Deadline" hint="Empty means open until filled">
            <chakra.input type="date" name="deadline" defaultValue={d.deadline} {...fieldStyles.input} />
          </Field>
        </SimpleGrid>

        <SimpleGrid columns={{ base: 1, md: 2 }} gap="16px">
          <Field label="Salary" hint="Free text, e.g. रु. ५०,०००–७०,००० or Negotiable">
            <chakra.input name="salary" defaultValue={d.salary} {...fieldStyles.input} />
          </Field>
          <Field label="Apply link or email" required hint="Full https:// URL, or an email address">
            <chakra.input name="applyUrl" defaultValue={d.applyUrl} required placeholder="https://... or jobs@company.com" {...fieldStyles.input} />
          </Field>
        </SimpleGrid>
      </FormSection>

      <FormSection title="Description" description="Separate paragraphs with a blank line.">
        <SimpleGrid columns={{ base: 1, md: 2 }} gap="16px">
          <Field label="Description (Nepali)" required>
            <chakra.textarea name="descriptionNe" defaultValue={d.descriptionNe} required h="240px" {...fieldStyles.textarea} />
          </Field>
          <Field label="Description (English)">
            <chakra.textarea name="descriptionEn" defaultValue={d.descriptionEn} h="240px" {...fieldStyles.textarea} />
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
