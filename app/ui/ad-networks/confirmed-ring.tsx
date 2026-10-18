"use client";

import { useEffect, useRef, useState } from "react";
import { formatShare } from "./viz/format";
import styles from "./network-card.module.css";

const radius = 15;
const circumference = 2 * Math.PI * radius;

/**
 * A small ring filled by the share of a network's sites we confirmed live, with a bubble saying it
 * in words. Hover or keyboard focus shows the bubble; a tap toggles it on touch screens, and a tap
 * elsewhere or Escape closes it.
 */
export function ConfirmedRing({ share }: { share: number }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);
  const percent = formatShare(share);

  useEffect(() => {
    if (!open) return;
    const away = (event: PointerEvent) => { if (!ref.current?.contains(event.target as Node)) setOpen(false); };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", away);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", away);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);

  return (
    <button
      aria-label={`${percent} of these sites are confirmed live by us`}
      className={styles.ring}
      data-open={open || undefined}
      onClick={() => setOpen((value) => !value)}
      ref={ref}
      type="button"
    >
      <svg aria-hidden="true" height="40" viewBox="0 0 40 40" width="40">
        <circle className={styles.ringTrack} cx="20" cy="20" fill="none" r={radius} strokeWidth="5" />
        <circle className={styles.ringDone} cx="20" cy="20" fill="none" r={radius} strokeDasharray={`${circumference * Math.min(1, Math.max(0, share))} ${circumference}`} strokeWidth="5" transform="rotate(-90 20 20)" />
      </svg>
      <span aria-hidden="true" className={styles.bubble}><b>{percent}</b> of these sites are confirmed live by us.</span>
    </button>
  );
}
