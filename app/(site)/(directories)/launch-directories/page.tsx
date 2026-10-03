import { getRequiredDirectoryPage } from "@/lib/directory-pages";
import { DirectoryPageTitle, DirectoryPageContent } from "@/app/ui/directories/directory-page-content";
import { ContentMarkdown } from "@/app/ui/content-markdown";
import { Rocket } from "lucide-react";
import { DirectoryQueryProvider } from "@/app/ui/directories/directory-query";
import { AppShell, SidebarLabel } from "@/app/ui/site/app-shell";
import { EntryHero } from "@/app/ui/site/entry-hero";
import { PageCanvas } from "@/app/ui/site/page-canvas";
import { PageHeader } from "@/app/ui/site/page-header";
import { PageTitleIcon } from "@/app/ui/site/page-title-icon";
import { getLaunchDirectorySnapshot, launchCategories } from "@/lib/launch-directories";
import { getRequiredPublishedPage } from "@/lib/page-registry";
import { LaunchDirectoryGuide } from "./launch-directory-guide";
import { costOptions, linkOptions } from "./launch-directory-options";
import { LaunchDirectoryFilters, LaunchDirectoryResults } from "./launch-directory-view";

export default async function LaunchDirectoriesPage() {
  const directoryPage = await getRequiredDirectoryPage("launch-directories");
  const registryPage = await getRequiredPublishedPage("launch-directories");
  const snapshot = await getLaunchDirectorySnapshot();
  const directories = snapshot.directories;
  const categoryOptions = launchCategories.map((category) => ({
    ...category,
    count: directories.filter((directory) => directory.categories.includes(category.value)).length,
  })).filter((category) => category.count > 0);
  const availableCosts = costOptions.filter((option) => directories.some((directory) => directory.cost_kind === option.value));
  const availableLinks = linkOptions.filter((option) => directories.some((directory) => directory.link_type_kind === option.value));
  const sidebar = <LaunchDirectoryFilters
    categoryOptions={categoryOptions}
    costOptions={availableCosts}
    heading={<SidebarLabel>{registryPage.label}</SidebarLabel>}
    linkOptions={availableLinks}
  />;

  return <DirectoryQueryProvider route="/launch-directories">
    <AppShell mainLabel="Launch directory results" menuLabel="Filters" sidebar={sidebar} sidebarLabel="Launch directory filters">
      <EntryHero art={null}>
        <PageHeader>
          <h1><PageTitleIcon><Rocket strokeWidth={2.2} /></PageTitleIcon>{" "}<DirectoryPageTitle title={directoryPage.title} /></h1>
          <ContentMarkdown markdown={directoryPage.intro_markdown} />
        </PageHeader>
      </EntryHero>
      {/* Data freshness marker for the cache verifier, not page metadata. */}
      <span data-launch-directories-revision={snapshot.revision} hidden />
      <PageCanvas as="div" className="directory-results">
        <LaunchDirectoryResults categories={[...launchCategories]} directories={directories} />
        <LaunchDirectoryGuide directoryPage={directoryPage} />
      </PageCanvas>
    </AppShell>
  </DirectoryQueryProvider>;
}
