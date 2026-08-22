import { Search, SquareTerminal } from "lucide-react";
import Link from "next/link";
import { getRequiredPublishedPage } from "@/lib/page-registry";
import {
  terminalAppCategories,
  terminalAppTypeLabels,
  type TerminalApp,
} from "@/lib/terminal-apps";
import { getTerminalApps } from "@/lib/terminal-apps";
import { AppShell, SidebarLabel } from "../../app-shell";
import { CategoryIcon } from "../../category-icon";
import { Doodle } from "../../doodle";
import { siteDoodleStarArt } from "../art/site--doodle-star";
import {
  sidebarPanelClassName,
  sidebarPanelHeadingClassName,
} from "../../sidebar-panel";
import { PageTitleIcon } from "../../page-title-icon";
import { SortDropdown } from "../self-host-apps/sort-dropdown";
import { CliAppBrowser } from "./cli-app-browser";
import { CliFilterController } from "./cli-filter-controller";
import {
  filterApps,
  getKnownValue,
  getPage,
  getString,
  getValues,
  paginationPages,
  sortApps,
  sortOptions,
  sortValues,
  type SearchParams,
} from "./filters";

export const dynamic = "force-dynamic";

type FilterOption = {
  count?: number;
  iconKey?: string | null;
  label: string;
  value: string;
};

const platformOptions: FilterOption[] = [
  { label: "Linux", value: "linux" },
  { label: "macOS", value: "macos" },
  { label: "Windows", value: "windows" },
  { label: "BSD", value: "bsd" },
  { label: "Web", value: "web" },
];

const pricingOptions: FilterOption[] = [
  { label: "Free", value: "free" },
  { label: "Freemium", value: "freemium" },
  { label: "Paid", value: "paid" },
  { label: "Subscription", value: "subscription" },
  { label: "Usage based", value: "usage_based" },
  { label: "Unknown", value: "unknown" },
];

const sourceModelOptions: FilterOption[] = [
  { label: "Open source", value: "open_source" },
  { label: "Source available", value: "source_available" },
  { label: "Freeware", value: "freeware" },
  { label: "Closed source", value: "closed_source" },
  { label: "Unknown", value: "unknown" },
];

const maintenanceOptions: FilterOption[] = [
  { label: "Active", value: "active" },
  { label: "Slow", value: "slow" },
  { label: "Stale", value: "stale" },
  { label: "Archived", value: "archived" },
  { label: "Unknown", value: "unknown" },
];

const pageSize = 30;

const typeLabels = new Map<string, string>(terminalAppTypeLabels);

const categoryMapStatic = new Map(
  terminalAppCategories.map((category) => [category.slug, category.name]),
);

const installLabels = new Map([
  ["brew", "Homebrew"],
  ["brew-cask", "Brew cask"],
  ["cargo", "cargo"],
  ["npm", "npm"],
  ["pip", "pip"],
  ["apt", "apt"],
  ["pacman", "pacman"],
  ["nix", "nix"],
  ["winget", "winget"],
  ["scoop", "scoop"],
  ["go", "go install"],
  ["binary", "binary"],
  ["docker", "Docker"],
  ["source", "from source"],
]);

