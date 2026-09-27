import React, { useState } from "react";
import { useRichTextContext } from "./RichTextContext";
import "./RichTextEditor.css";

/**
 * The one toolbar for a page/section. Acts on whichever <RichTextField />
 * most recently had focus. Always renders the same full button set
 * regardless of which field is active, so the toolbar never resizes or
 * hides buttons when focus moves between fields - only which editor the
 * buttons act on changes. Render it once, near the top of the page/card,
 * inside the same <RichTextProvider> as the fields it should control.
 * Before any field has been focused - or after the active one unmounts -
 * the buttons render disabled instead of acting on nothing.
 *
 * A show/hide toggle sits at the start of the bar. This is the ONE
 * intentional, user-triggered way the toolbar's size changes - clicking
 * it collapses every other button so only the toggle itself remains
 * (reclaiming vertical space), and clicking again brings the full set
 * back. It never collapses automatically on its own.
 */
const RichTextToolbar = () => {
  const { activeEditor: editor } = useRichTextContext();
  const disabled = !editor;
  const [collapsed, setCollapsed] = useState(false);

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

  return (
    <div className="rte-toolbar rte-toolbar-pinned">
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

      <button type="button" disabled={disabled} className={btn(editor?.isActive("bold"))} onClick={() => editor?.chain().focus().toggleBold().run()} title="Bold"><strong>B</strong></button>
      <button type="button" disabled={disabled} className={btn(editor?.isActive("italic"))} onClick={() => editor?.chain().focus().toggleItalic().run()} title="Italic"><em>I</em></button>
      <button type="button" disabled={disabled} className={btn(editor?.isActive("underline"))} onClick={() => editor?.chain().focus().toggleUnderline().run()} title="Underline"><u>U</u></button>
      <button type="button" disabled={disabled} className={btn(editor?.isActive("strike"))} onClick={() => editor?.chain().focus().toggleStrike().run()} title="Strikethrough"><s>S</s></button>

      <span className="rte-divider" />

      <button type="button" disabled={disabled} className={btn(editor?.isActive("link"))} onClick={setLink} title="Add link">Link</button>
      <button type="button" className="rte-btn" onClick={() => editor?.chain().focus().unsetLink().run()} disabled={disabled || !editor?.isActive("link")} title="Remove link">Unlink</button>

      <span className="rte-divider" />

      <button type="button" className="rte-btn" onClick={() => editor?.chain().focus().undo().run()} disabled={disabled || !editor?.can().undo()} title="Undo">Undo</button>
      <button type="button" className="rte-btn" onClick={() => editor?.chain().focus().redo().run()} disabled={disabled || !editor?.can().redo()} title="Redo">Redo</button>

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
      )}
    </div>
  );
};

export default RichTextToolbar;