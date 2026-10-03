"use client";

import { ArrowUpRight, Clock3, Link2, Search, ShieldCheck, UsersRound, WalletCards } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { AppFactCardContent, appFactCardClassName } from "@/app/ui/directories/app-fact-card";
import { DirectoryFilterController } from "@/app/ui/directories/directory-filter-controller";
import {
  DirectoryCheckboxGroup,
  DirectoryRadioGroup,
  DirectoryTagSelectGroup,
  type DirectoryFilterOption,
} from "@/app/ui/directories/directory-filters";
import { pageParamHref, paramString, paramValues, removeParamHref, type DirectoryParams } from "@/app/ui/directories/directory-params";
import { useDirectoryQuery } from "@/app/ui/directories/directory-query";
import { SortDropdown } from "@/app/ui/directories/directory-sort-dropdown";
import { Pagination } from "@/app/ui/pagination";
import { sidebarPanelClassName, sidebarPanelHeadingClassName } from "@/app/ui/site/sidebar-panel";
import { StatePanel } from "@/app/ui/state-panel";
import type { LaunchDirectory } from "@/lib/launch-directories";
import { queryLaunchDirectories } from "@/lib/launch-directories-query";
import { correctionEmail, costOptions, linkOptions, sortOptions, submissionOptions } from "./launch-directory-options";
import styles from "./launch-directories.module.css";

const route = "/launch-directories";
const sortValues = new Set<string>(sortOptions.map((option) => option.value));

type Category = { value: string; label: string; iconKey: string };

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Formats a YYYY-MM-DD record date the same way on the server and in the browser. */
function formatDate(value: string | null | undefined) {
  const match = value?.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const month = months[Number(match[2]) - 1];
  return month ? `${month} ${Number(match[3])}, ${match[1]}` : null;
}

/** A short, readable address for a source link: host plus the first path segment. */
function shortUrl(value: string) {
  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, "");
    const path = url.pathname.replace(/\/+$/, "");
    if (!path) return host;
    const [first, ...rest] = path.slice(1).split("/");
    return `${host}/${first}${rest.length ? "/…" : ""}`;
  } catch {
    return value;
  }
}

function domainOf(value: string) {
  try {
    return new URL(value).hostname.replace(/^www\./, "");
  } catch {
    return value;
  }
}

function SiteIcon({ eager, iconUrl, name }: { eager: boolean; iconUrl: string | null; name: string }) {
  const [failed, setFailed] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);

  // An image can fail before hydration attaches onError, so check once after mount.
  useEffect(() => {
    const image = imageRef.current;
    if (image?.complete && image.naturalWidth === 0) setFailed(true);
  }, [iconUrl]);

  const showImage = Boolean(iconUrl) && !failed;
  return <span className={showImage ? `${styles.siteIcon} ${styles.logoPlate}` : styles.siteIcon}>
    {iconUrl && showImage
      ? <img
        alt=""
        decoding="async"
        height={40}
        loading={eager ? "eager" : "lazy"}
        onError={() => setFailed(true)}
        ref={imageRef}
        src={iconUrl}
        width={40}
      />
      : <span aria-hidden="true">{name.slice(0, 1)}</span>}
  </span>;
}

function SourceList({ directory }: { directory: LaunchDirectory }) {
  const sources = directory.source_links ?? [];
  const checked = formatDate(directory.checked_on);
  const subject = encodeURIComponent(`Correction: ${directory.name} on launch directories`);

  return <details className={styles.sources}>
    <summary>
      Sources<span className={styles.srOnly}> for {directory.name}</span>
      {checked ? <>{" "}<span className={styles.checked}>record checked {checked}</span></> : null}
    </summary>
    <ul>
      {sources.map((source) => {
        const sourceDate = formatDate(source.checked_on);
        return <li key={`${source.label}-${source.url}`}>
          <span className={styles.sourceLabel}>{source.label}</span>
          <a href={source.url} rel="noopener noreferrer" target="_blank">{shortUrl(source.url)}</a>
          {sourceDate ? <span className={styles.sourceDate}>checked {sourceDate}</span> : null}
        </li>;
      })}
      {directory.example_listing_url ? <li>
        <span className={styles.sourceLabel}>Sample listing</span>
        <a href={directory.example_listing_url} rel="noopener noreferrer" target="_blank">{shortUrl(directory.example_listing_url)}</a>
      </li> : null}
      {sources.length === 0 && !directory.example_listing_url ? <li className={styles.noSources}>No public source links for this card yet.</li> : null}
    </ul>
    <a className={styles.correction} href={`mailto:${correctionEmail}?subject=${subject}`}>
      Report a correction<span className={styles.srOnly}> for {directory.name}</span>
    </a>
  </details>;
}

