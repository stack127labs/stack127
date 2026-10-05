"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

const HOVER_DELAY_MS = 80;
// Keep in line with experimental.staleTimes.static in next.config.ts, so a later hover
// refreshes an expired entry.
const REPEAT_AFTER_MS = 5 * 60_000;
// Per page view. Next's scheduler also keeps at most 4 prefetch requests in flight.
const MAX_PREFETCHES = 12;

type NetworkInformation = { saveData?: boolean; effectiveType?: string };

function savesData() {
  const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection;
  if (connection?.saveData) return true;
  if (connection?.effectiveType === "slow-2g" || connection?.effectiveType === "2g") return true;
  return window.matchMedia("(prefers-reduced-data: reduce)").matches;
}

function intentTarget(target: EventTarget | null) {
  const anchor = target instanceof Element ? target.closest<HTMLAnchorElement>('a[data-prefetch="intent"][href]') : null;
  if (!anchor || anchor.hasAttribute("download") || (anchor.target && anchor.target !== "_self")) return null;
  const url = new URL(anchor.href, window.location.href);
  if (url.origin !== window.location.origin) return null;
  const href = `${url.pathname}${url.search}`;
  if (href === `${window.location.pathname}${window.location.search}`) return null;
  return { anchor, href };
}

/**
 * Prefetches marked links when a reader shows intent: a mouse resting on the link
 * for 80ms, keyboard focus, or a touch. Mounted once in the site header.
 * Skips data saver and 2G connections. Next skips all prefetches in development.
 */
export function IntentPrefetch() {
  const router = useRouter();

  useEffect(() => {
    const fetchedAt = new Map<string, number>();
    let count = 0;
    let pageKey = window.location.pathname;
    let hoverTimer: ReturnType<typeof setTimeout> | null = null;
    let hoverAnchor: HTMLAnchorElement | null = null;

    const cancelHover = () => {
      if (hoverTimer) clearTimeout(hoverTimer);
      hoverTimer = null;
      hoverAnchor = null;
    };

    const prefetch = (href: string) => {
      if (window.location.pathname !== pageKey) {
        pageKey = window.location.pathname;
        count = 0;
      }
      const now = Date.now();
      const last = fetchedAt.get(href);
      if (last !== undefined && now - last < REPEAT_AFTER_MS) return;
      if (count >= MAX_PREFETCHES || savesData()) return;
      fetchedAt.set(href, now);
      count += 1;
      router.prefetch(href);
    };

    const onPointerOver = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const link = intentTarget(event.target);
      if (!link || link.anchor === hoverAnchor) return;
      cancelHover();
      hoverAnchor = link.anchor;
      hoverTimer = setTimeout(() => {
        hoverTimer = null;
        prefetch(link.href);
      }, HOVER_DELAY_MS);
    };

    const onPointerOut = (event: PointerEvent) => {
      if (!hoverAnchor) return;
      const next = event.relatedTarget;
      if (next instanceof Node && hoverAnchor.contains(next)) return;
      cancelHover();
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType === "mouse") return;
      const link = intentTarget(event.target);
      if (link) prefetch(link.href);
    };

    const onFocusIn = (event: FocusEvent) => {
      const link = intentTarget(event.target);
      if (link && link.anchor.matches(":focus-visible")) prefetch(link.href);
    };

    document.addEventListener("pointerover", onPointerOver, { passive: true });
    document.addEventListener("pointerout", onPointerOut, { passive: true });
    document.addEventListener("pointerdown", onPointerDown, { passive: true });
    document.addEventListener("focusin", onFocusIn);
    return () => {
      cancelHover();
      document.removeEventListener("pointerover", onPointerOver);
      document.removeEventListener("pointerout", onPointerOut);
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("focusin", onFocusIn);
    };
  }, [router]);

  return null;
}
