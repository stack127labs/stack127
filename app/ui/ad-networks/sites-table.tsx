"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { adNetworkNiches, type AdNetworkNicheSlug } from "@/lib/ad-network-niches";
import type { AdNetworkRef, AdNetworkSiteRow, AdNetworkSitesResponse, AdNetworkSitesSort } from "@/lib/ad-networks-types";
import { UiButton } from "@/app/ui/controls";
import { Pagination } from "@/app/ui/pagination";
import { StatePanel } from "@/app/ui/state-panel";
import { TableToolbar, ToolbarSearch, ToolbarSelect } from "@/app/ui/table-toolbar";
import { NOT_LISTED, checkerHref, domainAge, formatCount, formatDay, managerName, nicheName } from "./site-format";
import { TrafficMeter } from "./traffic-meter";
import styles from "./sites-table.module.css";

export type SitesTableColumn = "niche" | "networks" | "traffic" | "age" | "platform" | "manager" | "checked";

export type SitesTableProps = {
  /** The page path. Filters, sort, and page live in its query, such as `?q=&niche=&page=2`. */
  route: string;
  heading: ReactNode;
  headingId: string;
  /** The first page with the default view, rendered on the server. */
  initial: AdNetworkSitesResponse;
  /** The sort `initial` was loaded with. */
  defaultSort: AdNetworkSitesSort;
  /** Fixed filters for the whole page, such as this network or this niche. */
  scope: { network?: string; niche?: AdNetworkNicheSlug };
  columns: readonly SitesTableColumn[];
  /** Show the niche filter. Leave it off until sites have niches. */
  nicheFilter?: boolean;
  /** Show a network filter with these networks. */
  networkFilter?: readonly AdNetworkRef[];
  /** Words for the count line, such as `food sites`. */
  noun?: string;
  /**
   * Sort options, in order. Leave out sorts whose data isn't collected yet. The select hides when
   * one option is left. Defaults to the mockup's Traffic, Oldest domain, and Newest domain, plus
   * `defaultSort` when it isn't one of them.
   */
  sorts?: readonly AdNetworkSitesSort[];
};

type View = { q: string; niche: string; network: string; sort: AdNetworkSitesSort; page: number };

const sortOptions: { value: AdNetworkSitesSort; label: string }[] = [
  { value: "domain", label: "A to Z" },
  { value: "traffic", label: "Traffic" },
  { value: "oldest", label: "Oldest domain" },
  { value: "newest", label: "Newest domain" },
  { value: "checked", label: "Last checked" },
];
const allSorts = new Set<string>(sortOptions.map((option) => option.value));
const mockupSorts: readonly AdNetworkSitesSort[] = ["traffic", "oldest", "newest"];
const apiColumn: Record<SitesTableColumn, AdNetworkSitesResponse["availableColumns"][number]> = {
  niche: "niche",
  networks: "network",
  traffic: "traffic",
  age: "domain_age",
  platform: "platform",
  manager: "manager",
  checked: "checked",
};
const columnLabels: Record<SitesTableColumn, string> = {
  niche: "niche",
  networks: "network",
  traffic: "traffic",
  age: "domain age",
  platform: "platform",
  manager: "ads managed by",
  checked: "checked",
};

function readView(defaultSort: AdNetworkSitesSort, props: Pick<SitesTableProps, "nicheFilter" | "networkFilter">): View {
  const search = new URLSearchParams(window.location.search);
  const sort = search.get("sort") ?? "";
  const page = Number(search.get("page"));
  const niche = search.get("niche") ?? "";
  const network = search.get("network") ?? "";
  return {
    q: (search.get("q") ?? "").slice(0, 100),
    niche: props.nicheFilter && adNetworkNiches.some((item) => item.slug === niche) ? niche : "",
    network: props.networkFilter?.some((item) => item.slug === network) ? network : "",
    sort: allSorts.has(sort) ? sort as AdNetworkSitesSort : defaultSort,
    page: Number.isInteger(page) && page > 1 && page <= 10000 ? page : 1,
  };
}

function viewHref(route: string, view: View, defaultSort: AdNetworkSitesSort, page = view.page) {
  const params = new URLSearchParams();
  if (view.q.trim()) params.set("q", view.q.trim());
  if (view.niche) params.set("niche", view.niche);
  if (view.network) params.set("network", view.network);
  if (view.sort !== defaultSort) params.set("sort", view.sort);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `${route}?${query}` : route;
}

const isDefault = (view: View, defaultSort: AdNetworkSitesSort) =>
  !view.q.trim() && !view.niche && !view.network && view.sort === defaultSort && view.page === 1;

function TrafficCell({ group }: { group: string | null }) {
  return group ? <TrafficMeter group={group} /> : <span className={styles.none}>{NOT_LISTED}</span>;
}

function AgeCell({ row }: { row: AdNetworkSiteRow }) {
  const age = domainAge(row);
  if (!age) return <span className={styles.none}>{NOT_LISTED}</span>;
  return age.years === null
    ? <>{age.year}</>
    : <>{age.years} {age.years === 1 ? "yr" : "yrs"} <span className={styles.muted}>· {age.year}</span></>;
}

