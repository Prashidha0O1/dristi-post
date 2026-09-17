"use client";

import { Box, Flex, SimpleGrid, chakra } from "@chakra-ui/react";
import { useActionState, useRef, useState, type RefObject } from "react";
import { Languages, Loader2 } from "lucide-react";
import { toaster } from "@/components/ui/toaster";
import { translateTextAction } from "../translateActions";
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
    metaDescNe?: string;
    metaDescEn?: string;
    scheduledAt?: string;
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

type TextEl = HTMLInputElement | HTMLTextAreaElement;

/**
 * A pair of "translate" buttons that machine-fill one language field from the
 * other, so an editor who typed only Nepali (or only English) can generate a
 * draft of the missing side and proofread it before saving.
 */
function TranslateRow({ neRef, enRef }: { neRef: RefObject<TextEl | null>; enRef: RefObject<TextEl | null> }) {
  const [busy, setBusy] = useState<"toEn" | "toNe" | null>(null);

  async function run(dir: "toEn" | "toNe") {
    const from = dir === "toEn" ? neRef.current : enRef.current;
    const to = dir === "toEn" ? enRef.current : neRef.current;
    const source = (from?.value ?? "").trim();
    if (!source) {
      toaster.create({ type: "error", title: "Nothing to translate", description: dir === "toEn" ? "Type the Nepali text first." : "Type the English text first." });
      return;
    }
    setBusy(dir);
    try {
      const res = await translateTextAction(source, dir === "toEn" ? "ne" : "en", dir === "toEn" ? "en" : "ne");
      if (!res.ok) {
        toaster.create({ type: "error", title: "Translation failed", description: res.error });
        return;
      }
      if (to) to.value = res.text;
      toaster.create({ type: "success", title: "Translated", description: "Review the result before saving — machine translation isn't perfect." });
    } finally {
      setBusy(null);
    }
  }

  const btn = {
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    px: "10px",
    py: "5px",
    fontSize: "12px",
    fontWeight: "600",
    borderRadius: "5px",
    border: "1px solid var(--color-border)",
    bg: "var(--color-surface)",
    color: "var(--color-body)",
    cursor: busy ? "default" : "pointer",
    opacity: busy ? 0.6 : 1,
    _hover: busy ? {} : { borderColor: "var(--color-brand)" },
  } as const;

  const Spin = () => (
    <Box css={{ animation: "spin 1s linear infinite", display: "inline-flex" }}>
      <Loader2 size={13} strokeWidth={2} aria-hidden="true" />
    </Box>
  );

  return (
    <Flex gap="8px" mt="-6px" mb="4px" flexWrap="wrap" align="center">
      <chakra.span fontSize="12px" color="var(--color-muted)" display="inline-flex" alignItems="center" gap="5px">
        <Languages size={13} strokeWidth={2} aria-hidden="true" /> Auto-translate:
      </chakra.span>
      <chakra.button type="button" disabled={!!busy} onClick={() => run("toEn")} {...btn}>
        {busy === "toEn" ? <Spin /> : null} नेपाली → English
      </chakra.button>
      <chakra.button type="button" disabled={!!busy} onClick={() => run("toNe")} {...btn}>
        {busy === "toNe" ? <Spin /> : null} English → नेपाली
      </chakra.button>
    </Flex>
  );
}

export function ArticleForm({ action, authorOptions, defaultValues: d = {}, submitLabel, showPublish, canAddAuthors = false }: Props) {
  const titleNeRef = useRef<HTMLInputElement>(null);
  const titleEnRef = useRef<HTMLInputElement>(null);
  const excerptNeRef = useRef<HTMLTextAreaElement>(null);
  const excerptEnRef = useRef<HTMLTextAreaElement>(null);

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
            <chakra.input ref={titleNeRef} name="titleNe" defaultValue={d.titleNe} {...fieldStyles.input} />
          </Field>
          <Field label="Title (English)" error={issues["title.en"]}>
            <chakra.input ref={titleEnRef} name="titleEn" defaultValue={d.titleEn} {...fieldStyles.input} />
          </Field>
        </SimpleGrid>
        <TranslateRow neRef={titleNeRef} enRef={titleEnRef} />

        <SimpleGrid columns={{ base: 1, md: 2 }} gap="16px">
          <Field label="Excerpt (Nepali)" error={issues["excerpt.ne"]}>
            <chakra.textarea ref={excerptNeRef} name="excerptNe" defaultValue={d.excerptNe} h="86px" {...fieldStyles.textarea} />
          </Field>
          <Field label="Excerpt (English)">
            <chakra.textarea ref={excerptEnRef} name="excerptEn" defaultValue={d.excerptEn} h="86px" {...fieldStyles.textarea} />
          </Field>
        </SimpleGrid>
        <TranslateRow neRef={excerptNeRef} enRef={excerptEnRef} />
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
          <CheckboxField name="isFeatured" label="Featured" hint="Top stories on the homepage" defaultChecked={d.isFeatured} />
          <CheckboxField name="isBreaking" label="Breaking" hint="Shows in the ticker" defaultChecked={d.isBreaking} />
          <CheckboxField name="isTrending" label="Trending" hint="Appears on /trending" defaultChecked={d.isTrending} />
          {showPublish && (
            <CheckboxField name="publish" label="Publish immediately" hint="Otherwise saved as a draft" />
          )}
        </Flex>

        <Box mt="16px">
          <Field
            label="Schedule publish"
            hint="Optional. Pick a future date/time to publish automatically then. Leave blank to publish now or keep as a draft."
          >
            <chakra.input type="datetime-local" name="scheduledAt" defaultValue={d.scheduledAt} {...fieldStyles.input} />
          </Field>
        </Box>
      </FormSection>

      <SubmitButton>{submitLabel}</SubmitButton>
    </form>
  );
}
