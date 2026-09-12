"use client";

import { Box, Flex, Text, chakra } from "@chakra-ui/react";
import { AlertTriangle, RotateCw } from "lucide-react";
import Link from "next/link";

/**
 * Admin error boundary.
 *
 * Before this existed, any throw during an admin render (a missing env var, a
 * rejected query, a ValidationError) produced an opaque full-page failure with
 * nothing to diagnose from. Editors saw "server error" and lost their work.
 *
 * Caveat worth knowing: in a production build Next deliberately redacts server
 * error messages before they reach the client and replaces them with a digest.
 * So `error.message` is only the real text in development — in production the
 * digest is the thing to match against the host's function log. Both are shown.
 */
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Box maxW="640px">
      <Flex align="center" gap="10px" mb="10px">
        <Box color="var(--color-danger-fg)" display="flex">
          <AlertTriangle size={20} strokeWidth={2} aria-hidden="true" />
        </Box>
        <Text fontSize="18px" fontWeight="700" color="var(--color-headline)">
          This page failed to load
        </Text>
      </Flex>

      <Text fontSize="14px" lineHeight="1.7" color="var(--color-subtle)" mb="16px">
        Nothing was saved. You can retry, and if it keeps happening send the details
        below to whoever maintains the site.
      </Text>

      <Box
        bg="var(--color-neutral-bg)"
        border="1px solid var(--color-border)"
        borderRadius="6px"
        p="12px"
        mb="16px"
      >
        <Text
          fontSize="12px"
          fontFamily="var(--font-geist-mono), ui-monospace, monospace"
          lineHeight="1.7"
          color="var(--color-headline)"
          whiteSpace="pre-wrap"
          wordBreak="break-word"
        >
          {error.message || "No error message was provided."}
        </Text>
        {error.digest && (
          <Text
            fontSize="11px"
            fontFamily="var(--font-geist-mono), ui-monospace, monospace"
            color="var(--color-muted)"
            mt="8px"
          >
            Digest: {error.digest}
          </Text>
        )}
      </Box>

      <Flex gap="10px" align="center">
        <chakra.button
          type="button"
          onClick={reset}
          display="inline-flex"
          alignItems="center"
          gap="6px"
          px="14px"
          py="9px"
          borderRadius="6px"
          fontSize="14px"
          fontWeight="600"
          color="white"
          bg="var(--color-brand)"
          border="none"
          cursor="pointer"
          _hover={{ opacity: 0.9 }}
          transition="opacity 0.15s"
        >
          <RotateCw size={15} strokeWidth={2} aria-hidden="true" />
          Try again
        </chakra.button>
        <Link href="/admin">
          <Text fontSize="14px" fontWeight="500" color="var(--color-subtle)" _hover={{ color: "var(--color-brand)" }}>
            Back to dashboard
          </Text>
        </Link>
      </Flex>
    </Box>
  );
}
