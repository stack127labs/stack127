import type { ReactNode } from "react";
import { Search } from "lucide-react";
import Link from "next/link";
import { AppShell, SidebarLabel } from "@/app/app-shell";
import { PageHeader } from "@/app/page-header";
import { PageTitleIcon } from "@/app/page-title-icon";
import { proseClassName, proseFlowClassName } from "@/app/prose";
import { sidebarPanelClassName, sidebarPanelHeadingClassName } from "@/app/sidebar-panel";
import type { HardwareDirectorySnapshot } from "@/lib/hardware-directories";
import { DirectoryTagSelectGroup as TagSelectGroup, type DirectoryFilterOption as FilterOption } from "./directory-filters";
import { DirectoryFilterController } from "./directory-filter-controller";
import { SortDropdown } from "./directory-sort-dropdown";
import { HardwareDirectoryBrowser } from "./hardware-directory-browser";
import {
  filterHardwareRecords,
  getDirectoryPage,
  getDirectorySort,
  getDirectoryString,
  getDirectoryValues,
  hardwareDirectoryPageHref,
  hardwareDirectoryPaginationPages,
  sortHardwareRecords,
  type HardwareDirectorySearchParams,
} from "./hardware-directory-filters";
import styles from "./hardware-directory-page.module.css";

export type HardwareDirectoryConfig = {
  evidenceRows: Array<{ evidence: string; proves: string; limit: string }>;
  heading: string;
  highlightedHeading: string;
  icon: ReactNode;
  intro: string;
  route: string;
  searchPlaceholder: string;
  sidebarLabel: string;
  sourceSentence: string;
  title: string;
};

const pageSize = 30;
const sortOptions = [
  { label: "Device name", value: "name" },
  { label: "Vendor", value: "vendor" },
  { label: "Most recorded features", value: "features" },
  { label: "Recently added", value: "newest" },
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
  for (const [key, label] of [["category", "Category"], ["vendor", "Vendor"], ["feature", "Feature"]] as const) {
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
      <TagSelectGroup name="feature" options={featureOptions} selected={getDirectoryValues(params, "feature")} title="Feature" />
      <div className="filter-actions"><Link href={config.route}>reset</Link></div>
      <DirectoryFilterController />
    </form>
  );

  const snapshotDate = new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(snapshot.meta.generated_at));
  const coverage = snapshot.meta.coverage;

  return (
    <AppShell mainLabel={config.title} menuLabel="Filters" sidebar={sidebar} sidebarLabel={`${config.sidebarLabel} filters`}>
      <div className="directory-results">
        <PageHeader bordered>
          <h1><PageTitleIcon>{config.icon}</PageTitleIcon>{" "}{config.heading} <mark>{config.highlightedHeading}</mark></h1>
          <p>{config.intro}</p>
        </PageHeader>

        {chips.length > 0 ? <div aria-label="Active filters" className="active-filter-row">{chips.map((chip) => <Link href={chip.href} key={`${chip.key}-${chip.label}`}>{chip.label}<span>×</span></Link>)}<Link className="clear-filters" href={config.route}>clear all</Link></div> : null}

        <header className={styles.resultHeader}><p className={styles.resultCount}>{filtered.length.toLocaleString("en-US")} matching devices</p><p className={styles.snapshotNote}>snapshot {snapshotDate}</p></header>

        {coverage ? <section aria-label="Directory coverage" className={styles.coverageLedger}>
          <div><strong>{coverage.source_total.toLocaleString("en-US")}</strong><span>Source records</span></div>
          <div><strong>{coverage.record_total.toLocaleString("en-US")}</strong><span>Directory records</span></div>
          <div><strong>{coverage.detail_total.toLocaleString("en-US")}</strong><span>Detailed records</span></div>
          <div><strong>{coverage.image_total.toLocaleString("en-US")}</strong><span>Product images</span></div>
        </section> : null}

        {pageRecords.length > 0 ? (
          <>
            <HardwareDirectoryBrowser records={pageRecords} />
            {totalPages > 1 ? <nav aria-label={`${config.title} pages`} className="directory-pagination">
              <Link aria-disabled={currentPage === 1} aria-label="Previous page" href={hardwareDirectoryPageHref(config.route, params, Math.max(1, currentPage - 1))}>‹</Link>
              {hardwareDirectoryPaginationPages(currentPage, totalPages).map((page, index) => page === null ? <span className="directory-pagination-gap" key={`gap-${index}`}>…</span> : page === currentPage ? <span aria-current="page" key={page}>{page}</span> : <Link href={hardwareDirectoryPageHref(config.route, params, page)} key={page}>{page}</Link>)}
              <Link aria-disabled={currentPage === totalPages} aria-label="Next page" href={hardwareDirectoryPageHref(config.route, params, Math.min(totalPages, currentPage + 1))}>›</Link>
            </nav> : null}
          </>
        ) : <div className="directory-empty"><h2>No exact models match those filters</h2><p>Try the retail model without punctuation, or clear one filter.</p><Link href={config.route}>show all devices</Link></div>}

        <section className={`${proseClassName} ${proseFlowClassName} ${styles.guide}`}>
          <h2>What each record proves</h2>
          <div className={styles.tableWrap} tabIndex={0}><table className={styles.evidenceTable}><thead><tr><th>Evidence</th><th>What it confirms</th><th>What it does not confirm</th></tr></thead><tbody>{config.evidenceRows.map((row) => <tr key={row.evidence}><th>{row.evidence}</th><td>{row.proves}</td><td>{row.limit}</td></tr>)}</tbody></table></div>
          <p>{config.sourceSentence}</p>
          <p className={styles.sourceLine}>Source snapshot: {snapshot.meta.source_label}, revision {snapshot.meta.source_revision}</p>
        </section>
      </div>
    </AppShell>
  );
}
