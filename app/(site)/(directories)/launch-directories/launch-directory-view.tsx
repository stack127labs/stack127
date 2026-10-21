"use client";

import { LayoutGrid, List, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, type ReactNode } from "react";
import { DirectoryFilterController } from "@/app/ui/directories/directory-filter-controller";
import {
  DirectoryCheckboxGroup,
  DirectoryRadioGroup,
  DirectoryTagSelectGroup,
  type DirectoryFilterOption,
} from "@/app/ui/directories/directory-filters";
import { pageParamHref, paramString, paramValues, removeParamHref, type DirectoryParams } from "@/app/ui/directories/directory-params";
import { useDirectoryQuery } from "@/app/ui/directories/directory-query";
import { SortDropdown } from "@/app/ui/directories/directory-sort-dropdown";
import { Pagination } from "@/app/ui/pagination";
import { sidebarPanelClassName, sidebarPanelHeadingClassName } from "@/app/ui/site/sidebar-panel";
import { StatePanel } from "@/app/ui/state-panel";
import type { LaunchDirectory } from "@/lib/launch-directories";
import { queryLaunchDirectories } from "@/lib/launch-directories-query";
import { LaunchCard, LaunchGrid, launchHref, type LaunchCategory } from "./launch-card";
import { costShort, isSubmitReady, linkShort, submitStatusText, waitShort } from "./launch-format";
import { LaunchLogo } from "./launch-logo";
import { AhrefsCredit } from "./ahrefs-credit";
import { backlinkOptions, costOptions, drOptions, linkOptions, quickPicks, sortOptions, submissionOptions } from "./launch-directory-options";
import styles from "./launch-directories.module.css";

const route = "/launch-directories";
const formId = "launch-directory-filters";
const sortValues = new Set<string>(sortOptions.map((option) => option.value));
const drValues = new Set(drOptions.map((option) => option.value).filter(Boolean));

/** The quick pick whose filters are exactly the ones in the URL, ignoring sort, view, and page. */
function activePick(params: DirectoryParams) {
  const own = Object.entries(params).flatMap(([key, value]) => ["sort", "view", "page"].includes(key) ? []
    : (Array.isArray(value) ? value : value ? [value] : []).map((item) => `${key}=${item}`)).sort().join("&");
  return quickPicks.find((pick) => pick.params.map(([key, value]) => `${key}=${value}`).sort().join("&") === own)?.value ?? null;
}

function pickHref(params: DirectoryParams, pick: (typeof quickPicks)[number]) {
  const next = new URLSearchParams(pick.params.map(([key, value]) => [key, value]));
  for (const key of ["sort", "view"]) {
    const value = paramString(params, key);
    if (value) next.set(key, value);
  }
  return `${route}?${next}`;
}

function hrefWith(params: DirectoryParams, key: string, value: string | null) {
  const next = new URLSearchParams();
  for (const [paramKey, paramValue] of Object.entries(params)) {
    if (paramKey === key || paramKey === "page") continue;
    for (const current of Array.isArray(paramValue) ? paramValue : paramValue ? [paramValue] : []) next.append(paramKey, current);
  }
  if (value) next.set(key, value);
  const query = next.toString();
  return query ? `${route}?${query}` : route;
}

export function LaunchDirectoryFilters({ categoryOptions, costOptions, drAvailable, heading, linkOptions, pickCounts }: {
  categoryOptions: DirectoryFilterOption[];
  costOptions: DirectoryFilterOption[];
  /** False until DR data is loaded; the DR filter stays hidden. */
  drAvailable: boolean;
  heading: ReactNode;
  linkOptions: DirectoryFilterOption[];
  pickCounts: Record<string, number>;
}) {
  const { formKey, params } = useDirectoryQuery();
  const current = activePick(params);
  const view = paramString(params, "view");
  return <form action={route} className={sidebarPanelClassName} data-default-sort="recommended" data-live-filter-form id={formId} key={formKey}>
    <div className={sidebarPanelHeadingClassName}>{heading}</div>
    <nav aria-label="Quick picks" className={styles.picks}>
      <p className={styles.sideLabel}>Quick picks</p>
      <ul>
        {quickPicks.map((pick) => <li key={pick.value}>
          <Link aria-current={current === pick.value ? "true" : undefined} href={current === pick.value ? route : pickHref(params, pick)} prefetch={false}>
            <span aria-hidden="true" className={styles.pickDot} />
            <span>{pick.label}</span>
            <span className={styles.pickCount}>{pickCounts[pick.value] ?? 0}</span>
          </Link>
        </li>)}
      </ul>
    </nav>
    <label className="directory-search">
      <span>Search</span>
      <span className="directory-search-field">
        <Search aria-hidden="true" size={16} strokeWidth={2.2} />
        <input defaultValue={paramString(params, "q")} name="q" placeholder="Product Hunt, betalist.com..." type="search" />
      </span>
    </label>
    <DirectoryTagSelectGroup name="category" options={categoryOptions} selected={paramValues(params, "category")} title="Category" />
    <DirectoryCheckboxGroup name="cost" options={costOptions} selected={paramValues(params, "cost")} title="Cost" />
    <DirectoryCheckboxGroup name="link" options={linkOptions} selected={paramValues(params, "link")} title="Link type" />
    {drAvailable ? <DirectoryRadioGroup name="dr" options={drOptions} selected={paramString(params, "dr")} title="Domain rating" /> : null}
    <DirectoryRadioGroup name="submission" options={submissionOptions} selected={paramString(params, "submission")} title="Submit page" />
    <DirectoryRadioGroup name="backlink" options={backlinkOptions} selected={paramString(params, "backlink")} title="Free-plan backlink" />
    {view === "table" ? <input name="view" type="hidden" value="table" /> : null}
    <div className="filter-actions"><Link href={view === "table" ? `${route}?view=table` : route}>clear filters</Link></div>
    <DirectoryFilterController />
  </form>;
}

