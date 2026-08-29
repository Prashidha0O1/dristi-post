"use client";

import { Flex, chakra } from "@chakra-ui/react";
import Link from "next/link";

/**
 * Publish / unpublish / delete controls for one row.
 *
 * A Client Component so the destructive action can confirm first; the actual
 * work stays in Server Actions, which are passed in already bound to an id.
 */
export function JobRowActions({
  id,
  status,
  publishAction,
  unpublishAction,
  deleteAction,
}: {
  id: string;
  status: "draft" | "published";
  publishAction: () => Promise<void>;
  unpublishAction: () => Promise<void>;
  deleteAction: () => Promise<void>;
}) {
  const linkStyle = {
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    bg: "transparent",
    border: "none",
    p: "0",
  } as const;

  return (
    <Flex gap="10px" align="center" justify="flex-end">
      <Link href={`/admin/jobs/${id}/edit`}>
        <chakra.span {...linkStyle} color="var(--color-brand)" _hover={{ textDecoration: "underline" }}>
          Edit
        </chakra.span>
      </Link>

      <form action={status === "published" ? unpublishAction : publishAction}>
        <chakra.button
          type="submit"
          {...linkStyle}
          color="var(--color-muted)"
          _hover={{ color: "var(--color-headline)", textDecoration: "underline" }}
        >
          {status === "published" ? "Unpublish" : "Publish"}
        </chakra.button>
      </form>

      <form
        action={deleteAction}
        onSubmit={(e) => {
          if (!window.confirm("Delete this job listing permanently? This cannot be undone.")) {
            e.preventDefault();
          }
        }}
      >
        <chakra.button
          type="submit"
          {...linkStyle}
          color="#dc2626"
          _hover={{ textDecoration: "underline" }}
        >
          Delete
        </chakra.button>
      </form>
    </Flex>
  );
}
