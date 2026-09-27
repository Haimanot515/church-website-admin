import React, { useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { TextStyle, Color, FontFamily } from "@tiptap/extension-text-style";
import FontSize from "./RichTextFontSize";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { TableKit } from "@tiptap/extension-table";
import "./RichTextEditor.css";

/**
 * Shared rich text editor.
 * Drop-in replacement for a <textarea>: controlled with `value` (HTML string)
 * and `onChange` (receives the new HTML string), same as a normal
 * onChange={(e) => setX(e.target.value)} textarea, except onChange here is
 * called directly with the html string instead of an event object.
 *
 * Self-contained: builds its own extension set and its own toolbar, so it
 * doesn't need a <RichTextProvider>/<RichTextToolbar> pair around it. Use
 * this for a single standalone field on a page. If a page has several rich
 * text fields sharing one pinned toolbar, use RichTextField (+ RichTextProvider
 * + RichTextToolbar + RichTextContextMenu) instead.
 *
 * Toolbar is full by default. Pass toolbar="minimal" for short
 * single-line-ish fields (bold/italic/underline/link/undo/redo only).
 */
const RichTextEditor = ({
  value = "",
  onChange,
  placeholder = "Write here...",
  minHeight,
  toolbar = "full", // "full" (default, for description/content fields) or "minimal" (bold/italic/underline/link only, for shorter fields)
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        link: false, // we add our own configured Link below (StarterKit v3 bundles one)
      }),
      TextStyle,
      Color,
      FontFamily,
      FontSize,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
      }),
      Image,
      Placeholder.configure({ placeholder }),
      Subscript,
      Superscript,
      TaskList,
      TaskItem.configure({ nested: true }),
      TableKit.configure({ table: { resizable: true } }),
    ],
    content: value || "",
    immediatelyRender: false,
    shouldRerenderOnTransaction: true, // needed in Tiptap v3 for toolbar active-state buttons to update
    editorProps: {
      attributes: { class: "rte-content" },
    },
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  React.useEffect(() => {
    if (!editor) return;
    const next = value || "";
    if (editor.getHTML() !== next) {
      editor.commands.setContent(next, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, value]);

  if (!editor) return null;

  return (
    <div className="rte-wrapper" style={minHeight ? { "--rte-min-height": minHeight } : undefined}>
      <EditorToolbar editor={editor} variant={toolbar} />
      <EditorContent editor={editor} />
    </div>
  );
};

/**
 * Inline toolbar for a single standalone RichTextEditor instance (not shared
 * across multiple fields — for that, use RichTextToolbar + RichTextContext).
 * `variant="minimal"` shows only the essentials for short fields; `"full"`
 * shows the whole formatting set.
 */
const EditorToolbar = ({ editor, variant }) => {
  const disabled = !editor;
  const btn = (isActive) => (isActive ? "rte-btn active" : "rte-btn");

  const setLink = () => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Enter URL", previousUrl || "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const addImage = () => {
    if (!editor) return;
    const url = window.prompt("Image URL");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const minimalButtons = (
    <>
      <button type="button" disabled={disabled} className={btn(editor?.isActive("bold"))} onClick={() => editor?.chain().focus().toggleBold().run()} title="Bold"><strong>B</strong></button>
      <button type="button" disabled={disabled} className={btn(editor?.isActive("italic"))} onClick={() => editor?.chain().focus().toggleItalic().run()} title="Italic"><em>I</em></button>
      <button type="button" disabled={disabled} className={btn(editor?.isActive("underline"))} onClick={() => editor?.chain().focus().toggleUnderline().run()} title="Underline"><u>U</u></button>

      <span className="rte-divider" />

      <button type="button" disabled={disabled} className={btn(editor?.isActive("link"))} onClick={setLink} title="Add link">Link</button>
      <button type="button" className="rte-btn" onClick={() => editor?.chain().focus().unsetLink().run()} disabled={disabled || !editor?.isActive("link")} title="Remove link">Unlink</button>

      <span className="rte-divider" />

      <button type="button" className="rte-btn" onClick={() => editor?.chain().focus().undo().run()} disabled={disabled || !editor?.can().undo()} title="Undo">Undo</button>
      <button type="button" className="rte-btn" onClick={() => editor?.chain().focus().redo().run()} disabled={disabled || !editor?.can().redo()} title="Redo">Redo</button>
    </>
  );

  const fullExtraButtons = (
    <>
      <span className="rte-divider" />

      <button type="button" disabled={disabled} className={btn(editor?.isActive("strike"))} onClick={() => editor?.chain().focus().toggleStrike().run()} title="Strikethrough"><s>S</s></button>

      <span className="rte-divider" />

      <button type="button" disabled={disabled} className={btn(editor?.isActive("heading", { level: 1 }))} onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}>H1</button>
      <button type="button" disabled={disabled} className={btn(editor?.isActive("heading", { level: 2 }))} onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}>H2</button>
      <button type="button" disabled={disabled} className={btn(editor?.isActive("heading", { level: 3 }))} onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}>H3</button>

      <span className="rte-divider" />

      <button type="button" disabled={disabled} className={btn(editor?.isActive("bulletList"))} onClick={() => editor?.chain().focus().toggleBulletList().run()}>List</button>
      <button type="button" disabled={disabled} className={btn(editor?.isActive("orderedList"))} onClick={() => editor?.chain().focus().toggleOrderedList().run()}>1.List</button>
      <button type="button" disabled={disabled} className={btn(editor?.isActive("blockquote"))} onClick={() => editor?.chain().focus().toggleBlockquote().run()} title="Quote">Quote</button>
      <button type="button" disabled={disabled} className={btn(editor?.isActive("codeBlock"))} onClick={() => editor?.chain().focus().toggleCodeBlock().run()} title="Code block">Code</button>
      <button type="button" className="rte-btn" onClick={() => editor?.chain().focus().setHorizontalRule().run()} disabled={disabled} title="Horizontal rule">HR</button>

      <span className="rte-divider" />

      <button type="button" disabled={disabled} className={btn(editor?.isActive({ textAlign: "left" }))} onClick={() => editor?.chain().focus().setTextAlign("left").run()} title="Align left">Left</button>
      <button type="button" disabled={disabled} className={btn(editor?.isActive({ textAlign: "center" }))} onClick={() => editor?.chain().focus().setTextAlign("center").run()} title="Align center">Center</button>
      <button type="button" disabled={disabled} className={btn(editor?.isActive({ textAlign: "right" }))} onClick={() => editor?.chain().focus().setTextAlign("right").run()} title="Align right">Right</button>
      <button type="button" disabled={disabled} className={btn(editor?.isActive({ textAlign: "justify" }))} onClick={() => editor?.chain().focus().setTextAlign("justify").run()} title="Justify">Justify</button>

      <span className="rte-divider" />

      <button type="button" className="rte-btn" onClick={addImage} disabled={disabled} title="Insert image">Image</button>

      <span className="rte-divider" />

      <input
        type="color"
        className="rte-color"
        disabled={disabled}
        onChange={(e) => editor?.chain().focus().setColor(e.target.value).run()}
        title="Text color"
      />
      <input
        type="color"
        className="rte-color"
        disabled={disabled}
        onChange={(e) => editor?.chain().focus().setHighlight({ color: e.target.value }).run()}
        title="Highlight color"
      />
      <button type="button" className="rte-btn" onClick={() => editor?.chain().focus().unsetHighlight().run()} disabled={disabled || !editor?.isActive("highlight")} title="Remove highlight">No HL</button>
      <button type="button" className="rte-btn" onClick={() => editor?.chain().focus().unsetAllMarks().clearNodes().run()} disabled={disabled} title="Clear formatting">Clear</button>

      <span className="rte-divider" />

      <select
        className="rte-font-select"
        disabled={disabled}
        value={editor?.getAttributes("textStyle").fontSize || ""}
        onChange={(e) => {
          const value = e.target.value;
          if (!value) {
            editor?.chain().focus().unsetFontSize().run();
          } else {
            editor?.chain().focus().setFontSize(value).run();
          }
        }}
        title="Font size"
      >
        <option value="">Default size</option>
        <option value="12px">12</option>
        <option value="14px">14</option>
        <option value="16px">16</option>
        <option value="18px">18</option>
        <option value="20px">20</option>
        <option value="24px">24</option>
        <option value="28px">28</option>
        <option value="32px">32</option>
        <option value="36px">36</option>
        <option value="48px">48</option>
      </select>

      <select
        className="rte-font-select"
        disabled={disabled}
        value={editor?.getAttributes("textStyle").fontFamily || ""}
        onChange={(e) => {
          const value = e.target.value;
          if (!value) {
            editor?.chain().focus().unsetFontFamily().run();
          } else {
            editor?.chain().focus().setFontFamily(value).run();
          }
        }}
        title="Font family"
      >
        <option value="">Default font</option>
        <option value="'Cormorant Garamond', serif">Cormorant Garamond</option>
        <option value="'Nunito Sans', sans-serif">Nunito Sans</option>
        <option value="'IBM Plex Mono', monospace">IBM Plex Mono</option>
        <option value="Georgia, serif">Georgia</option>
        <option value="Arial, sans-serif">Arial</option>
      </select>

      <span className="rte-divider" />

      <button type="button" disabled={disabled} className={btn(editor?.isActive("subscript"))} onClick={() => editor?.chain().focus().toggleSubscript().run()} title="Subscript">X₂</button>
      <button type="button" disabled={disabled} className={btn(editor?.isActive("superscript"))} onClick={() => editor?.chain().focus().toggleSuperscript().run()} title="Superscript">X²</button>
      <button type="button" disabled={disabled} className={btn(editor?.isActive("taskList"))} onClick={() => editor?.chain().focus().toggleTaskList().run()} title="Checklist">☑ List</button>

      <span className="rte-divider" />

      <button type="button" className="rte-btn" disabled={disabled} onClick={() => editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} title="Insert table">Table</button>
      {editor?.isActive("table") && (
        <>
          <button type="button" className="rte-btn" onClick={() => editor.chain().focus().addRowAfter().run()} title="Add row below">+Row</button>
          <button type="button" className="rte-btn" onClick={() => editor.chain().focus().addColumnAfter().run()} title="Add column right">+Col</button>
          <button type="button" className="rte-btn" onClick={() => editor.chain().focus().deleteRow().run()} title="Delete current row">-Row</button>
          <button type="button" className="rte-btn" onClick={() => editor.chain().focus().deleteColumn().run()} title="Delete current column">-Col</button>
          <button type="button" className="rte-btn" onClick={() => editor.chain().focus().deleteTable().run()} title="Delete table">✕ Table</button>
        </>
      )}
    </>
  );

  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="rte-toolbar">
      <button
        type="button"
        className="rte-btn rte-toolbar-toggle"
        onClick={() => setCollapsed((c) => !c)}
        title={collapsed ? "Show toolbar" : "Hide toolbar"}
        aria-expanded={!collapsed}
      >
        {collapsed ? "☰ Show" : "▾ Hide"}
      </button>

      {!collapsed && (
        <>
          <span className="rte-divider" />
          {minimalButtons}
          {variant === "full" && fullExtraButtons}
        </>
      )}
    </div>
  );
};

export default RichTextEditor;