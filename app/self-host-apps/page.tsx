import Link from "next/link";
import { getDirectoryApps, type DirectoryApp } from "@/lib/apps";
import { SiteNav } from "../site-nav";
import {
  DirectoryAppCard,
  getRamTier,
  getStorageTier,
  hasMobileApp,
} from "./directory-app-card";

export const dynamic = "force-dynamic";

type SearchParams = Record<string, string | string[] | undefined>;

type FilterOption = {
  label: string;
  value: string;
};

const dockerOptions: FilterOption[] = [
  { label: "Official Docker", value: "official" },
  { label: "Community Docker", value: "community" },
  { label: "No Docker", value: "none" },
  { label: "Unknown", value: "unknown" },
];

const ramOptions: FilterOption[] = [
  { label: "Under 1GB", value: "under 1gb" },
  { label: "1-2GB", value: "1-2gb" },
  { label: "2-4GB", value: "2-4gb" },
  { label: "4GB+", value: "4gb+" },
  { label: "Unknown", value: "unknown" },
];

const storageOptions: FilterOption[] = [
  { label: "Tiny", value: "tiny" },
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
  { label: "Very high", value: "very high" },
  { label: "Depends", value: "depends" },
];

const maintenanceOptions: FilterOption[] = [
  { label: "Active", value: "active" },
  { label: "Slow but alive", value: "slow_but_alive" },
  { label: "Possibly stale", value: "possibly_stale" },
  { label: "Archived", value: "archived" },
  { label: "Unknown", value: "unknown" },
];

const sortOptions: FilterOption[] = [
  { label: "Most popular", value: "popular" },
  { label: "Name", value: "name" },
  { label: "Lowest RAM", value: "lowest-ram" },
  { label: "Easiest care", value: "easiest" },
  { label: "Healthiest", value: "healthy" },
];

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

function matchesSearch(app: DirectoryApp, query: string) {
  if (!query) {
    return true;
  }

  const haystack = [
    app.name,
    app.description,
    app.category_name,
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

function sortApps(apps: DirectoryApp[], sort: string) {
  return [...apps].sort((a, b) => {
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
  });
}

function filterApps(apps: DirectoryApp[], params: SearchParams) {
  const query = getString(params, "q").trim();
  const categories = getValues(params, "category");
  const docker = getValues(params, "docker");
  const ram = getValues(params, "ram");
  const storage = getValues(params, "storage");
  const maintenance = getValues(params, "maintenance");
  const signals = getValues(params, "signal");

  return apps.filter((app) => {
    if (!matchesSearch(app, query)) {
      return false;
    }

    if (categories.length > 0 && !categories.includes(app.category_slug ?? "")) {
      return false;
    }

    if (docker.length > 0 && !docker.includes(app.docker_support ?? "unknown")) {
      return false;
    }

    if (ram.length > 0 && !ram.includes(getRamTier(app))) {
      return false;
    }

    if (storage.length > 0 && !storage.includes(getStorageTier(app))) {
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

  const query = next.toString();
  return query ? `/self-host-apps?${query}` : "/self-host-apps";
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

function ActiveFilters({
  params,
  categoryMap,
}: {
  params: SearchParams;
  categoryMap: Map<string, string>;
}) {
  const chips: Array<{ key: string; value: string; label: string }> = [];

  for (const key of ["category", "docker", "ram", "storage", "maintenance", "signal"]) {
    for (const value of getValues(params, key)) {
      chips.push({
        key,
        value,
        label: key === "category" ? categoryMap.get(value) ?? value : value.replaceAll("_", " "),
      });
    }
  }

  const query = getString(params, "q").trim();

  if (query) {
    chips.unshift({ key: "q", value: query, label: `search: ${query}` });
  }

  if (chips.length === 0) {
    return null;
  }

  return (
    <div className="active-filter-row" aria-label="Active filters">
      {chips.map((chip) => (
        <Link href={removeFilterHref(params, chip.key, chip.value)} key={`${chip.key}-${chip.value}`}>
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
  const filteredApps = sortApps(filterApps(apps, params), sort);
  const categoryOptions = [...new Map(
    apps
      .filter((app) => app.category_slug && app.category_name)
      .map((app) => [app.category_slug as string, app.category_name as string]),
  )]
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label));
  const categoryMap = new Map(categoryOptions.map((option) => [option.value, option.label]));

  return (
    <>
      <SiteNav />

      <main className="site-shell directory-shell">
        <section className="directory-page">
          <aside className="directory-sidebar" aria-label="Self-hosted app filters">
            <form className="directory-filter-panel" action="/self-host-apps">
              <div className="filter-panel-heading">
                <p>directory controls</p>
                <h1>self-hosted apps</h1>
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

              <label className="directory-select">
                <span>Sort</span>
                <select defaultValue={sort} name="sort">
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <CheckboxGroup
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
              <CheckboxGroup
                name="ram"
                options={ramOptions}
                selected={getValues(params, "ram")}
                title="RAM"
              />
              <CheckboxGroup
                name="storage"
                options={storageOptions}
                selected={getValues(params, "storage")}
                title="Storage"
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
                <button type="submit">apply filters</button>
                <Link href="/self-host-apps">reset</Link>
              </div>
            </form>
          </aside>

          <section className="directory-results" aria-label="Self-hosted app results">
            <div className="directory-results-header">
              <div>
                <p>{filteredApps.length} apps found</p>
                <h2>Find apps that fit your server, storage, and setup comfort.</h2>
              </div>
              <Link href="/self-host-apps?docker=official&sort=healthy">healthy docker apps</Link>
            </div>

            <ActiveFilters categoryMap={categoryMap} params={params} />

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
          </section>
        </section>
      </main>
    </>
  );
}
