"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Search } from "@/app/ui/icons";
import { Pagination } from "@/app/ui/pagination";
import { StatePanel } from "@/app/ui/state-panel";
import { sidebarPanelClassName, sidebarPanelHeadingClassName } from "@/app/ui/site/sidebar-panel";
import { DirectoryFilterController } from "@/app/ui/directories/directory-filter-controller";
import { DirectoryCheckboxGroup as CheckboxGroup, DirectoryRadioGroup as RadioGroup } from "@/app/ui/directories/directory-filters";
import { pageParamHref, paramString, paramValues, removeParamHref, type DirectoryParams } from "@/app/ui/directories/directory-params";
import { hasDirectoryParams, useDirectoryQuery } from "@/app/ui/directories/directory-query";
import { useDirectoryIndex } from "@/app/ui/directories/directory-index";
import { SortDropdown } from "@/app/ui/directories/directory-sort-dropdown";
import {
  DirectoryResultsBar,
  DirectoryViewInput,
  DirectoryViewSwitch,
  directoryView,
  directoryViewRoute,
} from "@/app/ui/directories/directory-view";
import {
  appDirectoryApiIndexPath,
  appDirectoryPath,
  filterApps,
  freeOptions,
  sizeParam,
  sortApps,
  sortOptions,
  type DirectoryAppCard,
  type DirectoryCounts,
  type IndieCategory,
} from "@/lib/indie-hacker-apps/model";
import { AppBrowser } from "./app-browser";
import { appDirectoryPageSize, appDirectoryParamKeys, defaultSort, getFilter, getJob, getLevels, getMainOnly, getPage, getSort } from "./params";
import { appDirectoryContext, sizeLevels } from "./shared";
import styles from "./app-directory.module.css";

/**
 * The size a price is shown at, styled like the sort control. The default size submits
 * an empty value, so it stays out of the URL.
 */
function SizeDropdown({ label, name, options, value, defaultValue, hint }: {
  label: string;
  name: string;
  options: string[];
  value: number;
  defaultValue: number;
  hint: string;
}) {
  const optionValue = (index: number) => (index === defaultValue ? "" : String(index));
  return (
    <div className="directory-select" data-custom-select>
      <span className="field-label-line">{label}</span>
      <input name={name} type="hidden" value={optionValue(value)} />
      <div className="custom-select">
        <button aria-expanded="false" className="custom-select-trigger" data-custom-select-trigger type="button">
          <span data-custom-select-label>{options[value]}</span>
          <span className="custom-select-caret" aria-hidden="true" />
        </button>
        <div className="custom-select-menu" data-custom-select-menu hidden>
          {options.map((option, index) => (
            <button
              aria-pressed={index === value}
              className={index === value ? "active" : ""}
              data-custom-select-option
              data-value={optionValue(index)}
              key={option}
              type="button"
            >
              {option}
            </button>
          ))}
        </div>
      </div>
      <p className={styles.hint}>{hint}</p>
    </div>
  );
}

export function AppDirectoryFilters({ directorySlug, heading, counts }: {
  directorySlug: string;
  heading: ReactNode;
  counts: DirectoryCounts;
}) {
  const { category, view } = appDirectoryContext(directorySlug);
  const route = appDirectoryPath(directorySlug);
  const { formKey, params } = useDirectoryQuery();
  const levels = getLevels(view, params);
  const sizeSets = Object.entries(view.sets).filter(([, set]) => set.levels.length > 1);

  return (
    <form action={route} className={sidebarPanelClassName} data-default-sort={defaultSort} data-live-filter-form key={formKey}>
      <div className={sidebarPanelHeadingClassName}>{heading}</div>

      <label className="directory-search">
        <span>Search</span>
        <span className="directory-search-field">
          <Search aria-hidden="true" size={16} strokeWidth={2.2} />
          <input defaultValue={paramString(params, "q")} name="q" placeholder="Search by name or job" type="search" />
        </span>
      </label>

      <SortDropdown name="sort" options={sortOptions} value={getSort(params)} />

      {sizeSets.map(([key, set]) => (
        <SizeDropdown
          defaultValue={set.default}
          hint={set.note}
          key={key}
          label={set.label}
          name={sizeParam(key)}
          options={sizeLevels(view, key)}
          value={levels[key]}
        />
      ))}

      {view.jobs.length > 1 ? (
        <RadioGroup
          name="job"
          options={[{ label: `All (${counts.total})`, value: "" }, ...view.jobs.map(([id, label]) => ({ label: `${label} (${counts.jobs[id] ?? 0})`, value: id }))]}
          selected={getJob(view, params)}
          title={category.slug === "payments" ? "Type" : "Job"}
        />
      ) : null}

      {counts.main < counts.total ? (
        <CheckboxGroup
          name="main"
          options={[{ label: `Main job only (${counts.main})`, value: "1" }]}
          selected={getMainOnly(params) ? ["1"] : []}
          title="Main job"
        />
      ) : null}

      {view.show_free ? (
        <CheckboxGroup
          name="free"
          options={freeOptions.map((option) => ({ ...option, label: `${option.label} (${counts.free[option.value as keyof DirectoryCounts["free"]] ?? 0})` }))}
          selected={paramValues(params, "free")}
          title="Free start"
        />
      ) : null}

      {view.signals.length ? (
        <CheckboxGroup
          name="feature"
          options={view.signals.map(([cell, , label]) => ({ label: `${label} (${counts.features[cell] ?? 0})`, value: cell }))}
          selected={paramValues(params, "feature")}
          title="Features"
        />
      ) : null}
      <DirectoryViewInput view={directoryView(params)} />

      <div className="filter-actions">
        <Link href={directoryViewRoute(route, directoryView(params))}>reset</Link>
      </div>
      <DirectoryFilterController />
    </form>
  );
}

