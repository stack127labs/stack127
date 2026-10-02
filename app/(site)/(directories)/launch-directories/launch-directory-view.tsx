"use client";

import { ArrowUpRight, Clock3, Link2, Search, ShieldCheck, UsersRound, WalletCards } from "lucide-react";
import type { ReactNode } from "react";
import { AppFactCardContent, appFactCardClassName } from "@/app/ui/directories/app-fact-card";
import { DirectoryFilterController } from "@/app/ui/directories/directory-filter-controller";
import { DirectoryCheckboxGroup, DirectoryTagSelectGroup, type DirectoryFilterOption } from "@/app/ui/directories/directory-filters";
import { paramString, paramValues } from "@/app/ui/directories/directory-params";
import { useDirectoryQuery } from "@/app/ui/directories/directory-query";
import { sidebarPanelClassName, sidebarPanelHeadingClassName } from "@/app/ui/site/sidebar-panel";
import { StatePanel } from "@/app/ui/state-panel";
import type { LaunchDirectory } from "@/lib/launch-directories";
import styles from "./launch-directories.module.css";

const route = "/launch-directories";

type Category = { value: string; label: string; iconKey: string };

const iconSlugs = new Set(["alternativeto", "fazier", "futurepedia", "product-hunt", "sourceforge", "tinylaunch", "uneed"]);

function categoryFor(categories: Record<string, Category>, slug: string) {
  return categories[slug] ?? { value: slug, label: slug.replaceAll("-", " "), iconKey: "box" };
}

function matches(directory: LaunchDirectory, categoryMap: Record<string, Category>, query: string, categories: string[], costs: string[], links: string[]) {
  const haystack = [directory.name, directory.summary, directory.best_for, directory.eligibility_label,
    ...directory.categories.map((category) => categoryFor(categoryMap, category).label)].join(" ").toLowerCase();
  return (!query || haystack.includes(query))
    && (categories.length === 0 || categories.some((category) => directory.categories.includes(category)))
    && (costs.length === 0 || costs.includes(directory.cost_kind))
    && (links.length === 0 || links.includes(directory.link_type_kind));
}

function DirectoryCard({ categoryMap, directory }: { categoryMap: Record<string, Category>; directory: LaunchDirectory }) {
  const categories = directory.categories.map((slug) => ({
    name: categoryFor(categoryMap, slug).label,
    icon_key: categoryFor(categoryMap, slug).iconKey,
  }));

  return (
    <article className={`${appFactCardClassName} ${styles.card}`}>
      <a
        aria-label={`Open ${directory.name} website`}
        className={styles.websiteHit}
        href={directory.website_url}
        rel="noopener noreferrer"
        target="_blank"
      />
      <AppFactCardContent
        name={directory.name}
        image={<span className={styles.siteIcon}>
          {iconSlugs.has(directory.slug) ? <img alt="" height="38" src={`/launch-directories/${directory.slug}.${directory.slug === "fazier" ? "png" : "ico"}`} width="38" /> : <span>{directory.name.slice(0, 1)}</span>}
        </span>}
        categories={categories}
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
        {directory.submission_status === "verified" && directory.submit_url ? <a href={directory.submit_url} rel="noopener noreferrer" target="_blank">
          Submit here <ArrowUpRight aria-hidden="true" size={16} />
        </a> : <span className={styles.submissionNote}>
          {directory.submission_status === "unavailable" ? "Submission page unavailable" : "Submission page not found"}
        </span>}
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
  return <form action={route} className={sidebarPanelClassName} data-default-sort="name" data-live-filter-form key={formKey}>
    <div className={sidebarPanelHeadingClassName}>{heading}</div>
    <label className="directory-search">
      <span>Search</span>
      <span className="directory-search-field">
        <Search aria-hidden="true" size={16} strokeWidth={2.2} />
        <input defaultValue={paramString(params, "q")} name="q" placeholder="Product Hunt, AI tools..." type="search" />
      </span>
    </label>
    <DirectoryTagSelectGroup name="category" options={categoryOptions} selected={paramValues(params, "category")} title="Category" />
    <DirectoryCheckboxGroup name="cost" options={costOptions} selected={paramValues(params, "cost")} title="Cost" />
    <DirectoryCheckboxGroup name="link" options={linkOptions} selected={paramValues(params, "link")} title="Link type" />
    <div className="filter-actions"><a href={route}>clear filters</a></div>
    <DirectoryFilterController />
  </form>;
}

// All places (under 200) ship with the page. Filters from the URL apply in the browser.
export function LaunchDirectoryResults({ categories, directories }: { categories: Category[]; directories: LaunchDirectory[] }) {
  const { params } = useDirectoryQuery();
  const categoryMap = Object.fromEntries(categories.map((category) => [category.value, category]));
  const query = paramString(params, "q").trim().toLowerCase();
  const selectedCategories = paramValues(params, "category");
  const selectedCosts = paramValues(params, "cost");
  const selectedLinks = paramValues(params, "link");
  const filtered = directories.filter((directory) => matches(directory, categoryMap, query, selectedCategories, selectedCosts, selectedLinks));

  return <>
    <div className={styles.resultsIntro}>
      <p>{filtered.length} {filtered.length === 1 ? "place" : "places"} to submit</p>
      <p>Missing details are marked. Link types come from sample listings or site rules.</p>
    </div>
    {filtered.length > 0 ? <div className="directory-card-grid">{filtered.map((directory) => <DirectoryCard categoryMap={categoryMap} directory={directory} key={directory.slug} />)}</div>
      : <StatePanel title="No places match those filters" action={<a href={route}>show all places</a>}><p>Try clearing one filter first.</p></StatePanel>}
  </>;
}
