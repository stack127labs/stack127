"use client";

import Link from "next/link";
import { CalendarClock, CircleDollarSign, Gift, Rows3, Search } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { DetailDialog, DetailDialogClose } from "@/app/ui/detail-dialog";
import { Pagination } from "@/app/ui/pagination";
import { StatePanel } from "@/app/ui/state-panel";
import { sidebarPanelClassName, sidebarPanelHeadingClassName } from "@/app/ui/site/sidebar-panel";
import { DirectoryFilterController } from "@/app/ui/directories/directory-filter-controller";
import { DirectoryCheckboxGroup as CheckboxGroup, DirectoryRadioGroup as RadioGroup } from "@/app/ui/directories/directory-filters";
import { pageParamHref, paramString, paramValues, removeParamHref, type DirectoryParams } from "@/app/ui/directories/directory-params";
import { hasDirectoryParams, useDirectoryQuery } from "@/app/ui/directories/directory-query";
import { useDirectoryIndex } from "@/app/ui/directories/directory-index";
import { SortDropdown } from "@/app/ui/directories/directory-sort-dropdown";
import { AppFactCardContent, appFactCardClassName } from "@/app/ui/directories/app-fact-card";
import {
  formatIndieDate,
  getIndieCategory,
  indieCategoryPath,
  sizeParam,
  stateLabels,
  type IndieApp,
  type IndieAppCard,
  type IndieCategory,
} from "@/lib/indie-hacker-apps/model";
import { IndieAppDetailsBody } from "./app-details";
import { cardCost, filterApps, freeOptions, getJob, getLevels, getPage, getSort, indiePageSize, paramKeys, sortApps, sortOptions } from "./filters";
import styles from "./indie.module.css";

function category(slug: string) {
  const found = getIndieCategory(slug);
  if (!found) throw new Error(`Unknown indie hacker apps category: ${slug}`);
  return found;
}

/** A dropdown like the sort control, with its own label, for the size a price is shown at. */
function SizeDropdown({ label, name, options, value, hint }: { label: string; name: string; options: string[]; value: number; hint: string }) {
  return (
    <div className="directory-select" data-custom-select>
      <span className="field-label-line">{label}</span>
      <input name={name} type="hidden" value={String(value)} />
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
              data-value={String(index)}
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

const sizeLabels: Record<string, string> = {
  fee: "Seller based in",
  subs: "Newsletter price at",
  appmail: "App email price at",
  errors: "Error tracking price at",
  uptime: "Uptime price at",
  sql: "Database price for",
};

export function IndieFilters({ categorySlug, heading, counts }: {
  categorySlug: string;
  heading: ReactNode;
  counts: { jobs: Record<string, number>; free: Record<string, number>; features: Record<string, number>; total: number };
}) {
  const cat = category(categorySlug);
  const route = indieCategoryPath(cat.slug);
  const { formKey, params } = useDirectoryQuery();
  const job = getJob(cat, params);
  const levels = getLevels(cat, params);
  const sizeSets = Object.entries(cat.sets).filter(([key, set]) => set.levels.length > 1 && (!job || !cat.job_sets[job] || cat.job_sets[job] === key));

  return (
    <form action={route} className={sidebarPanelClassName} data-default-sort="cost" data-live-filter-form key={formKey}>
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
          hint={set.note}
          key={key}
          label={sizeLabels[key] ?? (set.unit ? "Price at" : "Price for")}
          name={sizeParam(key)}
          options={set.levels.map((level) => (set.unit ? `${level} ${set.unit}` : level))}
          value={levels[key]}
        />
      ))}

      <RadioGroup
        name="job"
        options={[{ label: `All (${counts.total})`, value: "" }, ...cat.jobs.map(([id, label]) => ({ label: `${label} (${counts.jobs[id] ?? 0})`, value: id }))]}
        selected={job}
        title={cat.slug === "payments" ? "Type" : "Job"}
      />

      {cat.show_free ? (
        <CheckboxGroup
          name="free"
          options={freeOptions.map((option) => ({ ...option, label: `${option.label} (${counts.free[option.value] ?? 0})` }))}
          selected={paramValues(params, "free")}
          title="Free start"
        />
      ) : null}

      {cat.signals.length ? (
        <CheckboxGroup
          name="feature"
          options={cat.signals.map(([cell, , label]) => ({ label: `${label} (${counts.features[cell] ?? 0})`, value: cell }))}
          selected={paramValues(params, "feature")}
          title="Features"
        />
      ) : null}

      <div className="filter-actions">
        <Link href={route}>reset</Link>
      </div>
      <DirectoryFilterController />
    </form>
  );
}

