"use client";

import { Flex, chakra } from "@chakra-ui/react";
import Link from "next/link";

/**
 * Publish / unpublish / delete for one article row.
 *
 * A Client Component purely so delete can confirm first; the work itself stays
 * in Server Actions, passed in already bound to an id. These actions existed in
 * app/admin/actions.ts from the start but had no UI, so publishing from the
 * console was impossible until now.
 */
export function ArticleRowActions({
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
      <Link href={`/admin/articles/${id}/edit`}>
        <chakra.span {...base} color="var(--color-brand)" _hover={{ textDecoration: "underline" }}>
          Edit
        </chakra.span>
      </Link>

      <form action={status === "published" ? unpublishAction : publishAction}>
        <chakra.button
          type="submit"
          {...base}
          color="var(--color-muted)"
          _hover={{ color: "var(--color-headline)", textDecoration: "underline" }}
        >
          {status === "published" ? "Unpublish" : "Publish"}
        </chakra.button>
      </form>

      <form
        action={deleteAction}
        onSubmit={(e) => {
          if (!window.confirm("Delete this article permanently? This cannot be undone.")) {
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
