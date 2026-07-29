import { Search } from "lucide-react";
import Link from "next/link";
import type { CSSProperties } from "react";
import { FaGithub } from "react-icons/fa6";
import { getDirectoryApps, type DirectoryApp } from "@/lib/apps";
import { getRequiredPublishedPage } from "@/lib/page-registry";
import { findLicenseAnchor } from "@/lib/software-licenses";
import { AppShell, SidebarLabel } from "../../app-shell";
import { CategoryIcon } from "../../category-icon";
import { Doodle } from "../../doodle";
import { siteDoodleSparkArt } from "../art/site--doodle-spark";
import {
  sidebarPanelClassName,
  sidebarPanelGithubLinkClassName,
  sidebarPanelHeadingClassName,
} from "../../sidebar-panel";
import {
  formatDatabaseRequirement,
  getRamTier,
  getStorageTier,
  hasMobileApp,
} from "./directory-app-card";
import { DirectoryAppBrowser } from "./directory-app-browser";
import { LiveFilterController } from "./live-filter-controller";
import { SortDropdown } from "./sort-dropdown";

export const dynamic = "force-dynamic";

type SearchParams = Record<string, string | string[] | undefined>;

type FilterOption = {
  iconKey?: string | null;
  label: string;
  value: string;
};

const dockerOptions: FilterOption[] = [
  { label: "Has Docker support", value: "supported" },
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
    return (a.ram_mb ?? Number.MAX_SAFE_INTEGER) -
      (b.ram_mb ?? Number.MAX_SAFE_INTEGER);
  }

  if (sort === "healthy") {
    return Number(b.maintenance_status === "active") -
      Number(a.maintenance_status === "active") ||
      (b.github_stars ?? 0) - (a.github_stars ?? 0);
  }

  return (b.github_stars ?? 0) - (a.github_stars ?? 0);
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

