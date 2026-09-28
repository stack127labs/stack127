import { StatePanel } from "@/app/ui/state-panel";
import { Pagination } from "@/app/ui/pagination";
import { PageCanvas } from "@/app/ui/site/page-canvas";
import type { ReactNode } from "react";
import { Search } from "lucide-react";
import Link from "next/link";
import { AppShell, SidebarLabel } from "@/app/ui/site/app-shell";
import { PageHeader } from "@/app/ui/site/page-header";
import { PageTitleIcon } from "@/app/ui/site/page-title-icon";
import { proseClassName, proseFlowClassName } from "@/app/ui/site/prose";
import { sidebarPanelClassName, sidebarPanelHeadingClassName } from "@/app/ui/site/sidebar-panel";
import type { HardwareDirectorySnapshot } from "@/lib/hardware-directories";
import { hardwareDirectoryCard } from "@/lib/hardware-directories/card";
import { DirectoryTagSelectGroup as TagSelectGroup, type DirectoryFilterOption as FilterOption } from "./directory-filters";
import { DirectoryFilterController } from "./directory-filter-controller";
import { SortDropdown } from "./directory-sort-dropdown";
import { HardwareDirectoryBrowser } from "./hardware-directory-browser";
import { DirectoryAffiliateDisclosure } from "./directory-affiliate-disclosure";
import {
  filterHardwareRecords,
  getDirectoryPage,
  getDirectorySort,
  getDirectoryString,
  getDirectoryValues,
  hardwareDirectoryPageHref,
  sortHardwareRecords,
  type HardwareDirectorySearchParams,
} from "./hardware-directory-filters";
import styles from "./hardware-directory-page.module.css";

export type HardwareDirectoryConfig = {
  detailFilterLabel: string;
  heading: string;
  highlightedHeading: string;
  icon: ReactNode;
  intro: string;
  route: string;
  searchPlaceholder: string;
  sidebarLabel: string;
  buyingNote: string;
  title: string;
};

const pageSize = 30;
const sortOptions = [
  { label: "Device name", value: "name" },
  { label: "Vendor", value: "vendor" },
];

function removeFilterHref(route: string, params: HardwareDirectorySearchParams, key: string, value?: string) {
  const next = new URLSearchParams();
  for (const [paramKey, paramValue] of Object.entries(params)) {
    if (paramKey === "page") continue;
    for (const current of Array.isArray(paramValue) ? paramValue : paramValue ? [paramValue] : []) {
      if (paramKey === key && (!value || current === value)) continue;
      next.append(paramKey, current);
    }
  }
  const query = next.toString();
  return query ? `${route}?${query}` : route;
}

export function HardwareDirectoryPage({ config, params, snapshot }: { config: HardwareDirectoryConfig; params: HardwareDirectorySearchParams; snapshot: HardwareDirectorySnapshot }) {
  const records = snapshot.records;
  const sort = getDirectorySort(params);
  const filtered = sortHardwareRecords(filterHardwareRecords(records, params), sort);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(getDirectoryPage(params), totalPages);
  const pageRecords = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const optionList = (key: "category" | "vendor" | "features"): FilterOption[] => {
    const counts = new Map<string, number>();
    for (const record of records) {
      const values = key === "features" ? record.features : [record[key]];
      for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
    }
    return [...counts].map(([value, count]) => ({ count, label: value, value })).sort((a, b) => a.label.localeCompare(b.label));
  };

  const categoryOptions = optionList("category");
  const vendorOptions = optionList("vendor");
  const featureOptions = optionList("features");
  const chips: Array<{ key: string; label: string; href: string }> = [];
  const query = getDirectoryString(params, "q").trim();
  if (query) chips.push({ href: removeFilterHref(config.route, params, "q"), key: "q", label: `Search: ${query}` });
  for (const [key, label] of [["category", "Category"], ["vendor", "Vendor"], ["feature", config.detailFilterLabel]] as const) {
    for (const value of getDirectoryValues(params, key)) chips.push({ href: removeFilterHref(config.route, params, key, value), key, label: `${label}: ${value}` });
  }

  const sidebar = (
    <form action={config.route} className={sidebarPanelClassName} data-default-sort="name" data-live-filter-form>
      <div className={sidebarPanelHeadingClassName}><SidebarLabel>{config.sidebarLabel}</SidebarLabel></div>
      <label className="directory-search">
        <span>Search</span>
        <span className="directory-search-field"><Search aria-hidden="true" size={16} /><input defaultValue={query} name="q" placeholder={config.searchPlaceholder} type="search" /></span>
      </label>
      <SortDropdown name="sort" options={sortOptions} value={sort} />
      <TagSelectGroup name="category" options={categoryOptions} selected={getDirectoryValues(params, "category")} title="Category" />
      <TagSelectGroup name="vendor" options={vendorOptions} selected={getDirectoryValues(params, "vendor")} title="Vendor" />
      <TagSelectGroup name="feature" options={featureOptions} selected={getDirectoryValues(params, "feature")} title={config.detailFilterLabel} />
      <div className="filter-actions"><Link href={config.route}>reset</Link></div>
      <DirectoryFilterController />
    </form>
  );

  const snapshotDate = new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(snapshot.meta.generated_at));
  return (
    <AppShell mainLabel={config.title} menuLabel="Filters" sidebar={sidebar} sidebarLabel={`${config.sidebarLabel} filters`}>
      <PageCanvas as="div" flow className="directory-results">
        <PageHeader bordered>
          <h1><PageTitleIcon>{config.icon}</PageTitleIcon>{" "}{config.heading} <mark>{config.highlightedHeading}</mark></h1>
          <p>{config.intro}</p>
        </PageHeader>

        {chips.length > 0 ? <div aria-label="Active filters" className="active-filter-row">{chips.map((chip) => <Link href={chip.href} key={`${chip.key}-${chip.label}`}>{chip.label}<span>×</span></Link>)}<Link className="clear-filters" href={config.route}>clear all</Link></div> : null}

        <header className={styles.resultHeader}><p className={styles.resultCount}>{filtered.length.toLocaleString("en-US")} matching devices</p><p className={styles.snapshotNote}>Updated {snapshotDate}</p></header>

        {pageRecords.length > 0 ? (
          <>
            <HardwareDirectoryBrowser directory={config.route.slice(1)} records={pageRecords.map(hardwareDirectoryCard)} />
            {pageRecords.some((record) => Boolean(record.amazon)) ? <DirectoryAffiliateDisclosure /> : null}
            {totalPages > 1 ? <Pagination ariaLabel={`${config.title} pages`} currentPage={currentPage} hrefForPage={(page) => hardwareDirectoryPageHref(config.route, params, page)} totalPages={totalPages} /> : null}
          </>
        ) : <StatePanel action={<Link href={config.route}>show all devices</Link>} title="No exact models match those filters"><p>Try the retail model without punctuation, or clear one filter.</p></StatePanel>}

        <section className={`${proseClassName} ${proseFlowClassName} ${styles.guide}`}>
          <h2>Before you buy</h2>
          <p>{config.buyingNote}</p>
        </section>
      </PageCanvas>
    </AppShell>
  );
}
