import React, { useState, useRef, useEffect, useLayoutEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import "./ActionMenu.css";

/**
 * Vertical three-dot (kebab) menu.
 * Clicking the dots opens a list of actions rendered as coloured text.
 *
 * items: [{ label, onClick, tone?: "edit" | "delete" | "success" | "warning", disabled? }]
 */
const ActionMenu = ({ items = [], ariaLabel = "Actions", align = "right" }) => {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef(null);
  const menuRef = useRef(null);

  const close = useCallback(() => setOpen(false), []);

  // Position the menu next to the button (flip up / left if it would overflow the viewport).
  useLayoutEffect(() => {
    if (!open || !btnRef.current || !menuRef.current) return;
    const b = btnRef.current.getBoundingClientRect();
    const m = menuRef.current.getBoundingClientRect();
    const gap = 4;
    let top = b.bottom + gap;
    if (top + m.height > window.innerHeight - 8) top = Math.max(8, b.top - m.height - gap);
    let left = align === "right" ? b.right - m.width : b.left;
    left = Math.min(Math.max(8, left), window.innerWidth - m.width - 8);
    setPos({ top, left });
  }, [open, align, items.length]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (menuRef.current?.contains(e.target) || btnRef.current?.contains(e.target)) return;
      close();
    };
    const onKey = (e) => {
      if (e.key === "Escape") {
        close();
        btnRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", close);
    window.addEventListener("scroll", close, true);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", close);
      window.removeEventListener("scroll", close, true);
    };
  }, [open, close]);

  return (
    <>
      <button
        type="button"
        ref={btnRef}
        className={`am-trigger${open ? " am-trigger--open" : ""}`}
        aria-label={ariaLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <circle cx="12" cy="5" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="12" cy="19" r="2" />
        </svg>
      </button>

      {open &&
        createPortal(
          <ul
            ref={menuRef}
            role="menu"
            className="am-menu"
            style={{ top: pos.top, left: pos.left }}
          >
            {items.map((item, i) => (
              <li key={i} role="none">
                <button
                  type="button"
                  role="menuitem"
                  className={`am-item am-item--${item.tone || "edit"}`}
                  disabled={item.disabled}
                  onClick={(e) => {
                    e.stopPropagation();
                    close();
                    item.onClick && item.onClick(e);
                  }}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>,
          document.body
        )}
    </>
  );
};

export default ActionMenu;