function labelForValue(map: Map<string, string>, value: string) {
  return map.get(value) ?? value.replaceAll("_", " ");
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

function formatList(values: string[], labels?: Map<string, string>) {
  if (values.length === 0) {
    return "unknown";
  }

  return values.map((value) => labels?.get(value) ?? value.replaceAll("_", " ")).join(", ");
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
              <span>{option.label}</span>
              {typeof option.count === "number" ? (
                <small className="filter-option-count">{option.count.toLocaleString("en-US")}</small>
              ) : null}
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

function removeFilterHref(params: SearchParams, key: string, value?: string) {
  const next = new URLSearchParams();

  for (const [paramKey, paramValue] of Object.entries(params)) {
    const values = Array.isArray(paramValue) ? paramValue : paramValue ? [paramValue] : [];

    for (const current of values) {
      if (paramKey === "page") {
        continue;
      }

      if (paramKey === key && (!value || current === value)) {
        continue;
      }

      next.append(paramKey, current);
    }
  }

  const query = next.toString();
  return query ? `/cli-apps?${query}` : "/cli-apps";
}

function pageHref(params: SearchParams, page: number) {
  const next = new URLSearchParams();

  for (const [paramKey, paramValue] of Object.entries(params)) {
    if (paramKey === "page") {
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

  const query = next.toString();
  return query ? `/cli-apps?${query}` : "/cli-apps";
}

function ActiveFilters({
  params,
  categoryMap,
}: {
  params: SearchParams;
  categoryMap: Map<string, string>;
}) {
  const chips: Array<{ href: string; key: string; label: string }> = [];
  const groupLabels = new Map([
    ["type", typeLabels],
    ["category", categoryMap],
    ["platform", new Map(platformOptions.map((o) => [o.value, o.label]))],
    ["install", installLabels],
    ["pricing", new Map(pricingOptions.map((o) => [o.value, o.label]))],
    ["source", new Map(sourceModelOptions.map((o) => [o.value, o.label]))],
    ["maintenance", new Map(maintenanceOptions.map((o) => [o.value, o.label]))],
    ["language", new Map()],
    ["license", new Map()],
  ]);
  const groupNames = new Map([
    ["type", "App type"],
    ["category", "Category"],
    ["platform", "Platform"],
    ["install", "Install"],
    ["pricing", "Pricing"],
    ["source", "Source model"],
    ["maintenance", "Health"],
    ["language", "Language"],
    ["license", "License"],
  ]);

  for (const [key, valueLabels] of groupLabels) {
    for (const value of getValues(params, key)) {
      chips.push({
        href: removeFilterHref(params, key, value),
        key,
        label: `${groupNames.get(key) ?? key}: ${valueLabels.size > 0 ? labelForValue(valueLabels, value) : value}`,
      });
    }
  }

  const query = getString(params, "q").trim();

  if (query) {
    chips.unshift({
      href: removeFilterHref(params, "q"),
      key: "q",
      label: `Search: ${query}`,
    });
  }

  if (chips.length === 0) {
    return null;
  }

  return (
    <div aria-label="Active filters" className="active-filter-row">
      {chips.map((chip) => (
        <Link href={chip.href} key={`${chip.key}-${chip.label}`}>
          {chip.label}
          <span>×</span>
        </Link>
      ))}
      <Link className="clear-filters" href="/cli-apps">
        clear all
      </Link>
    </div>
  );
}

function CrawlerRecords({ apps }: { apps: TerminalApp[] }) {
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
                <dt>aliases</dt>
                <dd>{formatList(app.aliases)}</dd>
              </div>
              <div>
                <dt>types</dt>
                <dd>{formatList([app.primary_type, ...app.additional_types])}</dd>
              </div>
              <div>
                <dt>categories</dt>
                <dd>{formatList(app.categories, categoryMapStatic)}</dd>
              </div>
              <div>
                <dt>platforms</dt>
                <dd>{formatList(app.platforms)}</dd>
              </div>
              <div>
                <dt>language</dt>
                <dd>{app.language ?? "unknown"}</dd>
              </div>
              <div>
                <dt>install</dt>
                <dd>{formatList(app.install_methods, installLabels)}</dd>
              </div>
              <div>
                <dt>website</dt>
                <dd>{app.website_url ? <a href={app.website_url}>{app.website_url}</a> : "none published"}</dd>
              </div>
              <div>
                <dt>docs</dt>
                <dd>{app.docs_url ? <a href={app.docs_url}>{app.docs_url}</a> : "none published"}</dd>
              </div>
              <div>
                <dt>repository</dt>
                <dd>{app.repository_url ? <a href={app.repository_url}>{app.repository_url}</a> : "no public repository"}</dd>
              </div>
              <div>
                <dt>source model</dt>
                <dd>{app.source_model.replaceAll("_", " ")}</dd>
              </div>
              <div>
                <dt>pricing</dt>
                <dd>{app.pricing_model.replaceAll("_", " ")}</dd>
              </div>
              <div>
                <dt>license</dt>
                <dd>{app.license ?? "license unknown"}</dd>
              </div>
              <div>
                <dt>maintenance</dt>
                <dd>{app.maintenance_status}</dd>
              </div>
              <div>
                <dt>latest version</dt>
                <dd>{app.latest_version ?? "unknown"}</dd>
              </div>
              <div>
                <dt>stars</dt>
                <dd>{app.stars?.toLocaleString("en-US") ?? "not applicable"}</dd>
              </div>
              <div>
                <dt>last commit</dt>
                <dd>{formatDate(app.last_commit_at)}</dd>
              </div>
              <div>
                <dt>verified</dt>
                <dd>{formatDate(app.last_verified_at)}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </details>
  );
}

export default async function CliAppsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const [apps, registryPage] = await Promise.all([
    getTerminalApps(),
    getRequiredPublishedPage("cli-apps"),
  ]);

  const sort = getKnownValue(params, "sort", sortValues) || "popular";
  const filteredApps = sortApps(filterApps(apps, params), sort);
  const totalPages = Math.max(1, Math.ceil(filteredApps.length / pageSize));
  const currentPage = Math.min(getPage(params), totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedApps = filteredApps.slice(startIndex, startIndex + pageSize);

  const categoryCounts = new Map<string, number>();
  for (const app of apps) {
    for (const category of app.categories) {
      categoryCounts.set(category, (categoryCounts.get(category) ?? 0) + 1);
    }
  }
  const categoryOptions = terminalAppCategories
    .filter((category) => categoryCounts.has(category.slug))
    .map((category) => ({
      count: categoryCounts.get(category.slug),
      iconKey: category.icon_key,
      label: category.name,
      value: category.slug,
    }));
  const categoryMap = new Map(categoryOptions.map((option) => [option.value, option.label]));

  const typeCounts = new Map<string, number>();
  for (const app of apps) {
    typeCounts.set(app.primary_type, (typeCounts.get(app.primary_type) ?? 0) + 1);
    for (const type of app.additional_types) {
      typeCounts.set(type, (typeCounts.get(type) ?? 0) + 1);
    }
  }
  const typeFilterOptions = [...typeCounts.entries()]
    .map(([value, count]) => ({
      count,
      label: labelForValue(typeLabels, value),
      value,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

  const installCounts = new Map<string, number>();
  for (const app of apps) {
    for (const method of app.install_methods) {
      installCounts.set(method, (installCounts.get(method) ?? 0) + 1);
    }
  }
  const installOptions = [...installCounts.entries()]
    .map(([value, count]) => ({
      count,
      label: installLabels.get(value) ?? value,
      value,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

  const platformFilterOptions = platformOptions.map((option) => ({
    ...option,
    count: apps.filter((app) => app.platforms.includes(option.value)).length,
  }));

  const languageCounts = new Map<string, number>();
  for (const app of apps) {
    const key = (app.language ?? "unknown").toLowerCase();
    languageCounts.set(key, (languageCounts.get(key) ?? 0) + 1);
  }
  const languageOptions: FilterOption[] = [...languageCounts.entries()]
    .map(([value, count]) => ({
      count,
      label: value === "unknown" ? "Unknown" : value,
      value,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

  const licenseCounts = new Map<string, number>();
  for (const app of apps) {
    const key = (app.license ?? "unknown").toLowerCase();
    licenseCounts.set(key, (licenseCounts.get(key) ?? 0) + 1);
  }
  const licenseOptions: FilterOption[] = [...licenseCounts.entries()]
    .map(([value, count]) => ({
      count,
      label: value === "unknown" ? "Unknown" : value,
      value,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

  const sidebar = (
    <form
      action="/cli-apps"
      className={sidebarPanelClassName}
      data-default-sort="popular"
      data-live-filter-form
    >
      <div className={sidebarPanelHeadingClassName}>
        <SidebarLabel>{registryPage.label}</SidebarLabel>
      </div>

      <label className="directory-search">
        <span>Search</span>
        <span className="directory-search-field">
          <Search aria-hidden="true" size={16} strokeWidth={2.2} />
          <input
            defaultValue={getString(params, "q")}
            name="q"
            placeholder="lazygit, kubectl, ghostty..."
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
        name="type"
        options={typeFilterOptions}
        selected={getValues(params, "type")}
        title="App type"
      />

      <CheckboxGroup
        name="platform"
        options={platformFilterOptions}
        selected={getValues(params, "platform")}
        title="Platform"
      />

      <TagSelectGroup
        name="install"
        options={installOptions}
        selected={getValues(params, "install")}
        title="Install"
      />

      <TagSelectGroup
        name="language"
        options={languageOptions}
        selected={getValues(params, "language")}
        title="Language"
      />

      <TagSelectGroup
        name="license"
        options={licenseOptions}
        selected={getValues(params, "license")}
        title="License"
      />

      <TagSelectGroup
        name="pricing"
        options={pricingOptions}
        selected={getValues(params, "pricing")}
        title="Pricing"
      />

      <TagSelectGroup
        name="source"
        options={sourceModelOptions}
        selected={getValues(params, "source")}
        title="Source model"
      />

      <RadioGroup
        name="maintenance"
        options={maintenanceOptions}
        selected={getString(params, "maintenance")}
        title="Health"
      />

      <div className="filter-actions">
        <Link href="/cli-apps">reset</Link>
      </div>
      <CliFilterController />
    </form>
  );

  return (
    <AppShell
      mainLabel="Terminal apps directory"
      menuLabel="Filters"
      sidebar={sidebar}
      sidebarLabel="Terminal app filters"
    >
      <div className="directory-results">
        <div className="directory-results-header">
          <h1>
            <PageTitleIcon>
              <SquareTerminal strokeWidth={2.2} />
            </PageTitleIcon>{" "}
            A directory of <mark>terminal apps</mark> worth knowing
          </h1>
          <p className="cli-directory-lede">
            Command-line tools, TUI apps, shells, prompts, and AI agents that run in or beside a
            terminal. The list includes open-source and closed tools, free and paid ones.
          </p>
        </div>

        <ActiveFilters categoryMap={categoryMap} params={params} />

        {paginatedApps.length > 0 ? (
          <>
            <p className="cli-result-count">
              Showing {paginatedApps.length.toLocaleString("en-US")} of{" "}
              {filteredApps.length.toLocaleString("en-US")} apps
            </p>
            <CliAppBrowser apps={paginatedApps} />
            <CrawlerRecords apps={paginatedApps} />
            {totalPages > 1 ? (
              <nav aria-label="Terminal app pages" className="directory-pagination">
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
            <Doodle svg={siteDoodleStarArt} />
            <h2>No terminal apps match those filters</h2>
            <p>Try clearing one filter first.</p>
            <Link href="/cli-apps">show all apps</Link>
          </div>
        )}
      </div>
    </AppShell>
  );
}
