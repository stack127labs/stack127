import { RadioTower, Search } from "lucide-react";
import Link from "next/link";
import { AppShell, SidebarLabel } from "@/app/app-shell";
import { PageHeader } from "@/app/page-header";
import { PageTitleIcon } from "@/app/page-title-icon";
import {
  proseClassName,
  proseFlowClassName,
} from "@/app/prose";
import {
  sidebarPanelClassName,
  sidebarPanelHeadingClassName,
} from "@/app/sidebar-panel";
import {
  featuredZigbeeCapabilities,
  getZigbeeDeviceSnapshotMeta,
  getZigbeeDevices,
  zigbeeCategoryLabels,
} from "@/lib/zigbee-devices";
import { addAmazonMatches } from "@/lib/amazon-affiliate/server";
import {
  DirectoryRadioGroup as RadioGroup,
  DirectoryTagSelectGroup as TagSelectGroup,
  type DirectoryFilterOption as FilterOption,
} from "../_components/directory-filters";
import { DirectoryFilterController } from "../_components/directory-filter-controller";
import { SortDropdown } from "../_components/directory-sort-dropdown";
import {
  filterDevices,
  getPage,
  getSort,
  getString,
  getValues,
  pageHref,
  paginationPages,
  sortDevices,
  type ZigbeeSearchParams,
} from "./filters";
import { ZigbeeDeviceBrowser } from "./zigbee-device-browser";
import { DirectoryAffiliateDisclosure } from "../_components/directory-affiliate-disclosure";
import styles from "./zigbee-devices.module.css";

const pageSize = 30;
const sortOptions = [
  { label: "Device name", value: "name" },
  { label: "Vendor", value: "vendor" },
  { label: "Most exposed fields", value: "capabilities" },
  { label: "Recently added", value: "newest" },
];

const yesOptions: FilterOption[] = [
  { label: "Any", value: "" },
  { label: "Yes", value: "yes" },
];

function removeFilterHref(params: ZigbeeSearchParams, key: string, value?: string) {
  const next = new URLSearchParams();

  for (const [paramKey, paramValue] of Object.entries(params)) {
    if (paramKey === "page") continue;

    for (const current of Array.isArray(paramValue) ? paramValue : paramValue ? [paramValue] : []) {
      if (paramKey === key && (!value || current === value)) continue;
      next.append(paramKey, current);
    }
  }

  const query = next.toString();
  return query ? `/zigbee-devices?${query}` : "/zigbee-devices";
}

function ActiveFilters({
  categoryLabels,
  params,
}: {
  categoryLabels: Map<string, string>;
  params: ZigbeeSearchParams;
}) {
  const labels = new Map([
    ["category", categoryLabels],
    ["vendor", new Map<string, string>()],
    ["capability", new Map(featuredZigbeeCapabilities.map((value) => [value, value.replaceAll("_", " ")]))],
  ]);
  const groupNames = new Map([
    ["category", "Category"],
    ["vendor", "Vendor"],
    ["capability", "Capability"],
  ]);
  const chips: Array<{ key: string; label: string; href: string }> = [];

  for (const [key, valueLabels] of labels) {
    for (const value of getValues(params, key)) {
      chips.push({
        href: removeFilterHref(params, key, value),
        key,
        label: `${groupNames.get(key)}: ${valueLabels.get(value) ?? value}`,
      });
    }
  }

  const query = getString(params, "q").trim();
  if (query) chips.unshift({ href: removeFilterHref(params, "q"), key: "q", label: `Search: ${query}` });
  if (getString(params, "ota") === "yes") chips.push({ href: removeFilterHref(params, "ota"), key: "ota", label: "OTA listed" });
  if (getString(params, "battery") === "yes") chips.push({ href: removeFilterHref(params, "battery"), key: "battery", label: "Reports battery" });

  if (chips.length === 0) return null;

  return (
    <div aria-label="Active filters" className="active-filter-row">
      {chips.map((chip) => (
        <Link href={chip.href} key={`${chip.key}-${chip.label}`}>
          {chip.label}<span>×</span>
        </Link>
      ))}
      <Link className="clear-filters" href="/zigbee-devices">clear all</Link>
    </div>
  );
}

