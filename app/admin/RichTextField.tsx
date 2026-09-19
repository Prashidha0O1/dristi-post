"use client";

import { Box, Flex, chakra, Text } from "@chakra-ui/react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
// StarterKit v3 bundles Link and Underline — configure via StarterKit, don't
// import them again (that throws "Duplicate extension names").
import TextAlign from "@tiptap/extension-text-align";
import { Table, TableRow, TableHeader, TableCell } from "@tiptap/extension-table";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  Link2,
  Link2Off,
  List,
  ListOrdered,
  Maximize2,
  Minimize2,
  Quote,
  Redo2,
  Strikethrough,
  Table as TableIcon,
  Underline as UnderlineIcon,
  Undo2,
} from "lucide-react";
import { useState, type ReactNode } from "react";

/**
 * Rich-text editor for article bodies. Content is stored as HTML in a hidden
 * input named `name`, so the server action reads it unchanged. Accepts HTML
 * (new articles) or legacy plain text (old articles) as its initial value.
 */

function looksLikeHtml(value: string): boolean {
  return /<\/?[a-z][\s\S]*>/i.test(value);
}

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

const Divider = () => <Box w="1px" bg="var(--color-border)" mx="4px" my="4px" />;

function currentBlock(editor: Editor): string {
  for (let level = 1; level <= 6; level++) {
    if (editor.isActive("heading", { level })) return `h${level}`;
  }
  return "p";
}

