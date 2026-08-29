"use client";

import { Box, Flex, Text, chakra } from "@chakra-ui/react";
import type { ReactNode } from "react";

/**
 * Form primitives shared by ArticleForm and JobForm.
 *
 * Both forms previously repeated the same inline style objects; centralising
 * them keeps focus rings, borders and dark-mode surfaces consistent between the
 * two (and with the rest of the admin).
 */

export const fieldStyles = {
  input: {
    h: "40px",
    w: "full" as const,
    border: "1px solid var(--color-input-border)",
    bg: "var(--color-input-bg)",
    color: "var(--color-body)",
    borderRadius: "6px",
    px: "12px",
    fontSize: "14px",
    transition: "border-color 0.12s, box-shadow 0.12s",
    _hover: { borderColor: "var(--color-muted)" },
    _focus: {
      outline: "none",
      borderColor: "var(--color-brand)",
      boxShadow: "0 0 0 3px color-mix(in srgb, var(--color-brand) 18%, transparent)",
    },
  },
  textarea: {
    w: "full" as const,
    p: "12px",
    border: "1px solid var(--color-input-border)",
    bg: "var(--color-input-bg)",
    color: "var(--color-body)",
    borderRadius: "6px",
    fontSize: "14px",
    lineHeight: "1.6",
    resize: "vertical" as const,
    transition: "border-color 0.12s, box-shadow 0.12s",
    _hover: { borderColor: "var(--color-muted)" },
    _focus: {
      outline: "none",
      borderColor: "var(--color-brand)",
      boxShadow: "0 0 0 3px color-mix(in srgb, var(--color-brand) 18%, transparent)",
    },
  },
  select: {
    w: "full" as const,
    h: "40px",
    border: "1px solid var(--color-input-border)",
    bg: "var(--color-input-bg)",
    color: "var(--color-body)",
    borderRadius: "6px",
    px: "10px",
    fontSize: "14px",
    cursor: "pointer",
    transition: "border-color 0.12s, box-shadow 0.12s",
    _hover: { borderColor: "var(--color-muted)" },
    _focus: {
      outline: "none",
      borderColor: "var(--color-brand)",
      boxShadow: "0 0 0 3px color-mix(in srgb, var(--color-brand) 18%, transparent)",
    },
  },
} as const;

export function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <Box mb="16px">
      <Flex align="baseline" gap="4px" mb="5px">
        <Text fontSize="13px" fontWeight="600" color="var(--color-body)">{label}</Text>
        {required && <Text fontSize="13px" color="var(--color-danger-fg)" lineHeight="1">*</Text>}
      </Flex>
      {children}
      {hint && (
        <Text fontSize="11px" color="var(--color-muted)" mt="5px" lineHeight="1.5">{hint}</Text>
      )}
    </Box>
  );
}

/** Titled group of related fields, so long forms scan in sections. */
export function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <Box
      mb="24px"
      pb="20px"
      borderBottom="1px solid var(--color-border)"
      css={{ "&:last-of-type": { borderBottom: "none", paddingBottom: 0, marginBottom: "8px" } }}
    >
      <Box mb="14px">
        <Text fontSize="14px" fontWeight="700" color="var(--color-headline)">{title}</Text>
        {description && (
          <Text fontSize="12px" color="var(--color-muted)" mt="2px">{description}</Text>
        )}
      </Box>
      {children}
    </Box>
  );
}

export function CheckboxField({
  name,
  label,
  hint,
  defaultChecked,
}: {
  name: string;
  label: string;
  hint?: string;
  defaultChecked?: boolean;
}) {
  return (
    <chakra.label
      display="flex"
      alignItems="flex-start"
      gap="9px"
      px="12px"
      py="10px"
      border="1px solid var(--color-border)"
      borderRadius="6px"
      cursor="pointer"
      flex="1"
      minW="180px"
      transition="border-color 0.12s"
      _hover={{ borderColor: "var(--color-brand)" }}
    >
      <chakra.input type="checkbox" name={name} defaultChecked={defaultChecked} mt="2px" cursor="pointer" />
      <Box>
        <Text fontSize="14px" fontWeight="500" color="var(--color-body)" lineHeight="1.3">{label}</Text>
        {hint && <Text fontSize="11px" color="var(--color-muted)" mt="2px">{hint}</Text>}
      </Box>
    </chakra.label>
  );
}

export function SubmitButton({ children }: { children: ReactNode }) {
  return (
    <chakra.button
      type="submit"
      px="22px"
      py="11px"
      bg="var(--color-brand)"
      color="white"
      border="none"
      borderRadius="6px"
      fontSize="14px"
      fontWeight="700"
      cursor="pointer"
      transition="opacity 0.15s"
      _hover={{ opacity: 0.9 }}
    >
      {children}
    </chakra.button>
  );
}
