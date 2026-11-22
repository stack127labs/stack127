import { AppCategoryLinks } from "@/app/ui/directories/app-category-links";
import { getAppCategoryLinks } from "@/lib/app-categories";
import { RegistryStructuredData } from "@/lib/registry-layout";
import { getRequiredDirectoryPage } from "@/lib/directory-pages";
import { getBreadcrumbs } from "@/lib/breadcrumbs";
import { DirectoryPageTitle } from "@/app/ui/directories/directory-page-content";
import { PageMeta } from "@/app/ui/site/page-meta";
import { PageCanvas } from "@/app/ui/site/page-canvas";
import { getRequiredPublishedPage } from "@/lib/page-registry";
import { getTerminalApps } from "@/lib/terminal-apps";
import { AppShell, SidebarLabel } from "@/app/ui/site/app-shell";
import { DirectoryQueryProvider } from "../../../ui/directories/directory-query";
import { Doodle } from "@/app/ui/site/doodle";
import { siteDoodleStarArt } from "../../art/site--doodle-star";
import { DirectoryTitleIcon } from "@/app/ui/directories/directory-title-icon";
import { PageHeader } from "@/app/ui/site/page-header";
import { EntryHero } from "@/app/ui/site/entry-hero";
import { siteSpotCliAppsArt } from "../../art/site--spot-cli-apps";
import { CliAppDetailsBody } from "./cli-app-details";
import { HiddenDetails } from "@/app/ui/directories/hidden-details";
import { cliAppFilterOptions } from "./cli-app-facets";
import { cliAppPageSize } from "./cli-app-options";
import { CliAppFilters, CliAppResults } from "./cli-app-view";
import { sortApps } from "./filters";
import { proseClassName, proseSectionFlowClassName } from "@/app/ui/site/prose";
import Checks from "./content/checks.mdx";
import Health from "./content/health.mdx";
import Intro from "./content/intro.mdx";
import SourceModel from "./content/source-model.mdx";
import Types from "./content/types.mdx";

const route = "/cli-apps";

// Static page: the default view (most popular, page 1). Filters run in the browser.
export default async function CliAppsPage() {
  const directoryPage = await getRequiredDirectoryPage("cli-apps");
  const [apps, registryPage] = await Promise.all([
    getTerminalApps(),
    getRequiredPublishedPage("cli-apps"),
  ]);
  const defaultApps = sortApps(apps, "popular").slice(0, cliAppPageSize);

  const options = cliAppFilterOptions(apps);
  const categoryLabels = Object.fromEntries(options.category.map((option) => [option.value, option.label]));

  const sidebar = (
    <CliAppFilters
      heading={<SidebarLabel>{registryPage.label}</SidebarLabel>}
      options={options}
      route={route}
    />
  );

  const categoryLinks = await getAppCategoryLinks("cli-apps");

  return (
    <DirectoryQueryProvider route={route}>
      <AppShell
        mainLabel="Terminal apps directory"
        menuLabel="Filters"
        sidebar={sidebar}
        sidebarLabel="Terminal app filters"
      >
        <RegistryStructuredData path="/cli-apps" />
        <EntryHero art={siteSpotCliAppsArt}>
          <PageHeader breadcrumbs={await getBreadcrumbs("cli-apps")}>
            <h1><DirectoryTitleIcon iconKey={directoryPage.card_icon_key} />{" "}<DirectoryPageTitle title={directoryPage.title} /></h1>
            <PageMeta updatedAt={directoryPage.updated_at} />
            <Intro />
          </PageHeader>
        </EntryHero>
        <PageCanvas as="div" flow className="directory-results">
          <CliAppResults firstPage={defaultApps} total={apps.length} categoryLabels={categoryLabels} emptyVisual={<Doodle svg={siteDoodleStarArt} />} route={route} />
          <HiddenDetails prefix="cli-app" items={defaultApps.map((app) => ({ slug: app.slug, name: app.name, body: <CliAppDetailsBody app={app} /> }))} />
          <AppCategoryLinks categories={categoryLinks} />
          <article className={`${proseClassName} ${proseSectionFlowClassName}`}>
            <section>
              <Types />
            </section>
            <section>
              <Checks />
            </section>
            <section>
              <Health />
            </section>
            <section>
              <SourceModel />
            </section>
          </article>
        </PageCanvas>
      </AppShell>
    </DirectoryQueryProvider>
  );
}
