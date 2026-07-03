import Link from "next/link";
import type { Metadata } from "next";
import { getSelfHostAppsModifiedAt, getSelfHostAppsStats } from "@/lib/apps";
import {
  buildWebPageStructuredData,
  defaultDescription,
  latestIsoDate,
  pageDates,
  siteName,
} from "@/lib/seo";
import { AppShell } from "./app-shell";
import { JsonLd } from "./json-ld";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
  description: defaultDescription,
  openGraph: {
    description: defaultDescription,
    title: siteName,
    url: "/",
  },
  robots: {
    follow: true,
    index: true,
  },
  title: {
    absolute: siteName,
  },
};

function HomeSidebar() {
  return (
    <div className="directory-filter-panel home-sidebar-panel">
      <nav className="home-sidebar-nav" aria-label="Home navigation">
        <Link href="/self-host-apps">self-host apps</Link>
      </nav>
    </div>
  );
}

export default async function Home() {
  const [stats, selfHostModifiedAt] = await Promise.all([
    getSelfHostAppsStats(),
    getSelfHostAppsModifiedAt(),
  ]);
  const dateModified = latestIsoDate(pageDates.home.updated, selfHostModifiedAt);

  return (
    <>
      <JsonLd
        data={buildWebPageStructuredData({
          dateModified,
          datePublished: pageDates.home.published,
          description: defaultDescription,
          name: siteName,
          path: "/",
        })}
      />
      <AppShell
        mainLabel="Home"
        sidebar={<HomeSidebar />}
        sidebarLabel="Home sidebar"
      >
        <section className="home-hero" aria-labelledby="home-title">
          <div className="home-hero-copy">
            <h1 id="home-title">
              Find useful technical tools, references, and directories.
            </h1>
          </div>

          <Link className="home-self-host-card" href="/self-host-apps">
            <div>
              <h2>self-host apps.</h2>
              <p>
                Browse practical apps by category, resources, Docker support,
                project health, and platform signals.
              </p>
            </div>

            <dl className="home-self-host-stats" aria-label="Self-host app stats">
              <div>
                <dt>apps</dt>
                <dd>{stats.appCount.toLocaleString("en-US")}</dd>
              </div>
              <div>
                <dt>categories</dt>
                <dd>{stats.categoryCount.toLocaleString("en-US")}</dd>
              </div>
              <div>
                <dt>docker</dt>
                <dd>{stats.dockerCount.toLocaleString("en-US")}</dd>
              </div>
              <div>
                <dt>active</dt>
                <dd>{stats.activeCount.toLocaleString("en-US")}</dd>
              </div>
            </dl>
          </Link>
        </section>
      </AppShell>
    </>
  );
}
