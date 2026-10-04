import { PageCanvas } from "@/app/ui/site/page-canvas";
import {
  BookOpen,
  Globe,
  HardDrive,
  Keyboard,
  FlaskConical,
  ListChecks,
  Receipt,
  Rocket,
  Scale,
  SquareTerminal,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import "@/app/(site)/home.css";
import { siteSpotCliAppsArt } from "@/app/(site)/art/site--spot-cli-apps";
import { siteSpotCourseArt } from "@/app/(site)/art/site--spot-course";
import { siteSpotLicensesArt } from "@/app/(site)/art/site--spot-licenses";
import { siteSpotLabsArt } from "@/app/(site)/art/site--spot-labs";
import { siteSpotKeyboardShortcutsArt } from "@/app/(site)/art/site--spot-keyboard-shortcuts";
import { siteSpotLaunchDirectoriesArt } from "@/app/(site)/art/site--spot-launch-directories";
import { siteSpotPlatformFeesArt } from "@/app/(site)/art/site--spot-platform-fees";
import { siteSpotSelfHostAppsArt } from "@/app/(site)/art/site--spot-self-host-apps";
import { eppStatusArt } from "@/app/ui/art/epp-status";
import { tldDirectoryArt } from "@/app/ui/art/tld-directory";
import { getTerminalApps } from "@/lib/terminal-apps";
import { shortcutAppCatalog } from "@/lib/shortcuts/catalog.generated";
import { STATUS_CODES } from "@/lib/domain/status-codes";
import tldDirectory from "@/lib/domain/data/tld-directory.json";
import { labProjects } from "../labs/projects";
import { getPublishedToolCatalogs, type ToolCatalogSummary } from "@/lib/tool-catalogs";
import { cardIcon } from "@/lib/card-icons";
import { ToolCatalogCard } from "@/app/ui/catalogs/tool-catalog-card";
import { getSelfHostAppsStats } from "@/lib/apps";
import { getFeeDirectory } from "@/lib/platform-fees/queries";
import { getLaunchDirectorySnapshot, type LaunchDirectory } from "@/lib/launch-directories";
import {
  getMainPublishedPages,
  getRequiredPublishedPage,
  isHomeFeaturePage,
  isHomeVisiblePage,
  pathFromSlug,
  type Stack127Page,
} from "@/lib/page-registry";
import { lessons } from "@/lib/self-hosting-for-beginners";
import { licenses } from "@/lib/software-licenses";
import { AppShell, SidebarLabel } from "@/app/ui/site/app-shell";
import { Doodle } from "@/app/ui/site/doodle";
import { EntryHero } from "@/app/ui/site/entry-hero";
import { SidebarList } from "@/app/ui/site/sidebar-list";
import {
  sidebarPanelClassName,
  sidebarPanelHeadingClassName,
} from "@/app/ui/site/sidebar-panel";
import { siteHeroStack127Art } from "@/app/(site)/art/site--hero-stack127";


type HomePageCardRecord = Stack127Page & { card_name: string; card_description: string };

type HomeStat = {
  label: string;
  value: string;
};

/** Legal pages stay in the footer; the explore list is for the real content. */
const legalSlugs = new Set(["about", "privacy", "terms"]);

/** Monochrome icon per feature page; unknown slugs fall back to the chevron. */
const pageIcons: Record<string, LucideIcon> = {
  "cli-apps": SquareTerminal,
  "epp-status-codes": ListChecks,
  "labs": FlaskConical,
  "launch-directories": Rocket,
  "platform-fees": Receipt,
  "self-host-apps": HardDrive,
  "keyboard-shortcuts": Keyboard,
  "self-hosting-for-beginners": BookOpen,
  "software-licenses-for-self-hosting": Scale,
  "tld-directory": Globe,
};

/** Marker spot per feature page: the card's visual one-liner. */
const pageArt: Record<string, string> = {
  "cli-apps": siteSpotCliAppsArt,
  "epp-status-codes": eppStatusArt,
  "keyboard-shortcuts": siteSpotKeyboardShortcutsArt,
  "labs": siteSpotLabsArt,
  "launch-directories": siteSpotLaunchDirectoriesArt,
  "platform-fees": siteSpotPlatformFeesArt,
  "self-host-apps": siteSpotSelfHostAppsArt,
  "self-hosting-for-beginners": siteSpotCourseArt,
  "software-licenses-for-self-hosting": siteSpotLicensesArt,
  "tld-directory": tldDirectoryArt,
};

function HomeSidebar({ pages, catalogs }: { pages: HomePageCardRecord[]; catalogs: Map<string, ToolCatalogSummary> }) {
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
              const catalog = catalogs.get(page.slug);
              const Icon = catalog ? cardIcon(catalog.card_icon_key) : pageIcons[page.slug];

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

async function buildCardStats(
  page: Stack127Page,
  appStats: Awaited<ReturnType<typeof getSelfHostAppsStats>>,
  launchDirectories: LaunchDirectory[] | null,
): Promise<HomeStat[]> {
  const metric = (label: string, count: number): HomeStat => ({ label, value: count.toLocaleString("en-US") });
  switch (page.slug) {
    case "cli-apps": return [metric("apps", (await getTerminalApps()).length)];
    case "keyboard-shortcuts": return [metric("apps", shortcutAppCatalog.length), metric("shortcuts", shortcutAppCatalog.reduce((total, app) => total + app.shortcutCount, 0))];
    case "epp-status-codes": return [metric("status codes", STATUS_CODES.length)];
    case "tld-directory": return [metric("domain extensions", tldDirectory.rows.length)];
    case "labs": return [metric("projects", labProjects.length)];
    case "launch-directories": {
      if (!launchDirectories) throw new Error("Home card metric is missing its launch directory snapshot");
      return [metric("places", launchDirectories.length), metric("categories", new Set(launchDirectories.flatMap((directory) => directory.categories)).size)];
    }
    case "platform-fees": {
      const directory = await getFeeDirectory();
      return [metric("platforms", directory.entries.length), metric("categories", directory.sections.length)];
    }
  }
  if (page.slug === "self-host-apps") {
    return [{ label: "apps", value: appStats.appCount.toLocaleString("en-US") }];
  }

  if (page.slug === "self-hosting-for-beginners") {
    const publishedLessons = lessons.filter((lesson) => lesson.published).length;
    return [{ label: "lessons", value: publishedLessons.toLocaleString("en-US") }];
  }

  if (page.slug === "software-licenses-for-self-hosting") {
    return [{ label: "licenses", value: licenses.length.toLocaleString("en-US") }];
  }

  throw new Error(`Home card metric is missing for ${page.slug}`);
}

function HomePageCard({
  page,
  stats,
}: {
  page: HomePageCardRecord;
  stats: HomeStat[];
}) {
  const Icon = pageIcons[page.slug];
  const art = pageArt[page.slug];
  if (!art) throw new Error(`Home card marker art is missing for ${page.slug}`);

  return (
    <Link className="home-page-card" href={pathFromSlug(page.slug)} prefetch={false}>
      <span className={art ? "home-page-card-art" : "home-page-card-art home-page-card-art-icon"} aria-hidden="true">
        {art ? <Doodle svg={art} /> : Icon ? <Icon size={64} strokeWidth={1.4} /> : null}
      </span>
      <div className="home-page-card-copy">
        <h2>
          {Icon ? (
            <span aria-hidden="true" className="home-page-card-icon">
              <Icon size={18} strokeWidth={2.2} />
            </span>
          ) : null}
          {page.card_name}
        </h2>
        <p>{page.card_description}</p>
      </div>
      {stats.length > 0 ? (
        <dl className="home-page-card-stats" aria-label={`${page.card_name} stats`}>
          {stats.map((stat) => (
            <div key={stat.label}>
              <dt>{stat.label}</dt>
              <dd>{stat.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </Link>
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
  const [homePage, mainPages, appStats, toolCatalogs] = await Promise.all([
    getRequiredPublishedPage(""),
    getMainPublishedPages(),
    getSelfHostAppsStats(),
    getPublishedToolCatalogs(),
  ]);
  const catalogBySlug = new Map(toolCatalogs.map((catalog) => [catalog.page.slug, catalog]));
  const visibleMainPages = [
    ...mainPages.filter(isHomeVisiblePage),
    ...toolCatalogs.map((catalog) => ({ ...catalog.page, card_name: catalog.card_name, card_description: catalog.card_description })),
  ].sort((left, right) => Number(right.sitemap_priority) - Number(left.sitemap_priority) || left.label.localeCompare(right.label));
  const featurePages = mainPages.filter((page) => isHomeVisiblePage(page) && isHomeFeaturePage(page));
  // One snapshot feeds both the card counts and the freshness marker, so they can't straddle a refresh.
  const launchSnapshot = featurePages.some((page) => page.slug === "launch-directories") ? await getLaunchDirectorySnapshot() : null;
  const cardStats = await Promise.all(featurePages.map((page) => buildCardStats(page, appStats, launchSnapshot?.directories ?? null)));
  const startItems = startHereItems(new Set([...featurePages.map((page) => page.slug), ...toolCatalogs.map((catalog) => catalog.page.slug)]));

  return (
    <AppShell
      mainLabel="Home"
      menuLabel="Pages"
      sidebar={<HomeSidebar pages={visibleMainPages} catalogs={catalogBySlug} />}
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
              {toolCatalogs.map((catalog) => <ToolCatalogCard key={catalog.page.slug} catalog={catalog} />)}
            </div>
          </section>
        ) : null}

        {featurePages.length > 0 ? (
          <section className="home-resources" aria-labelledby="home-resources-title">
            <h2 id="home-resources-title">More to explore</h2>
            <div className="home-page-grid">
              {featurePages.map((page, index) => (
                <HomePageCard key={page.slug} page={page} stats={cardStats[index]} />
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
