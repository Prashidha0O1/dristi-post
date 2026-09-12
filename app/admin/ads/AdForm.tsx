"use client";

import { Box, Flex, SimpleGrid, Text, chakra } from "@chakra-ui/react";
import { useActionState, useState } from "react";
import { Info } from "lucide-react";
import {
  AD_SLOTS,
  adPlacements,
  formatAdSlotSize,
  type AdPlacement,
} from "@/lib/adSlots";
import { ImageUploadField } from "../ImageUploadField";
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
    placement?: AdPlacement;
    imageUrl?: string;
    linkUrl?: string;
    altText?: string;
  };
  submitLabel: string;
  showActivate?: boolean;
}

export function AdForm({ action, defaultValues: d = {}, submitLabel, showActivate }: Props) {
  // The chosen slot decides which dimensions the upload will accept, so unlike
  // the other admin forms this one field has to be controlled — the uploader
  // needs to know the target before a file is picked, not at submit time.
  const [placement, setPlacement] = useState<AdPlacement | "">(d.placement ?? "");
  const spec = placement ? AD_SLOTS[placement] : null;

  const [state, formAction] = useActionState(action, idleFormState);
  const issues = state.status === "error" ? state.issues : {};

  return (
    <form action={formAction}>
      <FormError state={state} />
      <FormSection
        title="Slot"
        description="Where this ad appears. Each slot accepts one live ad at a time."
      >
        <Field label="Placement" required error={issues.placement}>
          <chakra.select
            name="placement"
            value={placement}
            onChange={(e) => setPlacement(e.target.value as AdPlacement | "")}
            required
            {...fieldStyles.select}
          >
            <option value="">Select...</option>
            {adPlacements.map((p) => (
              <option key={p} value={p}>
                {AD_SLOTS[p].label} — {formatAdSlotSize(p)}
              </option>
            ))}
          </chakra.select>
        </Field>

        {spec && (
          <Flex
            gap="9px"
            align="flex-start"
            px="14px"
            py="11px"
            mb="16px"
            borderRadius="8px"
            bg="var(--color-info-bg)"
            color="var(--color-info-fg)"
            fontSize="13px"
            lineHeight="1.6"
          >
            <Box mt="1px" flexShrink={0}>
              <Info size={15} strokeWidth={2} aria-hidden="true" />
            </Box>
            <Box>
              <Text fontWeight="700" mb="2px">
                Needs a {formatAdSlotSize(placement as AdPlacement)} image
              </Text>
              <Text>
                {spec.where}. Uploads must match those proportions and be at least{" "}
                {spec.minWidth}px wide — anything else is rejected.
              </Text>
            </Box>
          </Flex>
        )}
      </FormSection>

      <FormSection title="Creative">
        <Field label="Ad image" required error={issues.imageUrl}>
          {placement ? (
            <ImageUploadField
              folder="ads"
              placement={placement as AdPlacement}
              defaultValue={d.imageUrl}
              hint={`${formatAdSlotSize(placement as AdPlacement)} (or a larger multiple), JPEG, PNG, WebP or GIF, up to 5MB.`}
            />
          ) : (
            <Text
              px="14px"
              py="12px"
              borderRadius="6px"
              border="1px dashed var(--color-border)"
              fontSize="13px"
              color="var(--color-muted)"
            >
              Choose a placement first — it determines the image size required.
            </Text>
          )}
        </Field>

        <SimpleGrid columns={{ base: 1, md: 2 }} gap="16px">
          <Field label="Click-through link" required hint="Full https:// URL of the advertiser" error={issues.linkUrl}>
            <chakra.input
              name="linkUrl"
              type="url"
              defaultValue={d.linkUrl}
              required
              placeholder="https://advertiser.example.com"
              {...fieldStyles.input}
            />
          </Field>
          <Field
            label="Alt text"
            required
            hint="Describes the ad for screen readers and when the image fails to load"
            error={issues.altText}
          >
            <chakra.input
              name="altText"
              defaultValue={d.altText}
              required
              maxLength={160}
              {...fieldStyles.input}
            />
          </Field>
        </SimpleGrid>
      </FormSection>

      {showActivate && (
        <FormSection title="Status">
          <Flex gap="12px" flexWrap="wrap">
            <CheckboxField
              name="activate"
              label="Make live immediately"
              hint="Replaces whatever ad currently holds this slot"
            />
          </Flex>
        </FormSection>
      )}

      <SubmitButton>{submitLabel}</SubmitButton>
    </form>
  );
}
