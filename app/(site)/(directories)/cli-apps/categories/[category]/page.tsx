import { notFound } from "next/navigation";
import { getRequiredDirectoryPage } from "@/lib/directory-pages";
import { getAppCategoryLinks } from "@/lib/app-categories";
import { appCategoryStaticParams, MIN_CATEGORY_APPS } from "@/lib/app-category-model";
import { getBreadcrumbs } from "@/lib/breadcrumbs";
import { getTerminalApps } from "@/lib/terminal-apps";
import { AppCategoryLinks } from "@/app/ui/directories/app-category-links";
import { DirectoryPageTitle } from "@/app/ui/directories/directory-page-content";
import { DirectoryQueryProvider } from "@/app/ui/directories/directory-query";
import { HiddenDetails } from "@/app/ui/directories/hidden-details";
import { AppShell, SidebarLabel } from "@/app/ui/site/app-shell";
import { Doodle } from "@/app/ui/site/doodle";
import { EntryHero } from "@/app/ui/site/entry-hero";
import { PageCanvas } from "@/app/ui/site/page-canvas";
import { PageHeader } from "@/app/ui/site/page-header";
import { PageMeta } from "@/app/ui/site/page-meta";
import { proseClassName, proseSectionFlowClassName } from "@/app/ui/site/prose";
import { siteDoodleStarArt } from "../../../../art/site--doodle-star";
import { siteSpotCliAppsArt } from "../../../../art/site--spot-cli-apps";
import { CliAppDetailsBody } from "../../cli-app-details";
import { cliAppFilterOptions } from "../../cli-app-facets";
import { cliAppPageSize } from "../../cli-app-options";
import { CliAppFilters, CliAppResults } from "../../cli-app-view";
import { filterApps, sortApps } from "../../filters";
import { categoryAbouts, categoryIntros } from "./content";

export const revalidate = false;
export async function generateStaticParams() {
  return appCategoryStaticParams(await getAppCategoryLinks("cli-apps"));
}

// The static page is the category's default view: most popular first, page 1.
// Filters, search, sort, and later pages run in the browser on the cached CLI
// index, always limited to this category, and the URL stays on this page.
export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const route = `/cli-apps/categories/${category}`;
  const directoryPage = await getRequiredDirectoryPage(`cli-apps/categories/${category}`);
  const categories = await getAppCategoryLinks("cli-apps");
  const current = categories.find(entry => entry.slug === category);
  if (!current) notFound();
  const Intro = categoryIntros[category];
  if (!Intro) throw new Error(`Missing CLI category intro: ${category}`);
  const About = categoryAbouts[category];
  if (!About) throw new Error(`Missing CLI category about section: ${category}`);
  const apps = sortApps(filterApps(await getTerminalApps(), { category }), "popular");
  if (apps.length < MIN_CATEGORY_APPS) notFound();
  const defaultApps = apps.slice(0, cliAppPageSize);
  const options = cliAppFilterOptions(apps);
  const categoryLabels = Object.fromEntries(options.category.map((option) => [option.value, option.label]));

  return (
    <DirectoryQueryProvider route={route}>
      <AppShell
        mainLabel={`${current.name} terminal apps`}
        menuLabel="Filters"
        sidebar={<CliAppFilters category={category} heading={<SidebarLabel>{current.name}</SidebarLabel>} options={options} route={route} />}
        sidebarLabel={`${current.name} app filters`}
      >
        <EntryHero art={siteSpotCliAppsArt}>
          <PageHeader breadcrumbs={await getBreadcrumbs(directoryPage.slug)}>
            <h1><DirectoryPageTitle title={directoryPage.title} /></h1>
            <PageMeta updatedAt={directoryPage.updated_at} />
            <Intro />
          </PageHeader>
        </EntryHero>
        <PageCanvas as="div" flow className="directory-results">
          <CliAppResults category={category} firstPage={defaultApps} total={apps.length} categoryLabels={categoryLabels} emptyVisual={<Doodle svg={siteDoodleStarArt} />} route={route} />
          <HiddenDetails prefix="cli-app" items={defaultApps.map((app) => ({ slug: app.slug, name: app.name, body: <CliAppDetailsBody app={app} /> }))} />
          <AppCategoryLinks categories={categories} current={category} />
          <article className={`${proseClassName} ${proseSectionFlowClassName}`}>
            <section>
              <About />
            </section>
          </article>
        </PageCanvas>
      </AppShell>
    </DirectoryQueryProvider>
  );
}
