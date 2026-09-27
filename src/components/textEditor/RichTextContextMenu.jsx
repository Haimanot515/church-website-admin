import React, { useEffect, useRef } from "react";
import { useRichTextContext } from "./RichTextContext";
import "./RichTextEditor.css";

/**
 * Floating right-click context menu for any RichTextField. Render it once
 * per page, as a sibling of <RichTextToolbar />, inside the same
 * <RichTextProvider>. Right-clicking inside any field opens this at the
 * cursor position, acting on whichever field was right-clicked — the same
 * "single shared control, many fields" pattern as RichTextToolbar, just
 * triggered by right-click instead of always being on screen.
 *
 * Closes on an outside click or Escape. Renders nothing while closed.
 */
const RichTextContextMenu = () => {
  const { contextMenu, closeContextMenu } = useRichTextContext();
  const menuRef = useRef(null);

  useEffect(() => {
    if (!contextMenu) return;

    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        closeContextMenu();
      }
    };
    const handleEscape = (e) => {
      if (e.key === "Escape") closeContextMenu();
    };

    // mousedown (not click) so it closes before a click inside a field
    // re-opens/refocuses that field, avoiding a flash of both states.
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [contextMenu, closeContextMenu]);

  if (!contextMenu) return null;

  const { editor, x, y } = contextMenu;
  const btn = (isActive) => (isActive ? "rte-btn active" : "rte-btn");

  // Keep the menu on-screen: flip left/up if it would overflow the
  // viewport's right/bottom edge from the click position.
  const MENU_WIDTH = 260;
  const MENU_MAX_HEIGHT = 320;
  const left = Math.max(8, Math.min(x, window.innerWidth - MENU_WIDTH - 8));
  const top = Math.max(8, Math.min(y, window.innerHeight - MENU_MAX_HEIGHT - 8));

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Enter URL", previousUrl || "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    }
  };

  return (
    <div
      ref={menuRef}
      className="rte-context-menu"
      style={{ left, top }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="rte-context-menu-row">
        <select
          className="rte-font-select"
          value={editor.getAttributes("textStyle").fontSize || ""}
          onChange={(e) => {
            const value = e.target.value;
            if (!value) editor.chain().focus().unsetFontSize().run();
            else editor.chain().focus().setFontSize(value).run();
          }}
          title="Font size"
        >
          <option value="">Size</option>
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
          value={editor.getAttributes("textStyle").fontFamily || ""}
          onChange={(e) => {
            const value = e.target.value;
            if (!value) editor.chain().focus().unsetFontFamily().run();
            else editor.chain().focus().setFontFamily(value).run();
          }}
          title="Font family"
        >
          <option value="">Font</option>
          <option value="'Cormorant Garamond', serif">Cormorant Garamond</option>
          <option value="'Nunito Sans', sans-serif">Nunito Sans</option>
          <option value="'IBM Plex Mono', monospace">IBM Plex Mono</option>
          <option value="Georgia, serif">Georgia</option>
          <option value="Arial, sans-serif">Arial</option>
        </select>
      </div>

      <div className="rte-context-menu-row">
        <button type="button" className={btn(editor.isActive("bold"))} onClick={() => editor.chain().focus().toggleBold().run()} title="Bold"><strong>B</strong></button>
        <button type="button" className={btn(editor.isActive("italic"))} onClick={() => editor.chain().focus().toggleItalic().run()} title="Italic"><em>I</em></button>
        <button type="button" className={btn(editor.isActive("underline"))} onClick={() => editor.chain().focus().toggleUnderline().run()} title="Underline"><u>U</u></button>
        <button type="button" className={btn(editor.isActive("strike"))} onClick={() => editor.chain().focus().toggleStrike().run()} title="Strikethrough"><s>S</s></button>
        <button type="button" className={btn(editor.isActive("subscript"))} onClick={() => editor.chain().focus().toggleSubscript().run()} title="Subscript">X₂</button>
        <button type="button" className={btn(editor.isActive("superscript"))} onClick={() => editor.chain().focus().toggleSuperscript().run()} title="Superscript">X²</button>
      </div>

      <div className="rte-context-menu-row">
        <input
          type="color"
          className="rte-color"
          onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
          title="Text color"
        />
        <input
          type="color"
          className="rte-color"
          onChange={(e) => editor.chain().focus().setHighlight({ color: e.target.value }).run()}
          title="Highlight color"
        />
        <button type="button" className={btn(editor.isActive("link"))} onClick={setLink} title="Add link">Link</button>
        <button type="button" className="rte-btn" onClick={() => editor.chain().focus().unsetAllMarks().run()} title="Clear formatting">Clear</button>
      </div>

      <div className="rte-context-menu-row">
        <button type="button" className={btn(editor.isActive({ textAlign: "left" }))} onClick={() => editor.chain().focus().setTextAlign("left").run()} title="Align left">Left</button>
        <button type="button" className={btn(editor.isActive({ textAlign: "center" }))} onClick={() => editor.chain().focus().setTextAlign("center").run()} title="Align center">Center</button>
        <button type="button" className={btn(editor.isActive({ textAlign: "right" }))} onClick={() => editor.chain().focus().setTextAlign("right").run()} title="Align right">Right</button>
        <button type="button" className={btn(editor.isActive({ textAlign: "justify" }))} onClick={() => editor.chain().focus().setTextAlign("justify").run()} title="Justify">Justify</button>
      </div>
    </div>
  );
};

export default RichTextContextMenu;