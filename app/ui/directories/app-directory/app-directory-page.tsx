import type { ComponentType } from "react";
import { siteDoodleSparkArt } from "@/app/(site)/art/site--doodle-spark";
import { DirectoryPageTitle } from "@/app/ui/directories/directory-page-content";
import { DirectoryQueryProvider } from "@/app/ui/directories/directory-query";
import { DirectoryTitleIcon } from "@/app/ui/directories/directory-title-icon";
import { HiddenDetails } from "@/app/ui/directories/hidden-details";
import { AppShell, SidebarLabel } from "@/app/ui/site/app-shell";
import { Doodle } from "@/app/ui/site/doodle";
import { EntryHero } from "@/app/ui/site/entry-hero";
import { PageCanvas } from "@/app/ui/site/page-canvas";
import { PageHeader } from "@/app/ui/site/page-header";
import { PageMeta } from "@/app/ui/site/page-meta";
import { proseClassName, proseSectionFlowClassName } from "@/app/ui/site/prose";
import { getBreadcrumbs } from "@/lib/breadcrumbs";
import { getRequiredDirectoryPage } from "@/lib/directory-pages";
import { appDirectoryPath, defaultView, getAppDirectoryApps, getAppDirectoryData } from "@/lib/indie-hacker-apps";
import { getRequiredPublishedPage } from "@/lib/page-registry";
import { AppDetailsBody } from "./app-details";
import { AppDirectoryFilters, AppDirectoryResults } from "./app-directory-view";
import { appDirectoryPageSize } from "./params";
import { appDirectoryContext, hiddenDetailsPrefix } from "./shared";

/**
 * One app directory (/payment-providers, /file-storage, ...). Every route passes its slug
 * and its MDX. Static: the default view (lowest cost, page 1) and that page's short side
 * panels are in the HTML. Filters, sizes, and other pages run in the browser.
 */
export async function AppDirectoryPage({ slug, Intro, Article }: {
  slug: string;
  Intro: ComponentType;
  Article: ComponentType;
}) {
  // The registry decides first: an unpublished directory is a 404 before any app data loads,
  // so a build without its registry row or app table still passes.
  const directoryPage = await getRequiredDirectoryPage(slug);
  const [registryPage, data] = await Promise.all([getRequiredPublishedPage(slug), getAppDirectoryData(slug)]);
  const firstPage = defaultView(data.view, data.apps).slice(0, appDirectoryPageSize);
  const details = await getAppDirectoryApps(slug, firstPage.map((app) => app.slug));
  const { jobLabels } = appDirectoryContext(slug);
  const name = data.directory.name;

  return (
    <DirectoryQueryProvider route={appDirectoryPath(slug)}>
      <AppShell
        mainLabel={`${name} directory`}
        menuLabel="Filters"
        sidebar={<AppDirectoryFilters counts={data.counts} directorySlug={slug} heading={<SidebarLabel>{registryPage.label}</SidebarLabel>} />}
        sidebarLabel={`${name} filters`}
      >
        <EntryHero art={null}>
          <PageHeader breadcrumbs={await getBreadcrumbs(slug)}>
            <h1><DirectoryTitleIcon iconKey={directoryPage.card_icon_key} />{" "}<DirectoryPageTitle title={directoryPage.title} /></h1>
            <PageMeta updatedAt={directoryPage.updated_at} />
            <Intro />
          </PageHeader>
        </EntryHero>
        <PageCanvas as="div" className="directory-results" flow>
          <AppDirectoryResults directorySlug={slug} emptyVisual={<Doodle svg={siteDoodleSparkArt} />} firstPage={firstPage} total={data.apps.length} />
          <HiddenDetails
            items={details.map((app) => ({ slug: app.slug, name: app.name, body: <AppDetailsBody app={app} factLimit={4} jobLabels={jobLabels} view={data.view} /> }))}
            prefix={hiddenDetailsPrefix(slug)}
          />
          <article className={`${proseClassName} ${proseSectionFlowClassName}`}>
            <Article />
          </article>
        </PageCanvas>
      </AppShell>
    </DirectoryQueryProvider>
  );
}
