"use client";

import { Box, Flex, Text, chakra } from "@chakra-ui/react";
import { Check, ChevronDown, Plus, Trash2 } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import type { AuthorOption } from "@/lib/adminQueries";
import { createAuthorAction, deleteAuthorAction } from "../authorActions";
import { toaster } from "@/components/ui/toaster";
import { ConfirmModal } from "@/components/ConfirmModal";

function label(a: AuthorOption): string {
  return a.nameEn ? `${a.nameEn} / ${a.nameNe}` : a.nameNe;
}

/**
 * Author picker. Everyone can choose an existing author; owner/admin (canAdd)
 * can also type a new name and create it inline — it becomes a real author row
 * and is selected immediately. The chosen author id travels in a hidden
 * `authorId` input so the surrounding form submits unchanged.
 */
export function AuthorField({
  options,
  defaultValue,
  canAdd,
}: {
  options: AuthorOption[];
  defaultValue?: string;
  canAdd: boolean;
}) {
  const [authors, setAuthors] = useState(options);
  const [selectedId, setSelectedId] = useState(defaultValue ?? "");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selected = authors.find((a) => a.id === selectedId);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return authors;
    return authors.filter((a) => label(a).toLowerCase().includes(q));
  }, [authors, query]);

  const exactExists = authors.some(
    (a) => label(a).toLowerCase() === query.trim().toLowerCase(),
  );
  const showCreate = canAdd && query.trim().length > 0 && !exactExists;

  async function handleCreate() {
    const name = query.trim();
    if (!name || busy) return;
    setBusy(true);
    const result = await createAuthorAction(name);
    setBusy(false);
    if (!result.ok) {
      toaster.create({ type: "error", title: "Couldn't add author", description: result.error });
      return;
    }
    toaster.create({ type: "success", title: `Added ${result.author.nameNe}` });
    setAuthors((prev) =>
      prev.some((a) => a.id === result.author.id) ? prev : [...prev, result.author],
    );
    setSelectedId(result.author.id);
    setQuery("");
    setOpen(false);
  }

  async function handleDelete(id: string) {
    setConfirmDeleteId(null);
    setDeletingId(id);
    const result = await deleteAuthorAction(id);
    if (!result.ok) {
      toaster.create({ type: "error", title: "Couldn't delete author", description: result.error });
      setDeletingId(null);
      return;
    }
    
    toaster.create({ type: "success", title: "Author deleted" });
    setAuthors((prev) => prev.filter((a) => a.id !== id));
    if (selectedId === id) setSelectedId("");
    setDeletingId(null);
    
    // Keep the dropdown open to show it's gone
    if (blurTimer.current) clearTimeout(blurTimer.current);
  }

  return (
    <Box position="relative">
      {/* The value the form actually submits. */}
      <chakra.input type="hidden" name="authorId" value={selectedId} />

      <Flex
        align="center"
        h="40px"
        border="1px solid var(--color-input-border)"
        bg="var(--color-input-bg)"
        borderRadius="6px"
        px="12px"
        cursor="text"
        _focusWithin={{
          borderColor: "var(--color-brand)",
          boxShadow: "0 0 0 3px color-mix(in srgb, var(--color-brand) 18%, transparent)",
        }}
        onClick={() => setOpen(true)}
      >
        <chakra.input
          value={open ? query : selected ? label(selected) : query}
          placeholder={selected ? undefined : "Select or type a name..."}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            // Delay so a click on an option registers before closing.
            blurTimer.current = setTimeout(() => setOpen(false), 150);
          }}
          flex="1"
          minW="0"
          bg="transparent"
          border="none"
          outline="none"
          fontSize="14px"
          color="var(--color-body)"
          textOverflow="ellipsis"
          _placeholder={{ color: "var(--color-muted)" }}
        />
        <ChevronDown size={16} color="var(--color-muted)" aria-hidden="true" />
      </Flex>

      {open && (
        <Box
          position="absolute"
          top="44px"
          left="0"
          right="0"
          zIndex="20"
          bg="var(--color-surface)"
          border="1px solid var(--color-border)"
          borderRadius="6px"
          boxShadow="0 8px 24px rgba(0,0,0,0.12)"
          maxH="240px"
          overflowY="auto"
          py="4px"
          onMouseDown={() => {
            // Keep the input focused through the click.
            if (blurTimer.current) clearTimeout(blurTimer.current);
          }}
        >
          {filtered.map((a) => (
            <Flex
              key={a.id}
              align="center"
              justify="space-between"
              px="12px"
              py="8px"
              fontSize="14px"
              cursor="pointer"
              color="var(--color-body)"
              _hover={{ bg: "var(--color-card-alt)" }}
              onClick={() => {
                setSelectedId(a.id);
                setQuery("");
                setOpen(false);
              }}
            >
              <Text truncate flex="1" mr="8px">{label(a)}</Text>
              
              <Flex align="center" gap="10px">
                <Box w="15px" display="flex" alignItems="center" justifyContent="center">
                  {a.id === selectedId && <Check size={15} color="var(--color-brand)" aria-hidden="true" />}
                </Box>
                
                {canAdd && (
                  <chakra.button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setConfirmDeleteId(a.id);
                    }}
                    disabled={deletingId === a.id}
                    color="var(--color-faint-fg)"
                    _hover={{ color: "var(--color-danger-fg)" }}
                    title="Delete author permanently"
                    opacity={deletingId === a.id ? 0.5 : 1}
                    display="flex"
                  >
                    <Trash2 size={15} />
                  </chakra.button>
                )}
              </Flex>
            </Flex>
          ))}

          {filtered.length === 0 && !showCreate && (
            <Text px="12px" py="8px" fontSize="13px" color="var(--color-muted)">
              No authors found.
            </Text>
          )}

          {showCreate && (
            <Flex
              align="center"
              gap="8px"
              px="12px"
              py="9px"
              fontSize="14px"
              cursor="pointer"
              color="var(--color-brand)"
              borderTop={filtered.length ? "1px solid var(--color-border)" : undefined}
              _hover={{ bg: "var(--color-card-alt)" }}
              onClick={handleCreate}
              aria-disabled={busy}
            >
              <Plus size={15} aria-hidden="true" />
              {busy ? "Adding..." : `Add new author "${query.trim()}"`}
            </Flex>
          )}
        </Box>
      )}

      {!canAdd && (
        <Text fontSize="11px" color="var(--color-muted)" mt="5px">
          Choose an author. Ask an admin to add a new one.
        </Text>
      )}

      <ConfirmModal
        isOpen={confirmDeleteId !== null}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={() => confirmDeleteId && handleDelete(confirmDeleteId)}
        title="Delete Author"
        description="Permanently delete this author? Any articles they wrote will temporarily have no author until you assign a new one."
        confirmText="Delete"
        isDanger={true}
        isLoading={deletingId !== null}
      />
    </Box>
  );
}