function Toolbar({
  editor,
  onOpenLink,
  onOpenTable,
  fullscreen,
  onToggleFullscreen,
}: {
  editor: Editor;
  onOpenLink: () => void;
  onOpenTable: () => void;
  fullscreen: boolean;
  onToggleFullscreen: () => void;
}) {
  const selectStyle = {
    h: "32px",
    px: "8px",
    borderRadius: "5px",
    border: "1px solid var(--color-input-border)",
    bg: "var(--color-input-bg)",
    color: "var(--color-body)",
    fontSize: "13px",
    cursor: "pointer",
  } as const;

  return (
    <Flex
      wrap="wrap"
      align="center"
      gap="2px"
      p="6px"
      borderBottom="1px solid var(--color-input-border)"
      bg="var(--color-card-alt)"
      borderTopRadius="6px"
    >
      {/* Block type: paragraph + H1..H6 */}
      <chakra.select
        {...selectStyle}
        value={currentBlock(editor)}
        onChange={(e) => {
          const v = e.target.value;
          if (v === "p") editor.chain().focus().setParagraph().run();
          else editor.chain().focus().toggleHeading({ level: Number(v[1]) as 1 | 2 | 3 | 4 | 5 | 6 }).run();
        }}
        title="Text style"
      >
        <option value="p">Paragraph</option>
        <option value="h1">Heading 1</option>
        <option value="h2">Heading 2</option>
        <option value="h3">Heading 3</option>
        <option value="h4">Heading 4</option>
        <option value="h5">Heading 5</option>
        <option value="h6">Heading 6</option>
      </chakra.select>

      <Divider />

      <ToolbarButton title="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
        <Bold size={16} strokeWidth={2.2} />
      </ToolbarButton>
      <ToolbarButton title="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <Italic size={16} strokeWidth={2.2} />
      </ToolbarButton>
      <ToolbarButton title="Underline" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}>
        <UnderlineIcon size={16} strokeWidth={2.2} />
      </ToolbarButton>
      <ToolbarButton title="Strikethrough" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}>
        <Strikethrough size={16} strokeWidth={2.2} />
      </ToolbarButton>

      <Divider />

      <ToolbarButton title="Align left" active={editor.isActive({ textAlign: "left" })} onClick={() => editor.chain().focus().setTextAlign("left").run()}>
        <AlignLeft size={16} strokeWidth={2.2} />
      </ToolbarButton>
      <ToolbarButton title="Align center" active={editor.isActive({ textAlign: "center" })} onClick={() => editor.chain().focus().setTextAlign("center").run()}>
        <AlignCenter size={16} strokeWidth={2.2} />
      </ToolbarButton>
      <ToolbarButton title="Align right" active={editor.isActive({ textAlign: "right" })} onClick={() => editor.chain().focus().setTextAlign("right").run()}>
        <AlignRight size={16} strokeWidth={2.2} />
      </ToolbarButton>
      <ToolbarButton title="Justify" active={editor.isActive({ textAlign: "justify" })} onClick={() => editor.chain().focus().setTextAlign("justify").run()}>
        <AlignJustify size={16} strokeWidth={2.2} />
      </ToolbarButton>

      <Divider />

      <ToolbarButton title="Bullet list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
        <List size={16} strokeWidth={2.2} />
      </ToolbarButton>
      <ToolbarButton title="Numbered list" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
        <ListOrdered size={16} strokeWidth={2.2} />
      </ToolbarButton>
      <ToolbarButton title="Quote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
        <Quote size={16} strokeWidth={2.2} />
      </ToolbarButton>

      <Divider />

      <ToolbarButton
        title={editor.isActive("link") ? "Remove link" : "Add link"}
        active={editor.isActive("link")}
        onClick={() => (editor.isActive("link") ? editor.chain().focus().unsetLink().run() : onOpenLink())}
      >
        {editor.isActive("link") ? <Link2Off size={16} strokeWidth={2.2} /> : <Link2 size={16} strokeWidth={2.2} />}
      </ToolbarButton>

      {/* Table controls: insert, or (inside a table) add row/column, delete */}
      {editor.isActive("table") ? (
        <>
          <chakra.select
            {...selectStyle}
            value=""
            onChange={(e) => {
              const v = e.target.value;
              const c = editor.chain().focus();
              if (v === "addColumn") c.addColumnAfter().run();
              else if (v === "addRow") c.addRowAfter().run();
              else if (v === "delColumn") c.deleteColumn().run();
              else if (v === "delRow") c.deleteRow().run();
              else if (v === "delete") c.deleteTable().run();
              e.target.value = "";
            }}
            title="Table"
          >
            <option value="">Table…</option>
            <option value="addColumn">Add column</option>
            <option value="addRow">Add row</option>
            <option value="delColumn">Delete column</option>
            <option value="delRow">Delete row</option>
            <option value="delete">Delete table</option>
          </chakra.select>
        </>
      ) : (
        <Flex align="center" gap="2px" bg="var(--color-input-bg)" border="1px solid var(--color-border)" borderRadius="6px" overflow="hidden">
          <Box p="4px 6px" color="var(--color-subtle)"><TableIcon size={16} strokeWidth={2.2} /></Box>
          <chakra.button
            type="button"
            h="32px"
            px="8px"
            bg="transparent"
            border="none"
            fontSize="13px"
            fontWeight="600"
            color="var(--color-headline)"
            cursor="pointer"
            outline="none"
            onClick={onOpenTable}
            title="Insert Table"
          >
            Insert Table...
          </chakra.button>
        </Flex>
      )}

      <Divider />

      <ToolbarButton title="Undo" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}>
        <Undo2 size={16} strokeWidth={2.2} />
      </ToolbarButton>
      <ToolbarButton title="Redo" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}>
        <Redo2 size={16} strokeWidth={2.2} />
      </ToolbarButton>

      <Box flex="1" />

      <ToolbarButton title={fullscreen ? "Exit full screen" : "Full screen"} onClick={onToggleFullscreen}>
        {fullscreen ? <Minimize2 size={16} strokeWidth={2.2} /> : <Maximize2 size={16} strokeWidth={2.2} />}
      </ToolbarButton>
    </Flex>
  );
}

