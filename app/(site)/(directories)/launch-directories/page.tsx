import { getRequiredDirectoryPage } from "@/lib/directory-pages";
import { getBreadcrumbs } from "@/lib/breadcrumbs";
import { DirectoryPageTitle } from "@/app/ui/directories/directory-page-content";
import { PageMeta } from "@/app/ui/site/page-meta";
import { DirectoryQueryProvider } from "@/app/ui/directories/directory-query";
import { AppShell, SidebarLabel } from "@/app/ui/site/app-shell";
import { EntryHero } from "@/app/ui/site/entry-hero";
import { PageCanvas } from "@/app/ui/site/page-canvas";
import { PageHeader } from "@/app/ui/site/page-header";
import { DirectoryTitleIcon } from "@/app/ui/directories/directory-title-icon";
import { getLaunchDirectorySnapshot, launchCategories, listLaunchDirectorySlugs } from "@/lib/launch-directories";
import { filterLaunchDirectories, launchDirectoryHasFreeOption } from "@/lib/launch-directories-query";
import { getRequiredPublishedPage } from "@/lib/page-registry";
import { RegistryStructuredData } from "@/lib/registry-layout";
import Intro from "./content/intro.mdx";
import { CompareCallout, LaunchDirectoryGuide } from "./launch-directory-guide";
import { costOptions, linkOptions, quickPicks } from "./launch-directory-options";
import { LaunchDirectoryFilters, LaunchDirectoryResults } from "./launch-directory-view";
import { isSubmitReady, launchSectionNav } from "./launch-format";
import { LaunchGlance } from "./launch-glance";
import styles from "./launch-directories.module.css";

export default async function LaunchDirectoriesPage() {
  const directoryPage = await getRequiredDirectoryPage("launch-directories");
  const registryPage = await getRequiredPublishedPage("launch-directories");
  const [snapshot, pagedSlugs] = await Promise.all([getLaunchDirectorySnapshot(), listLaunchDirectorySlugs()]);
  const directories = snapshot.directories;
  const categories = [...launchCategories];
  const categoryOptions = categories.map((category) => ({
    ...category,
    count: directories.filter((directory) => directory.categories.includes(category.value)).length,
  })).filter((category) => category.count > 0);
  const availableCosts = costOptions.filter((option) => filterLaunchDirectories(directories, { costs: [option.value] }).length > 0);
  const availableLinks = linkOptions.filter((option) => directories.some((directory) => directory.link_type_kind === option.value));
  const pickCounts = Object.fromEntries(quickPicks.map((pick) => {
    const value = (key: string) => pick.params.filter(([name]) => name === key).map(([, current]) => current as string);
    return [pick.value, filterLaunchDirectories(directories, {
      categories: value("category"), costs: value("cost"), links: value("link"), backlink: value("backlink")[0],
    }).length];
  }));
  const stats = [
    { value: directories.length, label: "places" },
    { value: directories.filter(launchDirectoryHasFreeOption).length, label: "have a free option" },
    { value: directories.filter((directory) => directory.link_type_kind === "dofollow").length, label: "give a dofollow link" },
    { value: directories.filter(isSubmitReady).length, label: "submit pages work" },
  ];
  const sidebar = <LaunchDirectoryFilters
    categoryOptions={categoryOptions}
    costOptions={availableCosts}
    drAvailable={directories.some((directory) => directory.domain_rating !== null)}
    heading={<SidebarLabel>{registryPage.label}</SidebarLabel>}
    linkOptions={availableLinks}
    pickCounts={pickCounts}
  />;

  return <DirectoryQueryProvider route="/launch-directories">
    <RegistryStructuredData path="/launch-directories" />
    <AppShell
      mainLabel="Launch directory results"
      menuLabel="Filters"
      sectionNav={launchSectionNav("/launch-directories")}
      sidebar={sidebar}
      sidebarLabel="Launch directory filters"
    >
      <EntryHero art={null}>
        <PageHeader breadcrumbs={await getBreadcrumbs("launch-directories")}>
          <h1><DirectoryTitleIcon iconKey={directoryPage.card_icon_key} />{" "}<DirectoryPageTitle title={directoryPage.title} /></h1>
          <PageMeta updatedAt={directoryPage.updated_at} />
          <Intro />
          <dl className={styles.statline}>
            {stats.map((stat) => <div key={stat.label}><dt>{stat.label}</dt><dd>{stat.value}</dd></div>)}
          </dl>
        </PageHeader>
      </EntryHero>
      {/* Data freshness marker for the cache verifier, not page metadata. */}
      <span data-launch-directories-revision={snapshot.revision} hidden />
      <PageCanvas as="div" className="directory-results">
        <LaunchDirectoryResults categories={categories} directories={directories} pagedSlugs={pagedSlugs} />
        <LaunchGlance directories={directories} />
        <CompareCallout />
        <LaunchDirectoryGuide />
      </PageCanvas>
    </AppShell>
  </DirectoryQueryProvider>;
}
