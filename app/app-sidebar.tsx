"use client";

import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";

type AppSidebarProps = {
  children: ReactNode;
  /** Accessible label for the sidebar region. */
  label: string;
  /** Text next to the hamburger on mobile, e.g. "Lessons" or "Filters". */
  menuLabel: string;
};

const DRAWER_ID = "app-sidebar-drawer";

/**
 * Desktop: renders the sidebar exactly as before — an in-grid sticky column.
 * Mobile (<=900px, see globals.css): the same content becomes an off-canvas
 * left drawer opened by a sticky hamburger bar, so the main content is what
 * people land on. The trigger bar and backdrop are display:none on desktop, so
 * only the <aside> stays in the grid and desktop layout is untouched.
 */
export function AppSidebar({ children, label, menuLabel }: AppSidebarProps) {
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

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
      <div className="app-sidebar-bar">
        <button
          aria-controls={DRAWER_ID}
          aria-expanded={open}
          className="app-sidebar-toggle"
          onClick={() => setOpen((value) => !value)}
          ref={toggleRef}
          type="button"
        >
          <span aria-hidden="true" className="app-sidebar-toggle-icon">
            <span />
            <span />
            <span />
          </span>
          {menuLabel}
        </button>
      </div>

      <div
        aria-hidden="true"
        className={`app-sidebar-backdrop${open ? " is-open" : ""}`}
        onClick={() => setOpen(false)}
      />

      <aside
        aria-label={label}
        className={`app-sidebar${open ? " is-open" : ""}`}
        id={DRAWER_ID}
        onClick={handleContentClick}
      >
        <button
          aria-label="Close menu"
          className="app-sidebar-close"
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