function ActiveFilters({ cat, params }: { cat: IndieCategory; params: DirectoryParams }) {
  const route = indieCategoryPath(cat.slug);
  const chips: Array<{ href: string; label: string }> = [];
  const query = paramString(params, "q").trim();
  if (query) chips.push({ href: removeParamHref(route, params, "q"), label: `Search: ${query}` });
  const job = getJob(cat, params);
  if (job) chips.push({ href: removeParamHref(route, params, "job"), label: cat.jobs.find(([id]) => id === job)?.[1] ?? job });
  for (const value of paramValues(params, "free")) {
    chips.push({ href: removeParamHref(route, params, "free", value), label: freeOptions.find((o) => o.value === value)?.label ?? value });
  }
  for (const value of paramValues(params, "feature")) {
    chips.push({ href: removeParamHref(route, params, "feature", value), label: cat.signals.find(([cell]) => cell === value)?.[2] ?? value });
  }
  if (!chips.length) return null;
  return (
    <div aria-label="Active filters" className="active-filter-row">
      {chips.map((chip) => <Link href={chip.href} key={chip.label}>{chip.label}<span>×</span></Link>)}
      <Link className="clear-filters" href={route}>clear all</Link>
    </div>
  );
}

function AppIcon({ app }: { app: Pick<IndieAppCard, "name" | "icon"> }) {
  const [failed, setFailed] = useState(false);
  const letter = app.name.match(/[A-Za-z0-9]/)?.[0] ?? "?";
  if (!app.icon || failed) return <span aria-hidden="true" className={styles.letterIcon}>{letter}</span>;
  return (
    <span aria-hidden="true" className={styles.iconTile}>
      {/* eslint-disable-next-line @next/next/no-img-element -- static 128px PNGs from public/ */}
      <img alt="" height={128} loading="lazy" onError={() => setFailed(true)} src={app.icon} width={128} />
    </span>
  );
}

function costValue(row: IndieAppCard["costs"][string][number] | undefined) {
  if (!row || row.state === "not_applicable") return "—";
  const note = stateLabels[row.state];
  return [row.v, row.plan, note].filter(Boolean).join(" · ");
}

export function IndieAppCardView({ app, cat, levels, job, onSelect }: {
  app: IndieAppCard;
  cat: IndieCategory;
  levels: Record<string, number>;
  job: string;
  onSelect: () => void;
}) {
  const jobLabels = new Map(cat.jobs.map(([id, label]) => [id, label]));
  const { set, level, row } = cardCost(cat, app, levels, job);
  const status = app.status[0];
  return (
    <button
      aria-haspopup="dialog"
      aria-label={`View details for ${app.name}`}
      className={`directory-card ${appFactCardClassName}`}
      onClick={onSelect}
      type="button"
    >
      <AppFactCardContent
        categories={app.jobs.map((id) => ({ name: jobLabels.get(id) ?? id }))}
        facts={[
          { label: cat.sets[set].short[level], value: costValue(row), icon: CircleDollarSign },
          ...(cat.show_free ? [{ label: "Free start", value: app.free.text, icon: Gift }] : []),
          ...cat.cells.map(([key, label]) => ({ label, value: app.cells[key] ?? "—", icon: Rows3 })),
          { label: "Checked", value: formatIndieDate(app.checked), icon: CalendarClock },
        ]}
        image={<AppIcon app={app} />}
        name={app.name}
        status={status ? <span className={`${styles.statusPill} ${status.tone === "warning" ? styles.warning : ""}`}>{status.label.toLowerCase()}</span> : null}
        summary={app.line}
      />
    </button>
  );
}

