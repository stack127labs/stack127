import { notFound } from "next/navigation";
import { FaGithub } from "react-icons/fa6";
import { getRequiredDirectoryPage } from "@/lib/directory-pages";
import { getAppCategoryLinks } from "@/lib/app-categories";
import { appCategoryStaticParams, MIN_CATEGORY_APPS } from "@/lib/app-category-model";
import { getBreadcrumbs } from "@/lib/breadcrumbs";
import { getSelfHostAppsSearch } from "@/lib/self-host-apps-search-data";
import { parseSelfHostAppsSearchParams } from "@/lib/self-host-apps-search";
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
import { sidebarPanelGithubLinkClassName, sidebarPanelHeadingClassName } from "@/app/ui/site/sidebar-panel";
import { siteDoodleSparkArt } from "../../../../art/site--doodle-spark";
import { siteSpotSelfHostAppsArt } from "../../../../art/site--spot-self-host-apps";
import { AppDetailsBody } from "../../app-details";
import { SelfHostAppFilters } from "../../filters";
import { SelfHostAppResults } from "../../results";
import { SelfHostAppsSearchProvider } from "../../search";
import { categoryAbouts, categoryIntros } from "./content";

export const revalidate = false;
export async function generateStaticParams() {
  return appCategoryStaticParams(await getAppCategoryLinks("self-host-apps"));
}

// The static page is the category's default view: most popular first, page 1.
// Filters, search, sort, and later pages load from the search API, always with
// this category, and the URL stays on this page.
export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const route = `/self-host-apps/categories/${category}`;
  const directoryPage = await getRequiredDirectoryPage(`self-host-apps/categories/${category}`);
  const categories = await getAppCategoryLinks("self-host-apps");
  const current = categories.find(entry => entry.slug === category);
  if (!current) notFound();
  const Intro = categoryIntros[category];
  if (!Intro) throw new Error(`Missing self-host category intro: ${category}`);
  const About = categoryAbouts[category];
  if (!About) throw new Error(`Missing self-host category about section: ${category}`);
  const { detailApps, ...initial } = await getSelfHostAppsSearch(parseSelfHostAppsSearchParams(new URLSearchParams({ category })));
  if (initial.total < MIN_CATEGORY_APPS) notFound();

  const heading = (
    <div className={sidebarPanelHeadingClassName}>
      <SidebarLabel>{current.name}</SidebarLabel>
      <a
        className={sidebarPanelGithubLinkClassName}
        href="https://github.com/stack127labs/stack127-datasets/tree/main/self-host-apps"
        rel="noreferrer"
        target="_blank"
      >
        <FaGithub aria-hidden="true" size={14} />
        View on GitHub
      </a>
    </div>
  );

  return (
    <DirectoryQueryProvider route={route}>
      <SelfHostAppsSearchProvider category={category} initial={initial} route={route}>
        <AppShell
          mainLabel={`${current.name} self-hosted apps`}
          menuLabel="Filters"
          sidebar={<SelfHostAppFilters heading={heading} />}
          sidebarLabel={`${current.name} app filters`}
        >
          <EntryHero art={siteSpotSelfHostAppsArt}>
            <PageHeader breadcrumbs={await getBreadcrumbs(directoryPage.slug)}>
              <h1><DirectoryPageTitle title={directoryPage.title} /></h1>
              <PageMeta updatedAt={directoryPage.updated_at} />
              <Intro />
            </PageHeader>
          </EntryHero>
          <PageCanvas as="div" flow className="directory-results">
            <SelfHostAppResults emptyVisual={<Doodle svg={siteDoodleSparkArt} />} />
            <HiddenDetails prefix="self-host-app" items={detailApps.map((app) => ({ slug: app.slug, name: app.name, body: <AppDetailsBody app={app} /> }))} />
            <AppCategoryLinks categories={categories} current={category} />
            <article className={`${proseClassName} ${proseSectionFlowClassName}`}>
              <section>
                <About />
              </section>
            </article>
          </PageCanvas>
        </AppShell>
      </SelfHostAppsSearchProvider>
    </DirectoryQueryProvider>
  );
}
