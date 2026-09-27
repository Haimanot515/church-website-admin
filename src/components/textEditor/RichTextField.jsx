import React, { useEffect } from "react";
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
import { useRichTextContext } from "./RichTextContext";
import "./RichTextEditor.css";

/**
 * One rich-text field with no toolbar of its own. Must be rendered inside a
 * <RichTextProvider>, alongside a single <RichTextToolbar /> (and, for the
 * right-click menu, a single <RichTextContextMenu />) for the page.
 * Controlled the same way as RichTextEditor: `value` (HTML string) in,
 * `onChange(html)` out.
 *
 * `toolbar` ("full" | "minimal") is reported to the shared toolbar whenever
 * this field claims focus, so the same pinned toolbar can show a different
 * button set depending on which field the user is currently in.
 *
 * Right-clicking inside the field's text opens the shared context menu at
 * the cursor position instead of the browser's native menu, and makes this
 * field the active editor for both the toolbar and the menu.
 *
 * On focus it makes itself the toolbar's target; on unmount it releases
 * that target so the toolbar doesn't act on a destroyed editor. Pass
 * `autoFocus` for a field that should claim the toolbar as soon as it
 * mounts (e.g. the first field in a form that just opened).
 */
const RichTextField = ({
  value = "",
  onChange,
  placeholder = "Write here...",
  minHeight,
  toolbar = "full",
  autoFocus = false,
  id,
}) => {
  const { registerFocus, unregister, openContextMenu } = useRichTextContext();

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
      attributes: id ? { class: "rte-content", id } : { class: "rte-content" },
    },
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    onFocus: ({ editor }) => {
      registerFocus(editor, toolbar);
    },
  });

  // Keep the editor's HTML in sync with a controlled `value` prop.
  useEffect(() => {
    if (!editor) return;
    const next = value || "";
    if (editor.getHTML() !== next) {
      editor.commands.setContent(next, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, value]);

  // Claim the toolbar on mount if asked to, and always release it on
  // unmount so a stale/destroyed editor is never left as the active target.
  useEffect(() => {
    if (!editor) return;
    if (autoFocus) {
      registerFocus(editor, toolbar);
    }
    return () => unregister(editor);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  if (!editor) return null;

  const handleContextMenu = (e) => {
    if (!editor) return;
    e.preventDefault();
    openContextMenu(editor, e.clientX, e.clientY, toolbar);
  };

  return (
    <div
      className="rte-wrapper rte-field-only"
      style={minHeight ? { "--rte-min-height": minHeight } : undefined}
      onContextMenu={handleContextMenu}
    >
      <EditorContent editor={editor} />
    </div>
  );
};

export default RichTextField;