const CONTENT_CSS = {
  "& .ProseMirror p": { margin: "0 0 12px" },
  "& .ProseMirror h1": { fontSize: "30px", fontWeight: 800, margin: "20px 0 10px", lineHeight: 1.25 },
  "& .ProseMirror h2": { fontSize: "24px", fontWeight: 700, margin: "18px 0 8px" },
  "& .ProseMirror h3": { fontSize: "20px", fontWeight: 700, margin: "16px 0 6px" },
  "& .ProseMirror h4": { fontSize: "18px", fontWeight: 700, margin: "14px 0 6px" },
  "& .ProseMirror h5": { fontSize: "16px", fontWeight: 700, margin: "12px 0 4px" },
  "& .ProseMirror h6": { fontSize: "14px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", margin: "12px 0 4px" },
  "& .ProseMirror ul": { paddingLeft: "22px", margin: "0 0 12px", listStyleType: "disc" },
  "& .ProseMirror ol": { paddingLeft: "22px", margin: "0 0 12px", listStyleType: "decimal" },
  // Force italic to render even for fonts the browser won't synthesize obliques
  // for — otherwise the Italic button appeared to "do nothing".
  "& .ProseMirror em, & .ProseMirror i": { fontStyle: "italic" },
  "& .ProseMirror strong, & .ProseMirror b": { fontWeight: 700 },
  "& .ProseMirror a": { color: "var(--color-brand)", textDecoration: "underline" },
  "& .ProseMirror blockquote": {
    borderLeft: "3px solid var(--color-border)",
    paddingLeft: "12px",
    color: "var(--color-subtle)",
    margin: "0 0 12px",
  },
  "& .ProseMirror table": { borderCollapse: "collapse", width: "100%", margin: "0 0 12px", tableLayout: "fixed" },
  "& .ProseMirror td, & .ProseMirror th": {
    border: "1px solid var(--color-border)",
    padding: "6px 8px",
    verticalAlign: "top",
  },
  "& .ProseMirror th": { background: "var(--color-card-alt)", fontWeight: 700, textAlign: "left" },
} as const;

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
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("https://");
  const [fullscreen, setFullscreen] = useState(false);
  const [tableOpen, setTableOpen] = useState(false);
  const [tableRows, setTableRows] = useState("3");
  const [tableCols, setTableCols] = useState("3");

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] },
        link: { openOnClick: false, autolink: true },
      }),
      TextAlign.configure({ types: ["heading", "paragraph"], alignments: ["left", "center", "right", "justify"] }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: toInitialHtml(defaultValue),
    onUpdate({ editor }) {
      // isEmpty covers tables/images too (getText would be empty for a table).
      setHtml(editor.isEmpty ? "" : editor.getHTML());
    },
    editorProps: {
      attributes: {
        style: `min-height:${minHeight};padding:14px;outline:none;font-size:16px;line-height:1.85;`,
      },
    },
  });

  function applyLink() {
    if (!editor) return;
    const value = linkUrl.trim();
    if (!value || value === "https://") {
      editor.chain().focus().unsetLink().run();
    } else {
      const href = /^https?:\/\//i.test(value) ? value : `https://${value}`;
      editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
    }
    setLinkOpen(false);
  }

  function applyTable() {
    if (!editor) return;
    const rows = parseInt(tableRows, 10);
    const cols = parseInt(tableCols, 10);
    if (rows > 0 && cols > 0) {
      editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
    }
    setTableOpen(false);
  }

  return (
    <Box
      border="1px solid var(--color-input-border)"
      bg="var(--color-input-bg)"
      borderRadius="6px"
      className="dp-rte"
      // Fullscreen: pin over everything, scroll internally.
      position={fullscreen ? "fixed" : "relative"}
      inset={fullscreen ? "0" : undefined}
      zIndex={fullscreen ? 1400 : undefined}
      display="flex"
      flexDirection="column"
      flex="1"
      overflow={fullscreen ? "hidden" : undefined}
      _focusWithin={{
        borderColor: "var(--color-brand)",
        boxShadow: fullscreen ? "none" : "0 0 0 3px color-mix(in srgb, var(--color-brand) 18%, transparent)",
      }}
    >
      <chakra.input type="hidden" name={name} value={html} readOnly />
      {editor && (
        <Toolbar
          editor={editor}
          fullscreen={fullscreen}
          onToggleFullscreen={() => setFullscreen((f) => !f)}
          onOpenLink={() => {
            setLinkUrl((editor.getAttributes("link").href as string) || "https://");
            setLinkOpen(true);
          }}
          onOpenTable={() => setTableOpen(true)}
        />
      )}

      {linkOpen && editor && (
        <Flex align="center" gap="8px" p="8px" borderBottom="1px solid var(--color-input-border)" bg="var(--color-card-alt)">
          <chakra.input
            autoFocus
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") { e.preventDefault(); applyLink(); }
              if (e.key === "Escape") setLinkOpen(false);
            }}
            placeholder="https://example.com"
            flex="1"
            h="32px"
            px="10px"
            fontSize="13px"
            border="1px solid var(--color-input-border)"
            bg="var(--color-input-bg)"
            color="var(--color-body)"
            borderRadius="5px"
          />
          <chakra.button type="button" onClick={applyLink} h="32px" px="12px" fontSize="13px" fontWeight="600" bg="var(--color-brand)" color="white" border="none" borderRadius="5px" cursor="pointer">
            Apply
          </chakra.button>
          <chakra.button type="button" onClick={() => setLinkOpen(false)} h="32px" px="10px" fontSize="13px" bg="transparent" color="var(--color-subtle)" border="none" cursor="pointer">
            Cancel
          </chakra.button>
        </Flex>
      )}

      {tableOpen && editor && (
        <Flex align="center" gap="8px" p="8px" borderBottom="1px solid var(--color-input-border)" bg="var(--color-card-alt)">
          <Text fontSize="13px" fontWeight="600" color="var(--color-headline)">Table Size:</Text>
          <chakra.input
            type="number"
            min={1}
            max={20}
            value={tableRows}
            onChange={(e) => setTableRows(e.target.value)}
            placeholder="Rows"
            w="70px"
            h="32px"
            px="10px"
            fontSize="13px"
            border="1px solid var(--color-input-border)"
            bg="var(--color-input-bg)"
            color="var(--color-body)"
            borderRadius="5px"
          />
          <Text fontSize="13px" color="var(--color-subtle)">rows ×</Text>
          <chakra.input
            type="number"
            min={1}
            max={20}
            value={tableCols}
            onChange={(e) => setTableCols(e.target.value)}
            placeholder="Cols"
            w="70px"
            h="32px"
            px="10px"
            fontSize="13px"
            border="1px solid var(--color-input-border)"
            bg="var(--color-input-bg)"
            color="var(--color-body)"
            borderRadius="5px"
            onKeyDown={(e) => {
              if (e.key === "Enter") { e.preventDefault(); applyTable(); }
              if (e.key === "Escape") setTableOpen(false);
            }}
          />
          <Text fontSize="13px" color="var(--color-subtle)">cols</Text>
          <chakra.button type="button" onClick={applyTable} h="32px" px="12px" fontSize="13px" fontWeight="600" bg="var(--color-brand)" color="white" border="none" borderRadius="5px" cursor="pointer" ml="4px">
            Insert
          </chakra.button>
          <chakra.button type="button" onClick={() => setTableOpen(false)} h="32px" px="10px" fontSize="13px" bg="transparent" color="var(--color-subtle)" border="none" cursor="pointer">
            Cancel
          </chakra.button>
        </Flex>
      )}

      <Box
        color="var(--color-body)"
        bg="var(--color-input-bg)"
        flex="1"
        overflowY="auto"
        maxHeight={fullscreen ? "none" : "500px"}
        css={CONTENT_CSS}
      >
        <EditorContent editor={editor} />
      </Box>
    </Box>
  );
}
