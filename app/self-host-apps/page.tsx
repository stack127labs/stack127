import Link from "next/link";
import type { CSSProperties } from "react";
import { getDirectoryApps, type DirectoryApp } from "@/lib/apps";
import { AppShell } from "../app-shell";
import { CategoryIcon } from "../category-icon";
import {
  DirectoryAppCard,
  getRamTier,
  getStorageTier,
  hasMobileApp,
} from "./directory-app-card";
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
  { label: "Very high", value: "very high" },
];

const maintenanceOptions: FilterOption[] = [
  { label: "Active", value: "active" },
  { label: "Slow but alive", value: "slow_but_alive" },
  { label: "Possibly stale", value: "possibly_stale" },
  { label: "Archived", value: "archived" },
];

const sortOptions: FilterOption[] = [
  { label: "Most popular", value: "popular" },
  { label: "Name", value: "name" },
  { label: "Lowest RAM", value: "lowest-ram" },
  { label: "Easiest care", value: "easiest" },
  { label: "Healthiest", value: "healthy" },
];

const starsOptions: FilterOption[] = [
  { label: "0+ stars", value: "0" },
  { label: "1K+", value: "1000" },
  { label: "5K+", value: "5000" },
  { label: "10K+", value: "10000" },
  { label: "50K+", value: "50000" },
  { label: "100K+", value: "100000" },
];

const ramTierOrder = ramOptions.map((option) => option.value);
const storageTierOrder = storageOptions.map((option) => option.value);
const starsValues = starsOptions.map((option) => Number(option.value));

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
  ["license", "License"],
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

function getNumberParam(params: SearchParams, key: string) {
  const value = Number(getString(params, key));

  return Number.isFinite(value) ? value : null;
}

function getStarsMin(params: SearchParams) {
  const value = getNumberParam(params, "stars_min") ?? 0;

  return starsValues.includes(value) ? value : 0;
}

function formatStars(value: number) {
  return new Intl.NumberFormat("en", {
    maximumFractionDigits: 1,
    notation: value >= 10000 ? "compact" : "standard",
  }).format(value);
}

function formatStarsMinimum(value: number) {
  const option = starsOptions.find((starsOption) => Number(starsOption.value) === value);

  return option?.label ?? (value > 0 ? `${formatStars(value)}+` : "0+ stars");
}