function ActiveFilters({ categoryMap, params }: { categoryMap: Record<string, LaunchCategory>; params: DirectoryParams }) {
  const groups: Array<{ key: string; title: string; labels: Map<string, string> }> = [
    { key: "category", title: "Category", labels: new Map(Object.values(categoryMap).map((category) => [category.value, category.label])) },
    { key: "cost", title: "Cost", labels: new Map(costOptions.map((option) => [option.value, option.label])) },
    { key: "link", title: "Link", labels: new Map(linkOptions.map((option) => [option.value, option.label])) },
    { key: "dr", title: "DR", labels: new Map(drOptions.map((option) => [option.value, option.label])) },
    { key: "submission", title: "Submit page", labels: new Map(submissionOptions.map((option) => [option.value, option.label])) },
    { key: "backlink", title: "Backlink", labels: new Map(backlinkOptions.map((option) => [option.value, option.label])) },
  ];
  const chips: Array<{ href: string; label: string }> = [];
  const query = paramString(params, "q").trim();
  if (query) chips.push({ href: removeParamHref(route, params, "q"), label: `Search: ${query}` });
  for (const group of groups) {
    for (const value of paramValues(params, group.key)) {
      const label = group.labels.get(value);
      if (label && value) chips.push({ href: removeParamHref(route, params, group.key, value), label: `${group.title}: ${label}` });
    }
  }
  if (chips.length === 0) return null;
  const view = paramString(params, "view");

  return <div aria-label="Active filters" className="active-filter-row" role="group">
    {chips.map((chip) => <Link aria-label={`Remove ${chip.label}`} href={chip.href} key={chip.label} prefetch={false}>
      {chip.label}
      <span aria-hidden="true">×</span>
    </Link>)}
    <Link className="clear-filters" href={view === "table" ? `${route}?view=table` : route} prefetch={false}>clear all</Link>
  </div>;
}

