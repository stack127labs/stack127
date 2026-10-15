"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import styles from "./section-bar.module.css";

/** Only the row scrolls. scrollIntoView could also move the page under the sticky header. */
export function SectionBarScroll({ children, current }: { children: ReactNode; current: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    let cancelled = false;
    const revealCurrent = () => {
      const row = ref.current;
      const active = row?.querySelector<HTMLElement>('[aria-current="page"]');
      if (cancelled || !row || !active) return;
      const bounds = row.getBoundingClientRect();
      const link = active.getBoundingClientRect();
      if (link.right > bounds.right) row.scrollLeft += link.right - bounds.right;
      else if (link.left < bounds.left) row.scrollLeft += link.left - bounds.left;
    };

    revealCurrent();
    void document.fonts.ready.then(revealCurrent);
    return () => { cancelled = true; };
  }, [current]);

  return <div className={styles.scroll} ref={ref}>{children}</div>;
}
