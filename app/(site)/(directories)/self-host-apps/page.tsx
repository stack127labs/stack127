import { PageCanvas } from "@/app/ui/site/page-canvas";
import { HardDrive } from "lucide-react";
import { FaGithub } from "react-icons/fa6";
import { getRequiredPublishedPage } from "@/lib/page-registry";
import { getSelfHostAppsSearch } from "@/lib/self-host-apps-search-data";
import { parseSelfHostAppsSearchParams } from "@/lib/self-host-apps-search";
import { AppShell, SidebarLabel } from "@/app/ui/site/app-shell";
import { Doodle } from "@/app/ui/site/doodle";
import { siteDoodleSparkArt } from "../../art/site--doodle-spark";
import {
  sidebarPanelGithubLinkClassName,
  sidebarPanelHeadingClassName,
} from "@/app/ui/site/sidebar-panel";
import { DirectoryQueryProvider } from "@/app/ui/directories/directory-query";
import { HiddenDetails } from "@/app/ui/directories/hidden-details";
import { AppDetailsBody } from "./app-details";
import { SelfHostAppFilters } from "./filters";
import { route } from "./options";
import { SelfHostAppResults } from "./results";
import { SelfHostAppsSearchProvider } from "./search";
import { PageTitleIcon } from "@/app/ui/site/page-title-icon";
import { PageHeader } from "@/app/ui/site/page-header";
import { EntryHero } from "@/app/ui/site/entry-hero";
import { siteSpotSelfHostAppsArt } from "../../art/site--spot-self-host-apps";

// The static page is the default view: most popular first, no filters, page 1.
// Filters, search, sort, and other pages load in the browser from the search API.
export default async function SelfHostAppsPage() {
  const [{ detailApps, ...initial }, registryPage] = await Promise.all([
    getSelfHostAppsSearch(parseSelfHostAppsSearchParams(new URLSearchParams())),
    getRequiredPublishedPage("self-host-apps"),
  ]);

  const heading = (
    <div className={sidebarPanelHeadingClassName}>
      <SidebarLabel>{registryPage.label}</SidebarLabel>
      <a
        className={sidebarPanelGithubLinkClassName}
        href="https://github.com/stack127labs/stack127-datasets/tree/main/self-host-apps"
        rel="noreferrer"
        target="_blank"
      >
        <FaGithub aria-hidden="true" size={14} />
        View on Github
      </a>
    </div>
  );

  return (
    <DirectoryQueryProvider route={route}>
      <SelfHostAppsSearchProvider initial={initial}>
        <AppShell
          mainLabel="Self-hosted app results"
          menuLabel="Filters"
          sidebar={<SelfHostAppFilters heading={heading} />}
          sidebarLabel="Self-hosted app filters"
        >
          <EntryHero art={siteSpotSelfHostAppsArt}>
            <PageHeader>
              <h1>
                <PageTitleIcon>
                  <HardDrive strokeWidth={2.2} />
                </PageTitleIcon>{" "}
                Self-host <mark>apps that fit</mark> your server, storage, and setup comfort
              </h1>
              <p>
                Browse open-source, source-available, and closed-source apps by purpose, setup,
                resource needs, price, and maintenance.
              </p>
            </PageHeader>
          </EntryHero>
          <PageCanvas as="div" flow className="directory-results">
            <SelfHostAppResults emptyVisual={<Doodle svg={siteDoodleSparkArt} />} />
            <HiddenDetails prefix="self-host-app" items={detailApps.map((app) => ({ slug: app.slug, name: app.name, body: <AppDetailsBody app={app} /> }))} />
          </PageCanvas>
        </AppShell>
      </SelfHostAppsSearchProvider>
    </DirectoryQueryProvider>
  );
}