export default async function ZigbeeDevicesPage({
  searchParams,
}: {
  searchParams: Promise<ZigbeeSearchParams>;
}) {
  const params = await searchParams;
  const devices = getZigbeeDevices();
  const meta = getZigbeeDeviceSnapshotMeta();
  const sort = getSort(params);
  const filtered = sortDevices(filterDevices(devices, params), sort);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(getPage(params), totalPages);
  const pageDevices = await addAmazonMatches(
    "zigbee-devices",
    filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize),
  );

  const categoryCounts = new Map<string, number>();
  const vendorCounts = new Map<string, number>();
  for (const device of devices) {
    categoryCounts.set(device.category, (categoryCounts.get(device.category) ?? 0) + 1);
    vendorCounts.set(device.vendor, (vendorCounts.get(device.vendor) ?? 0) + 1);
  }

  const categoryOptions: FilterOption[] = [...categoryCounts.entries()]
    .map(([value, count]) => ({ count, label: zigbeeCategoryLabels.get(value) ?? "Other", value }))
    .sort((left, right) => left.label.localeCompare(right.label));
  const categoryLabels = new Map(categoryOptions.map((option) => [option.value, option.label]));
  const vendorOptions: FilterOption[] = [...vendorCounts.entries()]
    .map(([value, count]) => ({ count, label: value, value }))
    .sort((left, right) => left.label.localeCompare(right.label));
  const capabilityOptions: FilterOption[] = featuredZigbeeCapabilities
    .map((value) => ({
      count: devices.filter((device) => device.zigbee2mqtt_capabilities.includes(value)).length,
      label: value.replaceAll("_", " "),
      value,
    }))
    .filter((option) => option.count > 0);

  const sidebar = (
    <form
      action="/zigbee-devices"
      className={sidebarPanelClassName}
      data-default-sort="name"
      data-live-filter-form
    >
      <div className={sidebarPanelHeadingClassName}>
        <SidebarLabel>Zigbee devices</SidebarLabel>
      </div>

      <label className="directory-search">
        <span>Search</span>
        <span className="directory-search-field">
          <Search aria-hidden="true" size={16} />
          <input
            defaultValue={getString(params, "q")}
            name="q"
            placeholder="SNZB-02P, Aqara, temperature..."
            type="search"
          />
        </span>
      </label>

      <SortDropdown name="sort" options={sortOptions} value={sort} />
      <TagSelectGroup name="category" options={categoryOptions} selected={getValues(params, "category")} title="Category" />
      <TagSelectGroup name="vendor" options={vendorOptions} selected={getValues(params, "vendor")} title="Vendor" />
      <TagSelectGroup name="capability" options={capabilityOptions} selected={getValues(params, "capability")} title="Capability" />
      <RadioGroup name="ota" options={yesOptions} selected={getString(params, "ota")} title="OTA listed" />
      <RadioGroup name="battery" options={yesOptions} selected={getString(params, "battery")} title="Battery reporting" />

      <div className="filter-actions"><Link href="/zigbee-devices">reset</Link></div>
      <DirectoryFilterController />
    </form>
  );

  const snapshotDate = new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(meta.generated_at));

  return (
    <AppShell mainLabel="Zigbee devices directory" menuLabel="Filters" sidebar={sidebar} sidebarLabel="Zigbee device filters">
      <div className="directory-results">
        <PageHeader bordered>
          <h1>
            <PageTitleIcon><RadioTower strokeWidth={2.2} /></PageTitleIcon>{" "}
            Zigbee compatible devices for <mark>Zigbee2MQTT and ZHA</mark>
          </h1>
          <p>
            Search the complete Zigbee2MQTT supported-device list alongside model-specific ZHA community records.
            Each card states which platform has evidence, then shows the device type and useful exposed features.
          </p>
        </PageHeader>

        <ActiveFilters categoryLabels={categoryLabels} params={params} />

        <header className={styles.resultHeader}>
          <p className={styles.resultCount}>{filtered.length.toLocaleString("en-US")} matching devices</p>
          <p className={styles.snapshotNote}>
            {meta.coverage ? `${meta.coverage.zigbee2mqtt_marketed_total.toLocaleString("en-US")} Zigbee2MQTT marketed devices · ` : ""}
            snapshot {snapshotDate}
          </p>
        </header>

        {pageDevices.length > 0 ? (
          <>
            <ZigbeeDeviceBrowser devices={pageDevices} />
            {pageDevices.some((record) => Boolean(record.amazon)) ? <DirectoryAffiliateDisclosure /> : null}
            {totalPages > 1 ? (
              <nav aria-label="Zigbee device pages" className="directory-pagination">
                <Link aria-disabled={currentPage === 1} aria-label="Previous page" href={pageHref(params, Math.max(1, currentPage - 1))}>‹</Link>
                {paginationPages(currentPage, totalPages).map((page, index) => page === null ? (
                  <span className="directory-pagination-gap" key={`gap-${index}`}>…</span>
                ) : page === currentPage ? (
                  <span aria-current="page" key={page}>{page}</span>
                ) : (
                  <Link href={pageHref(params, page)} key={page}>{page}</Link>
                ))}
                <Link aria-disabled={currentPage === totalPages} aria-label="Next page" href={pageHref(params, Math.min(totalPages, currentPage + 1))}>›</Link>
              </nav>
            ) : null}
          </>
        ) : (
          <div className="directory-empty">
            <h2>No exact models match those filters</h2>
            <p>Try the retail model without punctuation, or clear one filter.</p>
            <Link href="/zigbee-devices">show all devices</Link>
          </div>
        )}

        <section className={`${proseClassName} ${proseFlowClassName} ${styles.guide}`}>
          <h2>What each support record proves</h2>
          <div className={styles.tableWrap} tabIndex={0}>
            <table className={styles.evidenceTable}>
              <thead>
                <tr><th>Evidence</th><th>What it confirms</th><th>What it does not confirm</th></tr>
              </thead>
              <tbody>
                <tr>
                  <th>Zigbee2MQTT converter</th>
                  <td>The exact model has a converter definition and a documented set of exposed fields.</td>
                  <td>Every firmware revision or white-label version behaves the same.</td>
                </tr>
                <tr>
                  <th>ZHA community record</th>
                  <td>A community member reported the exact retail model working with ZHA.</td>
                  <td>Every feature is exposed, or that Home Assistant maintains an official model list.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2>The exact model matters more than the product name</h2>
          <p>
            Manufacturers sometimes reuse a product name across different hardware. Tuya devices can also
            share generic Zigbee identifiers such as <code>TS0601</code> while using different manufacturer
            fingerprints and data points. This directory shares evidence only when the marketed model matches
            exactly. A source record that cannot be merged remains visible as its own card instead of being discarded.
          </p>

          <h2>Check the source again before you buy</h2>
          <p>
            Support changes with converter releases, Home Assistant updates, device firmware, and hardware
            revisions. Open both source links in the device details and check recent notes for your exact model.
            Search and filter values stay in the stack127 URL and are not sent to either upstream directory.
          </p>
          <p className={styles.sourceLine}>
            Snapshot sources: Zigbee2MQTT converter package {meta.zigbee2mqtt.version}, Zigbee2MQTT website commit {meta.zigbee2mqtt.website_commit?.slice(0, 12) ?? "not recorded"}, and Blakadder commit {meta.blakadder.commit.slice(0, 12)}. Product images come from the matching pinned source records.
          </p>
        </section>
      </div>
    </AppShell>
  );
}
