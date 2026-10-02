"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import type { ReactNode } from "react";
import { Pagination } from "@/app/ui/pagination";
import { StatePanel } from "@/app/ui/state-panel";
import { sidebarPanelClassName, sidebarPanelHeadingClassName } from "@/app/ui/site/sidebar-panel";
import { DirectoryFilterController } from "@/app/ui/directories/directory-filter-controller";
import {
  DirectoryCheckboxGroup as CheckboxGroup,
  DirectoryRadioGroup as RadioGroup,
  DirectoryTagSelectGroup as TagSelectGroup,
  type DirectoryFilterOption as FilterOption,
} from "@/app/ui/directories/directory-filters";
import { pageParamHref, removeParamHref, type DirectoryParams } from "@/app/ui/directories/directory-params";
import { hasDirectoryParams, useDirectoryQuery } from "@/app/ui/directories/directory-query";
import { useDirectoryIndex } from "@/app/ui/directories/directory-index";
import { SortDropdown } from "@/app/ui/directories/directory-sort-dropdown";
import type { TerminalApp } from "@/lib/terminal-apps";
import { terminalAppTypeLabels } from "@/lib/terminal-app-taxonomy";
import { CliAppBrowser } from "./cli-app-browser";
import {
  cliAppPageSize,
  installLabels,
  labelForValue,
  maintenanceOptions,
  platformOptions,
  pricingOptions,
  sourceModelOptions,
} from "./cli-app-options";
import { filterApps, getKnownValue, getPage, getString, getValues, sortApps, sortOptions, sortValues } from "./filters";

const route = "/cli-apps";
const paramKeys = ["q", "sort", "page", "category", "type", "platform", "install", "language", "license", "pricing", "source", "maintenance"] as const;

export type CliAppFilterOptions = {
  category: FilterOption[];
  install: FilterOption[];
  language: FilterOption[];
  license: FilterOption[];
  platform: FilterOption[];
  type: FilterOption[];
};

export function CliAppFilters({ heading, options }: { heading: ReactNode; options: CliAppFilterOptions }) {
  const { formKey, params } = useDirectoryQuery();
  return (
    <form action={route} className={sidebarPanelClassName} data-default-sort="popular" data-live-filter-form key={formKey}>
      <div className={sidebarPanelHeadingClassName}>{heading}</div>

      <label className="directory-search">
        <span>Search</span>
        <span className="directory-search-field">
          <Search aria-hidden="true" size={16} strokeWidth={2.2} />
          <input defaultValue={getString(params, "q")} name="q" placeholder="lazygit, kubectl, ghostty..." type="search" />
        </span>
      </label>

      <SortDropdown name="sort" options={sortOptions} value={getKnownValue(params, "sort", sortValues) || "popular"} />
      <TagSelectGroup name="category" options={options.category} selected={getValues(params, "category")} title="Category" />
      <TagSelectGroup name="type" options={options.type} selected={getValues(params, "type")} title="App type" />
      <CheckboxGroup name="platform" options={options.platform} selected={getValues(params, "platform")} title="Platform" />
      <TagSelectGroup name="install" options={options.install} selected={getValues(params, "install")} title="Install" />
      <TagSelectGroup name="language" options={options.language} selected={getValues(params, "language")} title="Language" />
      <TagSelectGroup name="license" options={options.license} selected={getValues(params, "license")} title="License" />
      <TagSelectGroup name="pricing" options={pricingOptions} selected={getValues(params, "pricing")} title="Pricing" />
      <TagSelectGroup name="source" options={sourceModelOptions} selected={getValues(params, "source")} title="Source model" />
      <RadioGroup name="maintenance" options={maintenanceOptions} selected={getString(params, "maintenance")} title="Health" />

      <div className="filter-actions">
        <Link href={route}>reset</Link>
      </div>
      <DirectoryFilterController />
    </form>
  );
}

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

