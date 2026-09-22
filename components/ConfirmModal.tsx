"use client";

import { Dialog, Button, Flex } from "@chakra-ui/react";
import { ReactNode } from "react";

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Delete",
  isDanger = true,
  isLoading = false,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  isDanger?: boolean;
  isLoading?: boolean;
}) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && onClose()}>
      <Dialog.Backdrop bg="rgba(0,0,0,0.5)" backdropFilter="blur(2px)" />
      <Dialog.Positioner p="20px" display="flex" alignItems="center" justifyContent="center">
        <Dialog.Content
          bg="var(--color-surface)"
          borderRadius="8px"
          boxShadow="0 10px 30px rgba(0,0,0,0.15)"
          maxW="400px"
          w="100%"
          p="20px"
        >
          <Dialog.Header p="0 0 12px">
            <Dialog.Title fontSize="16px" fontWeight="600" color="var(--color-headline)">
              {title}
            </Dialog.Title>
          </Dialog.Header>
          <Dialog.Body p="0 0 20px" fontSize="14px" color="var(--color-body)">
            {description}
          </Dialog.Body>
          <Dialog.Footer p="0">
            <Flex gap="12px" justify="flex-end" w="100%">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
                size="sm"
                px="16px"
                bg="var(--color-surface)"
                color="var(--color-headline)"
                border="1px solid var(--color-border)"
                _hover={{ bg: "var(--color-surface-hover)" }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  onConfirm();
                }}
                disabled={isLoading}
                loading={isLoading}
                size="sm"
                px="16px"
                bg={isDanger ? "var(--color-danger-bg)" : "var(--color-brand)"}
                color={isDanger ? "var(--color-danger-fg)" : "white"}
                _hover={{ opacity: 0.8 }}
              >
                {confirmText}
              </Button>
            </Flex>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}
