"use client";

import { Box, Flex, Text, chakra } from "@chakra-ui/react";
import { useFormStatus } from "react-dom";
import { AlertCircle, Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import type { FormState } from "./formState";

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
  error,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  /** Server-side message for this field, from FormState.issues. */
  error?: string;
  children: ReactNode;
}) {
  return (
    <Box mb="16px">
      <Flex align="baseline" gap="4px" mb="5px">
        <Text fontSize="13px" fontWeight="600" color="var(--color-body)">{label}</Text>
        {required && <Text fontSize="13px" color="var(--color-danger-fg)" lineHeight="1">*</Text>}
      </Flex>
      {children}
      {/* The error replaces the hint rather than stacking under it: once
          something is wrong, the generic guidance is just noise. */}
      {error ? (
        <Flex align="flex-start" gap="5px" mt="5px">
          <Box color="var(--color-danger-fg)" mt="1px" flexShrink={0} display="flex">
            <AlertCircle size={13} strokeWidth={2} aria-hidden="true" />
          </Box>
          <Text fontSize="12px" color="var(--color-danger-fg)" lineHeight="1.5">{error}</Text>
        </Flex>
      ) : (
        hint && (
          <Text fontSize="11px" color="var(--color-muted)" mt="5px" lineHeight="1.5">{hint}</Text>
        )
      )}
    </Box>
  );
}

/**
 * Summary shown above a form after a rejected save.
 *
 * Field-level messages alone are easy to miss on a form this long — the failing
 * field can be well off screen when the page re-renders at the submit button.
 */
export function FormError({ state }: { state: FormState }) {
  if (state.status !== "error") return null;

  const fieldIssues = Object.entries(state.issues);

  return (
    <Box
      mb="20px"
      p="12px 14px"
      borderRadius="6px"
      bg="var(--color-danger-bg)"
      border="1px solid color-mix(in srgb, var(--color-danger-fg) 30%, transparent)"
      role="alert"
    >
      <Flex align="flex-start" gap="8px">
        <Box color="var(--color-danger-fg)" mt="1px" flexShrink={0} display="flex">
          <AlertCircle size={16} strokeWidth={2} aria-hidden="true" />
        </Box>
        <Box>
          <Text fontSize="13px" fontWeight="600" color="var(--color-danger-fg)" lineHeight="1.5">
            {state.message}
          </Text>
          {fieldIssues.length > 0 && (
            <Box as="ul" mt="6px" pl="16px">
              {fieldIssues.map(([field, message]) => (
                <Text as="li" key={field} fontSize="12px" color="var(--color-danger-fg)" lineHeight="1.7">
                  {message}
                </Text>
              ))}
            </Box>
          )}
          <Text fontSize="12px" color="var(--color-danger-fg)" opacity={0.85} mt="6px" lineHeight="1.5">
            Nothing was saved, and everything you typed is still here.
          </Text>
        </Box>
      </Flex>
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

/**
 * Disables itself while the action is in flight. Without this the button stayed
 * live during the round trip, and a double-click submitted the form twice —
 * which on the create forms meant two articles.
 */
export function SubmitButton({ children }: { children: ReactNode }) {
  const { pending } = useFormStatus();

  return (
    <chakra.button
      type="submit"
      disabled={pending}
      display="inline-flex"
      alignItems="center"
      gap="8px"
      px="22px"
      py="11px"
      bg="var(--color-brand)"
      color="white"
      border="none"
      borderRadius="6px"
      fontSize="14px"
      fontWeight="700"
      cursor={pending ? "default" : "pointer"}
      opacity={pending ? 0.65 : 1}
      transition="opacity 0.15s"
      _hover={pending ? {} : { opacity: 0.9 }}
    >
      {pending && (
        <Box css={{ animation: "spin 1s linear infinite" }} display="flex">
          <Loader2 size={15} strokeWidth={2.2} aria-hidden="true" />
        </Box>
      )}
      {pending ? "Saving..." : children}
    </chakra.button>
  );
}
