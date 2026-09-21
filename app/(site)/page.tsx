import { PageCanvas } from "@/app/page-canvas";
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
  Layers3,
  Network,
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
import { siteSpotDnsToolsArt } from "./art/site--spot-dns-tools";
import { siteSpotDomainToolsArt } from "./art/site--spot-domain-tools";
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
import { siteSpotStorageToolsArt } from "./art/site--spot-storage-tools";
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
import { AppShell, SidebarLabel } from "../app-shell";
import { Doodle } from "../doodle";
import { EntryHero } from "../entry-hero";
import { SidebarList } from "../sidebar-list";
import { dnsToolCount } from "./(catalogs)/dns-tools/dns-tools-sidebar";
import { domainToolCount, domainReferenceCount } from "./(catalogs)/domain-tools/domain-tools-sidebar";
import { storageToolCount } from "./(catalogs)/storage-tools/storage-tools-sidebar";
import {
  sidebarPanelClassName,
  sidebarPanelHeadingClassName,
} from "../sidebar-panel";
import { siteHeroStack127Art } from "./art/site--hero-stack127";

export const dynamic = "force-dynamic";

type HomeStat = {
  label: string;
  value: string;
};

/** Legal pages stay in the footer; the explore list is for the real content. */
const legalSlugs = new Set(["about", "privacy", "terms"]);

/** Monochrome icon per feature page; unknown slugs fall back to the chevron. */
const pageIcons: Record<string, LucideIcon> = {
  "cli-apps": SquareTerminal,
  "dns-tools": Network,
  "domain-tools": Globe,
  "epp-status-codes": ListChecks,
  "labs": FlaskConical,
  "local-security-cameras": Camera,
  "matter-devices": HouseWifi,
  "nut-compatible-ups": BatteryCharging,
  "self-host-apps": HardDrive,
  "keyboard-shortcuts": Keyboard,
  "self-hosting-for-beginners": BookOpen,
  "software-licenses-for-self-hosting": Scale,
  "storage-tools": Layers3,
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
  "dns-tools": siteSpotDnsToolsArt,
  "domain-tools": siteSpotDomainToolsArt,
  "epp-status-codes": eppStatusArt,
  "keyboard-shortcuts": siteSpotKeyboardShortcutsArt,
  "labs": siteSpotLabsArt,
  "self-host-apps": siteSpotSelfHostAppsArt,
  "self-hosting-for-beginners": siteSpotCourseArt,
  "software-licenses-for-self-hosting": siteSpotLicensesArt,
  "storage-tools": siteSpotStorageToolsArt,
  "tld-directory": tldDirectoryArt,
};

function HomeSidebar({ pages }: { pages: Stack127Page[] }) {
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
              const Icon = pageIcons[page.slug];

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

  if (page.slug === "dns-tools") {
    return [{ label: "tools", value: dnsToolCount.toLocaleString("en-US") }];
  }

  if (page.slug === "domain-tools") {
    return [metric("tools", domainToolCount), metric("references", domainReferenceCount)];
  }

  if (page.slug === "storage-tools") {
    return [{ label: "tools", value: storageToolCount.toLocaleString("en-US") }];
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
    <Link className="home-page-card" href={pathFromSlug(page.slug)}>
      <span className="home-page-card-art" aria-hidden="true">
        <Doodle svg={art} />
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
  const [homePage, mainPages, appStats] = await Promise.all([
    getRequiredPublishedPage(""),
    getMainPublishedPages(),
    getSelfHostAppsStats(),
  ]);
  const visibleMainPages = mainPages.filter(isHomeVisiblePage);
  const featurePages = visibleMainPages.filter(isHomeFeaturePage);
  const cardStats = await Promise.all(featurePages.map((page) => buildCardStats(page, appStats)));
  const startItems = startHereItems(new Set(featurePages.map((page) => page.slug)));

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
            A toolbox and reference hub for <mark>solo builders and tinkerers creating things online.</mark>
          </h1>
          <p className="home-lede">
            Find a tool for your next project, compare software and hardware, and learn
            with practical references and courses.
          </p>
        </header>
      </EntryHero>
      <PageCanvas as="section" flow className="home-main" aria-labelledby="home-title">
        <div className="home-page-grid">
          {featurePages.map((page, index) => (
            <HomePageCard
              key={page.slug}
              page={page}
              stats={cardStats[index]}
            />
          ))}
        </div>

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