function LoadedDetails({ cat, slug }: { cat: IndieCategory; slug: string }) {
  const [state, setState] = useState<{ slug: string; app?: IndieApp; failed?: boolean } | null>(null);
  useEffect(() => {
    let active = true;
    fetch(`/api/indie-hacker-apps/${cat.slug}/apps/${slug}`)
      .then((response) => {
        if (!response.ok) throw new Error(`App details failed with ${response.status}.`);
        return response.json() as Promise<IndieApp>;
      })
      .then((app) => { if (active) setState({ slug, app }); })
      .catch(() => { if (active) setState({ slug, failed: true }); });
    return () => { active = false; };
  }, [cat.slug, slug]);
  if (state?.slug === slug && state.failed) return <p role="alert">App details could not be loaded. Close this panel and try again.</p>;
  if (state?.slug !== slug || !state.app) return <StatePanel state="loading" title="Loading details" />;
  return <IndieAppDetailsBody app={state.app} category={cat} />;
}

function IndieBrowser({ apps, cat, levels, job }: {
  apps: IndieAppCard[];
  cat: IndieCategory;
  levels: Record<string, number>;
  job: string;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const app = apps.find((item) => item.slug === selected);
  const close = () => setSelected(null);
  return (
    <>
      <div className="directory-card-grid">
        {apps.map((item) => (
          <IndieAppCardView app={item} cat={cat} job={job} key={item.slug} levels={levels} onSelect={() => setSelected(item.slug)} />
        ))}
      </div>
      {app ? (
        <DetailDialog ariaLabel={`${app.name} details`} onClose={close}>
          <div className="app-detail-heading">
            <AppIcon app={app} />
            <div><h2>{app.name}</h2></div>
            <DetailDialogClose ariaLabel="Close app details" onClose={close} />
          </div>
          <LoadedDetails cat={cat} slug={app.slug} />
        </DetailDialog>
      ) : null}
    </>
  );
}

// Panels hold about 100 sourced facts per app, so each one loads from its own
// static JSON file when opened instead of shipping in the page HTML.
// The static HTML shows the default view. A filter, size, sort, or page in the URL
// loads the category's card list from a cached JSON route and applies it here.
export function IndieResults({ categorySlug, firstPage, total, emptyVisual }: {
  categorySlug: string;
  firstPage: IndieAppCard[];
  total: number;
  emptyVisual: ReactNode;
}) {
  const cat = category(categorySlug);
  const route = indieCategoryPath(cat.slug);
  const { params } = useDirectoryQuery();
  const filtering = hasDirectoryParams(params, paramKeys(cat));
  const { failed, records } = useDirectoryIndex<IndieAppCard>({ url: `/api/indie-hacker-apps/${cat.slug}/index` }, filtering);

  if (filtering && !records) {
    return <>
      <ActiveFilters cat={cat} params={params} />
      {failed
        ? <StatePanel action={<Link href={route}>show all apps</Link>} state="error" title="Filters could not be loaded"><p>Reload the page to try again.</p></StatePanel>
        : <StatePanel state="loading" title="Loading apps" />}
    </>;
  }

  const job = getJob(cat, params);
  const levels = getLevels(cat, params);
  const filtered = filtering && records ? sortApps(cat, filterApps(cat, records, params), getSort(params), levels, job) : null;
  const count = filtered ? filtered.length : total;
  const totalPages = Math.max(1, Math.ceil(count / indiePageSize));
  const page = Math.min(getPage(params), totalPages);
  const shown = filtered ? filtered.slice((page - 1) * indiePageSize, page * indiePageSize) : firstPage;

  return (
    <>
      <ActiveFilters cat={cat} params={params} />
      <p className={styles.count}>{count === total ? `${total} apps` : `${count} of ${total} apps`}</p>
      {shown.length ? (
        <>
          <IndieBrowser apps={shown} cat={cat} job={job} levels={levels} />
          {totalPages > 1 ? (
            <Pagination ariaLabel={`${cat.name} app pages`} currentPage={page} hrefForPage={(next) => pageParamHref(route, params, next)} totalPages={totalPages} />
          ) : null}
        </>
      ) : (
        <StatePanel action={<Link href={route}>show all apps</Link>} title="No apps match those filters" visual={emptyVisual}>
          <p>Try clearing one filter first.</p>
        </StatePanel>
      )}
    </>
  );
}