function formatDate(value: Date | string | null) {
  if (!value) {
    return "unknown";
  }

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatCrawlerPublisher(app: DirectoryApp) {
  if (!app.publisher_name) {
    return app.publisher_type;
  }

  return app.publisher_type === "unknown"
    ? app.publisher_name
    : `${app.publisher_name} (${app.publisher_type})`;
}

function formatCrawlerList(values: string[]) {
  return values.length > 0 ? values.join(", ") : "unknown";
}

function DirectoryCrawlerRecords({ apps }: { apps: DirectoryApp[] }) {
  return (
    <details className="directory-crawl-records">
      <summary>full app records</summary>
      <div className="directory-crawl-record-list">
        {apps.map((app) => (
          <article className="directory-crawl-record" key={app.slug}>
            <h2>{app.name}</h2>
            <p>{app.summary}</p>
            <dl>
              <div>
                <dt>slug</dt>
                <dd>{app.slug}</dd>
              </div>
              <div>
                <dt>categories</dt>
                <dd>{formatCrawlerList(app.categories.map((category) => category.name))}</dd>
              </div>
              <div>
                <dt>publisher</dt>
                <dd>{formatCrawlerPublisher(app)}</dd>
              </div>
              <div>
                <dt>website</dt>
                <dd>
                  {app.website_url ? <a href={app.website_url}>{app.website_url}</a> : "unknown"}
                </dd>
              </div>
              <div>
                <dt>source code</dt>
                <dd>
                  {app.source_code_url ? <a href={app.source_code_url}>{app.source_code_url}</a> : "unknown"}
                </dd>
              </div>
              <div>
                <dt>install docs</dt>
                <dd>
                  {app.install_docs_url ? <a href={app.install_docs_url}>{app.install_docs_url}</a> : "unknown"}
                </dd>
              </div>
              <div>
                <dt>docs</dt>
                <dd>
                  {app.docs_url ? <a href={app.docs_url}>{app.docs_url}</a> : "unknown"}
                </dd>
              </div>
              <div>
                <dt>docker</dt>
                <dd>
                  {app.docker_url ? <a href={app.docker_url}>{app.docker_url}</a> : app.docker_support}
                </dd>
              </div>
              <div>
                <dt>license</dt>
                <dd>
                  {(() => {
                    const label = app.license ?? "unknown";
                    const anchor = findLicenseAnchor(app.license);
                    return anchor ? (
                      <Link href={`/software-licenses-for-self-hosting#${anchor}`}>{label}</Link>
                    ) : (
                      label
                    );
                  })()}
                </dd>
              </div>
              <div>
                <dt>license type</dt>
                <dd>{app.license_type}</dd>
              </div>
              <div>
                <dt>source model</dt>
                <dd>{app.source_model.replaceAll("_", " ")}</dd>
              </div>
              <div>
                <dt>surfaces</dt>
                <dd>{formatCrawlerList(app.surfaces)}</dd>
              </div>
              <div>
                <dt>database</dt>
                <dd>{formatDatabaseRequirement(app)}</dd>
              </div>
              <div>
                <dt>ram</dt>
                <dd>{getRamTier(app)}</dd>
              </div>
              <div>
                <dt>storage</dt>
                <dd>{getStorageTier(app)}</dd>
              </div>
              <div>
                <dt>maintenance</dt>
                <dd>{app.maintenance_status}</dd>
              </div>
              <div>
                <dt>latest release</dt>
                <dd>{app.github_latest_release ?? "unknown"}</dd>
              </div>
              <div>
                <dt>latest release date</dt>
                <dd>{formatDate(app.github_latest_release_at)}</dd>
              </div>
              <div>
                <dt>last commit</dt>
                <dd>{formatDate(app.github_last_commit_at)}</dd>
              </div>
              <div>
                <dt>primary language</dt>
                <dd>{app.github_primary_language ?? "unknown"}</dd>
              </div>
              <div>
                <dt>github topics</dt>
                <dd>{formatCrawlerList(app.github_topics)}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </details>
  );
}

function filterApps(apps: DirectoryApp[], params: SearchParams) {
  const query = getString(params, "q").trim();
  const categories = getValues(params, "category");
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

function CheckboxGroup({
  title,
  name,
  options,
  selected,
}: {
  title: string;
  name: string;
  options: FilterOption[];
  selected: string[];
}) {
  return (
    <fieldset className="filter-group">
      <legend>{title}</legend>
      <div className="filter-options">
        {options.map((option) => (
          <label key={option.value}>
            <input
              defaultChecked={selected.includes(option.value)}
              name={name}
              type="checkbox"
              value={option.value}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function TagSelectGroup({
  title,
  name,
  options,
  selected,
}: {
  title: string;
  name: string;
  options: FilterOption[];
  selected: string[];
}) {
  const selectedSet = new Set(selected);
  const selectedOptions = selected
    .map((value) => options.find((option) => option.value === value))
    .filter((option): option is FilterOption => Boolean(option));

  return (
    <fieldset className="filter-group filter-tag-select" data-filter-tag-select data-name={name}>
      <legend>{title}</legend>
      <div className="custom-select">
        <button
          aria-expanded="false"
          className="custom-select-trigger"
          data-filter-select-trigger
          type="button"
        >
          <span>{`Add ${title.toLowerCase()}`}</span>
          <span className="custom-select-caret" aria-hidden="true" />
        </button>

        <div className="custom-select-menu" data-filter-select-menu hidden>
          {options.map((option) => (
            <button
              aria-pressed={selectedSet.has(option.value)}
              className={selectedSet.has(option.value) ? "active" : ""}
              data-filter-select-option
              data-label={option.label}
              data-value={option.value}
              key={option.value}
              type="button"
            >
              {option.iconKey ? <CategoryIcon iconKey={option.iconKey} /> : null}
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-tag-list" data-filter-tag-list>
        {selectedOptions.map((option) => (
          <span className="filter-tag" data-filter-tag data-value={option.value} key={option.value}>
            <input name={name} type="hidden" value={option.value} />
            {option.iconKey ? <CategoryIcon iconKey={option.iconKey} /> : null}
            <span>{option.label}</span>
            <button aria-label={`Remove ${option.label}`} data-filter-tag-remove type="button">
              ×
            </button>
          </span>
        ))}
      </div>
    </fieldset>
  );
}

function RadioGroup({
  title,
  name,
  options,
  selected,
}: {
  title: string;
  name: string;
  options: FilterOption[];
  selected: string;
}) {
  return (
    <fieldset className="filter-group">
      <legend>{title}</legend>
      <div className="filter-options">
        {options.map((option) => (
          <label key={option.value}>
            <input
              defaultChecked={selected === option.value}
              name={name}
              type="radio"
              value={option.value}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
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
}: {
  params: SearchParams;
  categoryMap: Map<string, string>;
}) {
  const chips: Array<{ href: string; key: string; label: string; value: string }> = [];
  const valueLabels = new Map([
    ["category", categoryMap],
    ["docker", dockerOptionLabels],
    ["ram", ramOptionLabels],
    ["storage", storageOptionLabels],
    ["maintenance", maintenanceOptionLabels],
    ["signal", signalOptionLabels],
  ]);

  for (const key of ["category", "docker", "ram", "storage", "maintenance", "signal"]) {
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
          href="https://github.com/version127/version127-datasets/tree/main/self-host-apps"
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
      <LiveFilterController />
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
          <div className="directory-results-header">
            <h1>
              Find <mark>apps that fit</mark> your server, storage, and setup comfort.
            </h1>
          </div>

          <ActiveFilters
            categoryMap={categoryMap}
            params={params}
          />

          {paginatedApps.length > 0 ? (
            <>
              <DirectoryAppBrowser apps={paginatedApps} />
              <DirectoryCrawlerRecords apps={paginatedApps} />
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
              <p>Try clearing one resource or health filter first.</p>
              <Link href="/self-host-apps">show all apps</Link>
            </div>
          )}
        </div>
    </AppShell>
  );
}
