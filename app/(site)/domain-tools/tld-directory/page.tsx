import { Globe } from "lucide-react";
import Link from "next/link";
import { AppShell } from "../../../app-shell";
import { DomainToolsSidebar } from "../domain-tools-sidebar";
import { TldTable, type TldRow } from "./tld-table";
import directory from "@/lib/domain/data/tld-directory.json" with { type: "json" };
import { PageTitleIcon } from "../../../page-title-icon";
import { proseSectionFlowClassName } from "../../../prose";

export default function TldDirectoryPage() {
  const rows = directory.rows as TldRow[];
  const counts = directory.counts;

  return (
    <AppShell
      mainLabel="TLD Directory"
      menuLabel="Domain tools"
      sidebar={<DomainToolsSidebar active="tlds" />}
      sidebarLabel="Domain tools sidebar"
    >
      <main className="domain-tool-main">
        <header className="domain-page-header">
          <h1>
            <PageTitleIcon>
              <Globe strokeWidth={2.2} />
            </PageTitleIcon>{" "}
            TLD <mark>directory</mark>: every domain extension, its operator, and DNSSEC
          </h1>
          <p>
            Every top-level domain that exists, with the organisation that operates
            it, whether it is signed with DNSSEC, and whether registration data can be
            looked up under it. Built directly from IANA&apos;s own records and the
            published root zone rather than copied from another list, and it tells you
            when it was last refreshed.
          </p>
        </header>

        <TldTable rows={rows} />

        <hr className="domain-divider" />

          <article className={`domain-reference-content ${proseSectionFlowClassName}`}>
          <section>
            <h2>How many domain extensions are there?</h2>
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
            <h2>What are the different types of domain extension?</h2>
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
            <h2>Why can some domain extensions not be looked up?</h2>
            <p>
              Modern registration data is published over a protocol called RDAP, and not
              every registry offers it. Where an ending has no RDAP service, no tool can
              answer questions about names under it, including the ones on this site. That
              is a gap in what the ending publishes rather than a limitation of any
              particular lookup.
            </p>
            <p>
              A few endings run RDAP without appearing in the official IANA directory.
              Those are marked separately in the table, and each one was verified against a
              real domain by hand before being added. It is a short list because every entry
              has to be checked rather than guessed at.
            </p>
          </section>

          <section>
            <h2>Does DNSSEC on an extension mean my domain is secure?</h2>
            <p>
              This column says whether the ending itself is signed in the root zone, which
              is measured directly from its DS records. That is a prerequisite for domains
              under it to use DNSSEC, and it is not the same thing as any particular domain
              being signed. Nearly every ending is signed now; most individual domains are
              not.
            </p>
            <p>
              To check one domain, the{" "}
              <Link href="/dns-tools/dnssec-checker">DNSSEC chain checker</Link> validates
              it properly rather than reading a flag.
            </p>
          </section>

          <section>
            <h2>Where does this data come from?</h2>
            <ul>
              <li>
                Type and operator: <a href="https://www.iana.org/domains/root/db">IANA&apos;s root zone database</a>.
              </li>
              <li>
                DNSSEC: DS records in the published root zone, so it is measured rather than
                claimed.
              </li>
              <li>
                Lookups: the IANA RDAP directory, plus a short hand-verified list of registries that run RDAP without appearing in it.
              </li>
            </ul>
            <p>
              The table is rebuilt from those sources rather than maintained by hand, and
              the rebuild stops rather than saving a partial result if IANA changes its page
              structure. That means rows can go out of date, but they will not quietly go
              wrong, and the refresh date above tells you which you are looking at.
            </p>
          </section>

          <section>
            <h2>Why are domain prices not listed?</h2>
            <p>
              Because any price shown here would be wrong. Registry wholesale pricing is not
              public for most endings, and retail pricing changes constantly with the
              registrar, the promotion and whether the specific name is classed as premium. A
              stale price is more misleading than no price, so check at a registrar when you
              are ready to buy.
            </p>
            <p>
              Registration counts are missing for a similar reason: registry reporting is
              inconsistent and delayed. There are also no rankings, because which ending suits
              you depends entirely on what you are building and where.
            </p>
          </section>

          <section>
            <h2>Related tools</h2>
            <p>
              To check whether a specific name is free under one of these endings, use the{" "}
              <Link href="/domain-tools/domain-availability">domain availability checker</Link>,
              or try one name across several at once with{" "}
              <Link href="/domain-tools/multi-tld-availability">multi-TLD availability</Link>.
              For the full record on a registered domain, use the{" "}
              <Link href="/domain-tools/domain-lookup">domain registration lookup</Link>.
            </p>
          </section>
        </article>
      </main>
    </AppShell>
  );
}
