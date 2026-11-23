import { PageCanvas } from "@/app/ui/site/page-canvas";
import "@/app/(site)/home.css";
import { directoryCardCounts } from "@/app/(site)/(directories)/card-counts";
import { getCardSnapshot as getLaunchDirectorySnapshot } from "@/app/(site)/(directories)/launch-directories/card-counts";
import { getPublishedToolCatalog, getPublishedToolCatalogs } from "@/lib/tool-catalogs";
import { CatalogCard } from "@/app/ui/cards/catalog-card";
import { CourseCard } from "@/app/ui/cards/course-card";
import { DirectoryCard } from "@/app/ui/cards/directory-card";
import { AppStackCard } from "@/app/ui/cards/app-stack-card";
import { appStackGroup, getAppStackPages } from "@/app/ui/directories/app-directory/app-stack";
import {
  getMainPublishedPages,
  getRequiredPublishedPage,
  isHomeFeaturePage,
  isHomeVisiblePage,
  type Stack127Page,
} from "@/lib/page-registry";
import { getRequiredCourse } from "@/lib/course-pages";
import { AppShell } from "@/app/ui/site/app-shell";
import { EntryHero } from "@/app/ui/site/entry-hero";
import { siteHeroStack127Art } from "@/app/(site)/art/site--hero-stack127";

type HomePageCardRecord = Stack127Page & {
  card_name: string;
  card_description: string;
  card_icon_key: string | null;
  card_art_key: string | null;
};

/** Pages the home page leaves out, though they stay published and in the menus. */
const hiddenOnHome = new Set(["labs"]);

async function publishedLessonCount(page: Stack127Page) {
  const course = await getRequiredCourse(page.slug);
  return course.lessons.filter((lesson) => lesson.published).length;
}

export default async function Home() {
  const [homePage, mainPages, toolCatalogs, appStackPages] = await Promise.all([
    getRequiredPublishedPage(""),
    getMainPublishedPages(),
    getPublishedToolCatalogs(),
    getAppStackPages(),
  ]);
  const featurePages = mainPages.filter((page) =>
    isHomeVisiblePage(page) && isHomeFeaturePage(page) && !hiddenOnHome.has(page.slug)) as HomePageCardRecord[];
  const directoryPages = featurePages.filter((page) => page.page_family !== "course");
  const coursePages = featurePages.filter((page) => page.page_family === "course");
  // One snapshot feeds both the card counts and the freshness marker, so they can't straddle a refresh.
  const launchSnapshot = directoryPages.some((page) => page.slug === "launch-directories") ? await getLaunchDirectorySnapshot() : null;
  const [directoryCounts, lessonCounts, catalogTools] = await Promise.all([
    Promise.all(directoryPages.map((page) => directoryCardCounts(page.slug))),
    Promise.all(coursePages.map(publishedLessonCount)),
    // Each catalog's tools come from its cached, tagged entry, so a membership or tool card change refreshes the home cards.
    Promise.all(toolCatalogs.map((catalog) => getPublishedToolCatalog(catalog.page.slug))),
  ]);

  return (
    <AppShell mainLabel="Home" sidebarPosition="none">
      <EntryHero art={siteHeroStack127Art}>
        <header className="home-intro">
          <h1 id="home-title">
            A toolbox and reference hub for <mark>indie hackers</mark>
          </h1>
          <p className="home-lede">
            Free tools, calculators, directories, and reference data to help you build and run projects online.
          </p>
        </header>
      </EntryHero>
      {launchSnapshot ? <span data-launch-directories-revision={launchSnapshot.revision} hidden /> : null}
      <PageCanvas as="section" flow className="home-main" aria-labelledby="home-title">
        {directoryPages.length > 0 || appStackPages.length > 0 ? (
          <section className="home-resources" aria-labelledby="home-resources-title">
            <h2 id="home-resources-title">Directories and references</h2>
            <div className="home-page-grid">
              {directoryPages.map((page, index) => (
                <DirectoryCard counts={directoryCounts[index]} key={page.slug} page={page} />
              ))}
              {appStackPages.length > 0 ? <AppStackCard iconKey={appStackGroup.iconKey} name={appStackGroup.name} pages={appStackPages} /> : null}
            </div>
          </section>
        ) : null}

        {toolCatalogs.length > 0 ? (
          <section className="home-catalogs" aria-labelledby="home-catalogs-title">
            <h2 id="home-catalogs-title">Tool catalogs</h2>
            <div className="home-catalog-grid">
              {toolCatalogs.map((catalog, index) => (
                <CatalogCard catalog={catalog} key={catalog.page.slug} tools={catalogTools[index]?.tools ?? []} />
              ))}
            </div>
          </section>
        ) : null}

        {coursePages.length > 0 ? (
          <section className="home-courses" aria-labelledby="home-courses-title">
            <h2 id="home-courses-title">Courses</h2>
            <div className="home-course-list">
              {coursePages.map((page, index) => (
                <CourseCard key={page.slug} lessons={lessonCounts[index]} page={page} />
              ))}
            </div>
          </section>
        ) : null}
      </PageCanvas>
    </AppShell>
  );
}
