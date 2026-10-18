"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { UiButton } from "@/app/ui/controls";
import { StatePanel } from "@/app/ui/state-panel";
import { TableToolbar, ToolbarSelect } from "@/app/ui/table-toolbar";
import { NetworkGrid, SortNote } from "@/app/ui/ad-networks/network-card";
import { SectionHead } from "@/app/ui/ad-networks/section";
import { checkerHref } from "@/app/ui/ad-networks/site-format";
import type { AdNetworkDirectorySort } from "@/lib/ad-networks-types";
import styles from "./directory.module.css";

export type DirectoryNetwork = { slug: string; name: string };
export type DirectoryNiche = { slug: string; name: string; /** Network slugs, most sites in this niche first. */ order: readonly string[] };

type View = { q: string; sort: AdNetworkDirectorySort; niche: string };

const ViewContext = createContext<{ view: View; set: (patch: Partial<View>) => void } | null>(null);

const visibleAtFirst = 12;
const domainLike = /^(?:https?:\/\/)?(?:[a-z0-9-]+\.)+[a-z]{2,}(?:[/?#].*)?$/i;
const sortLabels: Record<AdNetworkDirectorySort, string> = {
  "most-sites": "Most sites",
  "easiest-to-join": "Easiest to join",
  "by-niche": "By niche",
};

const cleanQuery = (value: string) => value.trim().slice(0, 100);
const matches = (network: DirectoryNetwork, needle: string) =>
  network.name.toLowerCase().includes(needle) || network.slug.includes(needle.replace(/\s+/g, "-"));

/**
 * Holds the search, sort, and niche for the directory, so the hero search and the grid below it
 * share them. The static page renders the default view; a shared link's `?q=`, `?sort=`, and
 * `?niche=` are read in the browser after hydration.
 */
export function DirectoryView({ children, niches, sorts }: { children: ReactNode; niches: readonly DirectoryNiche[]; sorts: readonly AdNetworkDirectorySort[] }) {
  const [view, setView] = useState<View>({ q: "", sort: "most-sites", niche: "" });

  useEffect(() => {
    const read = () => {
      const search = new URLSearchParams(window.location.search);
      const sort = search.get("sort") as AdNetworkDirectorySort | null;
      const niche = search.get("niche") ?? "";
      setView({
        q: cleanQuery(search.get("q") ?? ""),
        sort: sort && sorts.includes(sort) ? sort : "most-sites",
        niche: niches.some((item) => item.slug === niche) ? niche : "",
      });
    };
    if (window.location.search) read();
    window.addEventListener("popstate", read);
    return () => window.removeEventListener("popstate", read);
  }, [niches, sorts]);

  const value = useMemo(() => ({
    view,
    set: (patch: Partial<View>) => {
      const next = { ...view, ...patch };
      const search = new URLSearchParams();
      if (cleanQuery(next.q)) search.set("q", cleanQuery(next.q));
      if (next.sort !== "most-sites") search.set("sort", next.sort);
      if (next.sort === "by-niche" && next.niche) search.set("niche", next.niche);
      const suffix = search.toString();
      window.history.replaceState(null, "", suffix ? `${window.location.pathname}?${suffix}` : window.location.pathname);
      setView(next);
    },
  }), [view]);

  return <ViewContext.Provider value={value}>{children}</ViewContext.Provider>;
}

function useView() {
  const context = useContext(ViewContext);
  if (!context) throw new Error("DirectoryView is missing");
  return context;
}

/**
 * The hero search (mockup `.hero-search`). Typing filters the network cards below. Submitting a
 * domain opens the checker, a niche name opens its page, and a single matching network opens its
 * page. `/` jumps to the box.
 */
export function HeroSearch({ examples, networks, niches, placeholder }: {
  examples: readonly { label: string; href: string }[];
  networks: readonly DirectoryNetwork[];
  /** Published niche pages only. */
  niches: readonly { slug: string; name: string }[];
  placeholder: string;
}) {
  const router = useRouter();
  const { view, set } = useView();
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const active = document.activeElement;
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return;
      if (active instanceof HTMLElement && (active.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(active.tagName))) return;
      event.preventDefault();
      input.current?.focus();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const text = cleanQuery(view.q);
    if (!text) return;
    const lower = text.toLowerCase();
    const named = networks.filter((network) => matches(network, lower));
    if (domainLike.test(text) && !named.length) {
      router.push(checkerHref(text.replace(/^https?:\/\//i, "").split(/[/?#]/)[0].replace(/^www\./i, "").toLowerCase()));
      return;
    }
    const niche = niches.find((item) => item.name.toLowerCase() === lower || item.slug === lower);
    if (niche) {
      router.push(`/ad-networks/niches/${niche.slug}`);
      return;
    }
    if (named.length === 1) router.push(`/ad-networks/${named[0].slug}`);
    else document.getElementById("all-networks")?.scrollIntoView({ block: "start" });
  };

  return (
    <div className={styles.heroSearch}>
      <form action="/ad-networks" onSubmit={submit} role="search">
        <label className={styles.searchBox}>
          <Search aria-hidden="true" size={18} />
          <span className={styles.visuallyHidden}>Search ad networks, sites{niches.length ? ", and niches" : ""}</span>
          <input
            autoComplete="off"
            name="q"
            onChange={(event) => set({ q: event.target.value })}
            placeholder={placeholder}
            ref={input}
            spellCheck={false}
            type="search"
            value={view.q}
          />
          <kbd aria-hidden="true">/</kbd>
        </label>
        <button className={styles.primaryButton} type="submit">Search</button>
      </form>
      {examples.length ? (
        <p className={styles.searchTry}>
          Try {examples.map((example) => <Link href={example.href} key={example.href} prefetch={false}>{example.label}</Link>)}
        </p>
      ) : null}
    </div>
  );
}

/**
 * "All ad networks": the sort controls, the sort note, and the cards. Every card is in the server
 * HTML in the Most sites order. Cards past the first twelve are `hidden="until-found"`, so search
 * engines and find-in-page still reach them, until "Show all" opens them.
 */
export function NetworkBrowser({ cards, easiest, easiestNote, networks, niches, sorts }: {
  /** One rendered card per network slug. */
  cards: Record<string, ReactNode>;
  /** Network slugs with a known traffic minimum, lowest first. */
  easiest: readonly string[];
  easiestNote: ReactNode;
  /** In Most sites order. */
  networks: readonly DirectoryNetwork[];
  niches: readonly DirectoryNiche[];
  sorts: readonly AdNetworkDirectorySort[];
}) {
  const { view, set } = useView();
  const [expanded, setExpanded] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const grid = useRef<HTMLDivElement>(null);
  const needle = cleanQuery(view.q).toLowerCase();
  const niche = view.sort === "by-niche" ? niches.find((item) => item.slug === view.niche) ?? niches[0] : undefined;

  const list = useMemo(() => {
    const ranked = (order: readonly string[]) => {
      const position = new Map(order.map((slug, index) => [slug, index]));
      // Networks missing from the order keep their Most sites order after the ranked ones.
      return [...networks].sort((a, b) => (position.get(a.slug) ?? Infinity) - (position.get(b.slug) ?? Infinity));
    };
    const ordered = view.sort === "easiest-to-join" ? ranked(easiest) : niche ? ranked(niche.order) : networks;
    return needle ? ordered.filter((network) => matches(network, needle)) : ordered;
  }, [easiest, needle, networks, niche, view.sort]);

  const collapsed = !expanded && !needle && list.length > visibleAtFirst;

  // Find-in-page on a hidden card opens the whole list.
  useEffect(() => {
    const root = grid.current;
    if (!root || !collapsed) return;
    const open = () => setExpanded(true);
    root.addEventListener("beforematch", open);
    return () => root.removeEventListener("beforematch", open);
  }, [collapsed]);

  // React can't render `hidden="until-found"`, so the server HTML hides the extra cards with CSS
  // and the browser swaps that for the attribute before the first paint.
  useLayoutEffect(() => setHydrated(true), []);
  useLayoutEffect(() => {
    if (!hydrated) return;
    grid.current?.querySelectorAll<HTMLElement>("[data-card]").forEach((card, index) => {
      if (collapsed && index >= visibleAtFirst) card.setAttribute("hidden", "until-found");
      else card.removeAttribute("hidden");
    });
  }, [collapsed, hydrated, list]);

  return (
    <section aria-labelledby="all-networks" className={styles.directory}>
      <SectionHead
        actions={sorts.length > 1 ? (
          <TableToolbar label="Sort ad networks">
            <ToolbarSelect
              label="Sort"
              onChange={(value) => set({ sort: value as AdNetworkDirectorySort, niche: value === "by-niche" ? niche?.slug ?? niches[0]?.slug ?? "" : "" })}
              options={sorts.map((sort) => ({ value: sort, label: sortLabels[sort] }))}
              value={view.sort}
            />
            {niche ? (
              <ToolbarSelect label="Niche" onChange={(value) => set({ niche: value })} options={niches.map((item) => ({ value: item.slug, label: item.name }))} value={niche.slug} />
            ) : null}
          </TableToolbar>
        ) : null}
        id="all-networks"
        title="All ad networks"
      />
      {view.sort === "easiest-to-join" ? <SortNote>{easiestNote}</SortNote> : null}
      {niche ? <SortNote>Sorted by how many <b>{niche.name}</b> sites use each network.</SortNote> : null}
      {list.length ? (
        <div className={styles.cards} data-collapsed={(collapsed && !hydrated) || undefined} ref={grid}>
          <NetworkGrid>
            {list.map((network) => <div className={styles.cell} data-card key={network.slug}>{cards[network.slug]}</div>)}
          </NetworkGrid>
        </div>
      ) : (
        <StatePanel action={<UiButton onPress={() => set({ q: "" })}>Show all networks</UiButton>} title="No networks match that search">
          <p>Try a shorter name, or press Search to check a site's domain.</p>
        </StatePanel>
      )}
      {collapsed ? (
        <div className={styles.more}>
          <button className={styles.secondaryButton} onClick={() => setExpanded(true)} type="button">Show all {list.length}</button>
        </div>
      ) : null}
    </section>
  );
}
