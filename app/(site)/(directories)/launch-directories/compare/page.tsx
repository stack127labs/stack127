import { getBreadcrumbs } from "@/lib/breadcrumbs";
import { getRequiredDirectoryPage } from "@/lib/directory-pages";
import { getLaunchDirectorySnapshot, launchCategories, listLaunchDirectorySlugs } from "@/lib/launch-directories";
import { sortLaunchDirectories } from "@/lib/launch-directories-query";
import { DirectoryPageTitle } from "@/app/ui/directories/directory-page-content";
import { AppShell } from "@/app/ui/site/app-shell";
import { EntryHero } from "@/app/ui/site/entry-hero";
import { PageCanvas } from "@/app/ui/site/page-canvas";
import { PageHeader } from "@/app/ui/site/page-header";
import { launchSectionNav } from "../launch-format";
import Intro from "./content/intro.mdx";
import { ComparePicker, ComparePicksProvider, CompareView, type CompareRecord } from "./compare-view";

export default async function CompareLaunchDirectoriesPage() {
  const [directoryPage, breadcrumbs, { directories }, pagedSlugs] = await Promise.all([
    getRequiredDirectoryPage("launch-directories/compare"),
    getBreadcrumbs("launch-directories/compare"),
    getLaunchDirectorySnapshot(),
    listLaunchDirectorySlugs(),
  ]);
  const paged = new Set(pagedSlugs);

  // Only the fields the comparison shows ship to the browser.
  const records: CompareRecord[] = sortLaunchDirectories(directories, "recommended").map((directory) => ({
    slug: directory.slug,
    name: directory.name,
    icon_url: directory.icon_url,
    website_url: directory.website_url,
    submit_url: directory.submit_url,
    submission_status: directory.submission_status,
    categories: directory.categories,
    cost_kind: directory.cost_kind,
    cost_label: directory.cost_label,
    lowest_paid_price_usd: directory.lowest_paid_price_usd,
    price_tiers: directory.price_tiers,
    has_page: paged.has(directory.slug),
    review_wait: directory.review_wait,
    review_time_label: directory.review_time_label,
    eligibility_label: directory.eligibility_label,
    link_type_kind: directory.link_type_kind,
    link_type_label: directory.link_type_label,
    domain_rating: directory.domain_rating,
    traffic_bucket: directory.traffic_bucket,
    listing_indexed: directory.listing_indexed,
    checked_on: directory.checked_on,
    summary: directory.summary,
    best_for: directory.best_for,
  }));
  const categories = launchCategories.map(({ value, label, iconKey }) => ({ value, label, iconKey }));

  return <ComparePicksProvider records={records}>
    <AppShell
      mainLabel="Compare launch directories"
      menuLabel="Pick places"
      sectionNav={launchSectionNav("/launch-directories/compare")}
      sidebar={<ComparePicker categories={categories} />}
      sidebarLabel="Pick places to compare"
    >
      <EntryHero art={null}>
        <PageHeader breadcrumbs={breadcrumbs}>
          <h1><DirectoryPageTitle title={directoryPage.title} /></h1>
          <Intro />
        </PageHeader>
      </EntryHero>
      <PageCanvas as="div">
        <CompareView categories={categories} />
      </PageCanvas>
    </AppShell>
  </ComparePicksProvider>;
}
