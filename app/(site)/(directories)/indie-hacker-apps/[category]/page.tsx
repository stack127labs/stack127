import { notFound } from "next/navigation";
import { getRequiredDirectoryPage } from "@/lib/directory-pages";
import { getBreadcrumbs } from "@/lib/breadcrumbs";
import { getRequiredPublishedPage } from "@/lib/page-registry";
import { getIndieCategoryData, getIndieCategory, indieAppCard, indieCategories, indieCategoryPath } from "@/lib/indie-hacker-apps";
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
import { siteDoodleSparkArt } from "../../../art/site--doodle-spark";
import { IndieAppDetailsBody } from "../app-details";
import { RecentChanges } from "../changes";
import { defaultView, indiePageSize } from "../filters";
import { IndieFilters, IndieResults } from "../indie-app-view";
import { CategoryIcon } from "../icons";
import { indieCategoryContent } from "./content";

// Build every category during the release. Unpublished categories still return 404.
export function generateStaticParams() {
  return indieCategories.map((category) => ({ category: category.slug }));
}

export default async function IndieCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category: slug } = await params;
  const category = getIndieCategory(slug);
  if (!category) notFound();
  const pageSlug = `indie-hacker-apps/${slug}`;
  const content = indieCategoryContent[slug];
  if (!content) throw new Error(`Published indie hacker apps category has no content: ${slug}`);
  // A failed load must surface as an error, never as a cacheable page.
  const [directoryPage, registryPage, data] = await Promise.all([
    getRequiredDirectoryPage(pageSlug),
    getRequiredPublishedPage(pageSlug),
    getIndieCategoryData(slug),
  ]);
  const cards = data.apps.map(indieAppCard);
  const firstPage = defaultView(category, cards).slice(0, indiePageSize);
  const firstSlugs = new Set(firstPage.map((app) => app.slug));

  const counts = {
    total: cards.length,
    jobs: Object.fromEntries(category.jobs.map(([id]) => [id, cards.filter((app) => app.jobs.includes(id)).length])),
    free: {
      free: cards.filter((app) => app.free.kind === "free").length,
      selfhost: cards.filter((app) => app.free.kind === "selfhost").length,
      trial: cards.filter((app) => app.free.kind === "trial" || app.free.kind === "credits").length,
    },
    features: Object.fromEntries(category.signals.map(([cell, value]) => [cell, cards.filter((app) => (app.cells[cell] ?? "").startsWith(value)).length])),
  };

  const { Intro, Article } = content;
  return (
    <DirectoryQueryProvider route={indieCategoryPath(slug)}>
      <AppShell
        mainLabel={`${category.name} apps`}
        menuLabel="Filters"
        sidebar={<IndieFilters categorySlug={slug} counts={counts} heading={<SidebarLabel>{registryPage.label}</SidebarLabel>} />}
        sidebarLabel={`${category.name} filters`}
      >
        <EntryHero art={null}>
          <PageHeader breadcrumbs={await getBreadcrumbs(pageSlug)}>
            <h1>
              <DirectoryTitleIcon fallback={<CategoryIcon slug={slug} />} iconKey={directoryPage.card_icon_key} />{" "}
              <DirectoryPageTitle title={directoryPage.title} />
            </h1>
            <PageMeta updatedAt={directoryPage.updated_at} />
            <Intro />
          </PageHeader>
        </EntryHero>
        <PageCanvas as="div" className="directory-results" flow>
          <IndieResults categorySlug={slug} emptyVisual={<Doodle svg={siteDoodleSparkArt} />} firstPage={firstPage} total={cards.length} />
          {/* A short panel per first-page app, for search engines and readers without JavaScript. */}
          <HiddenDetails
            items={data.apps.filter((app) => firstSlugs.has(app.slug)).map((app) => ({
              slug: app.slug,
              name: app.name,
              body: <IndieAppDetailsBody app={app} category={category} factLimit={4} />,
            }))}
            prefix={`indie-${slug}`}
          />
          <article className={`${proseClassName} ${proseSectionFlowClassName}`}>
            <Article />
            <RecentChanges changes={data.changes} />
          </article>
        </PageCanvas>
      </AppShell>
    </DirectoryQueryProvider>
  );
}