function ActiveFilters({ view, params, route }: { view: IndieCategory; params: DirectoryParams; route: string }) {
  const chips: Array<{ href: string; label: string }> = [];
  const query = paramString(params, "q").trim();
  if (query) chips.push({ href: removeParamHref(route, params, "q"), label: `Search: ${query}` });
  const job = getJob(view, params);
  if (job) chips.push({ href: removeParamHref(route, params, "job"), label: view.jobs.find(([id]) => id === job)?.[1] ?? job });
  if (getMainOnly(params)) chips.push({ href: removeParamHref(route, params, "main"), label: "Main job only" });
  for (const value of paramValues(params, "free")) {
    chips.push({ href: removeParamHref(route, params, "free", value), label: freeOptions.find((option) => option.value === value)?.label ?? value });
  }
  for (const value of paramValues(params, "feature")) {
    chips.push({ href: removeParamHref(route, params, "feature", value), label: view.signals.find(([cell]) => cell === value)?.[2] ?? value });
  }
  if (!chips.length) return null;
  return (
    <div aria-label="Active filters" className="active-filter-row">
      {chips.map((chip) => <Link href={chip.href} key={chip.label}>{chip.label}<span>×</span></Link>)}
      <Link className="clear-filters" href={directoryViewRoute(route, directoryView(params))}>clear all</Link>
    </div>
  );
}

// The static HTML shows the default view. A filter, size, sort, or page in the URL
// loads the directory's card list from its cached JSON route and applies it here.
export function AppDirectoryResults({ directorySlug, firstPage, total, emptyVisual }: {
  directorySlug: string;
  firstPage: DirectoryAppCard[];
  total: number;
  emptyVisual: ReactNode;
}) {
  const { view } = appDirectoryContext(directorySlug);
  const route = appDirectoryPath(directorySlug);
  const { params } = useDirectoryQuery();
  const display = directoryView(params);
  const showAll = <Link href={directoryViewRoute(route, display)}>show all apps</Link>;
  const filtering = hasDirectoryParams(params, appDirectoryParamKeys(view));
  const { failed, records } = useDirectoryIndex<DirectoryAppCard>({ url: appDirectoryApiIndexPath(directorySlug) }, filtering);

  if (filtering && !records) {
    return <>
      <ActiveFilters params={params} route={route} view={view} />
      {failed
        ? <StatePanel action={showAll} state="error" title="Filters could not be loaded"><p>Reload the page to try again.</p></StatePanel>
        : <StatePanel state="loading" title="Loading apps" />}
    </>;
  }

  const job = getJob(view, params);
  const levels = getLevels(view, params);
  const filtered = filtering && records ? sortApps(view, filterApps(view, records, getFilter(view, params)), getSort(params), levels, job) : null;
  const count = filtered ? filtered.length : total;
  const totalPages = Math.max(1, Math.ceil(count / appDirectoryPageSize));
  const page = Math.min(getPage(params), totalPages);
  const start = (page - 1) * appDirectoryPageSize;
  const shown = filtered ? filtered.slice(start, start + appDirectoryPageSize) : firstPage;
  const countText = shown.length > 0
    ? <>showing <b>{start + 1}</b>–<b>{start + shown.length}</b> of <b>{count.toLocaleString("en")}</b> apps</>
    : null;

  return (
    <>
      <ActiveFilters params={params} route={route} view={view} />
      <DirectoryResultsBar count={countText}>
        <DirectoryViewSwitch route={route} />
      </DirectoryResultsBar>
      {shown.length ? (
        <>
          <AppBrowser apps={shown} directorySlug={directorySlug} job={job} levels={levels} view={display} />
          {totalPages > 1 ? (
            <Pagination ariaLabel="App pages" currentPage={page} hrefForPage={(next) => pageParamHref(route, params, next)} totalPages={totalPages} />
          ) : null}
        </>
      ) : (
        <StatePanel action={showAll} title="No apps match those filters" visual={emptyVisual}>
          <p>Try clearing one filter first.</p>
        </StatePanel>
      )}
    </>
  );
}
