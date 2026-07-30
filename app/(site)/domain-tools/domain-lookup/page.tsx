import { FileSearch } from "lucide-react";
import Link from "next/link";
import { AppShell } from "../../../app-shell";
import { DomainToolsSidebar } from "../domain-tools-sidebar";
import { DomainLookupTool } from "./domain-lookup-tool";
import { PageTitleIcon } from "../../../page-title-icon";

type SearchParams = Record<string, string | string[] | undefined>;
const first = (value: string | string[] | undefined) => (Array.isArray(value) ? (value[0] ?? "") : (value ?? ""));

export default async function DomainLookupPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;

  return (
    <AppShell
      mainLabel="Domain Registration Lookup"
      menuLabel="Domain tools"
      sidebar={<DomainToolsSidebar active="lookup" />}
      sidebarLabel="Domain tools sidebar"
    >
      <main className="domain-tool-main">
        <header className="domain-page-header">
          <h1>
            <PageTitleIcon>
              <FileSearch strokeWidth={2.2} />
            </PageTitleIcon>{" "}
            Domain <mark>registration</mark> lookup: the full WHOIS and RDAP record
          </h1>
          <p>
            Enter any domain and see its full registration record: the registrar it
            sits with, when it was created, when it expires, the status codes
            controlling what can be done to it, its nameservers, and which contact
            details have been withheld. The data comes straight from the registry that
            runs the ending, so there is nothing sitting between you and the source.
          </p>
        </header>

        <DomainLookupTool initialName={first(params.name)} />

        <hr className="domain-divider" />

        <article className="domain-reference-content">
          <section>
            <h2>What is a domain registration lookup?</h2>
            <p>
              It is a query to the official database that records who holds a domain
              name. Every domain ending has a registry behind it, and that registry
              keeps a record for every name registered under it. A lookup asks for that
              record and shows you what it says.
            </p>
            <p>
              You may know this as a WHOIS lookup. Same job, newer plumbing. WHOIS was
              a plain text service that ICANN stopped requiring on 28 January 2025, and
              it has been replaced by RDAP, which returns properly structured data over
              a secure connection. This tool uses RDAP, which is why it can tell you
              things a WHOIS tool cannot, such as exactly which contact fields were
              hidden and by what method.
            </p>
          </section>

          <section>
            <h2>How do you look up a domain registration?</h2>
            <p>Type the domain into the box above and press the button. That is the whole thing.</p>
            <p>
              You can paste in more or less anything and it will work out what you
              meant. A full web address like <code>https://www.example.co.uk/pricing</code>{" "}
              becomes <code>example.co.uk</code>. A subdomain is reduced to the part
              that is actually registered, and the result tells you when that happened
              so you are never reading about a different name than you thought. Names
              with accents or non-Latin characters are converted automatically and both
              forms are shown.
            </p>
            <p>There is nothing to sign up for and no limit you will hit in normal use.</p>
          </section>

          <section>
            <h2>What information does a domain lookup show?</h2>
            <div className="domain-table-scroll">
              <table className="domain-table">
                <tbody>
                  <tr>
                    <th>Registrar</th>
                    <td>The company the domain was bought through, plus its IANA ID and abuse contact.</td>
                  </tr>
                  <tr>
                    <th>Creation date</th>
                    <td>When the name was first registered by anyone.</td>
                  </tr>
                  <tr>
                    <th>Expiry dates</th>
                    <td>Both of them. The registry date and the registrar date are separate fields and can differ.</td>
                  </tr>
                  <tr>
                    <th>Status codes</th>
                    <td>What the registry currently allows or blocks, including transfers and deletion.</td>
                  </tr>
                  <tr>
                    <th>Nameservers</th>
                    <td>The DNS servers on record at the registry.</td>
                  </tr>
                  <tr>
                    <th>DNSSEC</th>
                    <td>Whether the domain has a DS record published at its parent.</td>
                  </tr>
                  <tr>
                    <th>Contacts</th>
                    <td>Whatever is published, plus a list of exactly what was withheld and how.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2>Why do the registry and the registrar say different things?</h2>
            <p>
              Because they are two different companies holding two different records,
              and this is the single most useful thing to understand about domain data.
            </p>
            <p>
              The registry runs the ending. Verisign runs <code>.com</code>, Nominet
              runs <code>.uk</code>. There is exactly one per ending, and it is the
              authority on dates, status codes, nameservers and DNSSEC. The registrar is
              the company you bought the name from, and for most endings it is the only
              party holding contact details at all.
            </p>
            <p className="domain-source-path">
              <code>registry</code>
              <span aria-hidden="true">→</span>
              <span>dates, status codes, nameservers, DNSSEC</span>
            </p>
            <p className="domain-source-path">
              <code>registrar</code>
              <span aria-hidden="true">→</span>
              <span>contacts, redaction notice, its own expiry date</span>
            </p>
            <p>
              This tool asks both and labels which one said what. Most tools merge them
              into a single tidy block, which looks cleaner and hides the disagreements.
              The disagreements are often the interesting part, so when two dates do not
              match you see both, along with which one the registry will act on.
            </p>
          </section>

          <section>
            <h2>Why are there two expiry dates?</h2>
            <p>
              They are genuinely two separate fields, not one field spelled two ways.
              The registry expiry date is what the registry acts on when it decides to
              delete a name. The registrar expiry date is the registrar&apos;s own
              record of the same registration.
            </p>
            <p>
              Usually they match. When they do not, it normally means a renewal has been
              processed at one end and has not reached the other yet. If you are working
              out how long you have, use the registry date, because that is the one with
              consequences.
            </p>
          </section>

          <section>
            <h2>What is the difference between last changed and last updated?</h2>
            <p>
              A record can show three dates that all sound like &quot;last updated&quot;
              and mean completely different things. Reading the wrong one is the most
              common mistake people make with this data.
            </p>
            <div className="domain-table-scroll">
              <table className="domain-table">
                <tbody>
                  <tr>
                    <th>Record last changed</th>
                    <td>
                      When the registry&apos;s stored data for this specific domain last
                      changed. It does not say what changed. A nameserver edit, a
                      renewal, a contact update and a transfer all move it.
                    </td>
                  </tr>
                  <tr>
                    <th>Registry database updated</th>
                    <td>
                      When the registry last refreshed its own published copy. This has
                      nothing to do with your domain. It is usually today, which is
                      exactly why people misread it as something having just changed.
                    </td>
                  </tr>
                  <tr>
                    <th>Fetched</th>
                    <td>When this page retrieved the answer, which may have come from a short-lived cache.</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              On one real domain those first two dates were seventeen days apart. Read
              the wrong line and you would conclude something changed this morning when
              nothing had changed in over two weeks.
            </p>
          </section>

          <section>
            <h2>Why is the owner information hidden?</h2>
            <p>
              For almost every generic ending it is gone, and it is not coming back.
              GDPR arrived in 2018, ICANN changed its rules to match, and registrant
              name, address, phone and email stopped being published across the board
              in a matter of months.
            </p>
            <p>
              What replaced it is more useful than it sounds. Registrars now publish a
              structured list of exactly which fields they withheld and how, so the
              record tells you a phone number exists and was removed rather than staying
              silent about it. This tool reads that list and shows it as a table.
            </p>
            <p>
              If you need to reach whoever is behind a domain, routes still exist, and
              the <Link href="/domain-tools/domain-owner">registrant lookup</Link> walks
              through them.
            </p>
          </section>

          <section>
            <h2>When would you use a domain lookup?</h2>
            <ul>
              <li>
                <strong>Checking a domain before buying it.</strong> Creation date,
                expiry, status codes and transfer locks all change what you are actually
                getting.
              </li>
              <li>
                <strong>Working out why a site is down.</strong> A hold status explains a
                domain that resolves to nothing while looking perfectly registered.
              </li>
              <li>
                <strong>Judging whether an email or site is legitimate.</strong> A domain
                registered three weeks ago that claims twenty years of trading is worth a
                second look.
              </li>
              <li>
                <strong>Finding who to contact about abuse.</strong> The registrar and its
                abuse address are both in the record.
              </li>
              <li>
                <strong>Auditing domains you own.</strong> Expiry dates, transfer locks and
                nameservers in one place.
              </li>
            </ul>
          </section>

          <section>
            <h2>What a domain lookup cannot tell you</h2>
            <ul>
              <li>
                <strong>Anything historical.</strong> This is the current state of the
                record. There is no previous owner, no old nameserver, no log of what
                changed last month. Tools that show you that built their own archive by
                saving daily copies over years.
              </li>
              <li>
                <strong>Who runs the website.</strong> The registrant of a domain is often
                not the person operating what is on it.
              </li>
              <li>
                <strong>Whether a domain is trustworthy.</strong> Recently registered is a
                signal worth noticing, not a verdict.
              </li>
              <li>
                <strong>Anything for endings with no registration service.</strong> Some
                endings publish nothing machine readable. You get a clear &quot;cannot
                check&quot; rather than a blank that looks like an answer, and the{" "}
                <Link href="/domain-tools/tld-directory">TLD directory</Link> lists which
                ones those are.
              </li>
            </ul>
          </section>

          <section>
            <h2>Is this lookup private?</h2>
            <p>
              The name you enter is sent to the registry and registrar that run that
              ending, because they hold the answer. There is no way around that part.
            </p>
            <p>
              On this side, the registry&apos;s reply is kept briefly so repeated
              lookups do not hammer them, stored against the domain name and nothing
              else. Your IP address is used for a few minutes to stop one person
              overloading the tools and is never written next to a lookup. No history of
              who searched for what is kept, and nothing here is for sale that would
              give a reason to.
            </p>
          </section>

          <section>
            <h2>Related tools</h2>
            <p>
              For one specific part of the record there is a focused page for each:{" "}
              <Link href="/domain-tools/domain-age">domain age</Link>,{" "}
              <Link href="/domain-tools/domain-expiry">expiry and the deletion cycle</Link>,{" "}
              <Link href="/domain-tools/domain-registrar">registrar and abuse contact</Link>,{" "}
              <Link href="/domain-tools/domain-owner">registrant details</Link>, and{" "}
              <Link href="/domain-tools/epp-status-codes">what each status code means</Link>.
              To check the registration and the live DNS together, use the{" "}
              <Link href="/domain-tools/domain-report">domain report</Link>.
            </p>
          </section>
        </article>
      </main>
    </AppShell>
  );
}
