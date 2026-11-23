"use client";

import { LayoutGrid, List } from "@/app/ui/icons";
import type { MouseEvent, ReactNode } from "react";
import { paramString, type DirectoryParams } from "./directory-params";
import { useDirectoryQuery } from "./directory-query";
import styles from "./directory-view.module.css";

/** A directory shows its results as a list (the default) or as cards (`?view=cards`). */
export type DirectoryView = "list" | "cards";

/** Any other `view` value, such as the old `?view=table`, shows the list. */
export function directoryView(params: DirectoryParams): DirectoryView {
  return paramString(params, "view") === "cards" ? "cards" : "list";
}

/** The params with this view: `view=cards` for cards, no `view` key for the list. */
export function withDirectoryView(params: DirectoryParams, view: DirectoryView): DirectoryParams {
  const rest = Object.fromEntries(Object.entries(params).filter(([key]) => key !== "view"));
  return view === "cards" ? { ...rest, view: "cards" } : rest;
}

/** The page's clean URL in this view, for reset and clear-all links. */
export function directoryViewRoute(route: string, view: DirectoryView) {
  return view === "cards" ? `${route}?view=cards` : route;
}

function hrefFor(route: string, params: DirectoryParams) {
  const next = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    for (const current of Array.isArray(value) ? value : value ? [value] : []) next.append(key, current);
  }
  const query = next.toString();
  return query ? `${route}?${query}` : route;
}

/** Keeps the cards view when the sidebar form rebuilds the URL from its fields. */
export function DirectoryViewInput({ view }: { view: DirectoryView }) {
  return view === "cards" ? <input name="view" type="hidden" value="cards" /> : null;
}

/** The list or cards switch. It changes only `view` in the URL, keeping filters, sort, and page. */
export function DirectoryViewSwitch({ route }: { route: string }) {
  const { params, replace } = useDirectoryQuery();
  const current = directoryView(params);
  const choose = (view: DirectoryView) => (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (view !== current) replace(hrefFor(route, withDirectoryView(params, view)));
  };

  return <div aria-label="view" className={styles.switch} role="group">
    <button aria-pressed={current === "list"} onClick={choose("list")} type="button">
      <List aria-hidden="true" size={14} strokeWidth={2} />list
    </button>
    <button aria-pressed={current === "cards"} onClick={choose("cards")} type="button">
      <LayoutGrid aria-hidden="true" size={14} strokeWidth={2} />cards
    </button>
  </div>;
}

/** The row above the results: a short count or note on the left, controls such as the view switch on the right. */
export function DirectoryResultsBar({ children, count }: { children: ReactNode; count?: ReactNode }) {
  return <div className={styles.bar}>
    {count ? <p aria-atomic="true" aria-live="polite" className={styles.count}>{count}</p> : <span />}
    <div className={styles.controls}>{children}</div>
  </div>;
}

export type DirectoryListColumn = {
  /** Lowercase header text. Phones show it before the value. */
  label: string;
  /** Header content when it needs more than text, such as a credit link. */
  header?: ReactNode;
  /** Data values such as sizes, dates, and counts. */
  mono?: boolean;
  /** Hidden on phones to keep each row short. */
  hideOnPhone?: boolean;
  /** No label before the value on phones, for actions such as a submit link. */
  bare?: boolean;
};

export type DirectoryListRow = {
  key: string;
  icon: ReactNode;
  /** The name as a link or a button that opens the item's details. */
  name: ReactNode;
  badge?: ReactNode;
  summary?: string;
  /** One short muted line under the summary, such as an app directory's main job label. */
  note?: ReactNode;
  cells: ReactNode[];
  selected?: boolean;
  /** A click anywhere on the row does the same as the name. The name stays the keyboard target. */
  onSelect?: () => void;
};

/** One item per row: icon, name, and summary first, then one cell per column. Phones stack each row. */
export function DirectoryList({ columns, firstLabel, label, rows }: {
  columns: DirectoryListColumn[];
  /** Header of the name column, such as "app" or "place". */
  firstLabel: string;
  /** Accessible table name. */
  label: string;
  rows: DirectoryListRow[];
}) {
  const rowClick = (row: DirectoryListRow) => row.onSelect ? (event: MouseEvent<HTMLTableRowElement>) => {
    if (event.target instanceof Element && event.target.closest("a, button")) return;
    row.onSelect?.();
  } : undefined;

  return <div className={styles.frame}>
    <table aria-label={label} className={styles.table}>
      <thead>
        <tr>
          <th scope="col">{firstLabel}</th>
          {columns.map((column) => <th data-phone={column.hideOnPhone ? "hide" : undefined} key={column.label} scope="col">{column.header ?? column.label}</th>)}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => <tr data-clickable={row.onSelect ? "true" : undefined} data-selected={row.selected ? "true" : undefined} key={row.key} onClick={rowClick(row)}>
          <th scope="row">
            <span className={styles.item}>
              <span className={styles.icon}>{row.icon}</span>
              <span className={styles.copy}>
                <span className={styles.name}>{row.name}{row.badge}</span>
                {row.summary ? <span className={styles.summary}>{row.summary}</span> : null}
                {row.note}
              </span>
            </span>
          </th>
          {row.cells.map((cell, index) => {
            const column = columns[index];
            return <td
              data-bare={column?.bare ? "true" : undefined}
              data-label={column?.label}
              data-mono={column?.mono ? "true" : undefined}
              data-phone={column?.hideOnPhone ? "hide" : undefined}
              key={column?.label ?? index}
            >{cell}</td>;
          })}
        </tr>)}
      </tbody>
    </table>
  </div>;
}

/** Plain text for a value nobody has confirmed yet. */
export function DirectoryListUnknown({ children }: { children: ReactNode }) {
  return <span className={styles.unknown}>{children}</span>;
}