function DirectoryCard({ categoryMap, directory, eager }: { categoryMap: Record<string, Category>; directory: LaunchDirectory; eager: boolean }) {
  const categories = directory.categories.map((slug) => ({
    name: categoryMap[slug]?.label ?? slug.replaceAll("-", " "),
    icon_key: categoryMap[slug]?.iconKey ?? "box",
  }));
  const domain = domainOf(directory.website_url);
  const submitUrl = directory.submission_status === "verified" ? directory.submit_url : null;

  return (
    <article className={`${appFactCardClassName} ${styles.card}`}>
      <a
        aria-label={`${directory.name} website, ${domain}`}
        className={styles.websiteHit}
        href={directory.website_url}
        rel="noopener noreferrer"
        target="_blank"
      />
      <AppFactCardContent
        name={directory.name}
        image={<SiteIcon eager={eager} iconUrl={directory.icon_url ?? null} name={directory.name} />}
        categories={categories}
        status={<span aria-hidden="true" className={styles.domain}>{domain}<ArrowUpRight size={13} strokeWidth={2.2} /></span>}
        summary={directory.summary}
        facts={[
          { label: "Best for", value: directory.best_for, icon: UsersRound },
          { label: "Cost", value: directory.cost_label, icon: WalletCards },
          { label: "Review time", value: directory.review_time_label, icon: Clock3 },
          { label: "Link type", value: directory.link_type_label, icon: Link2 },
          { label: "Eligibility", value: directory.eligibility_label, icon: ShieldCheck },
        ]}
      />
      <div className={styles.cardFooter}>
        {submitUrl ? <a className={styles.submit} href={submitUrl} rel="noopener noreferrer" target="_blank">
          Submit<span className={styles.srOnly}> to {directory.name}</span> <ArrowUpRight aria-hidden="true" size={16} />
        </a> : <span className={styles.submissionNote}>
          {directory.submission_status === "unavailable" ? "Submission page unavailable" : "Submission page not found"}
        </span>}
        <SourceList directory={directory} />
      </div>
    </article>
  );
}

export function LaunchDirectoryFilters({ categoryOptions, costOptions, heading, linkOptions }: {
  categoryOptions: DirectoryFilterOption[];
  costOptions: DirectoryFilterOption[];
  heading: ReactNode;
  linkOptions: DirectoryFilterOption[];
}) {
  const { formKey, params } = useDirectoryQuery();
  const sort = paramString(params, "sort");
  return <form action={route} className={sidebarPanelClassName} data-default-sort="ready" data-live-filter-form key={formKey}>
    <div className={sidebarPanelHeadingClassName}>{heading}</div>
    <label className="directory-search">
      <span>Search</span>
      <span className="directory-search-field">
        <Search aria-hidden="true" size={16} strokeWidth={2.2} />
        <input defaultValue={paramString(params, "q")} name="q" placeholder="Product Hunt, betalist.com..." type="search" />
      </span>
    </label>
    <SortDropdown name="sort" options={sortOptions} value={sortValues.has(sort) ? sort : "ready"} />
    <DirectoryTagSelectGroup name="category" options={categoryOptions} selected={paramValues(params, "category")} title="Category" />
    <DirectoryRadioGroup name="submission" options={submissionOptions} selected={paramString(params, "submission")} title="Submission page" />
    <DirectoryCheckboxGroup name="cost" options={costOptions} selected={paramValues(params, "cost")} title="Cost" />
    <DirectoryCheckboxGroup name="link" options={linkOptions} selected={paramValues(params, "link")} title="Link type" />
    <div className="filter-actions"><Link href={route}>clear filters</Link></div>
    <DirectoryFilterController />
  </form>;
}

