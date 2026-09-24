import { PageCanvas } from "@/app/ui/site/page-canvas";
import { siteSpotLocalSecurityCamerasArt } from "./art/site--spot-local-security-cameras";
import { siteSpotNutCompatibleUpsArt } from "./art/site--spot-nut-compatible-ups";
import { siteSpotZigbeeCoordinatorsArt } from "./art/site--spot-zigbee-coordinators";
import { siteSpotZigbeeDevicesArt } from "./art/site--spot-zigbee-devices";
import { siteSpotMatterDevicesArt } from "./art/site--spot-matter-devices";
import { siteSpotZWaveDevicesArt } from "./art/site--spot-z-wave-devices";
import {
  BookOpen,
  BatteryCharging,
  Camera,
  Globe,
  HardDrive,
  Keyboard,
  FlaskConical,
  Radio,
  RadioTower,
  ListChecks,
  Scale,
  HouseWifi,
  SquareTerminal,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import "./home.css";
import { siteSpotCliAppsArt } from "./art/site--spot-cli-apps";
import { siteSpotCourseArt } from "./art/site--spot-course";
import { siteSpotLicensesArt } from "./art/site--spot-licenses";
import { siteSpotLabsArt } from "./art/site--spot-labs";
import { siteSpotKeyboardShortcutsArt } from "./art/site--spot-keyboard-shortcuts";
import { siteSpotSelfHostAppsArt } from "./art/site--spot-self-host-apps";
import { eppStatusArt } from "./(catalogs)/_components/art/epp-status";
import { tldDirectoryArt } from "./(catalogs)/_components/art/tld-directory";
import { getTerminalApps } from "@/lib/terminal-apps";
import { getHardwareDirectoryCount } from "@/lib/hardware-directories";
import { getZigbeeDevices } from "@/lib/zigbee-devices";
import { shortcutAppCatalog } from "@/lib/shortcuts/catalog.generated";
import { STATUS_CODES } from "@/lib/domain/status-codes";
import tldDirectory from "@/lib/domain/data/tld-directory.json";
import { labProjects } from "./labs/projects";
import { getPublishedToolCatalogs, type ToolCatalogSummary } from "@/lib/tool-catalogs";
import { toolCatalogIcon } from "@/lib/tool-catalog-icons";
import { ToolCatalogCard } from "@/app/ui/catalogs/tool-catalog-card";
import { getSelfHostAppsStats } from "@/lib/apps";
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
import { AppShell, SidebarLabel } from "../ui/site/app-shell";
import { Doodle } from "../ui/site/doodle";
import { EntryHero } from "../ui/site/entry-hero";
import { SidebarList } from "../ui/site/sidebar-list";
import {
  sidebarPanelClassName,
  sidebarPanelHeadingClassName,
} from "../ui/site/sidebar-panel";
import { siteHeroStack127Art } from "./art/site--hero-stack127";


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
  "local-security-cameras": Camera,
  "matter-devices": HouseWifi,
  "nut-compatible-ups": BatteryCharging,
  "self-host-apps": HardDrive,
  "keyboard-shortcuts": Keyboard,
  "self-hosting-for-beginners": BookOpen,
  "software-licenses-for-self-hosting": Scale,
  "tld-directory": Globe,
  "z-wave-devices": Radio,
  "zigbee-coordinators": RadioTower,
  "zigbee-devices": RadioTower,
};

/** Marker spot per feature page: the card's visual one-liner. */
const pageArt: Record<string, string> = {
  "local-security-cameras": siteSpotLocalSecurityCamerasArt,
  "nut-compatible-ups": siteSpotNutCompatibleUpsArt,
  "zigbee-coordinators": siteSpotZigbeeCoordinatorsArt,
  "zigbee-devices": siteSpotZigbeeDevicesArt,
  "matter-devices": siteSpotMatterDevicesArt,
  "z-wave-devices": siteSpotZWaveDevicesArt,
  "cli-apps": siteSpotCliAppsArt,
  "epp-status-codes": eppStatusArt,
  "keyboard-shortcuts": siteSpotKeyboardShortcutsArt,
  "labs": siteSpotLabsArt,
  "self-host-apps": siteSpotSelfHostAppsArt,
  "self-hosting-for-beginners": siteSpotCourseArt,
  "software-licenses-for-self-hosting": siteSpotLicensesArt,
  "tld-directory": tldDirectoryArt,
};

