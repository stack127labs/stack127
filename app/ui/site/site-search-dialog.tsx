"use client";

import { BookOpen, FileText, Search, type SketchIcon } from "@/app/ui/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { cardIcon } from "@/lib/card-icons";
import { searchSiteEntries, type SiteSearchEntry, type SiteSearchFamily } from "@/lib/site-search";
import styles from "./site-search.module.css";

const focusableSelector = 'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

const familyLabels: Record<SiteSearchFamily, string> = {
  catalog: "catalog",
  course: "course",
  directory: "directory",
  site: "page",
  tool: "tool",
};

const familyIcons: Partial<Record<SiteSearchFamily, SketchIcon>> = { course: BookOpen, site: FileText };

/** The index loads once per visit, on the first open. A failed load can retry. */
let indexRequest: Promise<SiteSearchEntry[]> | null = null;
function loadIndex() {
  indexRequest ??= fetch("/search-index.json").then(async response => {
    if (!response.ok) throw new Error(`Search index failed with status ${response.status}.`);
    return await response.json() as SiteSearchEntry[];
  }).catch(error => {
    indexRequest = null;
    throw error;
  });
  return indexRequest;
}

/** Tool catalogs, top-level directories, and the course, for an empty query. */
function startingEntries(entries: readonly SiteSearchEntry[]) {
  const order: SiteSearchFamily[] = ["catalog", "directory", "course"];
  return entries
    .filter(entry => order.includes(entry.family) && !entry.path.slice(1).includes("/"))
    .sort((a, b) => order.indexOf(a.family) - order.indexOf(b.family) || a.title.localeCompare(b.title));
}

function EntryIcon({ entry }: { entry: SiteSearchEntry }) {
  const Icon = entry.icon ? cardIcon(entry.icon) : familyIcons[entry.family] ?? cardIcon(null);
  return <Icon aria-hidden="true" className={styles.rowIcon} strokeWidth={2} />;
}

export default function SiteSearchDialog({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const id = useId();
  const listId = `${id}-list`;
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const [entries, setEntries] = useState<SiteSearchEntry[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  useEffect(() => {
    let current = true;
    loadIndex().then(
      index => { if (current) { setEntries(index); setFailed(false); } },
      () => { if (current) setFailed(true); },
    );
    return () => { current = false; };
  }, [attempt]);

  // Focus, scroll lock, Escape, and a focus trap, as in DetailDialog.
  useEffect(() => {
    const panel = panelRef.current;
    inputRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab" || !panel) return;
      const focusable = [...panel.querySelectorAll<HTMLElement>(focusableSelector)]
        // Only real tab stops: result links use tabIndex -1 and are reached with the arrow keys.
        .filter(item => item.tabIndex >= 0 && item.getClientRects().length > 0);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;
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
    };
  }, []);

  const trimmed = query.trim();
  const results = useMemo(() => {
    if (!entries) return [];
    return trimmed ? searchSiteEntries(entries, trimmed, 30) : startingEntries(entries);
  }, [entries, trimmed]);
  const activeIndex = Math.min(active, Math.max(results.length - 1, 0));
  const optionId = (index: number) => `${id}-option-${index}`;

  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${activeIndex}"]`)?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, results]);

  const open = (entry: SiteSearchEntry) => {
    onClose();
    router.push(entry.path);
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!results.length) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActive((activeIndex + step + results.length) % results.length);
    } else if (event.key === "Enter" && !event.nativeEvent.isComposing) {
      event.preventDefault();
      const entry = results[activeIndex];
      if (!entry) return;
      if (event.metaKey || event.ctrlKey) window.open(entry.path, "_blank", "noopener");
      else open(entry);
    }
  };

  const status = failed ? "Search couldn't load." : !entries ? "Loading pages…"
    : trimmed && !results.length ? `No pages match “${trimmed}”.`
      : trimmed ? `${results.length} ${results.length === 1 ? "page" : "pages"} found.` : "";

  return (
    <div className={styles.overlay} onPointerDown={event => {
      if (event.target !== event.currentTarget) return;
      event.preventDefault();
      onClose();
    }}>
      <div aria-label="Search pages" aria-modal="true" className={styles.panel} ref={panelRef} role="dialog">
        <div className={styles.field}>
          <Search aria-hidden="true" className={styles.fieldIcon} strokeWidth={2} />
          <input
            aria-activedescendant={results.length ? optionId(activeIndex) : undefined}
            aria-autocomplete="list"
            aria-controls={listId}
            aria-expanded={results.length > 0}
            aria-label="Search pages"
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            className={styles.input}
            enterKeyHint="go"
            onChange={event => { setQuery(event.target.value); setActive(0); }}
            onKeyDown={handleInputKeyDown}
            placeholder="search tools, directories, and guides"
            ref={inputRef}
            role="combobox"
            spellCheck={false}
            type="search"
            value={query}
          />
          <button aria-label="Close search" className={styles.close} onClick={onClose} type="button">esc</button>
        </div>
        <div className={styles.body}>
          <p aria-live="polite" className={trimmed && !results.length || failed ? styles.message : styles.srOnly} role="status">
            {status}
          </p>
          {failed ? (
            <button className={styles.retry} onClick={() => setAttempt(value => value + 1)} type="button">try again</button>
          ) : null}
          {!trimmed && results.length ? <p className={styles.groupLabel} id={`${id}-start`}>start here</p> : null}
          <div
            aria-label={trimmed ? "Matching pages" : undefined}
            aria-labelledby={trimmed ? undefined : `${id}-start`}
            className={styles.list}
            id={listId}
            ref={listRef}
            role="listbox"
          >
            {results.map((entry, index) => (
              <Link
                aria-selected={index === activeIndex}
                className={styles.row}
                data-index={index}
                href={entry.path}
                id={optionId(index)}
                key={entry.path}
                onClick={event => {
                  if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
                  onClose();
                }}
                onPointerMove={() => { if (index !== activeIndex) setActive(index); }}
                prefetch={false}
                role="option"
                tabIndex={-1}
              >
                <EntryIcon entry={entry} />
                <span className={styles.rowText}>
                  <span className={styles.rowTitle}>{entry.title}</span>
                  {entry.description ? <span className={styles.rowDescription}>{entry.description}</span> : null}
                </span>
                <span className={styles.rowFamily}>{familyLabels[entry.family]}</span>
              </Link>
            ))}
          </div>
        </div>
        <p aria-hidden="true" className={styles.footer}>
          <span><kbd>↑</kbd><kbd>↓</kbd> move</span>
          <span><kbd>enter</kbd> open</span>
          <span><kbd>esc</kbd> close</span>
        </p>
      </div>
    </div>
  );
}
