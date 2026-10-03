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
// Same focus targets as the shared DetailDialog.
const focusableSelector = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])';
const openMenuSelector = '[data-custom-select-trigger][aria-expanded="true"], [data-filter-select-trigger][aria-expanded="true"]';

/** Makes everything outside the drawer inert, except the backdrop that closes it. Returns the undo. */
function isolate(drawer: HTMLElement, keep: HTMLElement | null) {
  const changed: HTMLElement[] = [];
  let node: HTMLElement = drawer;
  while (node.parentElement && node !== document.body) {
    for (const sibling of node.parentElement.children) {
      if (sibling === node || sibling === keep || !(sibling instanceof HTMLElement) || sibling.inert) continue;
      if (sibling.tagName === "SCRIPT" || sibling.tagName === "STYLE") continue;
      sibling.inert = true;
      changed.push(sibling);
    }
    node = node.parentElement;
  }
  return () => {
    for (const element of changed) element.inert = false;
  };
}

/**
 * Desktop renders the sidebar as an in-grid sticky column.
 * Compact view (<=960px, see app-shell.module.css): the same content becomes an off-canvas
 * left drawer opened by a sticky hamburger bar, so the main content is what
 * people land on. The trigger bar and backdrop are display:none on desktop, so
 * only the <aside> stays in the grid and desktop layout is untouched.
 * While the drawer is open it is a modal dialog: focus stays inside, the rest of
 * the page is inert, and Escape or the backdrop closes it and returns focus to the trigger.
 */
export function AppSidebar({ children, label, menuLabel }: AppSidebarProps) {
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

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
    const drawer = drawerRef.current;
    if (!open || !drawer) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        // An open filter menu closes first; the next Escape closes the drawer.
        if (drawer.querySelector(openMenuSelector)) return;
        event.preventDefault();
        setOpen(false);
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = [...drawer.querySelectorAll<HTMLElement>(focusableSelector)].filter((item) => item.getClientRects().length > 0);
      if (!focusable.length) {
        event.preventDefault();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && (document.activeElement === first || !drawer.contains(document.activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !drawer.contains(document.activeElement))) {
        event.preventDefault();
        first.focus();
      }
    };

    // Capture runs before the filter controller closes its menus on Escape.
    document.addEventListener("keydown", onKeyDown, true);
    const restore = isolate(drawer, backdropRef.current);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      restore();
      document.body.style.overflow = previousOverflow;
      const active = document.activeElement;
      const focusWasInside = !active || active === document.body || drawer.contains(active);
      if (!focusWasInside) return;
      if (window.matchMedia(COMPACT_SIDEBAR_QUERY).matches) {
        toggleRef.current?.focus({ preventScroll: true });
        return;
      }
      // The drawer closed because the window grew to desktop width. The close button is
      // hidden there, so move focus to the first visible sidebar control. A control that
      // is still visible keeps focus.
      if (active instanceof HTMLElement && active !== document.body && active.getClientRects().length > 0) return;
      const visible = [...drawer.querySelectorAll<HTMLElement>(focusableSelector)].find((item) => item.getClientRects().length > 0);
      visible?.focus({ preventScroll: true });
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
          aria-haspopup="dialog"
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
        ref={backdropRef}
      />

      <aside
        aria-label={label}
        aria-modal={open ? true : undefined}
        className={`${styles.sidebar}${open ? ` ${styles.open}` : ""}`}
        data-app-sidebar
        id={DRAWER_ID}
        onClick={handleContentClick}
        ref={drawerRef}
        role={open ? "dialog" : undefined}
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
