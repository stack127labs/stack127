import { getRequiredDirectoryPage } from "@/lib/directory-pages";
import { getBreadcrumbs } from "@/lib/breadcrumbs";
import { DirectoryPageTitle } from "@/app/ui/directories/directory-page-content";
import { PageMeta } from "@/app/ui/site/page-meta";
import { PageCanvas } from "@/app/ui/site/page-canvas";
import "@/app/(site)/(tools)/(domain)/domain-tools.css";
import { AppShell } from "../../../ui/site/app-shell";
import { DomainToolsSidebar } from "@/app/(site)/(tools)/(domain)/domain-tools-sidebar";
import { TldTable, type TldRow } from "./tld-table";
import directory from "@/lib/domain/data/tld-directory.json" with { type: "json" };
import { DirectoryTitleIcon } from "@/app/ui/directories/directory-title-icon";
import { PageHeader } from "../../../ui/site/page-header";
import { proseSectionFlowClassName } from "../../../ui/site/prose";
import CheckAName from "./content/check-a-name.mdx";
import Dnssec from "./content/dnssec.mdx";
import HowMany from "./content/how-many.mdx";
import Intro from "./content/intro.mdx";
import Lookups from "./content/lookups.mdx";
import Prices from "./content/prices.mdx";
import Sources from "./content/sources.mdx";
import Types from "./content/types.mdx";

export default async function TldDirectoryPage() {
  const directoryPage = await getRequiredDirectoryPage("tld-directory");
  const rows = directory.rows as TldRow[];
  const signed = rows.filter((row) => row.dnssec).length;
  const lookups = rows.filter((row) => row.rdap !== "none").length;
  const refreshedOn = new Date(`${directory.fetchedAt}T00:00:00Z`).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
    year: "numeric",
  });

  return (
    <AppShell
      mainLabel="TLD directory"
      menuLabel="Domain tools"
      sidebar={<DomainToolsSidebar />}
      sidebarLabel="Domain tools sidebar"
    >
      <PageCanvas as="main" className="domain-tool-main">
        <PageHeader breadcrumbs={await getBreadcrumbs("tld-directory")}>
          <h1><DirectoryTitleIcon iconKey={directoryPage.card_icon_key} />{" "}<DirectoryPageTitle title={directoryPage.title} /></h1>
          <PageMeta updatedAt={directoryPage.updated_at} />
          <Intro />
        </PageHeader>

        <TldTable rows={rows} />

        <hr className="domain-divider" />

        <article className={`domain-reference-content ${proseSectionFlowClassName}`}>
          <section>
            <HowMany />
            <p>
              There are {rows.length.toLocaleString("en-US")} top-level domains in the root zone. Of those,{" "}
              {signed.toLocaleString("en-US")} are signed with DNSSEC, and we can look up registration data
              for {lookups.toLocaleString("en-US")}. The table was last refreshed on {refreshedOn}, from root
              zone list version {directory.tldListVersion}.
            </p>
          </section>

          <section>
            <Types />
          </section>

          <section>
            <Lookups />
          </section>

          <section>
            <Dnssec />
          </section>

          <section>
            <Sources />
          </section>

          <section>
            <Prices />
          </section>

          <section>
            <CheckAName />
          </section>
        </article>
      </PageCanvas>
    </AppShell>
  );
}
