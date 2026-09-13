"use client";

import { Box, Flex, chakra } from "@chakra-ui/react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
// NB: StarterKit v3 already bundles Link and Underline — importing them
// separately would throw "Duplicate extension names", so configure via StarterKit.
import {
  Bold,
  Heading2,
  Heading3,
  Italic,
  Link2,
  Link2Off,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Underline as UnderlineIcon,
  Undo2,
} from "lucide-react";
import { useState, type ReactNode } from "react";

/**
 * Rich-text editor for article bodies (replaces the plain textarea).
 *
 * The content is stored as HTML in a hidden input named `name`, so the existing
 * server action reads it unchanged. It accepts either HTML (new articles) or
 * legacy plain text (old articles) as its initial value — plain text is turned
 * into paragraphs so nothing that was written before this editor breaks.
 */

function looksLikeHtml(value: string): boolean {
  return /<\/?[a-z][\s\S]*>/i.test(value);
}

/** Legacy plain text -> paragraphs, so old articles open cleanly in the editor. */
function toInitialHtml(value: string | undefined): string {
  if (!value) return "";
  if (looksLikeHtml(value)) return value;
  return value
    .split(/\n{2,}/)
    .map((block) => `<p>${block.replace(/\n/g, "<br>").trim()}</p>`)
    .join("");
}

function ToolbarButton({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: ReactNode;
}) {
  return (
    <chakra.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      aria-pressed={active}
      display="inline-flex"
      alignItems="center"
      justifyContent="center"
      w="32px"
      h="32px"
      borderRadius="5px"
      color={active ? "white" : "var(--color-body)"}
      bg={active ? "var(--color-brand)" : "transparent"}
      cursor={disabled ? "not-allowed" : "pointer"}
      opacity={disabled ? 0.4 : 1}
      _hover={active ? {} : { bg: "var(--color-card-alt)" }}
      transition="background 0.12s"
    >
      {children}
    </chakra.button>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const setLink = () => {
    if (editor.isActive("link")) {
      editor.chain().focus().unsetLink().run();
      return;
    }
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL (https://...)", previous ?? "https://");
    if (url === null) return; // cancelled
    if (url.trim() === "") {
      editor.chain().focus().unsetLink().run();
      return;
    }
    const href = /^https?:\/\//i.test(url.trim()) ? url.trim() : `https://${url.trim()}`;
    editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
  };

  return (
    <Flex
      wrap="wrap"
      gap="2px"
      p="6px"
      borderBottom="1px solid var(--color-input-border)"
      bg="var(--color-card-alt)"
      borderTopRadius="6px"
    >
      <ToolbarButton title="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
        <Bold size={16} strokeWidth={2.2} />
      </ToolbarButton>
      <ToolbarButton title="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <Italic size={16} strokeWidth={2.2} />
      </ToolbarButton>
      <ToolbarButton title="Underline" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}>
        <UnderlineIcon size={16} strokeWidth={2.2} />
      </ToolbarButton>

      <Box w="1px" bg="var(--color-border)" mx="4px" my="4px" />

      <ToolbarButton title="Heading" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
        <Heading2 size={16} strokeWidth={2.2} />
      </ToolbarButton>
      <ToolbarButton title="Subheading" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
        <Heading3 size={16} strokeWidth={2.2} />
      </ToolbarButton>
      <ToolbarButton title="Bullet list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
        <List size={16} strokeWidth={2.2} />
      </ToolbarButton>
      <ToolbarButton title="Numbered list" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
        <ListOrdered size={16} strokeWidth={2.2} />
      </ToolbarButton>
      <ToolbarButton title="Quote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
        <Quote size={16} strokeWidth={2.2} />
      </ToolbarButton>

      <Box w="1px" bg="var(--color-border)" mx="4px" my="4px" />

      <ToolbarButton title={editor.isActive("link") ? "Remove link" : "Add link"} active={editor.isActive("link")} onClick={setLink}>
        {editor.isActive("link") ? <Link2Off size={16} strokeWidth={2.2} /> : <Link2 size={16} strokeWidth={2.2} />}
      </ToolbarButton>

      <Box w="1px" bg="var(--color-border)" mx="4px" my="4px" />

      <ToolbarButton title="Undo" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}>
        <Undo2 size={16} strokeWidth={2.2} />
      </ToolbarButton>
      <ToolbarButton title="Redo" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}>
        <Redo2 size={16} strokeWidth={2.2} />
      </ToolbarButton>
    </Flex>
  );
}

export function RichTextField({
  name,
  defaultValue,
  minHeight = "240px",
}: {
  name: string;
  defaultValue?: string;
  minHeight?: string;
}) {
  const [html, setHtml] = useState(() => toInitialHtml(defaultValue));

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ link: { openOnClick: false, autolink: true } }),
    ],
    content: toInitialHtml(defaultValue),
    onUpdate({ editor }) {
      // getText().trim() empty -> store "" so validation treats it as absent.
      setHtml(editor.getText().trim() ? editor.getHTML() : "");
    },
    editorProps: {
      attributes: {
        style: `min-height:${minHeight};padding:14px;outline:none;font-size:16px;line-height:1.85;`,
      },
    },
  });

  return (
    <Box
      border="1px solid var(--color-input-border)"
      bg="var(--color-input-bg)"
      borderRadius="6px"
      className="dp-rte"
      _focusWithin={{
        borderColor: "var(--color-brand)",
        boxShadow: "0 0 0 3px color-mix(in srgb, var(--color-brand) 18%, transparent)",
      }}
    >
      <chakra.input type="hidden" name={name} value={html} readOnly />
      {editor && <Toolbar editor={editor} />}
      <Box color="var(--color-body)" css={{
        "& .ProseMirror": { minHeight },
        "& .ProseMirror p": { margin: "0 0 12px" },
        "& .ProseMirror h2": { fontSize: "22px", fontWeight: 700, margin: "18px 0 8px" },
        "& .ProseMirror h3": { fontSize: "18px", fontWeight: 700, margin: "16px 0 6px" },
        "& .ProseMirror ul, & .ProseMirror ol": { paddingLeft: "22px", margin: "0 0 12px" },
        "& .ProseMirror a": { color: "var(--color-brand)", textDecoration: "underline" },
        "& .ProseMirror blockquote": {
          borderLeft: "3px solid var(--color-border)",
          paddingLeft: "12px",
          color: "var(--color-subtle)",
          margin: "0 0 12px",
        },
      }}>
        <EditorContent editor={editor} />
      </Box>
    </Box>
  );
}
