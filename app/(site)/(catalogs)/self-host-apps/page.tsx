import { HardDrive, Search } from "lucide-react";
import Link from "next/link";
import type { CSSProperties } from "react";
import { FaGithub } from "react-icons/fa6";
import { getDirectoryApps, type DirectoryApp } from "@/lib/apps";
import { getRequiredPublishedPage } from "@/lib/page-registry";
import {
  findDirectoryLicenseId,
  licenses,
} from "@/lib/software-licenses";
import { AppShell, SidebarLabel } from "@/app/app-shell";
import {
  CatalogCheckboxGroup as CheckboxGroup,
  CatalogRadioGroup as RadioGroup,
  CatalogTagSelectGroup as TagSelectGroup,
  type CatalogFilterOption as FilterOption,
} from "../_components/catalog-filters";
import { Doodle } from "@/app/doodle";
import { siteDoodleSparkArt } from "../../art/site--doodle-spark";
import {
  sidebarPanelClassName,
  sidebarPanelGithubLinkClassName,
  sidebarPanelHeadingClassName,
} from "@/app/sidebar-panel";
import {
  getRamTier,
  getStorageTier,
  hasMobileApp,
} from "./directory-app-card";
import { DirectoryAppBrowser } from "./directory-app-browser";
import { CatalogFilterController } from "../_components/catalog-filter-controller";
import { SortDropdown } from "../_components/catalog-sort-dropdown";
import { PageTitleIcon } from "@/app/page-title-icon";
import { PageHeader } from "@/app/page-header";

export const dynamic = "force-dynamic";

type SearchParams = Record<string, string | string[] | undefined>;

const dockerOptions: FilterOption[] = [
  { label: "Has Docker support", value: "supported" },
];

const sourceOptions: FilterOption[] = [
  { label: "Open source", value: "open_source" },
  { label: "Source available", value: "source_available" },
  { label: "Closed source", value: "closed_source" },
  { label: "Not verified", value: "unknown" },
];

const ramOptions: FilterOption[] = [
  { label: "Under 1GB", value: "under 1gb" },
  { label: "Up to 2GB", value: "1-2gb" },
  { label: "Up to 4GB", value: "2-4gb" },
  { label: "4GB+ ok", value: "4gb+" },
];

const storageOptions: FilterOption[] = [
  { label: "Tiny", value: "tiny" },
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
  { label: "Depends", value: "depends" },
];

const maintenanceOptions: FilterOption[] = [
  { label: "Active", value: "active" },
  { label: "Slow", value: "slow" },
  { label: "Stale", value: "stale" },
  { label: "Archived", value: "archived" },
  { label: "Unknown", value: "unknown" },
];

const sortOptions: FilterOption[] = [
  { label: "Most popular", value: "popular" },
  { label: "Name", value: "name" },
  { label: "Lowest RAM", value: "lowest-ram" },
  { label: "Healthiest", value: "healthy" },
];

const ramTierOrder = ramOptions.map((option) => option.value);
const storageTierOrder = storageOptions.map((option) => option.value);
const pageSize = 30;

function optionsMap(options: FilterOption[]) {
  return new Map(options.map((option) => [option.value, option.label]));
}

const dockerOptionLabels = optionsMap(dockerOptions);
const sourceOptionLabels = optionsMap(sourceOptions);
const ramOptionLabels = optionsMap(ramOptions);
const storageOptionLabels = optionsMap(storageOptions);
const maintenanceOptionLabels = optionsMap(maintenanceOptions);

const signalOptionLabels = new Map([
  ["mobile", "Has mobile app"],
  ["database", "Needs database"],
  ["compose", "Compose ready"],
]);

const filterLabels = new Map([
  ["category", "Category"],
  ["license", "License"],
  ["source", "Source model"],
  ["docker", "Docker"],
  ["ram", "RAM"],
  ["storage", "Storage"],
  ["maintenance", "Health"],
  ["signal", "Signal"],
]);

function getValues(params: SearchParams, key: string) {
  const value = params[key];

  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}

