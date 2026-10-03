import { getRequiredDirectoryPage } from "@/lib/directory-pages";
import { DirectoryPageTitle, DirectoryPageContent } from "@/app/ui/directories/directory-page-content";
import { ContentMarkdown } from "@/app/ui/content-markdown";
import { PageCanvas } from "@/app/ui/site/page-canvas";
import { SquareTerminal } from "lucide-react";
import { getRequiredPublishedPage } from "@/lib/page-registry";
import {
  terminalAppCategories,
  terminalAppTypeLabels,
} from "@/lib/terminal-apps";
import { getTerminalApps } from "@/lib/terminal-apps";
import { AppShell, SidebarLabel } from "@/app/ui/site/app-shell";
import type { DirectoryFilterOption as FilterOption } from "../../../ui/directories/directory-filters";
import { DirectoryQueryProvider } from "../../../ui/directories/directory-query";
import { Doodle } from "@/app/ui/site/doodle";
import { siteDoodleStarArt } from "../../art/site--doodle-star";
import { PageTitleIcon } from "@/app/ui/site/page-title-icon";
import { PageHeader } from "@/app/ui/site/page-header";
import { EntryHero } from "@/app/ui/site/entry-hero";
import { siteSpotCliAppsArt } from "../../art/site--spot-cli-apps";
import { CliAppDetailsBody } from "./cli-app-details";
import { HiddenDetails } from "@/app/ui/directories/hidden-details";
import { cliAppPageSize, installLabels, labelForValue, platformOptions } from "./cli-app-options";
import { CliAppFilters, CliAppResults } from "./cli-app-view";
import { sortApps } from "./filters";

const typeLabels = new Map<string, string>(terminalAppTypeLabels);

// Static page: the default view (most popular, page 1). Filters run in the browser.
export default async function CliAppsPage() {
  const directoryPage = await getRequiredDirectoryPage("cli-apps");
  const [apps, registryPage] = await Promise.all([
    getTerminalApps(),
    getRequiredPublishedPage("cli-apps"),
  ]);
  const defaultApps = sortApps(apps, "popular").slice(0, cliAppPageSize);

  const categoryCounts = new Map<string, number>();
  for (const app of apps) {
    for (const category of app.categories) {
      categoryCounts.set(category, (categoryCounts.get(category) ?? 0) + 1);
    }
  }
  const categoryOptions = terminalAppCategories
    .filter((category) => categoryCounts.has(category.slug))
    .map((category) => ({
      count: categoryCounts.get(category.slug),
      iconKey: category.icon_key,
      label: category.name,
      value: category.slug,
    }));
  const categoryLabels = Object.fromEntries(categoryOptions.map((option) => [option.value, option.label]));

  const typeCounts = new Map<string, number>();
  for (const app of apps) {
    typeCounts.set(app.primary_type, (typeCounts.get(app.primary_type) ?? 0) + 1);
    for (const type of app.additional_types) {
      typeCounts.set(type, (typeCounts.get(type) ?? 0) + 1);
    }
  }
  const typeFilterOptions = [...typeCounts.entries()]
    .map(([value, count]) => ({
      count,
      label: labelForValue(typeLabels, value),
      value,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

  const installCounts = new Map<string, number>();
  for (const app of apps) {
    for (const method of app.install_methods) {
      installCounts.set(method, (installCounts.get(method) ?? 0) + 1);
    }
  }
  const installOptions = [...installCounts.entries()]
    .map(([value, count]) => ({
      count,
      label: installLabels.get(value) ?? value,
      value,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

  const platformFilterOptions = platformOptions.map((option) => ({
    ...option,
    count: apps.filter((app) => app.platforms.includes(option.value)).length,
  }));

  const languageCounts = new Map<string, number>();
  for (const app of apps) {
    const key = (app.language ?? "unknown").toLowerCase();
    languageCounts.set(key, (languageCounts.get(key) ?? 0) + 1);
  }
  const languageOptions: FilterOption[] = [...languageCounts.entries()]
    .map(([value, count]) => ({
      count,
      label: value === "unknown" ? "Unknown" : value,
      value,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

  const licenseCounts = new Map<string, number>();
  for (const app of apps) {
    const key = (app.license ?? "unknown").toLowerCase();
    licenseCounts.set(key, (licenseCounts.get(key) ?? 0) + 1);
  }
  const licenseOptions: FilterOption[] = [...licenseCounts.entries()]
    .map(([value, count]) => ({
      count,
      label: value === "unknown" ? "Unknown" : value,
      value,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

  const sidebar = (
    <CliAppFilters
      heading={<SidebarLabel>{registryPage.label}</SidebarLabel>}
      options={{
        category: categoryOptions,
        install: installOptions,
        language: languageOptions,
        license: licenseOptions,
        platform: platformFilterOptions,
        type: typeFilterOptions,
      }}
    />
  );

  return (
    <DirectoryQueryProvider route="/cli-apps">
      <AppShell
        mainLabel="Terminal apps directory"
        menuLabel="Filters"
        sidebar={sidebar}
        sidebarLabel="Terminal app filters"
      >
        <EntryHero art={siteSpotCliAppsArt}>
          <PageHeader>
            <h1><PageTitleIcon>
                <SquareTerminal strokeWidth={2.2} />
              </PageTitleIcon>{" "}<DirectoryPageTitle title={directoryPage.title} /></h1>
            <ContentMarkdown markdown={directoryPage.intro_markdown} />
          </PageHeader>
        </EntryHero>
        <PageCanvas as="div" flow className="directory-results">
          <CliAppResults firstPage={defaultApps} total={apps.length} categoryLabels={categoryLabels} emptyVisual={<Doodle svg={siteDoodleStarArt} />} />
          <HiddenDetails prefix="cli-app" items={defaultApps.map((app) => ({ slug: app.slug, name: app.name, body: <CliAppDetailsBody app={app} /> }))} />
        <DirectoryPageContent page={directoryPage} />
          </PageCanvas>
      </AppShell>
    </DirectoryQueryProvider>
  );
}
