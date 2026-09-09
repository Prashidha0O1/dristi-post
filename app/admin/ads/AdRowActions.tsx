"use client";

import { Flex, chakra } from "@chakra-ui/react";
import Link from "next/link";

/**
 * Activate / deactivate / delete for one ad row. A Client Component only so
 * delete can confirm first; the work stays in Server Actions, passed in already
 * bound to an id.
 */
export function AdRowActions({
  id,
  isActive,
  activateAction,
  deactivateAction,
  deleteAction,
}: {
  id: string;
  isActive: boolean;
  activateAction: () => Promise<void>;
  deactivateAction: () => Promise<void>;
  deleteAction: () => Promise<void>;
}) {
  const base = {
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    bg: "transparent",
    border: "none",
    p: "0",
    transition: "color 0.12s",
  } as const;

  return (
    <Flex gap="12px" align="center" justify="flex-end">
      <Link href={`/admin/ads/${id}/edit`}>
        <chakra.span {...base} color="var(--color-brand)" _hover={{ textDecoration: "underline" }}>
          Edit
        </chakra.span>
      </Link>

      <form action={isActive ? deactivateAction : activateAction}>
        <chakra.button
          type="submit"
          {...base}
          color="var(--color-muted)"
          _hover={{ color: "var(--color-headline)", textDecoration: "underline" }}
          title={
            isActive
              ? "Take this ad down — the slot falls back to the placeholder"
              : "Make this the live ad for its slot, replacing any current one"
          }
        >
          {isActive ? "Deactivate" : "Make live"}
        </chakra.button>
      </form>

      <form
        action={deleteAction}
        onSubmit={(e) => {
          if (!window.confirm("Delete this ad permanently? This cannot be undone.")) {
            e.preventDefault();
          }
        }}
      >
        <chakra.button
          type="submit"
          {...base}
          color="var(--color-danger-fg)"
          _hover={{ textDecoration: "underline" }}
        >
          Delete
        </chakra.button>
      </form>
    </Flex>
  );
}
