"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import type { ReactNode } from "react";
import { Pagination } from "@/app/ui/pagination";
import { StatePanel } from "@/app/ui/state-panel";
import { sidebarPanelClassName, sidebarPanelHeadingClassName } from "@/app/ui/site/sidebar-panel";
import { DirectoryAffiliateDisclosure } from "@/app/ui/directories/directory-affiliate-disclosure";
import { DirectoryFilterController } from "@/app/ui/directories/directory-filter-controller";
import {
  DirectoryRadioGroup as RadioGroup,
  DirectoryTagSelectGroup as TagSelectGroup,
  type DirectoryFilterOption as FilterOption,
} from "@/app/ui/directories/directory-filters";
import { useDirectoryIndex, type DirectoryIndexSource } from "@/app/ui/directories/directory-index";
import { removeParamHref } from "@/app/ui/directories/directory-params";
import { hasDirectoryParams, useDirectoryQuery } from "@/app/ui/directories/directory-query";
import { SortDropdown } from "@/app/ui/directories/directory-sort-dropdown";
import type { ZigbeeDevice } from "@/lib/zigbee-devices";
import { filterDevices, getPage, getSort, getString, getValues, pageHref, sortDevices, zigbeePageSize, type ZigbeeIndexRecord } from "./filters";
import { ZigbeeDeviceBrowser } from "./zigbee-device-browser";
import styles from "./zigbee-devices.module.css";

const route = "/zigbee-devices";

const paramKeys = ["q", "sort", "category", "vendor", "capability", "ota", "battery", "page"] as const;

const sortOptions = [
  { label: "Device name", value: "name" },
  { label: "Vendor", value: "vendor" },
  { label: "Most features", value: "capabilities" },
  { label: "Recently added to a support list", value: "newest" },
];

const yesOptions: FilterOption[] = [
  { label: "Any", value: "" },
  { label: "Yes", value: "yes" },
];

export function ZigbeeDeviceFilters({ capabilityOptions, categoryOptions, heading, vendorOptions }: {
  capabilityOptions: FilterOption[];
  categoryOptions: FilterOption[];
  heading: ReactNode;
  vendorOptions: FilterOption[];
}) {
  const { formKey, params } = useDirectoryQuery();
  return (
    <form action={route} className={sidebarPanelClassName} data-default-sort="name" data-live-filter-form key={formKey}>
      <div className={sidebarPanelHeadingClassName}>{heading}</div>

      <label className="directory-search">
        <span>Search</span>
        <span className="directory-search-field">
          <Search aria-hidden="true" size={16} />
          <input defaultValue={getString(params, "q")} name="q" placeholder="SNZB-02P, Aqara, temperature..." type="search" />
        </span>
      </label>

      <SortDropdown name="sort" options={sortOptions} value={getSort(params)} />
      <TagSelectGroup name="category" options={categoryOptions} selected={getValues(params, "category")} title="Category" />
      <TagSelectGroup name="vendor" options={vendorOptions} selected={getValues(params, "vendor")} title="Vendor" />
      <TagSelectGroup name="capability" options={capabilityOptions} selected={getValues(params, "capability")} title="Capability" />
      <RadioGroup name="ota" options={yesOptions} selected={getString(params, "ota")} title="OTA listed" />
      <RadioGroup name="battery" options={yesOptions} selected={getString(params, "battery")} title="Battery reporting" />

      <div className="filter-actions"><Link href={route}>reset</Link></div>
      <DirectoryFilterController />
    </form>
  );
}

// The static page shows the first page sorted by name. Any filter, sort, or
// ?page= in the URL loads the full index and filters it in the browser.
export function ZigbeeDeviceResults({ categoryLabels, details, firstPage, index, snapshotDate, total }: {
  categoryLabels: Record<string, string>;
  details: ZigbeeDevice[];
  firstPage: ZigbeeIndexRecord[];
  index: DirectoryIndexSource<ZigbeeIndexRecord>;
  snapshotDate: string;
  total: number;
}) {
  const { params } = useDirectoryQuery();
  const filtering = hasDirectoryParams(params, paramKeys);
  const { failed, records } = useDirectoryIndex(index, filtering);

  const groups = [
    ["category", "Category", (value: string) => categoryLabels[value] ?? value],
    ["vendor", "Vendor", (value: string) => value],
    ["capability", "Capability", (value: string) => value.replaceAll("_", " ")],
  ] as const;
  const chips: Array<{ key: string; label: string; href: string }> = [];
  for (const [key, name, label] of groups) {
    for (const value of getValues(params, key)) chips.push({ href: removeParamHref(route, params, key, value), key, label: `${name}: ${label(value)}` });
  }
  const query = getString(params, "q").trim();
  if (query) chips.unshift({ href: removeParamHref(route, params, "q"), key: "q", label: `Search: ${query}` });
  if (getString(params, "ota") === "yes") chips.push({ href: removeParamHref(route, params, "ota"), key: "ota", label: "OTA listed" });
  if (getString(params, "battery") === "yes") chips.push({ href: removeParamHref(route, params, "battery"), key: "battery", label: "Reports battery" });
  const chipRow = chips.length > 0 ? (
    <div aria-label="Active filters" className="active-filter-row">
      {chips.map((chip) => <Link href={chip.href} key={`${chip.key}-${chip.label}`}>{chip.label}<span>×</span></Link>)}
      <Link className="clear-filters" href={route}>clear all</Link>
    </div>
  ) : null;

  if (filtering && !records) {
    return <>
      {chipRow}
      {failed
        ? <StatePanel action={<Link href={route}>show all devices</Link>} state="error" title="Filters could not be loaded"><p>Reload the page to try again.</p></StatePanel>
        : <StatePanel state="loading" title="Loading devices" />}
    </>;
  }

  const filtered = filtering && records ? sortDevices(filterDevices(records, params), getSort(params)) : null;
  const count = filtered ? filtered.length : total;
  const totalPages = Math.max(1, Math.ceil(count / zigbeePageSize));
  const currentPage = Math.min(getPage(params), totalPages);
  const pageDevices = filtered ? filtered.slice((currentPage - 1) * zigbeePageSize, currentPage * zigbeePageSize) : firstPage;

  return <>
    {chipRow}
    <header className={styles.resultHeader}>
      <p className={styles.resultCount}>{count.toLocaleString("en-US")} matching devices</p>
      <p className={styles.snapshotNote}>Sources read {snapshotDate}</p>
    </header>

    {pageDevices.length > 0 ? (
      <>
        <ZigbeeDeviceBrowser categoryLabels={categoryLabels} details={details} devices={pageDevices} />
        {pageDevices.some((device) => device.amazon) ? <DirectoryAffiliateDisclosure /> : null}
        {totalPages > 1 ? (
          <Pagination ariaLabel="Zigbee device pages" currentPage={currentPage} hrefForPage={(page) => pageHref(params, page)} totalPages={totalPages} />
        ) : null}
      </>
    ) : (
      <StatePanel action={<Link href={route}>show all devices</Link>} title="No exact models match those filters">
        <p>Try the retail model without punctuation, or clear one filter.</p>
      </StatePanel>
    )}
  </>;
}
