import { ArrowUpRight, Clock3, Link2, Search, ShieldCheck, UsersRound, WalletCards, Rocket } from "lucide-react";
import { AppFactCardContent, appFactCardClassName } from "@/app/ui/directories/app-fact-card";
import { DirectoryFilterController } from "@/app/ui/directories/directory-filter-controller";
import { DirectoryCheckboxGroup, DirectoryTagSelectGroup } from "@/app/ui/directories/directory-filters";
import { StatePanel } from "@/app/ui/state-panel";
import { AppShell, SidebarLabel } from "@/app/ui/site/app-shell";
import { EntryHero } from "@/app/ui/site/entry-hero";
import { PageCanvas } from "@/app/ui/site/page-canvas";
import { PageHeader } from "@/app/ui/site/page-header";
import { PageTitleIcon } from "@/app/ui/site/page-title-icon";
import { sidebarPanelClassName, sidebarPanelHeadingClassName } from "@/app/ui/site/sidebar-panel";
import { getPublishedLaunchDirectories, launchCategories, type LaunchDirectory } from "@/lib/launch-directories";
import { getRequiredPublishedPage } from "@/lib/page-registry";
import styles from "./launch-directories.module.css";

type SearchParams = Record<string, string | string[] | undefined>;

const costOptions = [
  { value: "free", label: "Free" },
  { value: "free_and_paid", label: "Free and paid" },
  { value: "paid", label: "Paid" },
  { value: "unknown", label: "Unclear price" },
];

const linkOptions = [
  { value: "dofollow", label: "Dofollow" },
  { value: "nofollow", label: "Nofollow" },
  { value: "ugc", label: "UGC" },
  { value: "sponsored", label: "Sponsored" },
  { value: "multiple", label: "Multiple types" },
  { value: "varies", label: "Varies by plan or listing" },
  { value: "estimated_nofollow", label: "Likely nofollow" },
  { value: "none", label: "No website link in sample" },
  { value: "unknown", label: "Couldn't verify" },
];

function values(params: SearchParams, key: string) {
  const value = params[key];
  return value ? Array.isArray(value) ? value : [value] : [];
}

function first(params: SearchParams, key: string) {
  return values(params, key)[0] ?? "";
}

function categoryFor(slug: string) {
  return launchCategories.find((category) => category.value === slug) ?? {
    value: slug, label: slug.replaceAll("-", " "), iconKey: "box",
  };
}

function matches(directory: LaunchDirectory, query: string, categories: string[], costs: string[], links: string[]) {
  const haystack = [directory.name, directory.summary, directory.best_for, directory.eligibility_label,
    ...directory.categories.map((category) => categoryFor(category).label)].join(" ").toLowerCase();
  return (!query || haystack.includes(query))
    && (categories.length === 0 || categories.some((category) => directory.categories.includes(category)))
    && (costs.length === 0 || costs.includes(directory.cost_kind))
    && (links.length === 0 || links.includes(directory.link_type_kind));
}

function DirectoryCard({ directory }: { directory: LaunchDirectory }) {
  const categories = directory.categories.map((slug) => ({
    name: categoryFor(slug).label,
    icon_key: categoryFor(slug).iconKey,
  }));
  const hasIcon = ["alternativeto", "fazier", "futurepedia", "product-hunt", "sourceforge", "tinylaunch", "uneed"].includes(directory.slug);

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
          {hasIcon ? <img alt="" height="38" src={`/launch-directories/${directory.slug}.${directory.slug === "fazier" ? "png" : "ico"}`} width="38" /> : <span>{directory.name.slice(0, 1)}</span>}
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

export default async function LaunchDirectoriesPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const registryPage = await getRequiredPublishedPage("launch-directories");
  const params = await searchParams;
  const directories = await getPublishedLaunchDirectories();
  const query = first(params, "q").trim().toLowerCase();
  const selectedCategories = values(params, "category");
  const selectedCosts = values(params, "cost");
  const selectedLinks = values(params, "link");
  const filtered = directories.filter((directory) => matches(directory, query, selectedCategories, selectedCosts, selectedLinks));
  const categoryOptions = launchCategories.map((category) => ({
    ...category,
    count: directories.filter((directory) => directory.categories.includes(category.value)).length,
  })).filter((category) => category.count > 0);
  const availableCosts = costOptions.filter((option) => directories.some((directory) => directory.cost_kind === option.value));
  const availableLinks = linkOptions.filter((option) => directories.some((directory) => directory.link_type_kind === option.value));
  const sidebar = <form action="/launch-directories" className={sidebarPanelClassName} data-default-sort="name" data-live-filter-form>
    <div className={sidebarPanelHeadingClassName}><SidebarLabel>{registryPage.label}</SidebarLabel></div>
    <label className="directory-search">
      <span>Search</span>
      <span className="directory-search-field">
        <Search aria-hidden="true" size={16} strokeWidth={2.2} />
        <input defaultValue={first(params, "q")} name="q" placeholder="Product Hunt, AI tools..." type="search" />
      </span>
    </label>
    <DirectoryTagSelectGroup name="category" options={categoryOptions} selected={selectedCategories} title="Category" />
    <DirectoryCheckboxGroup name="cost" options={availableCosts} selected={selectedCosts} title="Cost" />
    <DirectoryCheckboxGroup name="link" options={availableLinks} selected={selectedLinks} title="Link type" />
    <div className="filter-actions"><a href="/launch-directories">clear filters</a></div>
    <DirectoryFilterController />
  </form>;

  return <AppShell mainLabel="Launch directory results" menuLabel="Filters" sidebar={sidebar} sidebarLabel="Launch directory filters">
    <EntryHero art={null}>
      <PageHeader>
        <h1><PageTitleIcon><Rocket strokeWidth={2.2} /></PageTitleIcon>{" "}Find the right place to <mark>launch your product</mark></h1>
        <p>Compare submission cost, review time, link type, and eligibility before you start.</p>
      </PageHeader>
    </EntryHero>
    <PageCanvas as="div" flow className="directory-results">
      <div className={styles.resultsIntro}>
        <p>{filtered.length} {filtered.length === 1 ? "place" : "places"} to submit</p>
        <p>Missing details are marked. Link types come from sample listings or site rules.</p>
      </div>
      {filtered.length > 0 ? <div className="directory-card-grid">{filtered.map((directory) => <DirectoryCard directory={directory} key={directory.slug} />)}</div>
        : <StatePanel title="No places match those filters" action={<a href="/launch-directories">show all places</a>}><p>Try clearing one filter first.</p></StatePanel>}
    </PageCanvas>
  </AppShell>;
}