function ActiveFilters({ categoryMap, params }: { categoryMap: Record<string, Category>; params: DirectoryParams }) {
  const groups: Array<{ key: string; title: string; labels: Map<string, string> }> = [
    { key: "category", title: "Category", labels: new Map(Object.values(categoryMap).map((category) => [category.value, category.label])) },
    { key: "submission", title: "Submission page", labels: new Map(submissionOptions.map((option) => [option.value, option.label])) },
    { key: "cost", title: "Cost", labels: new Map(costOptions.map((option) => [option.value, option.label])) },
    { key: "link", title: "Link type", labels: new Map(linkOptions.map((option) => [option.value, option.label])) },
  ];
  const chips: Array<{ href: string; label: string }> = [];
  const query = paramString(params, "q").trim();
  if (query) chips.push({ href: removeParamHref(route, params, "q"), label: `Search: ${query}` });
  for (const group of groups) {
    for (const value of paramValues(params, group.key)) {
      const label = group.labels.get(value);
      if (label) chips.push({ href: removeParamHref(route, params, group.key, value), label: `${group.title}: ${label}` });
    }
  }
  if (chips.length === 0) return null;

  return <div aria-label="Active filters" className="active-filter-row" role="group">
    {chips.map((chip) => <Link aria-label={`Remove ${chip.label}`} href={chip.href} key={chip.label} prefetch={false}>
      {chip.label}
      <span aria-hidden="true">×</span>
    </Link>)}
    <Link className="clear-filters" href={route} prefetch={false}>clear all</Link>
  </div>;
}

function countText(start: number, end: number, total: number, filtered: boolean) {
  const noun = total === 1 ? "place" : "places";
  const matching = filtered ? `matching ${noun}` : noun;
  if (total === 0) return `No ${filtered ? "matching " : ""}places`;
  if (start === 1 && end === total) return `${total} ${matching}`;
  return `Showing ${start} to ${end} of ${total} ${matching}`;
}

// All places (under 200) ship with the static page. The URL's filters, sort, and page apply in the browser.
export function LaunchDirectoryResults({ categories, directories }: { categories: Category[]; directories: LaunchDirectory[] }) {
  const { params } = useDirectoryQuery();
  const categoryMap = Object.fromEntries(categories.map((category) => [category.value, category]));
  const categoryLabels = Object.fromEntries(categories.map((category) => [category.value, category.label]));
  const sortParam = paramString(params, "sort");
  const sort = sortValues.has(sortParam) ? sortParam : "ready";
  const result = queryLaunchDirectories(directories, {
    q: paramString(params, "q"),
    categories: paramValues(params, "category"),
    costs: paramValues(params, "cost"),
    links: paramValues(params, "link"),
    submission: paramString(params, "submission"),
    sort,
    page: paramString(params, "page") || 1,
  }, categoryLabels);
  const filtered = result.total !== directories.length;

  return <div className={styles.results}>
    <div className={styles.resultsIntro}>
      <p aria-atomic="true" aria-live="polite" className={styles.count}>{countText(result.start, result.end, result.total, filtered)}</p>
      <p className={styles.order}>
        {sort === "name" ? "Sorted by name." : "Sites with a checked submission page come first."}{" "}
        <a href="#how-we-check">How we check listings</a>
      </p>
    </div>
    <ActiveFilters categoryMap={categoryMap} params={params} />
    {result.items.length > 0 ? <>
      <div className="directory-card-grid">
        {result.items.map((directory, index) => <DirectoryCard
          categoryMap={categoryMap}
          directory={directory}
          eager={result.currentPage === 1 && index < 3}
          key={directory.slug}
        />)}
      </div>
      <Pagination
        ariaLabel="Launch directory pages"
        currentPage={result.currentPage}
        hrefForPage={(page) => pageParamHref(route, params, page)}
        totalPages={result.totalPages}
      />
    </> : <StatePanel title="No places match those filters" action={<Link href={route} prefetch={false}>show all places</Link>}>
      <p>Try removing one filter or searching for a shorter name.</p>
    </StatePanel>}
  </div>;
}