function HomeSidebar({ pages, catalogs }: { pages: Stack127Page[]; catalogs: Map<string, ToolCatalogSummary> }) {
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
              const Icon = catalog ? toolCatalogIcon(catalog.icon_key) : pageIcons[page.slug];

              return {
                href: pathFromSlug(page.slug),
                icon: Icon ? <Icon size={15} strokeWidth={2.2} /> : undefined,
                label: page.label,
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
): Promise<HomeStat[]> {
  const metric = (label: string, count: number): HomeStat => ({ label, value: count.toLocaleString("en-US") });
  switch (page.slug) {
    case "cli-apps": return [metric("apps", (await getTerminalApps()).length)];
    case "zigbee-devices": return [metric("devices", getZigbeeDevices().length)];
    case "zigbee-coordinators": return [metric("coordinators", await getHardwareDirectoryCount(page.slug))];
    case "local-security-cameras": return [metric("cameras", await getHardwareDirectoryCount(page.slug))];
    case "nut-compatible-ups": return [metric("UPS models", await getHardwareDirectoryCount(page.slug))];
    case "z-wave-devices":
    case "matter-devices": return [metric("devices", await getHardwareDirectoryCount(page.slug))];
    case "keyboard-shortcuts": return [metric("apps", shortcutAppCatalog.length), metric("shortcuts", shortcutAppCatalog.reduce((total, app) => total + app.shortcutCount, 0))];
    case "epp-status-codes": return [metric("status codes", STATUS_CODES.length)];
    case "tld-directory": return [metric("domain extensions", tldDirectory.rows.length)];
    case "labs": return [metric("projects", labProjects.length)];
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
  page: Stack127Page;
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
          {page.label}
        </h2>
        <p>{page.meta_description}</p>
      </div>
      {stats.length > 0 ? (
        <dl className="home-page-card-stats" aria-label={`${page.label} stats`}>
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

function startHereItems(featureSlugs: Set<string>): { key: string; node: ReactNode }[] {
  const items: { key: string; node: ReactNode }[] = [];

  if (featureSlugs.has("domain-tools")) {
    items.push({
      key: "domains",
      node: (
        <>
          Working on a website? <Link href="/domain-tools">Check its domain</Link>.
        </>
      ),
    });
  }

  if (featureSlugs.has("cli-apps")) {
    items.push({
      key: "apps",
      node: (
        <>
          Looking for a terminal app? <Link href="/cli-apps">Browse CLI apps</Link>.
        </>
      ),
    });
  }

  if (featureSlugs.has("keyboard-shortcuts")) {
    items.push({
      key: "shortcuts",
      node: (
        <>
          Learning an app? <Link href="/keyboard-shortcuts">Find its shortcuts</Link>.
        </>
      ),
    });
  }

  if (featureSlugs.has("self-hosting-for-beginners")) {
    items.push({
      key: "course",
      node: (
        <>
          Setting up a home server? <Link href="/self-hosting-for-beginners">Start the course</Link>.
        </>
      ),
    });
  }

  return items;
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
    ...toolCatalogs.map((catalog) => catalog.page),
  ].sort((left, right) => Number(right.sitemap_priority) - Number(left.sitemap_priority) || left.label.localeCompare(right.label));
  const featurePages = mainPages.filter((page) => isHomeVisiblePage(page) && isHomeFeaturePage(page));
  const cardStats = await Promise.all(featurePages.map((page) => buildCardStats(page, appStats)));
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
            A toolbox and reference hub for <mark>solo builders</mark> and <mark>tinkerers</mark> creating things online.
          </h1>
          <p className="home-lede">
            Find a tool for your next project, compare software and hardware, and learn
            with practical references and courses.
          </p>
        </header>
      </EntryHero>
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
