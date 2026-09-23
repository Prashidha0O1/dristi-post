"use client";

import { chakra, Flex } from "@chakra-ui/react";
import { RotateCcw, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toaster } from "@/components/ui/toaster";
import { ConfirmModal } from "@/components/ConfirmModal";

export function TrashRowActions({
  restoreAction,
  deleteForeverAction,
  canDeleteForever,
}: {
  restoreAction: () => Promise<void>;
  deleteForeverAction: () => Promise<void>;
  canDeleteForever: boolean;
}) {
  const [pending, start] = useTransition();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const run = (fn: () => Promise<void>, requireConfirm?: boolean) => {
    if (requireConfirm) {
      setIsConfirmOpen(true);
      return;
    }
    
    start(async () => {
      try {
        await fn();
      } catch (e) {
        toaster.create({
          type: "error",
          title: "Action failed",
          description: e instanceof Error ? e.message : "Try again.",
        });
      } finally {
        setIsConfirmOpen(false);
      }
    });
  };

  const btn = {
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    h: "30px",
    px: "10px",
    fontSize: "12px",
    fontWeight: "600",
    borderRadius: "5px",
    cursor: pending ? "default" : "pointer",
    opacity: pending ? 0.6 : 1,
    border: "1px solid var(--color-border)",
  } as const;

  return (
    <>
      <Flex gap="6px" justify="flex-end">
        <chakra.button
          type="button"
          disabled={pending}
          onClick={() => run(restoreAction, false)}
          {...btn}
          bg="var(--color-surface)"
          color="var(--color-body)"
          _hover={{ borderColor: "var(--color-brand)" }}
        >
          <RotateCcw size={13} strokeWidth={2.2} /> Restore
        </chakra.button>
        {canDeleteForever && (
          <chakra.button
            type="button"
            disabled={pending}
            onClick={() => run(deleteForeverAction, true)}
            {...btn}
            bg="var(--color-surface)"
            color="var(--color-danger-fg)"
            _hover={{ borderColor: "var(--color-danger-fg)" }}
          >
            <Trash2 size={13} strokeWidth={2.2} /> Delete
          </chakra.button>
        )}
      </Flex>
      
      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={() => run(deleteForeverAction, false)}
        title="Delete Permanently"
        description="Permanently delete this article? This cannot be undone."
        confirmText="Delete Forever"
        isDanger={true}
        isLoading={pending}
      />
    </>
  );
}