function ActiveFilters({ categoryLabels, params }: { categoryLabels: Record<string, string>; params: DirectoryParams }) {
  const groupLabels = new Map<string, Map<string, string>>([
    ["type", new Map(terminalAppTypeLabels)],
    ["category", new Map(Object.entries(categoryLabels))],
    ["platform", new Map(platformOptions.map((o) => [o.value, o.label]))],
    ["install", installLabels],
    ["pricing", new Map(pricingOptions.map((o) => [o.value, o.label]))],
    ["source", new Map(sourceModelOptions.map((o) => [o.value, o.label]))],
    ["maintenance", new Map(maintenanceOptions.map((o) => [o.value, o.label]))],
    ["language", new Map()],
    ["license", new Map()],
  ]);
  const chips: Array<{ href: string; key: string; label: string }> = [];

  for (const [key, valueLabels] of groupLabels) {
    for (const value of getValues(params, key)) {
      chips.push({
        href: removeParamHref(route, params, key, value),
        key,
        label: `${groupNames.get(key) ?? key}: ${valueLabels.size > 0 ? labelForValue(valueLabels, value) : value}`,
      });
    }
  }

  const query = getString(params, "q").trim();
  if (query) chips.unshift({ href: removeParamHref(route, params, "q"), key: "q", label: `Search: ${query}` });
  if (chips.length === 0) return null;

  return (
    <div aria-label="Active filters" className="active-filter-row">
      {chips.map((chip) => (
        <Link href={chip.href} key={`${chip.key}-${chip.label}`}>
          {chip.label}
          <span>×</span>
        </Link>
      ))}
      <Link className="clear-filters" href={route}>
        clear all
      </Link>
    </div>
  );
}

// The static HTML shows the default view. Filters, sort, and ?page= from the URL load
// the full list from a cached JSON route and apply in the browser.
export function CliAppResults({ firstPage, total, categoryLabels, emptyVisual }: {
  firstPage: TerminalApp[];
  total: number;
  categoryLabels: Record<string, string>;
  emptyVisual: ReactNode;
}) {
  const { params } = useDirectoryQuery();
  const filtering = hasDirectoryParams(params, paramKeys);
  const { failed, records } = useDirectoryIndex<TerminalApp>({ url: "/api/cli-apps/index" }, filtering);

  if (filtering && !records) {
    return <>
      <ActiveFilters categoryLabels={categoryLabels} params={params} />
      {failed
        ? <StatePanel action={<Link href={route}>show all apps</Link>} state="error" title="Filters could not be loaded"><p>Reload the page to try again.</p></StatePanel>
        : <StatePanel state="loading" title="Loading apps" />}
    </>;
  }

  const sort = getKnownValue(params, "sort", sortValues) || "popular";
  const filteredApps = filtering && records ? sortApps(filterApps(records, params), sort) : null;
  const count = filteredApps ? filteredApps.length : total;
  const totalPages = Math.max(1, Math.ceil(count / cliAppPageSize));
  const currentPage = Math.min(getPage(params), totalPages);
  const startIndex = (currentPage - 1) * cliAppPageSize;
  const paginatedApps = filteredApps ? filteredApps.slice(startIndex, startIndex + cliAppPageSize) : firstPage;

  return (
    <>
      <ActiveFilters categoryLabels={categoryLabels} params={params} />
      {paginatedApps.length > 0 ? (
        <>
          <CliAppBrowser apps={paginatedApps} />
          {totalPages > 1 ? (
            <Pagination ariaLabel="Terminal app pages" currentPage={currentPage} hrefForPage={(page) => pageParamHref(route, params, page)} totalPages={totalPages} />
          ) : null}
        </>
      ) : (
        <StatePanel action={<Link href={route}>show all apps</Link>} title="No terminal apps match those filters" visual={emptyVisual}>
          <p>Try clearing one filter first.</p>
        </StatePanel>
      )}
    </>
  );
}