function Cell({ column, row }: { column: SitesTableColumn; row: AdNetworkSiteRow }) {
  switch (column) {
    case "niche": {
      const name = nicheName(row.niche);
      return <td className={styles.muted} data-column={column}>{name ?? <span className={styles.none}>{NOT_LISTED}</span>}</td>;
    }
    case "networks":
      return (
        <td className={styles.networks} data-column={column}>
          {row.networks.length
            ? row.networks.map((network, index) => <span key={network.slug}>{index ? ", " : ""}<Link href={`/ad-networks/${network.slug}`} prefetch={false}>{network.name}</Link></span>)
            : <span className={styles.none}>{NOT_LISTED}</span>}
        </td>
      );
    case "traffic":
      return <td className={styles.mono} data-column={column}><TrafficCell group={row.traffic_group} /></td>;
    case "age":
      return <td className={`${styles.mono} ${styles.right}`} data-column={column}><AgeCell row={row} /></td>;
    case "platform":
      return <td data-column={column}>{row.platform ?? <span className={styles.none}>{NOT_LISTED}</span>}</td>;
    case "manager": {
      const name = managerName(row);
      return <td className={styles.muted} data-column={column} data-none={name ? undefined : true}>{name ?? NOT_LISTED}</td>;
    }
    case "checked":
      return <td className={`${styles.mono} ${styles.muted} ${styles.right}`} data-column={column}>{formatDay(row.last_checked_at) ?? "—"}</td>;
  }
}

/**
 * A long list of sites. The server renders the first page in the default view; search, filters,
 * sort, and pages load from the cached sites API and keep their state in the URL. On phones each
 * row becomes a two-line block, so the table never scrolls sideways.
 */
