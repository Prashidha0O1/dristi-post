"use client";

import { Flex, chakra } from "@chakra-ui/react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { toaster } from "@/components/ui/toaster";
import { ConfirmModal } from "@/components/ConfirmModal";

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
  const [pending, startTransition] = useTransition();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleAction = (actionFn: () => Promise<void>, successMessage: string) => {
    startTransition(async () => {
      try {
        await actionFn();
        toaster.create({ type: "success", title: successMessage });
      } catch (err: any) {
        toaster.create({ type: "error", title: "Action failed", description: err.message });
      } finally {
        setIsConfirmOpen(false);
      }
    });
  };

  const base = {
    fontSize: "12px",
    fontWeight: "600",
    cursor: pending ? "default" : "pointer",
    bg: "transparent",
    border: "none",
    p: "0",
    opacity: pending ? 0.6 : 1,
    transition: "color 0.12s",
  } as const;

  return (
    <>
      <Flex gap="12px" align="center" justify="flex-end">
        <Link href={`/admin/articles/${id}/edit`}>
          <chakra.span {...base} color="var(--color-brand)" _hover={{ textDecoration: "underline" }}>
            Edit
          </chakra.span>
        </Link>

        <chakra.button
          type="button"
          disabled={pending}
          onClick={() => handleAction(
            status === "published" ? unpublishAction : publishAction,
            status === "published" ? "Article unpublished" : "Article published"
          )}
          {...base}
          color="var(--color-muted)"
          _hover={{ color: "var(--color-headline)", textDecoration: "underline" }}
        >
          {status === "published" ? "Unpublish" : "Publish"}
        </chakra.button>

        <chakra.button
          type="button"
          disabled={pending}
          onClick={() => setIsConfirmOpen(true)}
          {...base}
          color="var(--color-danger-fg)"
          _hover={{ textDecoration: "underline" }}
        >
          Delete
        </chakra.button>
      </Flex>
      
      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={() => handleAction(deleteAction, "Moved to trash")}
        title="Delete Article"
        description="Delete this article? This will move it to the trash."
        confirmText="Delete"
        isDanger={true}
        isLoading={pending}
      />
    </>
  );
}
