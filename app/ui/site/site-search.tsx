"use client";

import { Search } from "@/app/ui/icons";
import { lazy, Suspense, useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import styles from "./site-search.module.css";

const loadDialog = () => import("./site-search-dialog");
const SiteSearchDialog = lazy(loadDialog);

const subscribeNever = () => () => {};
const readIsMac = () => /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent);

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
}

/** The top bar search field. It opens the page search dialog. */
export function SiteSearch() {
  const [open, setOpen] = useState(false);
  const openRef = useRef(open);
  openRef.current = open;
  const triggerRef = useRef<HTMLButtonElement>(null);
  const isMac = useSyncExternalStore(subscribeNever, readIsMac, () => null);

  const close = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.isComposing) return;
      if ((event.metaKey || event.ctrlKey) && !event.altKey && !event.shiftKey && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (openRef.current) close();
        else setOpen(true);
        return;
      }
      if (event.key === "/" && !event.metaKey && !event.ctrlKey && !event.altKey && !isTypingTarget(event.target)) {
        event.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [close]);

  return (
    <>
      <button
        aria-haspopup="dialog"
        aria-keyshortcuts="Meta+K Control+K /"
        aria-label="Search pages"
        className={styles.trigger}
        onClick={() => setOpen(true)}
        onFocus={() => void loadDialog()}
        onPointerEnter={() => void loadDialog()}
        ref={triggerRef}
        type="button"
      >
        <Search aria-hidden="true" className={styles.icon} strokeWidth={2} />
        <span className={styles.placeholder}>search tools and directories</span>
        {isMac === null ? null : (
          <kbd aria-hidden="true" className={styles.hint}>{isMac ? "⌘K" : "Ctrl K"}</kbd>
        )}
      </button>
      {/* The sticky header is its own stacking layer, so the dialog renders in body. */}
      {open ? createPortal(
        <Suspense fallback={null}>
          <SiteSearchDialog onClose={close} />
        </Suspense>,
        document.body,
      ) : null}
    </>
  );
}
