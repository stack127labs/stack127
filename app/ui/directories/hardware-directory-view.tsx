"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import type { ReactNode } from "react";
import { Pagination } from "@/app/ui/pagination";
import { StatePanel } from "@/app/ui/state-panel";
import { sidebarPanelClassName, sidebarPanelHeadingClassName } from "@/app/ui/site/sidebar-panel";
import { DirectoryAffiliateDisclosure } from "./directory-affiliate-disclosure";
import { DirectoryFilterController } from "./directory-filter-controller";
import { DirectoryTagSelectGroup as TagSelectGroup, type DirectoryFilterOption as FilterOption } from "./directory-filters";
import { useDirectoryIndex, type DirectoryIndexSource } from "./directory-index";
import { removeParamHref } from "./directory-params";
import { hasDirectoryParams, useDirectoryQuery } from "./directory-query";
import { SortDropdown } from "./directory-sort-dropdown";
import { HardwareDirectoryBrowser } from "./hardware-directory-browser";
import {
  filterHardwareRecords,
  getDirectoryPage,
  getDirectorySort,
  getDirectoryString,
  getDirectoryValues,
  hardwareDirectoryPageHref,
  hardwarePageSize,
  sortHardwareRecords,
  type HardwareIndexRecord,
} from "./hardware-directory-filters";
import styles from "./hardware-directory-page.module.css";

const paramKeys = ["q", "sort", "category", "vendor", "feature", "page"] as const;

const sortOptions = [
  { label: "Device name", value: "name" },
  { label: "Vendor", value: "vendor" },
];

export function HardwareDirectoryFilters({ categoryOptions, detailFilterLabel, featureOptions, heading, route, searchPlaceholder, vendorOptions }: {
  categoryOptions: FilterOption[];
  detailFilterLabel: string;
  featureOptions: FilterOption[];
  heading: ReactNode;
  route: string;
  searchPlaceholder: string;
  vendorOptions: FilterOption[];
}) {
  const { formKey, params } = useDirectoryQuery();
  return (
    <form action={route} className={sidebarPanelClassName} data-default-sort="name" data-live-filter-form key={formKey}>
      <div className={sidebarPanelHeadingClassName}>{heading}</div>
      <label className="directory-search">
        <span>Search</span>
        <span className="directory-search-field"><Search aria-hidden="true" size={16} /><input defaultValue={getDirectoryString(params, "q")} name="q" placeholder={searchPlaceholder} type="search" /></span>
      </label>
      <SortDropdown name="sort" options={sortOptions} value={getDirectorySort(params)} />
      <TagSelectGroup name="category" options={categoryOptions} selected={getDirectoryValues(params, "category")} title="Category" />
      <TagSelectGroup name="vendor" options={vendorOptions} selected={getDirectoryValues(params, "vendor")} title="Vendor" />
      <TagSelectGroup name="feature" options={featureOptions} selected={getDirectoryValues(params, "feature")} title={detailFilterLabel} />
      <div className="filter-actions"><Link href={route}>reset</Link></div>
      <DirectoryFilterController />
    </form>
  );
}

// The static page shows the first page in the default sort. Any filter, sort, or
// ?page= in the URL switches to the full index, filtered in the browser.
export function HardwareDirectoryResults({ detailFilterLabel, firstPage, index, route, snapshotDate, title, total }: {
  detailFilterLabel: string;
  firstPage: HardwareIndexRecord[];
  index: DirectoryIndexSource<HardwareIndexRecord>;
  route: string;
  snapshotDate: string;
  title: string;
  total: number;
}) {
  const { params } = useDirectoryQuery();
  const filtering = hasDirectoryParams(params, paramKeys);
  const { failed, records } = useDirectoryIndex(index, filtering);

  const chips: Array<{ key: string; label: string; href: string }> = [];
  const query = getDirectoryString(params, "q").trim();
  if (query) chips.push({ href: removeParamHref(route, params, "q"), key: "q", label: `Search: ${query}` });
  for (const [key, label] of [["category", "Category"], ["vendor", "Vendor"], ["feature", detailFilterLabel]] as const) {
    for (const value of getDirectoryValues(params, key)) chips.push({ href: removeParamHref(route, params, key, value), key, label: `${label}: ${value}` });
  }
  const chipRow = chips.length > 0
    ? <div aria-label="Active filters" className="active-filter-row">{chips.map((chip) => <Link href={chip.href} key={`${chip.key}-${chip.label}`}>{chip.label}<span>×</span></Link>)}<Link className="clear-filters" href={route}>clear all</Link></div>
    : null;

  if (filtering && !records) {
    return <>
      {chipRow}
      {failed
        ? <StatePanel action={<Link href={route}>show all devices</Link>} state="error" title="Filters could not be loaded"><p>Reload the page to try again.</p></StatePanel>
        : <StatePanel state="loading" title="Loading devices" />}
    </>;
  }

  const filtered = filtering && records ? sortHardwareRecords(filterHardwareRecords(records, params), getDirectorySort(params)) : null;
  const count = filtered ? filtered.length : total;
  const totalPages = Math.max(1, Math.ceil(count / hardwarePageSize));
  const currentPage = Math.min(getDirectoryPage(params), totalPages);
  const pageRecords = filtered ? filtered.slice((currentPage - 1) * hardwarePageSize, currentPage * hardwarePageSize) : firstPage;

  return <>
    {chipRow}
    <header className={styles.resultHeader}><p className={styles.resultCount}>{count.toLocaleString("en-US")} matching devices</p><p className={styles.snapshotNote}>Updated {snapshotDate}</p></header>
    {pageRecords.length > 0 ? (
      <>
        <HardwareDirectoryBrowser directory={route.slice(1)} records={pageRecords} />
        {pageRecords.some((record) => record.amazon) ? <DirectoryAffiliateDisclosure /> : null}
        {totalPages > 1 ? <Pagination ariaLabel={`${title} pages`} currentPage={currentPage} hrefForPage={(page) => hardwareDirectoryPageHref(route, params, page)} totalPages={totalPages} /> : null}
      </>
    ) : <StatePanel action={<Link href={route}>show all devices</Link>} title="No exact models match those filters"><p>Try the retail model without punctuation, or clear one filter.</p></StatePanel>}
  </>;
}