/** Sort and the cards or table switch. Sort writes into the sidebar form through its `form` id. */
function Toolbar({ count, credit, params, sort }: { count: ReactNode; credit: boolean; params: DirectoryParams; sort: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const view = paramString(params, "view") === "table" ? "table" : "cards";

  // The filter controller closes its own selects; this one sits outside the form.
  useEffect(() => {
    const root = () => ref.current?.querySelector<HTMLElement>("[data-custom-select]");
    const close = (focusTrigger: boolean) => {
      const select = root();
      const trigger = select?.querySelector<HTMLButtonElement>("[data-custom-select-trigger]");
      const menu = select?.querySelector<HTMLElement>("[data-custom-select-menu]");
      if (!trigger || !menu || menu.hidden) return;
      trigger.setAttribute("aria-expanded", "false");
      menu.hidden = true;
      if (focusTrigger) trigger.focus();
    };
    const onClick = (event: MouseEvent) => {
      if (event.target instanceof Node && root()?.contains(event.target)) return;
      close(false);
    };
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") close(true); };
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return <div className={styles.toolbar} ref={ref}>
    <div className={styles.countLine}>
      <p aria-atomic="true" aria-live="polite" className={styles.count}>{count}</p>
      {credit ? <AhrefsCredit prefix="DR is" /> : null}
    </div>
    <div className={styles.toolbarControls}>
      <SortDropdown form={formId} name="sort" options={sortOptions} value={sort} />
      <div aria-label="View" className={styles.viewToggle} role="group">
        <Link aria-current={view === "cards" ? "true" : undefined} href={hrefWith(params, "view", null)} prefetch={false}>
          <LayoutGrid aria-hidden="true" size={15} strokeWidth={2.2} />Cards
        </Link>
        <Link aria-current={view === "table" ? "true" : undefined} href={hrefWith(params, "view", "table")} prefetch={false}>
          <List aria-hidden="true" size={15} strokeWidth={2.2} />Table
        </Link>
      </div>
    </div>
  </div>;
}

function Cell({ value }: { value: string | null }) {
  return value ? <>{value}</> : <span className={styles.unknown}>Not stated</span>;
}

function ResultsTable({ categoryMap, directories, paged }: { categoryMap: Record<string, LaunchCategory>; directories: LaunchDirectory[]; paged: Set<string> }) {
  return <div className={styles.tableFrame}>
    <table className={styles.table}>
      <thead><tr><th scope="col">Place</th><th scope="col">Category</th><th scope="col">Cost</th><th scope="col">Link</th><th scope="col">Review</th><th scope="col"><AhrefsCredit /></th><th scope="col"><span className={styles.srOnly}>Submit</span></th></tr></thead>
      <tbody>
        {directories.map((directory) => <tr key={directory.slug}>
          <th scope="row">{paged.has(directory.slug)
            ? <Link href={launchHref(directory.slug)} prefetch={false}><LaunchLogo iconUrl={directory.icon_url} name={directory.name} size="row" />{directory.name}</Link>
            : <span className={styles.tableName}><LaunchLogo iconUrl={directory.icon_url} name={directory.name} size="row" />{directory.name}</span>}</th>
          <td>{categoryMap[directory.categories[0] ?? ""]?.label ?? ""}</td>
          <td className={styles.mono}><Cell value={costShort(directory)} /></td>
          <td className={styles.mono}><Cell value={linkShort(directory)} /></td>
          <td className={styles.mono}><Cell value={waitShort(directory)} /></td>
          <td className={styles.mono}>{directory.domain_rating ?? "—"}</td>
          <td className={styles.mono}>{isSubmitReady(directory)
            ? <a className={styles.cardSubmit} href={directory.submit_url ?? undefined} rel="noopener noreferrer" target="_blank">Submit<span className={styles.srOnly}> to {directory.name}</span></a>
            : <span className={styles.unknown}>{submitStatusText(directory)}</span>}</td>
        </tr>)}
      </tbody>
    </table>
  </div>;
}

function countText(start: number, end: number, total: number, filtered: boolean) {
  const noun = total === 1 ? "place" : "places";
  const matching = filtered ? `matching ${noun}` : noun;
  if (total === 0) return <>No {filtered ? "matching " : ""}places</>;
  if (start === 1 && end === total) return <><b>{total}</b> {matching}</>;
  return <>Showing <b>{start}</b> to <b>{end}</b> of <b>{total}</b> {matching}</>;
}

// All places (under 200) ship with the static page. The URL's filters, sort, view, and page apply in the browser.
export function LaunchDirectoryResults({ categories, directories, pagedSlugs }: {
  categories: LaunchCategory[];
  directories: LaunchDirectory[];
  /** Places with a published page of their own. Others show no page link. */
  pagedSlugs: string[];
}) {
  const { formKey, params } = useDirectoryQuery();
  const paged = new Set(pagedSlugs);
  const categoryMap = Object.fromEntries(categories.map((category) => [category.value, category]));
  const categoryLabels = Object.fromEntries(categories.map((category) => [category.value, category.label]));
  const sortParam = paramString(params, "sort");
  const sort = sortValues.has(sortParam) ? sortParam : "recommended";
  const drParam = paramString(params, "dr");
  const result = queryLaunchDirectories(directories, {
    q: paramString(params, "q"),
    categories: paramValues(params, "category"),
    costs: paramValues(params, "cost"),
    links: paramValues(params, "link"),
    submission: paramString(params, "submission"),
    backlink: paramString(params, "backlink"),
    minDr: drValues.has(drParam) ? Number(drParam) : undefined,
    sort,
    page: paramString(params, "page") || 1,
  }, categoryLabels);
  const filtered = result.total !== directories.length;
  const view = paramString(params, "view") === "table" ? "table" : "cards";
  const clearHref = view === "table" ? `${route}?view=table` : route;

  return <div className={styles.results} id="places">
    <Toolbar count={countText(result.start, result.end, result.total, filtered)} credit={result.items.some((directory) => directory.domain_rating !== null)} key={formKey} params={params} sort={sort} />
    <ActiveFilters categoryMap={categoryMap} params={params} />
    {result.items.length > 0 ? <>
      {view === "table"
        ? <ResultsTable categoryMap={categoryMap} directories={result.items} paged={paged} />
        : <LaunchGrid>
          {result.items.map((directory, index) => <LaunchCard
            category={categoryMap[directory.categories[0] ?? ""]}
            directory={directory}
            eager={result.currentPage === 1 && index < 3}
            key={directory.slug}
            linked={paged.has(directory.slug)}
          />)}
        </LaunchGrid>}
      <Pagination
        ariaLabel="Launch directory pages"
        currentPage={result.currentPage}
        hrefForPage={(page) => pageParamHref(route, params, page)}
        totalPages={result.totalPages}
      />
    </> : <StatePanel title="No places match those filters" action={<Link href={clearHref} prefetch={false}>show all places</Link>}>
      <p>Try removing one filter or searching for a shorter name.</p>
    </StatePanel>}
  </div>;
}
