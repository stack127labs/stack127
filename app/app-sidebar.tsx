"use client";

import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import styles from "./app-shell.module.css";

type AppSidebarProps = {
  children: ReactNode;
  /** Accessible label for the sidebar region. */
  label: string;
  /** Text next to the hamburger on mobile, e.g. "Lessons" or "Filters". */
  menuLabel: string;
};

const DRAWER_ID = "app-sidebar-drawer";
const COMPACT_SIDEBAR_QUERY = "(max-width: 960px)";

/**
 * Desktop renders the sidebar as an in-grid sticky column.
 * Compact view (<=960px, see app-shell.module.css): the same content becomes an off-canvas
 * left drawer opened by a sticky hamburger bar, so the main content is what
 * people land on. The trigger bar and backdrop are display:none on desktop, so
 * only the <aside> stays in the grid and desktop layout is untouched.
 */
export function AppSidebar({ children, label, menuLabel }: AppSidebarProps) {
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const compactSidebar = window.matchMedia(COMPACT_SIDEBAR_QUERY);
    const closeAtDesktopWidth = (event: MediaQueryListEvent) => {
      if (!event.matches) {
        setOpen(false);
      }
    };

    compactSidebar.addEventListener("change", closeAtDesktopWidth);
    return () => compactSidebar.removeEventListener("change", closeAtDesktopWidth);
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      toggleRef.current?.focus();
    };
  }, [open]);

  // Close after a navigation link is tapped inside the drawer (lesson links,
  // reset/clear). Filter checkboxes and radios are not links, so multi-select
  // stays open.
  const handleContentClick = (event: MouseEvent<HTMLElement>) => {
    if ((event.target as HTMLElement).closest("a")) {
      setOpen(false);
    }
  };

  return (
    <>
      <div className={styles.sidebarBar}>
        <button
          aria-controls={DRAWER_ID}
          aria-expanded={open}
          className={styles.toggle}
          onClick={() => setOpen((value) => !value)}
          ref={toggleRef}
          type="button"
        >
          <span aria-hidden="true" className={styles.toggleIcon}>
            <span />
            <span />
            <span />
          </span>
          {menuLabel}
        </button>
      </div>

      <div
        aria-hidden="true"
        className={`${styles.backdrop}${open ? ` ${styles.open}` : ""}`}
        onClick={() => setOpen(false)}
      />

      <aside
        aria-label={label}
        className={`${styles.sidebar}${open ? ` ${styles.open}` : ""}`}
        data-app-sidebar
        id={DRAWER_ID}
        onClick={handleContentClick}
      >
        <button
          aria-label="Close menu"
          className={styles.close}
          onClick={() => setOpen(false)}
          ref={closeRef}
          type="button"
        >
          <span aria-hidden="true">×</span>
        </button>
        {children}
      </aside>
    </>
  );
}