function matchesSearch(app: DirectoryApp, query: string) {
  if (!query) {
    return true;
  }

  const haystack = [
    app.name,
    app.description,
    ...app.categories.map((category) => category.name),
    ...app.good_fit,
    ...app.watch_outs,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(query.toLowerCase());
}

function maintenanceValue(app: DirectoryApp) {
  if (app.actively_maintained) {
    return "active";
  }

  return app.maintenance_status ?? "unknown";
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
    return (a.ram_recommended_mb ?? Number.MAX_SAFE_INTEGER) -
      (b.ram_recommended_mb ?? Number.MAX_SAFE_INTEGER);
  }

  if (sort === "easiest") {
    const order = ["very_easy", "easy", "moderate", "hard", "expert", "unknown"];
    return order.indexOf(a.backup_difficulty ?? "unknown") -
      order.indexOf(b.backup_difficulty ?? "unknown");
  }

  if (sort === "healthy") {
    return Number(b.actively_maintained) - Number(a.actively_maintained) ||
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

function filterApps(apps: DirectoryApp[], params: SearchParams) {
  const query = getString(params, "q").trim();
  const categories = getValues(params, "category");
  const dockerSupported = getValues(params, "docker").includes("supported");
  const licenses = getValues(params, "license");
  const ram = getKnownValue(params, "ram", ramTierOrder);
  const storage = getKnownValue(params, "storage", storageTierOrder);
  const maintenance = getValues(params, "maintenance");
  const signals = getValues(params, "signal");
  const starsMin = getStarsMin(params);

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

    if (licenses.length > 0 && !licenses.includes(app.license ?? "")) {
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

    if (starsMin > 0 && (app.github_stars === null || app.github_stars < starsMin)) {
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
      if (paramKey === key && (!value || current === value)) {
        continue;
      }

      next.append(paramKey, current);
    }
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

function StarsMinSlider({
  options,
  selected,
}: {
  options: FilterOption[];
  selected: number;
}) {
  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => Number(option.value) === selected),
  );
  const sliderPosition = `${selectedIndex * (100 / (options.length - 1))}%`;
  const selectedLabel = options[selectedIndex]?.label ?? "0+ stars";

  return (
    <fieldset className="filter-group stars-slider-group">
      <legend>GitHub stars</legend>

      <div
        className="stars-slider-shell"
        data-stars-slider-root
        style={
          {
            "--stars-slider-fill-left": sliderPosition,
            "--stars-slider-position": sliderPosition,
          } as CSSProperties
        }
      >
        <input
          data-stars-slider-value
          defaultValue={selected > 0 ? selected : ""}
          name="stars_min"
          type="hidden"
        />
        <div className="storage-slider-current" aria-live="polite">
          <span data-stars-slider-current>{selectedLabel}</span>
        </div>
        <div className="stars-slider-bar">
          <div className="stars-slider-track" aria-hidden="true">
            <i className="stars-slider-fill" />
            {options.map((option, index) => (
              <span
                className={index >= selectedIndex ? "active" : ""}
                data-stars-slider-step
                key={option.value}
                style={
                  {
                    "--stars-slider-step-position": `${index * (100 / (options.length - 1))}%`,
                  } as CSSProperties
                }
              />
            ))}
            <i className="stars-slider-thumb" />
          </div>
          <input
            aria-label="Minimum GitHub stars"
            className="stars-slider-range"
            data-stars-slider
            data-stars-slider-labels={options.map((option) => option.label).join("|")}
            data-stars-slider-values={options.map((option) => option.value).join("|")}
            defaultValue={selectedIndex}
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
  licenseMap,
  params,
  categoryMap,
}: {
  licenseMap: Map<string, string>;
  params: SearchParams;
  categoryMap: Map<string, string>;
}) {
  const chips: Array<{ href: string; key: string; label: string; value: string }> = [];
  const valueLabels = new Map([
    ["category", categoryMap],
    ["docker", dockerOptionLabels],
    ["license", licenseMap],
    ["ram", ramOptionLabels],
    ["storage", storageOptionLabels],
    ["maintenance", maintenanceOptionLabels],
    ["signal", signalOptionLabels],
  ]);

  for (const key of ["category", "docker", "license", "ram", "storage", "maintenance", "signal"]) {
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

  const starsMin = getStarsMin(params);

  if (starsMin > 0) {
    chips.push({
      href: removeFilterHref(params, "stars_min"),
      key: "stars",
      label: `Stars: ${formatStarsMinimum(starsMin)}`,
      value: String(starsMin),
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
  const apps = await getDirectoryApps();
  const sort = getString(params, "sort") || "popular";
  const selectedRam = getKnownValue(params, "ram", ramTierOrder);
  const selectedStorage = getKnownValue(params, "storage", storageTierOrder);
  const selectedStarsMin = getStarsMin(params);
  const filteredApps = sortApps(filterApps(apps, params), sort, params);
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
  const licenseOptions = [...new Set(apps.map((app) => app.license).filter(Boolean) as string[])]
    .map((license) => ({ label: license, value: license }))
    .sort((a, b) => a.label.localeCompare(b.label));
  const licenseMap = new Map(licenseOptions.map((option) => [option.value, option.label]));

  const sidebar = (
    <form
      action="/self-host-apps"
      className="directory-filter-panel"
      data-default-sort="popular"
      data-live-filter-form
    >
      <div className="filter-panel-heading">
        <h1>self-hosted apps.</h1>
      </div>

      <label className="directory-search">
        <span>Search</span>
        <input
          defaultValue={getString(params, "q")}
          name="q"
          placeholder="Immich, DNS, photos..."
          type="search"
        />
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
      <StarsMinSlider options={starsOptions} selected={selectedStarsMin} />
      <TagSelectGroup
        name="license"
        options={licenseOptions}
        selected={getValues(params, "license")}
        title="License"
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
      sidebar={sidebar}
      sidebarLabel="Self-hosted app filters"
    >
      <div className="directory-results">
        <div className="directory-results-header">
          <div>
            <h2>Find apps that fit your server, storage, and setup comfort.</h2>
          </div>
        </div>

        <ActiveFilters
          categoryMap={categoryMap}
          licenseMap={licenseMap}
          params={params}
        />

        {filteredApps.length > 0 ? (
          <div className="directory-card-grid">
            {filteredApps.map((app) => (
              <DirectoryAppCard app={app} key={app.slug} />
            ))}
          </div>
        ) : (
          <div className="directory-empty">
            <h2>No apps match those filters.</h2>
            <p>Try clearing one resource or health filter first.</p>
            <Link href="/self-host-apps">show all apps</Link>
          </div>
        )}
      </div>
    </AppShell>
  );
}
