"use client";

import { Flex, chakra } from "@chakra-ui/react";
import Link from "next/link";

/**
 * Publish / unpublish / delete controls for one blog row. A Client Component so
 * the destructive action can confirm first; the work stays in Server Actions,
 * passed in already bound to an id.
 */
export function BlogRowActions({
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
    transition: "color 0.12s",
  } as const;

  return (
    <Flex gap="12px" align="center" justify="flex-end">
      <Link href={`/admin/blog/${id}/edit`}>
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
          if (!window.confirm("Delete this blog post permanently? This cannot be undone.")) {
            e.preventDefault();
          }
        }}
      >
        <chakra.button
          type="submit"
          {...linkStyle}
          color="var(--color-danger-fg)"
          _hover={{ textDecoration: "underline" }}
        >
          Delete
        </chakra.button>
      </form>
    </Flex>
  );
}