export function SitesTable(props: SitesTableProps) {
  const { columns, defaultSort, heading, headingId, initial, networkFilter, nicheFilter, noun = "sites", route, scope, sorts = mockupSorts } = props;
  const [view, setView] = useState<View>({ q: "", niche: "", network: "", sort: defaultSort, page: 1 });
  const [data, setData] = useState<AdNetworkSitesResponse>(initial);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [attempt, setAttempt] = useState(0);
  const section = useRef<HTMLElement>(null);

  // The current response says which sorts, filters, and columns have data. Anything without data
  // stays hidden, except an active filter, which stays so it can be cleared.
  const availableSorts = data.availableSorts ?? sorts;
  const shownSorts = [...(sorts.includes(defaultSort) ? [] : [defaultSort]), ...sorts]
    .filter((value) => value === defaultSort || availableSorts.includes(value))
    .flatMap((value) => sortOptions.filter((option) => option.value === value));
  // Show the sort the API used. A shared link's unavailable sort falls back to the default there.
  const shownSort = status === "loading" ? view.sort : data.effectiveSort ?? view.sort;
  const withActive = (options: { value: string; label: string }[], active: string, label: string) =>
    active && !options.some((option) => option.value === active) ? [...options, { value: active, label }] : options;
  const nicheOptions = withActive(
    (data.filters?.niches ?? []).map((niche) => ({ value: niche.slug, label: niche.name })),
    view.niche,
    nicheName(view.niche || null) ?? view.niche,
  );
  const networkChoices = data.filters?.networks?.length ? data.filters.networks : networkFilter ?? [];
  const networkOptions = withActive(
    networkChoices.map((network) => ({ value: network.slug, label: network.name })),
    view.network,
    networkFilter?.find((network) => network.slug === view.network)?.name ?? view.network,
  );
  const showNicheFilter = Boolean(nicheFilter) && ((data.availableFilters?.includes("niche") && nicheOptions.length > 0) || Boolean(view.niche));
  const showNetworkFilter = Boolean(networkFilter) && ((data.availableFilters?.includes("network") && networkOptions.length > 0) || Boolean(view.network));
  const filterRef = useRef({ nicheFilter, networkFilter });

  // Read a shared link after hydration, and follow the back button.
  useEffect(() => {
    const sync = () => setView(readView(defaultSort, filterRef.current));
    if (window.location.search) sync();
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, [defaultSort]);

  const scopeNetwork = scope.network;
  const scopeNiche = scope.niche;
  useEffect(() => {
    if (isDefault(view, defaultSort)) {
      setData(initial);
      setStatus("idle");
      return;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setStatus("loading");
      const params = new URLSearchParams();
      const network = scopeNetwork ?? view.network;
      const niche = scopeNiche ?? view.niche;
      if (network) params.set("network", network);
      if (niche) params.set("niche", niche);
      if (view.q.trim()) params.set("q", view.q.trim());
      params.set("sort", view.sort);
      params.set("page", String(view.page));
      params.set("pageSize", String(initial.pageSize));
      try {
        const response = await fetch(`/api/ad-networks/sites?${params}`, { signal: controller.signal });
        if (!response.ok) throw new Error(`Sites request failed: ${response.status}`);
        setData(await response.json() as AdNetworkSitesResponse);
        setStatus("idle");
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error(error);
          setStatus("error");
        }
      }
    }, view.q ? 250 : 0);
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [attempt, defaultSort, initial, scopeNetwork, scopeNiche, view]);

  const update = useCallback((patch: Partial<View>, push = false) => {
    const next = { ...view, page: 1, ...patch };
    const href = viewHref(route, next, defaultSort);
    if (push) window.history.pushState(null, "", href);
    else window.history.replaceState(null, "", href);
    setView(next);
  }, [defaultSort, route, view]);

  // Page links change the view in place instead of loading the static page again.
  const onPagerClick = (event: MouseEvent<HTMLDivElement>) => {
    const link = (event.target as Element).closest("a[href]");
    if (!(link instanceof HTMLAnchorElement) || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const page = Number(new URL(link.href).searchParams.get("page") ?? "1");
    update({ page: Number.isInteger(page) && page > 0 ? page : 1 }, true);
    section.current?.scrollIntoView({ block: "start" });
  };

  // A column with no data yet is left out, instead of a column of "Not listed". The API's
  // availableColumns decides when present; otherwise the rows on this page do.
  const hasValue: Partial<Record<SitesTableColumn, (row: AdNetworkSiteRow) => unknown>> = {
    niche: (row) => row.niche,
    traffic: (row) => row.traffic_group,
    age: (row) => row.domain_created_on,
    platform: (row) => row.platform,
  };
  const available = data.availableColumns;
  const shown = columns.filter((column) => available
    ? available.includes(apiColumn[column])
    : !hasValue[column] || data.rows.some((row) => hasValue[column]!(row)));

  const reset = () => update({ q: "", niche: "", network: "", sort: defaultSort });
  const filtered = Boolean(view.q.trim() || view.niche || view.network);
  const first = data.total ? (data.page - 1) * data.pageSize + 1 : 0;
  const last = Math.min(data.total, data.page * data.pageSize);

  let body: ReactNode;
  if (status === "error") {
    body = (
      <StatePanel action={<UiButton onPress={() => setAttempt((count) => count + 1)}>Try again</UiButton>} state="error" title="Sites could not be loaded">
        <p>Check your connection and try again.</p>
      </StatePanel>
    );
  } else if (!data.rows.length) {
    body = filtered
      ? <StatePanel action={<UiButton onPress={reset}>Show all sites</UiButton>} title="No sites match"><p>Try another part of the domain, or clear the filters.</p></StatePanel>
      : <StatePanel title="No sites listed yet"><p>Sites show up here once we confirm them from their own ads.txt files or ad code.</p></StatePanel>;
  } else {
    body = (
      <>
        <div className={styles.frame}>
          <table aria-busy={status === "loading"} aria-labelledby={headingId} className={styles.table} data-loading={status === "loading" || undefined}>
            <thead>
              <tr>
                <th scope="col">site</th>
                {shown.map((column) => <th className={column === "age" || column === "checked" ? styles.right : undefined} key={column} scope="col">{columnLabels[column]}</th>)}
              </tr>
            </thead>
            <tbody>
              {data.rows.map((row) => (
                <tr key={row.domain}>
                  <th className={styles.site} scope="row">
                    <Link className={styles.domain} href={checkerHref(row.domain)} prefetch={false}>{row.domain}</Link>
                    {row.publisher_name ? <span className={styles.publisher}>{row.publisher_name}</span> : null}
                  </th>
                  {shown.map((column) => <Cell column={column} key={column} row={row} />)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className={styles.foot}>
          <span aria-live="polite">{formatCount(first)}-{formatCount(last)} of {formatCount(data.total)} {noun}</span>
          <div className={styles.pager} onClickCapture={onPagerClick}>
            <Pagination
              ariaLabel={`Pages of ${noun}`}
              currentPage={data.page}
              hrefForPage={(page) => viewHref(route, view, defaultSort, page)}
              totalPages={data.totalPages}
              variant="words"
            />
          </div>
        </div>
      </>
    );
  }

  return (
    <section aria-labelledby={headingId} className={styles.section} ref={section}>
      <div className={styles.head}>
        <h2 id={headingId}>{heading}</h2>
        {initial.total ? <TableToolbar label="Search and sort sites">
          <ToolbarSearch label="Search sites" onChange={(q) => update({ q: q.slice(0, 100) })} placeholder="Search sites" value={view.q} />
          {showNicheFilter ? (
            <ToolbarSelect
              label="Niche"
              onChange={(niche) => update({ niche })}
              options={[{ value: "", label: "All" }, ...nicheOptions]}
              value={view.niche}
            />
          ) : null}
          {showNetworkFilter ? (
            <ToolbarSelect
              label="Network"
              onChange={(network) => update({ network })}
              options={[{ value: "", label: "All" }, ...networkOptions]}
              value={view.network}
            />
          ) : null}
          {shownSorts.length > 1 ? <ToolbarSelect label="Sort" onChange={(sort) => update({ sort: sort as AdNetworkSitesSort })} options={shownSorts} value={shownSort} /> : null}
        </TableToolbar> : null}
      </div>
      {body}
    </section>
  );
}
