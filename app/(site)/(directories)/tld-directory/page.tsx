import { getRequiredDirectoryPage } from "@/lib/directory-pages";
import { DirectoryPageTitle, DirectoryPageContent } from "@/app/ui/directories/directory-page-content";
import { PageMeta } from "@/app/ui/site/page-meta";
import { ContentMarkdown } from "@/app/ui/content-markdown";
import { PageCanvas } from "@/app/ui/site/page-canvas";
import "@/app/(site)/(tools)/(domain)/domain-tools.css";
import Link from "next/link";
import { AppShell } from "../../../ui/site/app-shell";
import { DomainToolsSidebar } from "@/app/(site)/(tools)/(domain)/domain-tools-sidebar";
import { TldTable, type TldRow } from "./tld-table";
import directory from "@/lib/domain/data/tld-directory.json" with { type: "json" };
import { DirectoryTitleIcon } from "@/app/ui/directories/directory-title-icon";
import { PageHeader } from "../../../ui/site/page-header";
import { proseSectionFlowClassName } from "../../../ui/site/prose";

export default async function TldDirectoryPage() {
  const directoryPage = await getRequiredDirectoryPage("tld-directory");
  const rows = directory.rows as TldRow[];
  const counts = directory.counts;

  return (
    <AppShell
      mainLabel="TLD Directory"
      menuLabel="Domain tools"
      sidebar={<DomainToolsSidebar />}
      sidebarLabel="Domain tools sidebar"
    >
      <PageCanvas as="main" className="domain-tool-main">
        <PageHeader>
          <h1><DirectoryTitleIcon iconKey={directoryPage.card_icon_key} />{" "}<DirectoryPageTitle title={directoryPage.title} /></h1>
          <PageMeta updatedAt={directoryPage.updated_at} />
          <ContentMarkdown markdown={directoryPage.intro_markdown} />
        </PageHeader>

        <TldTable rows={rows} />

        <hr className="domain-divider" />

          <article className={`domain-reference-content ${proseSectionFlowClassName}`}>
          <section>
            <DirectoryPageContent page={directoryPage} section="copy-1" />
            <p>
              {counts.total.toLocaleString("en-US")} of them exist right now. Of those,{" "}
              {counts.signed.toLocaleString("en-US")} are signed with DNSSEC and{" "}
              {counts.rdapCovered.toLocaleString("en-US")} publish registration data that
              can be looked up. The number moves as endings are added and retired, so the
              table above was last refreshed on {directory.fetchedAt} from root zone list
              version {directory.tldListVersion}.
            </p>
          </section>

          <section>
            <DirectoryPageContent page={directoryPage} section="copy-2" />
            <div className="domain-table-scroll">
              <table className="domain-table">
                <tbody>
                  <tr>
                    <th>generic</th>
                    <td>
                      Open endings like <code>.com</code>, <code>.app</code> and{" "}
                      <code>.xyz</code>. Most of the root is this, and most of it arrived
                      after 2013 when ICANN opened applications.
                    </td>
                  </tr>
                  <tr>
                    <th>country-code</th>
                    <td>
                      Two letter endings tied to a country or territory. Each is run under
                      its own national rules, which is why <code>.de</code> and{" "}
                      <code>.uk</code> behave nothing like each other or like{" "}
                      <code>.com</code>.
                    </td>
                  </tr>
                  <tr>
                    <th>sponsored</th>
                    <td>
                      Endings run for a defined community with eligibility rules, such as{" "}
                      <code>.edu</code> or <code>.aero</code>. You cannot simply register
                      one.
                    </td>
                  </tr>
                  <tr>
                    <th>infrastructure</th>
                    <td>
                      <code>.arpa</code>, used by the internet&apos;s own plumbing rather
                      than by anyone building a site.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <DirectoryPageContent page={directoryPage} section="copy-3" />
          </section>

          <section>
            <DirectoryPageContent page={directoryPage} section="copy-4" />
          </section>

          <section>
            <DirectoryPageContent page={directoryPage} section="copy-5" />
          </section>

          <section>
            <DirectoryPageContent page={directoryPage} section="copy-6" />
          </section>

          <section>
            <DirectoryPageContent page={directoryPage} section="copy-7" />
          </section>
        </article>
      </PageCanvas>
    </AppShell>
  );
}
