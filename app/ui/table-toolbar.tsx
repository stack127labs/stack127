"use client";

import { Search } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";
import { Button, ListBox, ListBoxItem, Popover, Select, SelectValue } from "react-aria-components";
import styles from "./table-toolbar.module.css";

/**
 * Compact controls that sit beside a section heading and drive the table below it: a search box,
 * labeled selects, and a small switch. They are controlled, so use them inside a client component.
 * On phones the row becomes a grid: search on its own line, selects two per line.
 */
export function TableToolbar({ children, label }: { children: ReactNode; label: string }) {
  return <div aria-label={label} className={styles.toolbar} role="group">{children}</div>;
}

/**
 * A search box. `compact` is the 42px box beside a heading. `large` is the 52px hero box with the
 * `/` key hint; pressing `/` anywhere on the page jumps to it.
 */
export function ToolbarSearch({ label, onChange, placeholder, size = "compact", value }: {
  label: string;
  onChange: (value: string) => void;
  placeholder: string;
  size?: "compact" | "large";
  value: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const large = size === "large";

  useEffect(() => {
    if (!large) return;
    const jump = (event: KeyboardEvent) => {
      const active = document.activeElement;
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return;
      if (active instanceof HTMLElement && (active.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(active.tagName))) return;
      event.preventDefault();
      input.current?.focus();
    };
    document.addEventListener("keydown", jump);
    return () => document.removeEventListener("keydown", jump);
  }, [large]);

  return (
    <label className={styles.search} data-size={size}>
      <Search aria-hidden="true" size={large ? 20 : 16} />
      <span className={styles.hidden}>{label}</span>
      <input
        autoComplete="off"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        ref={input}
        spellCheck={false}
        type="search"
        value={value}
      />
      {large ? <kbd aria-hidden="true">/</kbd> : null}
    </label>
  );
}

// React Aria keys can't be empty, so an empty value ("All") travels under this key.
const emptyKey = "__all__";
const toKey = (value: string) => (value === "" ? emptyKey : value);
const fromKey = (key: string) => (key === emptyKey ? "" : key);

/**
 * A compact select with its short mono key inside the control, such as `Sort` or `Niche`, and an
 * accessible popover list. Built on React Aria, so it works with keys, touch, and screen readers.
 */
export function ToolbarSelect({ disabled, label, onChange, options, value }: {
  disabled?: boolean;
  /** Short mono key shown inside the control, such as `Sort` or `Niche`. Also its accessible name. */
  label: string;
  onChange: (value: string) => void;
  options: readonly { value: string; label: string }[];
  value: string;
}) {
  const items = options.map((option) => ({ id: toKey(option.value), label: option.label }));
  // Like a native select, the control is as wide as its longest option, so it doesn't jump.
  const longest = options.reduce((widest, option) => (option.label.length > widest.length ? option.label : widest), "");
  return (
    <Select
      aria-label={label}
      className={styles.select}
      isDisabled={disabled}
      onChange={(key) => { if (key !== null) onChange(fromKey(String(key))); }}
      value={toKey(value)}
    >
      <Button className={styles.selectButton}>
        <span aria-hidden="true" className={styles.key}>{label}</span>
        <span className={styles.valueBox}>
          <SelectValue className={styles.value} />
          <span aria-hidden="true" className={styles.sizer}>{longest}</span>
        </span>
        <span aria-hidden="true" className={styles.chevron} />
      </Button>
      <Popover className={styles.popover} offset={4} placement="bottom start">
        <ListBox className={styles.listbox} items={items}>
          {(item) => <ListBoxItem className={styles.option} id={item.id} textValue={item.label}>{item.label}</ListBoxItem>}
        </ListBox>
      </Popover>
    </Select>
  );
}

/** Two to four short choices that change how a table orders or groups, all visible at once. */
export function ToolbarSwitch({ label, onChange, options, value }: {
  label: string;
  onChange: (value: string) => void;
  options: readonly { value: string; label: string }[];
  value: string;
}) {
  return (
    <div aria-label={label} className={styles.switch} role="group">
      {options.map((option) => (
        <button aria-pressed={option.value === value} key={option.value} onClick={() => onChange(option.value)} type="button">
          {option.label}
        </button>
      ))}
    </div>
  );
}
