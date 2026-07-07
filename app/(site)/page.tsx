import Link from "next/link";
import { getSelfHostAppsStats } from "@/lib/apps";
import { AppShell } from "../app-shell";

export const dynamic = "force-dynamic";

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
  const stats = await getSelfHostAppsStats();

  return (
    <AppShell
      mainLabel="Home"
      menuLabel="Menu"
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
              <h2>Self-host apps</h2>
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
  );
}
