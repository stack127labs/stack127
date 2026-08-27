import {
  BookOpen,
  FileSearch,
  Gauge,
  Globe,
  HardDrive,
  Keyboard,
  FlaskConical,
  Layers3,
  Network,
  Route,
  Scale,
  ShieldCheck,
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
import { siteSpotDockerignoreArt } from "./art/site--spot-dockerignore";
import { siteSpotHomeAssistantEnergyArt } from "./art/site--spot-home-assistant-energy";
import { siteSpotNfsFirewallArt } from "./art/site--spot-nfs-firewall";
import { siteSpotNginxProxyPassArt } from "./art/site--spot-nginx-proxy-pass";
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
import { dotBandClassName } from "../dot-band";
import { Doodle } from "../doodle";
import { SidebarList } from "../sidebar-list";
import { dnsToolCount } from "./(catalogs)/dns-tools/dns-tools-sidebar";
import { domainToolCount } from "./(catalogs)/domain-tools/domain-tools-sidebar";
import { storageToolCount } from "./(catalogs)/storage-tools/storage-tools-sidebar";
import {
  sidebarPanelClassName,
  sidebarPanelHeadingClassName,
} from "../sidebar-panel";
import { siteDoodleStarArt } from "./art/site--doodle-star";

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
  "dockerignore-tester": FileSearch,
  "domain-tools": Globe,
  "home-assistant-energy-entity-checker": Gauge,
  "labs": FlaskConical,
  "nfs-firewall-rules": ShieldCheck,
  "nginx-proxy-pass-calculator": Route,
  "self-host-apps": HardDrive,
  "keyboard-shortcuts": Keyboard,
  "self-hosting-for-beginners": BookOpen,
  "software-licenses-for-self-hosting": Scale,
  "storage-tools": Layers3,
};

/** Marker spot per feature page: the card's visual one-liner. */
const pageArt: Record<string, string> = {
  "cli-apps": siteSpotCliAppsArt,
  "dns-tools": siteSpotDnsToolsArt,
  "dockerignore-tester": siteSpotDockerignoreArt,
  "domain-tools": siteSpotDomainToolsArt,
  "home-assistant-energy-entity-checker": siteSpotHomeAssistantEnergyArt,
  "keyboard-shortcuts": siteSpotKeyboardShortcutsArt,
  "labs": siteSpotLabsArt,
  "nfs-firewall-rules": siteSpotNfsFirewallArt,
  "nginx-proxy-pass-calculator": siteSpotNginxProxyPassArt,
  "self-host-apps": siteSpotSelfHostAppsArt,
  "self-hosting-for-beginners": siteSpotCourseArt,
  "software-licenses-for-self-hosting": siteSpotLicensesArt,
  "storage-tools": siteSpotStorageToolsArt,
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

function buildCardStats(
  page: Stack127Page,
  appStats: Awaited<ReturnType<typeof getSelfHostAppsStats>>,
): HomeStat[] {
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
    return [{ label: "tools", value: domainToolCount.toLocaleString("en-US") }];
  }

  if (page.slug === "storage-tools") {
    return [{ label: "tools", value: storageToolCount.toLocaleString("en-US") }];
  }

  return [];
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

  return (
    <Link className="home-page-card" href={pathFromSlug(page.slug)}>
      {art ? (
        <span className="home-page-card-art">
          <Doodle svg={art} />
        </span>
      ) : null}
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

  if (featureSlugs.has("self-hosting-for-beginners")) {
    items.push({
      key: "course",
      node: (
        <>
          New to self-hosting? <Link href="/self-hosting-for-beginners">Open the course</Link>.
        </>
      ),
    });
  }

  if (featureSlugs.has("self-host-apps")) {
    items.push({
      key: "apps",
      node: (
        <>
          Looking for an app? <Link href="/self-host-apps">Browse the directory</Link>.
        </>
      ),
    });
  }

  if (featureSlugs.has("software-licenses-for-self-hosting")) {
    items.push({
      key: "licenses",
      node: (
        <>
          Checking a license label?{" "}
          <Link href="/software-licenses-for-self-hosting">Read the license notes</Link>.
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
  const startItems = startHereItems(new Set(featurePages.map((page) => page.slug)));

  return (
    <AppShell
      mainLabel="Home"
      menuLabel="Pages"
      sidebar={<HomeSidebar pages={visibleMainPages} />}
      sidebarLabel="Home sidebar"
    >
      <div className={`${dotBandClassName} home-hero-band`}>
        <header className="home-intro">
          <h1 id="home-title">
            Practical tools for people who <mark>tinker</mark>
          </h1>
          <p className="home-lede">
            Directories, tools, and guides for self-hosting, automation, AI agents, and way
            more techy stuff.
          </p>
        </header>
        <Doodle className="home-hero-doodle" placement="corner" svg={siteDoodleStarArt} />
      </div>
      <section className="home-main" aria-labelledby="home-title">
        <div className="home-page-grid">
          {featurePages.map((page) => (
            <HomePageCard
              key={page.slug}
              page={page}
              stats={buildCardStats(page, appStats)}
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
      </section>
    </AppShell>
  );
}
