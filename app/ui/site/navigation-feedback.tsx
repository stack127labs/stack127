"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import styles from "./navigation-feedback.module.css";

const SHOW_DELAY_MS = 120;
const FAILURE_TIMEOUT_MS = 30_000;

function routeKey(pathname: string, searchParams: { toString(): string }) {
  const search = searchParams.toString();
  return `${pathname}${search ? `?${search}` : ""}`;
}

export function NavigationFeedback() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentUrl = routeKey(pathname, searchParams);
  const currentUrlRef = useRef(currentUrl);
  const targetUrlRef = useRef<string | null>(null);
  const showTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const failureTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    currentUrlRef.current = currentUrl;
    if (targetUrlRef.current === currentUrl) {
      targetUrlRef.current = null;
      if (showTimerRef.current) clearTimeout(showTimerRef.current);
      if (failureTimerRef.current) clearTimeout(failureTimerRef.current);
      showTimerRef.current = null;
      failureTimerRef.current = null;
      setVisible(false);
    }
  }, [currentUrl]);

  useEffect(() => {
    const stop = () => {
      targetUrlRef.current = null;
      if (showTimerRef.current) clearTimeout(showTimerRef.current);
      if (failureTimerRef.current) clearTimeout(failureTimerRef.current);
      showTimerRef.current = null;
      failureTimerRef.current = null;
      setVisible(false);
    };

    const start = (target: string) => {
      if (target === currentUrlRef.current) {
        stop();
        return;
      }
      if (showTimerRef.current) clearTimeout(showTimerRef.current);
      if (failureTimerRef.current) clearTimeout(failureTimerRef.current);
      targetUrlRef.current = target;
      showTimerRef.current = setTimeout(() => setVisible(true), SHOW_DELAY_MS);
      failureTimerRef.current = setTimeout(stop, FAILURE_TIMEOUT_MS);
    };

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[href]") : null;
      if (!anchor || anchor.hasAttribute("download") || (anchor.target && anchor.target !== "_self")) return;
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      start(routeKey(url.pathname, url.searchParams));
    };

    const onPopState = () => start(routeKey(window.location.pathname, new URLSearchParams(window.location.search)));

    document.addEventListener("click", onClick, true);
    window.addEventListener("popstate", onPopState);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("popstate", onPopState);
      stop();
    };
  }, []);

  return visible ? (
    <>
      <div aria-label="Opening page" aria-valuetext="Loading" className={styles.progress} role="progressbar">
        <span />
      </div>
      <span className={styles.toast} role="status">Opening page…</span>
    </>
  ) : null;
}
