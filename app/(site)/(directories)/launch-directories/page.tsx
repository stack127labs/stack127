import { Rocket } from "lucide-react";
import { DirectoryQueryProvider } from "@/app/ui/directories/directory-query";
import { AppShell, SidebarLabel } from "@/app/ui/site/app-shell";
import { EntryHero } from "@/app/ui/site/entry-hero";
import { PageCanvas } from "@/app/ui/site/page-canvas";
import { PageHeader } from "@/app/ui/site/page-header";
import { PageTitleIcon } from "@/app/ui/site/page-title-icon";
import { getPublishedLaunchDirectories, launchCategories } from "@/lib/launch-directories";
import { getRequiredPublishedPage } from "@/lib/page-registry";
import { LaunchDirectoryFilters, LaunchDirectoryResults } from "./launch-directory-view";

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

export default async function LaunchDirectoriesPage() {
  const registryPage = await getRequiredPublishedPage("launch-directories");
  const directories = await getPublishedLaunchDirectories();
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
          <h1><PageTitleIcon><Rocket strokeWidth={2.2} /></PageTitleIcon>{" "}Find the right place to <mark>launch your product</mark></h1>
          <p>Compare submission cost, review time, link type, and eligibility before you start.</p>
        </PageHeader>
      </EntryHero>
      <PageCanvas as="div" flow className="directory-results">
        <LaunchDirectoryResults categories={[...launchCategories]} directories={directories} />
      </PageCanvas>
    </AppShell>
  </DirectoryQueryProvider>;
}