function getString(params: SearchParams, key: string) {
  const value = params[key];

  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function getKnownValue(params: SearchParams, key: string, values: string[]) {
  const value = getString(params, key);

  return values.includes(value) ? value : "";
}

function getPage(params: SearchParams) {
  const value = Number(getString(params, "page"));

  return Number.isInteger(value) && value > 1 ? value : 1;
}

function matchesSearch(app: DirectoryApp, query: string) {
  if (!query) {
    return true;
  }

  const haystack = [
    app.name,
    app.summary,
    app.publisher_name,
    ...app.categories.map((category) => category.name),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(query.toLowerCase());
}

function maintenanceValue(app: DirectoryApp) {
  return app.maintenance_status;
}

function getTierIndex(order: string[], value: string) {
  return order.indexOf(value);
}

function matchesTierLimit(order: string[], appTier: string, selectedTier: string) {
  const appIndex = getTierIndex(order, appTier);
  const selectedIndex = getTierIndex(order, selectedTier);

  return appIndex >= 0 && selectedIndex >= 0 && appIndex <= selectedIndex;
}

function compareTierDescending(order: string[], aTier: string, bTier: string) {
  const aIndex = getTierIndex(order, aTier);
  const bIndex = getTierIndex(order, bTier);

  if (aIndex < 0 && bIndex < 0) {
    return 0;
  }

  if (aIndex < 0) {
    return 1;
  }

  if (bIndex < 0) {
    return -1;
  }

  return bIndex - aIndex;
}

function compareBySort(a: DirectoryApp, b: DirectoryApp, sort: string) {
  if (sort === "name") {
    return a.name.localeCompare(b.name);
  }

  if (sort === "lowest-ram") {
    return (a.ram_min_mb ?? Number.MAX_SAFE_INTEGER) -
      (b.ram_min_mb ?? Number.MAX_SAFE_INTEGER);
  }

  if (sort === "healthy") {
    return Number(b.maintenance_status === "active") -
      Number(a.maintenance_status === "active") ||
      b.popularity_score - a.popularity_score;
  }

  return b.popularity_score - a.popularity_score || a.name.localeCompare(b.name);
}

function sortApps(apps: DirectoryApp[], sort: string, params: SearchParams) {
  const selectedRam = getKnownValue(params, "ram", ramTierOrder);
  const selectedStorage = getKnownValue(params, "storage", storageTierOrder);

  return [...apps].sort((a, b) => {
    if (sort !== "lowest-ram" && selectedRam) {
      const ramSort = compareTierDescending(ramTierOrder, getRamTier(a), getRamTier(b));

      if (ramSort !== 0) {
        return ramSort;
      }
    }

    if (selectedStorage) {
      const storageSort = compareTierDescending(
        storageTierOrder,
        getStorageTier(a),
        getStorageTier(b),
      );

      if (storageSort !== 0) {
        return storageSort;
      }
    }

    return compareBySort(a, b, sort);
  });
}

function filterApps(apps: DirectoryApp[], params: SearchParams) {
  const query = getString(params, "q").trim();
  const categories = getValues(params, "category");
  const selectedLicenses = getValues(params, "license").filter((value) =>
    licenses.some((license) => license.id === value),
  );
  const selectedSources = getValues(params, "source").filter((value) =>
    sourceOptions.some((option) => option.value === value),
  );
  const dockerSupported = getValues(params, "docker").includes("supported");
  const ram = getKnownValue(params, "ram", ramTierOrder);
  const storage = getKnownValue(params, "storage", storageTierOrder);
  const maintenance = getValues(params, "maintenance");
  const signals = getValues(params, "signal");

  return apps.filter((app) => {
    if (!matchesSearch(app, query)) {
      return false;
    }

    if (
      categories.length > 0 &&
      !app.categories.some((category) => categories.includes(category.slug))
    ) {
      return false;
    }

    if (selectedLicenses.length > 0) {
      const licenseId = findDirectoryLicenseId(app.license_spdx_id, app.license);
      if (!licenseId || !selectedLicenses.includes(licenseId)) {
        return false;
      }
    }

    if (selectedSources.length > 0 && !selectedSources.includes(app.source_model)) {
      return false;
    }

    if (dockerSupported && !["official", "community"].includes(app.docker_support ?? "")) {
      return false;
    }

    if (ram && !matchesTierLimit(ramTierOrder, getRamTier(app), ram)) {
      return false;
    }

    if (storage && !matchesTierLimit(storageTierOrder, getStorageTier(app), storage)) {
      return false;
    }

    if (maintenance.length > 0 && !maintenance.includes(maintenanceValue(app))) {
      return false;
    }

    if (signals.includes("mobile") && !hasMobileApp(app)) {
      return false;
    }

    if (signals.includes("database") && !app.requires_database) {
      return false;
    }

    if (signals.includes("compose") && !app.compose_support) {
      return false;
    }

    return true;
  });
}

function buildHref(params: URLSearchParams) {
  const query = params.toString();
  return query ? `/self-host-apps?${query}` : "/self-host-apps";
}

function removeFilterHref(params: SearchParams, key: string, value?: string) {
  const next = new URLSearchParams();

  for (const [paramKey, paramValue] of Object.entries(params)) {
    const values = Array.isArray(paramValue) ? paramValue : paramValue ? [paramValue] : [];

    for (const current of values) {
      if (paramKey === "app" || paramKey === "page") {
        continue;
      }

      if (paramKey === key && (!value || current === value)) {
        continue;
      }

      next.append(paramKey, current);
    }
  }

  return buildHref(next);
}

/**
 * Page numbers to render: first, last, and a window around the current page,
 * with null marking an ellipsis gap.
 */
function paginationPages(currentPage: number, totalPages: number): (number | null)[] {
  const wanted = new Set([1, totalPages, currentPage - 1, currentPage, currentPage + 1]);
  const pages: (number | null)[] = [];

  for (let page = 1; page <= totalPages; page += 1) {
    if (wanted.has(page)) {
      pages.push(page);
    } else if (pages[pages.length - 1] !== null) {
      pages.push(null);
    }
  }

  return pages;
}

function pageHref(params: SearchParams, page: number) {
  const next = new URLSearchParams();

  for (const [paramKey, paramValue] of Object.entries(params)) {
    if (paramKey === "app" || paramKey === "page") {
      continue;
    }

    const values = Array.isArray(paramValue) ? paramValue : paramValue ? [paramValue] : [];

    for (const current of values) {
      next.append(paramKey, current);
    }
  }

  if (page > 1) {
    next.set("page", String(page));
  }

  return buildHref(next);
}


function StorageSlider({
  options,
  selected,
  clearHref,
}: {
  options: FilterOption[];
  selected: string;
  clearHref: string;
}) {
  const selectedIndex = options.findIndex((option) => option.value === selected);
  const hasSelection = selectedIndex >= 0;
  const sliderIndex = hasSelection ? selectedIndex : options.length - 1;
  const sliderPosition = `${sliderIndex * 25}%`;
  const currentLabel = hasSelection ? options[selectedIndex]?.label : "Any storage";

  return (
    <fieldset className="filter-group storage-slider-group">
      <legend className="storage-slider-legend">
        <span>Storage</span>
        {hasSelection ? (
          <Link className="storage-slider-clear" href={clearHref}>
            any
          </Link>
        ) : (
          <span className="storage-slider-clear passive">any</span>
        )}
      </legend>

      <div
        className="storage-slider-shell"
        data-storage-slider-root
        style={
          {
            "--storage-slider-fill-width": sliderPosition,
            "--storage-slider-position": sliderPosition,
          } as CSSProperties
        }
      >
        <input
          data-storage-slider-value
          defaultValue={hasSelection ? options[selectedIndex]?.value : ""}
          name="storage"
          type="hidden"
        />
        <div className="storage-slider-current" aria-live="polite">
          <span data-storage-slider-current>{currentLabel}</span>
        </div>
        <div className="storage-slider-bar">
          <div className="storage-slider-track" aria-hidden="true">
            <i className="storage-slider-fill" />
            {options.map((option, index) => (
              <span
                className={hasSelection && index <= selectedIndex ? "active" : ""}
                data-storage-slider-step
                key={option.value}
              />
            ))}
            <i className="storage-slider-thumb" />
          </div>
          <input
            aria-label="Storage comfort"
            className="storage-slider-range"
            data-storage-slider
            data-storage-slider-labels={options.map((option) => option.label).join("|")}
            data-storage-slider-values={options.map((option) => option.value).join("|")}
            defaultValue={sliderIndex}
            max={options.length - 1}
            min="0"
            step="1"
            type="range"
          />
        </div>
      </div>
    </fieldset>
  );
}

function ActiveFilters({
  params,
  categoryMap,
  licenseMap,
}: {
  params: SearchParams;
  categoryMap: Map<string, string>;
  licenseMap: Map<string, string>;
}) {
  const chips: Array<{ href: string; key: string; label: string; value: string }> = [];
  const valueLabels = new Map([
    ["category", categoryMap],
    ["license", licenseMap],
    ["source", sourceOptionLabels],
    ["docker", dockerOptionLabels],
    ["ram", ramOptionLabels],
    ["storage", storageOptionLabels],
    ["maintenance", maintenanceOptionLabels],
    ["signal", signalOptionLabels],
  ]);

  for (const key of ["category", "license", "source", "docker", "ram", "storage", "maintenance", "signal"]) {
    for (const value of getValues(params, key)) {
      const groupLabel = filterLabels.get(key) ?? key;
      const valueLabel = valueLabels.get(key)?.get(value) ?? value.replaceAll("_", " ");

      chips.push({
        href: removeFilterHref(params, key, value),
        key,
        label: `${groupLabel}: ${valueLabel}`,
        value,
      });
    }
  }

  const query = getString(params, "q").trim();

  if (query) {
    chips.unshift({
      href: removeFilterHref(params, "q"),
      key: "q",
      label: `Search: ${query}`,
      value: query,
    });
  }

  if (chips.length === 0) {
    return null;
  }

  return (
    <div className="active-filter-row" aria-label="Active filters">
      {chips.map((chip) => (
        <Link href={chip.href} key={`${chip.key}-${chip.value}`}>
          {chip.label}
          <span>×</span>
        </Link>
      ))}
      <Link className="clear-filters" href="/self-host-apps">
        clear all
      </Link>
    </div>
  );
}

export default async function SelfHostAppsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const [apps, registryPage] = await Promise.all([
    getDirectoryApps(),
    getRequiredPublishedPage("self-host-apps"),
  ]);
  const sort = getString(params, "sort") || "popular";
  const selectedRam = getKnownValue(params, "ram", ramTierOrder);
  const selectedStorage = getKnownValue(params, "storage", storageTierOrder);
  const filteredApps = sortApps(filterApps(apps, params), sort, params);
  const totalPages = Math.max(1, Math.ceil(filteredApps.length / pageSize));
  const currentPage = Math.min(getPage(params), totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedApps = filteredApps.slice(startIndex, startIndex + pageSize);
  const categoryOptions = [...new Map(
    apps
      .flatMap((app) => app.categories)
      .map((category) => [
        category.slug,
        {
          iconKey: category.icon_key,
          label: category.name,
          value: category.slug,
        },
      ]),
  )]
    .map(([, option]) => option)
    .sort((a, b) => a.label.localeCompare(b.label));
  const categoryMap = new Map(categoryOptions.map((option) => [option.value, option.label]));
  const licenseCounts = new Map<string, number>();
  for (const app of apps) {
    const licenseId = findDirectoryLicenseId(app.license_spdx_id, app.license);
    if (licenseId) {
      licenseCounts.set(licenseId, (licenseCounts.get(licenseId) ?? 0) + 1);
    }
  }
  const licenseOptions = licenses
    .filter((license) => licenseCounts.has(license.id))
    .map((license) => ({
      count: licenseCounts.get(license.id) ?? 0,
      label: license.sidebarLabel,
      value: license.id,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
  const licenseMap = new Map(licenseOptions.map((option) => [option.value, option.label]));
  const selectedLicenses = getValues(params, "license").filter((value) => licenseMap.has(value));

  const sidebar = (
    <form
      action="/self-host-apps"
      className={sidebarPanelClassName}
      data-default-sort="popular"
      data-live-filter-form
    >
      <div className={sidebarPanelHeadingClassName}>
        <SidebarLabel>{registryPage.label}</SidebarLabel>
        <a
          className={sidebarPanelGithubLinkClassName}
          href="https://github.com/stack127/stack127-datasets/tree/main/self-host-apps"
          rel="noreferrer"
          target="_blank"
        >
          <FaGithub aria-hidden="true" size={14} />
          View on Github
        </a>
      </div>

      <label className="directory-search">
        <span>Search</span>
        <span className="directory-search-field">
          <Search aria-hidden="true" size={16} strokeWidth={2.2} />
          <input
            defaultValue={getString(params, "q")}
            name="q"
            placeholder="Immich, DNS, photos..."
            type="search"
          />
        </span>
      </label>

      <SortDropdown name="sort" options={sortOptions} value={sort} />

      <TagSelectGroup
        name="category"
        options={categoryOptions}
        selected={getValues(params, "category")}
        title="Category"
      />
      <TagSelectGroup
        name="license"
        options={licenseOptions}
        selected={selectedLicenses}
        title="License"
      />
      <CheckboxGroup
        name="source"
        options={sourceOptions}
        selected={getValues(params, "source")}
        title="Source model"
      />
      <CheckboxGroup
        name="docker"
        options={dockerOptions}
        selected={getValues(params, "docker")}
        title="Docker"
      />
      <RadioGroup
        name="ram"
        options={ramOptions}
        selected={selectedRam}
        title="RAM"
      />
      <StorageSlider
        clearHref={removeFilterHref(params, "storage")}
        options={storageOptions}
        selected={selectedStorage}
      />
      <CheckboxGroup
        name="maintenance"
        options={maintenanceOptions}
        selected={getValues(params, "maintenance")}
        title="Health"
      />
      <CheckboxGroup
        name="signal"
        options={[
          { label: "Has mobile app", value: "mobile" },
          { label: "Needs database", value: "database" },
          { label: "Compose ready", value: "compose" },
        ]}
        selected={getValues(params, "signal")}
        title="Signals"
      />

      <div className="filter-actions">
        <Link href="/self-host-apps">reset</Link>
      </div>
      <CatalogFilterController />
    </form>
  );

  return (
    <AppShell
      mainLabel="Self-hosted app results"
      menuLabel="Filters"
      sidebar={sidebar}
      sidebarLabel="Self-hosted app filters"
    >
        <div className="directory-results">
          <PageHeader bordered>
            <h1>
              <PageTitleIcon>
                <HardDrive strokeWidth={2.2} />
              </PageTitleIcon>{" "}
              Self-host <mark>apps that fit</mark> your server, storage, and setup comfort
            </h1>
            <p>
              Compare open-source, source-available, and closed-source apps by purpose, deployment,
              hardware needs, price, and maintenance. Unknown requirements stay unknown until an
              official source supports them.
            </p>
          </PageHeader>

          <ActiveFilters
            categoryMap={categoryMap}
            licenseMap={licenseMap}
            params={params}
          />

          {paginatedApps.length > 0 ? (
            <>
              <DirectoryAppBrowser apps={paginatedApps} />
              {totalPages > 1 ? (
                <nav className="directory-pagination" aria-label="Self-hosted app pages">
                  <Link
                    aria-disabled={currentPage === 1}
                    aria-label="Previous page"
                    href={pageHref(params, Math.max(1, currentPage - 1))}
                  >
                    ‹
                  </Link>
                  {paginationPages(currentPage, totalPages).map((page, index) =>
                    page === null ? (
                      <span className="directory-pagination-gap" key={`gap-${index}`}>
                        …
                      </span>
                    ) : page === currentPage ? (
                      <span aria-current="page" key={page}>
                        {page}
                      </span>
                    ) : (
                      <Link href={pageHref(params, page)} key={page}>
                        {page}
                      </Link>
                    ),
                  )}
                  <Link
                    aria-disabled={currentPage === totalPages}
                    aria-label="Next page"
                    href={pageHref(params, Math.min(totalPages, currentPage + 1))}
                  >
                    ›
                  </Link>
                </nav>
              ) : null}
            </>
          ) : (
            <div className="directory-empty">
              <Doodle svg={siteDoodleSparkArt} />
              <h2>No apps match those filters</h2>
              <p>Try clearing one filter first.</p>
              <Link href="/self-host-apps">show all apps</Link>
            </div>
          )}
        </div>
    </AppShell>
  );
}
