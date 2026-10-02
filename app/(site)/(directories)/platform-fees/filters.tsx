"use client";
import Link from 'next/link';
import { createContext, Fragment, useContext, useEffect, useState, type ReactNode } from 'react';
import { UiButton, UiSearchField } from '@/app/ui/controls';
import { StatePanel } from '@/app/ui/state-panel';
import styles from './page.module.css';

// The pages are static. Search runs in the browser from ?q=, which stays out of the index.
export type FeeSearchItem = { id: string; text: string };

const QueryContext = createContext<{ query: string; setQuery: (query: string) => void }>({ query: '', setQuery: () => {} });

const readQuery = () => (new URLSearchParams(window.location.search).get('q') ?? '').trim().slice(0, 160);

export function FeeSearch({ children, sectionRedirects }: { children: ReactNode; sectionRedirects?: Record<string, string> }) {
  const [query, setQuery] = useState('');
  useEffect(() => {
    // Old hub links used ?section=<id>. Send them to the section page.
    const section = new URLSearchParams(window.location.search).get('section');
    const target = section ? sectionRedirects?.[section] : undefined;
    if (target) {
      const q = readQuery();
      window.location.replace(`${target}${q ? `?q=${encodeURIComponent(q)}` : ''}`);
      return;
    }
    const sync = () => setQuery(readQuery());
    sync();
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, [sectionRedirects]);
  return <QueryContext.Provider value={{ query, setQuery }}>{children}</QueryContext.Provider>;
}

export function useFeeQuery() {
  return useContext(QueryContext).query;
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
      window.history.replaceState(null, '', next ? `${action}?q=${encodeURIComponent(next)}` : action);
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

export function FeeSectionGrid({ items, path }: { items: Array<FeeSearchItem & { card: ReactNode }>; path: string }) {
  const matches = matchItems(items, useFeeQuery());
  return <>
    {!matches.length && <StatePanel title="No platforms match" action={<ShowAll href={path}>Show all platforms</ShowAll>} />}
    <div className={styles.grid}>{matches.map(item => <Fragment key={item.id}>{item.card}</Fragment>)}</div>
  </>;
}

export function FeeHubResults({ items, children }: {
  items: Array<FeeSearchItem & { name: string; section: string; href: string }>;
  children: ReactNode;
}) {
  const query = useFeeQuery();
  if (!query) return children;
  const matches = matchItems(items, query);
  return <>
    <p className={styles.count}>{matches.length} results</p>
    {!matches.length && <StatePanel title="No platforms match" action={<ShowAll href="/platform-fees">All sections</ShowAll>} />}
    <div className={styles.results}>{matches.map(item =>
      <Link className={styles.result} key={item.id} href={item.href}>
        <strong>{item.name}</strong>
        <span>{item.section}</span>
        <span aria-hidden="true">→</span>
      </Link>,
    )}</div>
  </>;
}
