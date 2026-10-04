"use client";
import Link from 'next/link';
import { createContext, Fragment, useContext, useEffect, useState, type MouseEvent, type ReactNode } from 'react';
import { UiButton, UiSearchField } from '@/app/ui/controls';
import { StatePanel } from '@/app/ui/state-panel';
import { SidebarList } from '@/app/ui/site/sidebar-list';
import styles from './page.module.css';

// The pages are static. Search runs in the browser from ?q=, which stays out of the index.
export type FeeSearchItem = { id: string; text: string };

const QueryContext = createContext<{ query: string; setQuery: (query: string) => void }>({ query: '', setQuery: () => {} });

const readQuery = () => (new URLSearchParams(window.location.search).get('q') ?? '').trim().slice(0, 160);

export function FeeSearch({ children }: { children: ReactNode }) {
  const [query, setQuery] = useState('');
  useEffect(() => {
    const sync = () => setQuery(readQuery());
    sync();
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, []);
  return <QueryContext.Provider value={{ query, setQuery }}>{children}</QueryContext.Provider>;
}

export function useFeeQuery() {
  return useContext(QueryContext).query;
}

// Same-page section links clear the search, then scroll once the section is back in the page.
function useSamePageAnchor() {
  const { setQuery } = useContext(QueryContext);
  return (event: MouseEvent<HTMLElement>) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = (event.target as Element).closest('a');
    if (!link?.hash) return;
    const destination = new URL(link.href, window.location.origin);
    if (destination.pathname !== window.location.pathname) return;
    event.preventDefault();
    event.stopPropagation();
    const id = decodeURIComponent(destination.hash.slice(1));
    window.history.pushState(null, '', `${destination.pathname}${destination.hash}`);
    setQuery('');
    window.setTimeout(() => document.getElementById(id)?.scrollIntoView(), 0);
  };
}

// Clears the search in place; a link to the same path would keep the old query state.
function ShowAll({ href, children }: { href: string; children: ReactNode }) {
  const { setQuery } = useContext(QueryContext);
  return <Link href={href} onClick={event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    window.history.pushState(null, '', href);
    setQuery('');
  }}>{children}</Link>;
}

export function matchItems<T extends FeeSearchItem>(items: T[], query: string) {
  const needle = query.toLocaleLowerCase('en-US');
  return needle ? items.filter(item => item.text.includes(needle)) : items;
}

function matchesLines(text: string, query: string) {
  const needle = query.toLocaleLowerCase('en-US');
  if (!needle) return true;
  return text.split('\n').some(line => line.includes(needle));
}

export function FeeFilters({ action = '/platform-fees' }: { action?: string }) {
  const { query, setQuery } = useContext(QueryContext);
  const [search, setSearch] = useState(query);
  useEffect(() => setSearch(query), [query]);
  return <form
    action={action}
    role="search"
    className={styles.filters}
    onSubmit={event => {
      event.preventDefault();
      const next = search.trim().slice(0, 160);
      const url = new URL(action, window.location.origin);
      if (next) url.searchParams.set('q', next);
      window.history.replaceState(null, '', `${url.pathname}${url.search}`);
      setQuery(next);
    }}
  >
    <UiSearchField label="Search platforms" name="q" placeholder="Platform or service name" value={search} onChange={setSearch} />
    <UiButton type="submit">Search</UiButton>
  </form>;
}

export function FeeMatchCount({ items, label }: { items: FeeSearchItem[]; label: string }) {
  return <>{matchItems(items, useFeeQuery()).length} {label}</>;
}

export type FeeCategorySection = {
  anchor: string;
  href: string;
  name: string;
  intro: string;
  checkedLabel: ReactNode;
  sources: ReactNode;
  items: Array<FeeSearchItem & { card: ReactNode }>;
};

export function FeeCategoryBody({ path, sections }: { path: string; sections: FeeCategorySection[] }) {
  const query = useFeeQuery();
  const followAnchor = useSamePageAnchor();
  const visible = sections.flatMap(section => {
    const items = matchItems(section.items, query);
    if (query && items.length === 0) return [];
    return [{ ...section, items }];
  });
  return <>
    {visible.length > 0 && <nav aria-label="Jump to a section" onClickCapture={followAnchor}>
      <ul className={styles.jump}>
        {visible.map(section => <li key={section.anchor}><a href={section.href}>{section.name}</a></li>)}
      </ul>
    </nav>}
    {query && visible.length > 0 && <p className={styles.resetLine}><ShowAll href={path}>Show all platforms</ShowAll></p>}
    {visible.length === 0 && <StatePanel title="No platforms match" action={<ShowAll href={path}>Show all platforms</ShowAll>} />}
    {visible.map(section => <section key={section.anchor} id={section.anchor} className={styles.sectionGroup}>
      <div className={styles.sectionHeading}>
        <h2>{section.name}</h2>
        <div className={styles.overviewActions}>
          {section.checkedLabel}
          {section.sources}
        </div>
      </div>
      <p className={styles.sectionIntro}>{section.intro}</p>
      <div className={styles.grid}>{section.items.map(item => <Fragment key={item.id}>{item.card}</Fragment>)}</div>
    </section>)}
  </>;
}

export type FeeAnchor = { href: string; label: string; icon: ReactNode; text: string };

export function FeeSidebarAnchors({ anchors }: { anchors: FeeAnchor[] }) {
  const query = useFeeQuery();
  const followAnchor = useSamePageAnchor();
  const visible = anchors.filter(anchor => matchesLines(anchor.text, query));
  if (!visible.length) return null;
  return <nav aria-label="Sections on this page" className={styles.sidebarAnchors} onClickCapture={followAnchor}>
    <p className={styles.sidebarAnchorLabel}>On this page</p>
    <SidebarList items={visible.map(anchor => ({ href: anchor.href, label: anchor.label, icon: anchor.icon }))} />
  </nav>;
}

export function FeeHubResults({ items, children }: {
  items: Array<FeeSearchItem & { name: string; section: string; href: string }>;
  children: ReactNode;
}) {
  const query = useFeeQuery();
  if (!query) return children;
  const matches = matchItems(items, query);
  return <>
    <p className={styles.count} aria-live="polite">{matches.length} results</p>
    {!matches.length && <StatePanel title="No platforms match" action={<ShowAll href="/platform-fees">All categories</ShowAll>} />}
    <div className={styles.results}>{matches.map(item =>
      <Link className={styles.result} key={item.id} href={item.href}>
        <strong>{item.name}</strong>
        <span>{item.section}</span>
        <span aria-hidden="true">→</span>
      </Link>,
    )}</div>
  </>;
}
