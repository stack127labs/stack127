import Link from "next/link";
import type { ReactNode } from "react";
import "./home.css";
import { getSelfHostAppsStats } from "@/lib/apps";
import {
  getMainPublishedPages,
  getRequiredPublishedPage,
  isHomeFeaturePage,
  isHomeVisiblePage,
  pathFromSlug,
  type Version127Page,
} from "@/lib/page-registry";
import { lessons } from "@/lib/self-hosting-for-beginners";
import { licenses } from "@/lib/software-licenses";
import { AppShell, SidebarLabel } from "../app-shell";
import { dotBandClassName } from "../dot-band";
import { Doodle } from "../doodle";
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

function HomeSidebar({ label, pages }: { label: string; pages: Version127Page[] }) {
  return (
    <div className={`${sidebarPanelClassName} home-sidebar-panel`}>
      <div className={sidebarPanelHeadingClassName}>
        <SidebarLabel>{label}</SidebarLabel>
      </div>
      <nav className="home-sidebar-nav" aria-label="Main pages">
        <ul>
          {pages.map((page) => (
            <li key={page.slug}>
              <Link href={pathFromSlug(page.slug)}>{page.label}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

function buildCardStats(
  page: Version127Page,
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

  return [];
}

function HomePageCard({
  page,
  stats,
}: {
  page: Version127Page;
  stats: HomeStat[];
}) {
  return (
    <Link className="home-page-card" href={pathFromSlug(page.slug)}>
      <div className="home-page-card-copy">
        <h2>{page.label}</h2>
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
      sidebar={<HomeSidebar label={homePage.label} pages={visibleMainPages} />}
      sidebarLabel="Home sidebar"
    >
      <div className={`${dotBandClassName} home-hero-band`}>
        <header className="home-intro">
          <h1 id="home-title">
            Practical tools for <mark>self-hosting</mark>
          </h1>
          <p className="home-lede">
            Compact directories, a beginner course, and references you can scan without
            wading through filler.
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
