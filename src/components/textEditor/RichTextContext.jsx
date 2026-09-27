import React, { createContext, useContext, useRef, useState, useCallback } from "react";

const RichTextContext = createContext(null);

/**
 * Tracks:
 * 1) which RichTextField currently owns the page's single RichTextToolbar,
 *    plus which toolbar variant ("full" | "minimal") that field asked for.
 * 2) the right-click context menu's open/closed state - which editor it's
 *    for and where on screen it should appear.
 *
 * Wrap the toolbar, the context menu, and all fields in one Provider.
 */
export const RichTextProvider = ({ children }) => {
  const [activeEditor, setActiveEditor] = useState(null);
  const [activeToolbarVariant, setActiveToolbarVariant] = useState("full");
  const activeEditorRef = useRef(null);

  const [contextMenu, setContextMenu] = useState(null); // { editor, x, y } | null

  const registerFocus = useCallback((editor, toolbar = "full") => {
    activeEditorRef.current = editor;
    setActiveEditor(editor);
    setActiveToolbarVariant(toolbar);
  }, []);

  // Only clears the active editor if the unmounting field is the one
  // currently holding focus — otherwise a background field's unmount
  // would wipe out whichever field the user is actually still editing.
  const unregister = useCallback((editor) => {
    if (activeEditorRef.current === editor) {
      activeEditorRef.current = null;
      setActiveEditor(null);
    }
  }, []);

  // Right-clicking a field both opens the menu AND makes that field the
  // active editor (so the toolbar and the menu always agree on which
  // field is being edited), even if the field wasn't already focused.
  const openContextMenu = useCallback((editor, x, y, toolbar = "full") => {
    activeEditorRef.current = editor;
    setActiveEditor(editor);
    setActiveToolbarVariant(toolbar);
    setContextMenu({ editor, x, y });
  }, []);

  const closeContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  return (
    <RichTextContext.Provider
      value={{
        activeEditor,
        activeToolbarVariant,
        registerFocus,
        unregister,
        contextMenu,
        openContextMenu,
        closeContextMenu,
      }}
    >
      {children}
    </RichTextContext.Provider>
  );
};

export const useRichTextContext = () => {
  const ctx = useContext(RichTextContext);
  if (!ctx) {
    throw new Error("useRichTextContext must be used within a RichTextProvider");
  }
  return ctx;
};