"use client";

import { Flex, chakra } from "@chakra-ui/react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { toaster } from "@/components/ui/toaster";
import { ConfirmModal } from "@/components/ConfirmModal";

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

  const linkStyle = {
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
        <Link href={`/admin/blog/${id}/edit`}>
          <chakra.span {...linkStyle} color="var(--color-brand)" _hover={{ textDecoration: "underline" }}>
            Edit
          </chakra.span>
        </Link>

        <chakra.button
          type="button"
          disabled={pending}
          onClick={() => handleAction(
            status === "published" ? unpublishAction : publishAction,
            status === "published" ? "Blog unpublished" : "Blog published"
          )}
          {...linkStyle}
          color="var(--color-muted)"
          _hover={{ color: "var(--color-headline)", textDecoration: "underline" }}
        >
          {status === "published" ? "Unpublish" : "Publish"}
        </chakra.button>

        <chakra.button
          type="button"
          disabled={pending}
          onClick={() => setIsConfirmOpen(true)}
          {...linkStyle}
          color="var(--color-danger-fg)"
          _hover={{ textDecoration: "underline" }}
        >
          Delete
        </chakra.button>
      </Flex>
      
      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={() => handleAction(deleteAction, "Blog deleted")}
        title="Delete Blog"
        description="Delete this blog post permanently? This cannot be undone."
        confirmText="Delete"
        isDanger={true}
        isLoading={pending}
      />
    </>
  );
}
