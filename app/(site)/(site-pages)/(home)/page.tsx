import { PageCanvas } from "@/app/ui/site/page-canvas";
import type { ReactNode } from "react";
import Link from "next/link";
import "@/app/(site)/home.css";
import { labProjects } from "../labs/projects";
import { directoryCardCounts } from "@/app/(site)/(directories)/card-counts";
import { getCardSnapshot as getLaunchDirectorySnapshot } from "@/app/(site)/(directories)/launch-directories/card-counts";
import { getPublishedToolCatalogs } from "@/lib/tool-catalogs";
import { cardArt } from "@/lib/card-art";
import { cardIcon } from "@/lib/card-icons";
import { CatalogCard } from "@/app/ui/cards/catalog-card";
import { DirectoryCard } from "@/app/ui/cards/directory-card";
import { PageCard, PageCardCounts, type PageCardCount } from "@/app/ui/cards/page-card";
import {
  getMainPublishedPages,
  getRequiredPublishedPage,
  isHomeFeaturePage,
  isHomeVisiblePage,
  pathFromSlug,
  type Stack127Page,
} from "@/lib/page-registry";
import { getRequiredCourse } from "@/lib/course-pages";
import { AppShell, SidebarLabel } from "@/app/ui/site/app-shell";
import { EntryHero } from "@/app/ui/site/entry-hero";
import { SidebarList } from "@/app/ui/site/sidebar-list";
import {
  sidebarPanelClassName,
  sidebarPanelHeadingClassName,
} from "@/app/ui/site/sidebar-panel";
import { siteHeroStack127Art } from "@/app/(site)/art/site--hero-stack127";

type HomePageCardRecord = Stack127Page & {
  card_name: string;
  card_description: string;
  card_icon_key: string | null;
  card_art_key: string | null;
};

/** Legal pages stay in the footer; the explore list is for the real content. */
const legalSlugs = new Set(["about", "privacy", "terms"]);

/** Labs keeps its card assets and counts in code. */
const codeCards: Record<string, { iconKey: string; artKey: string; counts: () => PageCardCount[] }> = {
  labs: {
    iconKey: "labs",
    artKey: "labs",
    counts: () => [{ label: "projects", value: labProjects.length }],
  },
};

function HomeSidebar({ pages }: { pages: HomePageCardRecord[] }) {
  return (
    <div className={`${sidebarPanelClassName} home-sidebar-panel`}>
      <div className={sidebarPanelHeadingClassName}>
        <SidebarLabel>Explore stack127</SidebarLabel>
      </div>
      <nav aria-label="Main pages">
        <SidebarList
          items={pages
            .filter((page) => !legalSlugs.has(page.slug))
            .map((page) => {
              const iconKey = page.card_icon_key ?? codeCards[page.slug]?.iconKey;
              const Icon = iconKey ? cardIcon(iconKey) : null;

              return {
                href: pathFromSlug(page.slug),
                icon: Icon ? <Icon size={15} strokeWidth={2.2} /> : undefined,
                label: page.card_name,
              };
            })}
        />
      </nav>
    </div>
  );
}

async function cardCounts(page: Stack127Page) {
  if (page.page_family === "course") {
    const course = await getRequiredCourse(page.slug);
    return [{ label: "lessons", value: course.lessons.filter(lesson => lesson.published).length }];
  }
  return codeCards[page.slug]?.counts() ?? directoryCardCounts(page.slug);
}

function HomeFeatureCard({ page, counts }: { page: HomePageCardRecord; counts: PageCardCount[] }) {
  const code = codeCards[page.slug];
  if (!code) return <DirectoryCard counts={counts} page={page} />;
  return (
    <PageCard
      art={cardArt(code.artKey)}
      count={<PageCardCounts counts={counts} label={`${page.card_name} stats`} />}
      description={page.card_description}
      href={pathFromSlug(page.slug)}
      icon={cardIcon(code.iconKey)}
      name={page.card_name}
    />
  );
}

const startHereLinks = [
  { slug: "kdp-tools", question: "Publishing on Amazon KDP?", action: "Work out your royalties" },
  { slug: "saas-tools", question: "Running a SaaS?", action: "Check your MRR and churn" },
  { slug: "platform-fees", question: "Choosing where to sell?", action: "Compare platform fees" },
  { slug: "domain-tools", question: "Working on a website?", action: "Check its domain" },
  { slug: "cli-apps", question: "Looking for a terminal app?", action: "Browse CLI apps" },
];

function startHereItems(featureSlugs: Set<string>): { key: string; node: ReactNode }[] {
  return startHereLinks
    .filter((item) => featureSlugs.has(item.slug))
    .map((item) => ({
      key: item.slug,
      node: (
        <>
          {item.question} <Link href={`/${item.slug}`}>{item.action}</Link>.
        </>
      ),
    }));
}

export default async function Home() {
  const [homePage, mainPages, toolCatalogs] = await Promise.all([
    getRequiredPublishedPage(""),
    getMainPublishedPages(),
    getPublishedToolCatalogs(),
  ]);
  const visibleMainPages: HomePageCardRecord[] = [
    ...mainPages.filter(isHomeVisiblePage),
    ...toolCatalogs.map((catalog) => ({
      ...catalog.page,
      card_name: catalog.card_name,
      card_description: catalog.card_description,
      card_icon_key: catalog.card_icon_key,
      card_art_key: catalog.card_art_key,
    })),
  ].sort((left, right) => Number(right.sitemap_priority) - Number(left.sitemap_priority) || left.label.localeCompare(right.label));
  const featurePages = mainPages.filter((page) => isHomeVisiblePage(page) && isHomeFeaturePage(page));
  // One snapshot feeds both the card counts and the freshness marker, so they can't straddle a refresh.
  const launchSnapshot = featurePages.some((page) => page.slug === "launch-directories") ? await getLaunchDirectorySnapshot() : null;
  const featureCounts = await Promise.all(featurePages.map(cardCounts));
  const startItems = startHereItems(new Set([...featurePages.map((page) => page.slug), ...toolCatalogs.map((catalog) => catalog.page.slug)]));

  return (
    <AppShell
      mainLabel="Home"
      menuLabel="Pages"
      sidebar={<HomeSidebar pages={visibleMainPages} />}
      sidebarLabel="Home sidebar"
    >
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
        {toolCatalogs.length > 0 ? (
          <section className="home-catalogs" aria-labelledby="home-catalogs-title">
            <h2 id="home-catalogs-title">Tool catalogs</h2>
            <div className="home-page-grid">
              {toolCatalogs.map((catalog) => <CatalogCard key={catalog.page.slug} catalog={catalog} />)}
            </div>
          </section>
        ) : null}

        {featurePages.length > 0 ? (
          <section className="home-resources" aria-labelledby="home-resources-title">
            <h2 id="home-resources-title">More to explore</h2>
            <div className="home-page-grid">
              {featurePages.map((page, index) => (
                <HomeFeatureCard counts={featureCounts[index]} key={page.slug} page={page} />
              ))}
            </div>
          </section>
        ) : null}

        {startItems.length > 0 ? (
          <section className="home-start" aria-labelledby="home-start-title">
            <h2 id="home-start-title">Start here</h2>
            <ul>
              {startItems.map((item) => (
                <li key={item.key}>{item.node}</li>
              ))}
            </ul>
          </section>
        ) : null}
      </PageCanvas>
    </AppShell>
  );
}
