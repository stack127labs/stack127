"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import styles from "./tabs.module.css";

export type UiTab = {
  /** Stable key, also used in the panel id. */
  id: string;
  /** The tab name and the panel's heading. */
  title: string;
  content: ReactNode;
};

type HeadingLevel = 2 | 3 | 4;

/**
 * Tabs that search engines and find-in-page can read. The server HTML holds every panel under its
 * own heading, so without scripts all panels show in order. After hydration the tab row appears and
 * inactive panels get `hidden="until-found"`: find-in-page still reaches them and opens their tab.
 */
export function UiTabs({ headingLevel = 3, label, tabs }: { headingLevel?: HeadingLevel; label: string; tabs: readonly UiTab[] }) {
  const base = useId();
  const [enhanced, setEnhanced] = useState(false);
  const [active, setActive] = useState(0);
  const panels = useRef<(HTMLElement | null)[]>([]);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const Heading = `h${headingLevel}` as const;

  useEffect(() => setEnhanced(true), []);

  // React has no typed `hidden="until-found"` or `beforematch`, so both are set on the elements.
  useEffect(() => {
    if (!enhanced) return;
    panels.current.forEach((panel, index) => {
      if (!panel) return;
      if (index === active) panel.removeAttribute("hidden");
      else panel.setAttribute("hidden", "until-found");
    });
  }, [active, enhanced]);

  useEffect(() => {
    if (!enhanced) return;
    const cleanups = panels.current.map((panel, index) => {
      if (!panel) return () => {};
      const open = () => setActive(index);
      panel.addEventListener("beforematch", open);
      return () => panel.removeEventListener("beforematch", open);
    });
    return () => cleanups.forEach((cleanup) => cleanup());
  }, [enhanced, tabs.length]);

  const select = (index: number, focus = false) => {
    setActive(index);
    if (focus) buttons.current[index]?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const count = tabs.length;
    const next = { ArrowRight: (active + 1) % count, ArrowLeft: (active - 1 + count) % count, Home: 0, End: count - 1 }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    select(next, true);
  };

  const tabId = (index: number) => `${base}-tab-${tabs[index].id}`;
  const panelId = (index: number) => `${base}-panel-${tabs[index].id}`;

  return (
    <div className={styles.tabs} data-enhanced={enhanced || undefined}>
      {enhanced ? (
        <div aria-label={label} className={styles.list} onKeyDown={onKeyDown} role="tablist">
          {tabs.map((tab, index) => (
            <button
              aria-controls={panelId(index)}
              aria-selected={index === active}
              className={styles.tab}
              id={tabId(index)}
              key={tab.id}
              onClick={() => select(index)}
              ref={(element) => { buttons.current[index] = element; }}
              role="tab"
              tabIndex={index === active ? 0 : -1}
              type="button"
            >
              {tab.title}
            </button>
          ))}
        </div>
      ) : null}
      {tabs.map((tab, index) => (
        <section
          aria-labelledby={enhanced ? tabId(index) : `${panelId(index)}-heading`}
          className={styles.panel}
          id={panelId(index)}
          key={tab.id}
          ref={(element) => { panels.current[index] = element; }}
          role={enhanced ? "tabpanel" : undefined}
          tabIndex={enhanced ? 0 : undefined}
        >
          <Heading className={styles.heading} id={`${panelId(index)}-heading`}>{tab.title}</Heading>
          {tab.content}
        </section>
      ))}
    </div>
  );
}

export type UiTabRowItem = { id: string; title: string };

/**
 * A tab row over one panel the caller renders, such as a tool with several ways to calculate.
 * The caller owns the active tab, so a shared link can open any of them, and spreads
 * `uiTabPanelProps(panelId, value)` on the panel. Same look and keys as `UiTabs`.
 */
export function UiTabRow({ label, onChange, panelId, tabs, value }: {
  label: string;
  onChange: (id: string) => void;
  panelId: string;
  tabs: readonly UiTabRowItem[];
  value: string;
}) {
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const active = Math.max(0, tabs.findIndex((tab) => tab.id === value));

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const count = tabs.length;
    const next = { ArrowRight: (active + 1) % count, ArrowLeft: (active - 1 + count) % count, Home: 0, End: count - 1 }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    onChange(tabs[next].id);
    buttons.current[next]?.focus();
  };

  return (
    <div aria-label={label} className={styles.list} onKeyDown={onKeyDown} role="tablist">
      {tabs.map((tab, index) => (
        <button
          aria-controls={panelId}
          aria-selected={index === active}
          className={styles.tab}
          id={`${panelId}-tab-${tab.id}`}
          key={tab.id}
          onClick={() => onChange(tab.id)}
          ref={(element) => { buttons.current[index] = element; }}
          role="tab"
          tabIndex={index === active ? 0 : -1}
          type="button"
        >
          {tab.title}
        </button>
      ))}
    </div>
  );
}

/** Props for the panel under a `UiTabRow`. */
export function uiTabPanelProps(panelId: string, value: string) {
  return { "aria-labelledby": `${panelId}-tab-${value}`, id: panelId, role: "tabpanel" } as const;
}
