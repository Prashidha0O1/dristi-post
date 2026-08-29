"use client";

import { Flex, Text, Input, SimpleGrid, chakra } from "@chakra-ui/react";
import { employmentTypes } from "@/lib/domain/job";
import { provinces } from "@/lib/domain/province";

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

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <chakra.div mb="16px">
      <Text fontSize="13px" fontWeight="600" color="var(--color-body)" mb="4px">{label}</Text>
      {children}
      {hint && (
        <Text fontSize="11px" color="var(--color-muted)" mt="4px">{hint}</Text>
      )}
    </chakra.div>
  );
}

const inputStyle = { h: "40px", border: "1px solid var(--color-border)", borderRadius: "4px", px: "12px", fontSize: "14px" } as const;
const textareaStyle = { w: "full" as const, p: "12px", border: "1px solid var(--color-border)", borderRadius: "4px", fontSize: "14px" };
const selectStyle = { w: "full" as const, h: "40px", border: "1px solid var(--color-border)", borderRadius: "4px", px: "8px", fontSize: "14px", bg: "var(--color-surface)" };

export function JobForm({ action, defaultValues: d = {}, submitLabel, showPublish }: Props) {
  return (
    <form action={action}>
      <SimpleGrid columns={{ base: 1, md: 2 }} gap="16px">
        <Field label="Job Title (Nepali) *">
          <Input name="titleNe" defaultValue={d.titleNe} required {...inputStyle} />
        </Field>
        <Field label="Job Title (English)">
          <Input name="titleEn" defaultValue={d.titleEn} {...inputStyle} />
        </Field>
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, md: 2 }} gap="16px">
        <Field label="Company *">
          <Input name="company" defaultValue={d.company} required {...inputStyle} />
        </Field>
        <Field label="Location *" hint="City or area, e.g. काठमाडौं / Remote">
          <Input name="location" defaultValue={d.location} required {...inputStyle} />
        </Field>
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} gap="16px">
        <Field label="Employment Type *">
          <chakra.select name="employmentType" defaultValue={d.employmentType} required {...selectStyle}>
            <option value="">Select...</option>
            {employmentTypes.map((t) => (
              <option key={t.value} value={t.value}>{t.name.en} / {t.name.ne}</option>
            ))}
          </chakra.select>
        </Field>
        <Field label="Province">
          <chakra.select name="provinceSlug" defaultValue={d.provinceSlug ?? ""} {...selectStyle}>
            <option value="">Not province-specific</option>
            {provinces.map((p) => (
              <option key={p.slug} value={p.slug}>{p.name.en} / {p.name.ne}</option>
            ))}
          </chakra.select>
        </Field>
        <Field label="Deadline" hint="Leave empty for open until filled">
          <Input type="date" name="deadline" defaultValue={d.deadline} {...inputStyle} />
        </Field>
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, md: 2 }} gap="16px">
        <Field label="Salary" hint="Free text, e.g. रु. ५०,०००–७०,००० or Negotiable">
          <Input name="salary" defaultValue={d.salary} {...inputStyle} />
        </Field>
        <Field label="Apply Link or Email *" hint="Full https:// URL, or an email address">
          <Input name="applyUrl" defaultValue={d.applyUrl} required {...inputStyle} placeholder="https://... or jobs@company.com" />
        </Field>
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, md: 2 }} gap="16px">
        <Field label="Description (Nepali) *">
          <chakra.textarea name="descriptionNe" defaultValue={d.descriptionNe} required h="200px" {...textareaStyle} />
        </Field>
        <Field label="Description (English)">
          <chakra.textarea name="descriptionEn" defaultValue={d.descriptionEn} h="200px" {...textareaStyle} />
        </Field>
      </SimpleGrid>

      <Flex gap="20px" mb="24px" flexWrap="wrap">
        <chakra.label display="flex" alignItems="center" gap="6px" fontSize="14px" color="var(--color-body)" cursor="pointer">
          <input type="checkbox" name="isFeatured" defaultChecked={d.isFeatured} /> Featured
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
