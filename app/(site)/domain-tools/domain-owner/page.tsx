import { UserSearch } from "lucide-react";
import Link from "next/link";
import { AppShell } from "../../../app-shell";
import { DomainToolsSidebar } from "../domain-tools-sidebar";
import { DomainOwnerTool } from "./domain-owner-tool";
import { PageTitleIcon } from "../../../page-title-icon";
import { proseSectionFlowClassName } from "../../../prose";

type SearchParams = Record<string, string | string[] | undefined>;
const first = (value: string | string[] | undefined) => (Array.isArray(value) ? (value[0] ?? "") : (value ?? ""));

export default async function DomainOwnerPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;

  return (
    <AppShell
      mainLabel="Domain Registrant Lookup"
      menuLabel="Domain tools"
      sidebar={<DomainToolsSidebar active="owner" />}
      sidebarLabel="Domain tools sidebar"
    >
      <main className="domain-tool-main">
        <header className="domain-page-header">
          <h1>
            <PageTitleIcon>
              <UserSearch strokeWidth={2.2} />
            </PageTitleIcon>{" "}
            Domain <mark>registrant</mark> lookup: who owns this domain?
          </h1>
          <p>
            Look up who a domain is registered to. For most domains the answer is
            that the details are hidden, so rather than showing you a wall of
            REDACTED and stopping there, this shows what is published, exactly which
            fields were withheld and how, and the routes that still work for reaching
            the person behind a name.
          </p>
        </header>

        <DomainOwnerTool initialName={first(params.name)} />

        <hr className="domain-divider" />

          <article className={`domain-reference-content ${proseSectionFlowClassName}`}>
          <section>
            <h2>Can you find out who owns a domain?</h2>
            <p>
              Sometimes, but far less often than you would expect. Until 2018 the name,
              address, phone number and email of almost every domain owner were public.
              Then GDPR arrived, ICANN changed its rules to match, and registrars stopped
              publishing contact details across the board. It was not a gradual fade, it
              happened in a matter of months.
            </p>
            <p>
              Where you will still see real details: organisations rather than
              individuals, because data protection law protects people and not companies,
              and some country endings that publish more than generic ones do. When the
              data is there, this tool shows it normally.
            </p>
          </section>

          <section>
            <h2>What does redacted for privacy actually mean?</h2>
            <p>
              It means the registrar removed something before publishing the record. What
              is genuinely useful, and what most tools throw away, is that registrars now
              publish a structured list of exactly which fields they withheld and by which
              method. So the record can tell you a phone number exists and was removed,
              rather than staying silent about whether one was ever there.
            </p>
            <p>The three methods mean different things:</p>
            <div className="domain-table-scroll">
              <table className="domain-table">
                <tbody>
                  <tr>
                    <th>Removed</th>
                    <td>The field is gone from the record entirely.</td>
                  </tr>
                  <tr>
                    <th>Emptied</th>
                    <td>
                      The field is still there with a blank value. This is why a
                      registrant name sometimes appears as an empty string rather than
                      being absent.
                    </td>
                  </tr>
                  <tr>
                    <th>Replaced</th>
                    <td>
                      The real value was swapped for a stand-in. This is the interesting
                      one: a replaced email is usually a working relay or contact form
                      that reaches the owner without exposing them.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2>How do you contact a domain owner?</h2>
            <p>
              Four routes, in rough order of how often they work. The result above links
              whichever ones exist for the domain you checked.
            </p>
            <ul>
              <li>
                <strong>The registrar&apos;s contact form or relay address.</strong> When
                one is published we link it directly. Your message reaches the owner and
                you do not learn who they are, which is the trade-off the system is built
                around.
              </li>
              <li>
                <strong>The abuse contact</strong>, for phishing, malware or spam coming
                from the domain. Accredited registrars must publish one and must act on
                reports. Using it for a general question gets you ignored, fairly.
              </li>
              <li>
                <strong>ICANN&apos;s Registration Data Request Service</strong>, for a
                documented legitimate interest such as a legal claim or an investigation.
                It is a real process with real requirements, not a form that hands over
                data because you asked.
              </li>
              <li>
                <strong>A court order or law enforcement request</strong>, where that
                applies to your situation.
              </li>
            </ul>
          </section>

          <section>
            <h2>What is a domain privacy service?</h2>
            <p>
              Some domains list a proxy company as the owner, with names like Domains By
              Proxy or Privacy Protect. That is not redaction. It is a service the owner
              paid for, and the proxy company is genuinely the registrant of record.
            </p>
            <p>
              The practical difference: with redaction, the real details exist in the
              registrar&apos;s system and are simply not published. With a proxy, a third
              party is standing in the middle deliberately. Either way the person behind
              it is not in any public source, and the published contact is the only route
              to them.
            </p>
          </section>

          <section>
            <h2>Why do WHOIS sites show owner details when this does not?</h2>
            <p>
              Usually because they are showing you old data. Some sites hold archives
              scraped before 2018 and present them as current, which is why you will
              occasionally see a name and address that has not been accurate for years.
            </p>
            <p>
              Others sell access to aggregated historical records. That data is real, but
              it is history rather than the current record, and it is worth knowing which
              you are looking at. This tool reads what the registry and registrar publish
              today and nothing else.
            </p>
          </section>

          <section>
            <h2>What this lookup cannot do</h2>
            <ul>
              <li>
                <strong>Reveal a redacted owner.</strong> There is no technique, no back
                door, and no paid data source used here.
              </li>
              <li>
                <strong>Tell you who runs the website.</strong> The registrant of a domain
                is frequently not the operator of what is on it, especially on hosted
                platforms.
              </li>
              <li>
                <strong>Verify that published details are true.</strong> Registrars must
                collect accurate data, not prove it, and published names and addresses are
                routinely wrong.
              </li>
              <li>
                <strong>Show previous owners.</strong> The record is current state only.
              </li>
            </ul>
          </section>

          <section>
            <h2>Related tools</h2>
            <p>
              If what you actually want is somewhere to report abuse, the{" "}
              <Link href="/domain-tools/domain-registrar">registrar lookup</Link> gets you
              there faster. For the complete record including dates and status codes, use
              the <Link href="/domain-tools/domain-lookup">domain registration lookup</Link>,
              and to judge whether a domain is newly set up, the{" "}
              <Link href="/domain-tools/domain-age">domain age checker</Link>.
            </p>
          </section>
        </article>
      </main>
    </AppShell>
  );
}
