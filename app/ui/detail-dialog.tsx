"use client";

import { useEffect, useRef, type ReactNode } from "react";
import styles from "./detail-dialog.module.css";

const focusableSelector = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])';

export function DetailDialog({ ariaLabel, children, onClose }: {
  ariaLabel: string;
  children: ReactNode;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const panel = panelRef.current;
    panel?.querySelector<HTMLElement>(focusableSelector)?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab" || !panel) return;
      const focusable = [...panel.querySelectorAll<HTMLElement>(focusableSelector)].filter((item) => item.getClientRects().length > 0);
      if (!focusable.length) {
        event.preventDefault();
        panel.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && (document.activeElement === first || !panel.contains(document.activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !panel.contains(document.activeElement))) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      if (opener?.isConnected) opener.focus({ preventScroll: true });
    };
  }, []);

  return (
    <div className={styles.overlay} onPointerDown={(event) => {
      if (event.target !== event.currentTarget) return;
      event.preventDefault();
      onClose();
    }}>
      <aside aria-label={ariaLabel} aria-modal="true" className={styles.panel} ref={panelRef} role="dialog" tabIndex={-1}>
        {children}
      </aside>
    </div>
  );
}

export function DetailDialogClose({ ariaLabel, onClose }: { ariaLabel: string; onClose: () => void }) {
  return <button aria-label={ariaLabel} className={styles.close} onClick={onClose} type="button">×</button>;
}
