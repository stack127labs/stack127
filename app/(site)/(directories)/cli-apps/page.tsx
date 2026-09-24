import { StatePanel } from "@/app/ui/state-panel";
import { Pagination } from "@/app/ui/pagination";
import { PageCanvas } from "@/app/ui/site/page-canvas";
import { Search, SquareTerminal } from "lucide-react";
import Link from "next/link";
import { getRequiredPublishedPage } from "@/lib/page-registry";
import {
  terminalAppCategories,
  terminalAppTypeLabels,
  type TerminalApp,
} from "@/lib/terminal-apps";
import { getTerminalApps } from "@/lib/terminal-apps";
import { AppShell, SidebarLabel } from "@/app/ui/site/app-shell";
import {
  DirectoryCheckboxGroup as CheckboxGroup,
  DirectoryRadioGroup as RadioGroup,
  DirectoryTagSelectGroup as TagSelectGroup,
  type DirectoryFilterOption as FilterOption,
} from "../../../ui/directories/directory-filters";
import { Doodle } from "@/app/ui/site/doodle";
import { siteDoodleStarArt } from "../../art/site--doodle-star";
import {
  sidebarPanelClassName,
  sidebarPanelHeadingClassName,
} from "@/app/ui/site/sidebar-panel";
import { PageTitleIcon } from "@/app/ui/site/page-title-icon";
import { PageHeader } from "@/app/ui/site/page-header";
import { EntryHero } from "@/app/ui/site/entry-hero";
import { siteSpotCliAppsArt } from "../../art/site--spot-cli-apps";
import { SortDropdown } from "../../../ui/directories/directory-sort-dropdown";
import { CliAppBrowser } from "./cli-app-browser";
import { DirectoryFilterController } from "../../../ui/directories/directory-filter-controller";
import {
  filterApps,
  getKnownValue,
  getPage,
  getString,
  getValues,
  sortApps,
  sortOptions,
  sortValues,
  type SearchParams,
} from "./filters";


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
      <DirectoryFilterController />
    </form>
  );

  return (
    <AppShell
      mainLabel="Terminal apps directory"
      menuLabel="Filters"
      sidebar={sidebar}
      sidebarLabel="Terminal app filters"
    >
      <EntryHero art={siteSpotCliAppsArt}>
        <PageHeader>
          <h1>
            <PageTitleIcon>
              <SquareTerminal strokeWidth={2.2} />
            </PageTitleIcon>{" "}
            A directory of <mark>terminal apps</mark> worth knowing
          </h1>
          <p>
            Command-line tools, TUI apps, shells, prompts, and AI agents that run in or beside a
            terminal. The list includes open-source and closed tools, free and paid ones.
          </p>
        </PageHeader>
      </EntryHero>
      <PageCanvas as="div" flow className="directory-results">
        <ActiveFilters categoryMap={categoryMap} params={params} />

        {paginatedApps.length > 0 ? (
          <>
            <CliAppBrowser apps={paginatedApps} />
            {totalPages > 1 ? (
              <Pagination ariaLabel="Terminal app pages" currentPage={currentPage} hrefForPage={(page) => pageHref(params, page)} totalPages={totalPages} />
            ) : null}
          </>
        ) : (
          <StatePanel action={<Link href="/cli-apps">show all apps</Link>} title="No terminal apps match those filters" visual={<Doodle svg={siteDoodleStarArt} />}>
            <p>Try clearing one filter first.</p>
          </StatePanel>
        )}
      </PageCanvas>
    </AppShell>
  );
}
