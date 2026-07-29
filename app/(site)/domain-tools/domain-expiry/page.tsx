import Link from "next/link";
import { AppShell } from "../../../app-shell";
import { DomainToolsSidebar } from "../domain-tools-sidebar";
import { DomainExpiryTool } from "./domain-expiry-tool";

type SearchParams = Record<string, string | string[] | undefined>;
const first = (value: string | string[] | undefined) => (Array.isArray(value) ? (value[0] ?? "") : (value ?? ""));

export default async function DomainExpiryPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;

  return (
    <AppShell
      mainLabel="Domain Expiry Checker"
      menuLabel="Domain tools"
      sidebar={<DomainToolsSidebar active="expiry" />}
      sidebarLabel="Domain tools sidebar"
    >
      <main className="domain-tool-main">
        <header className="domain-page-header">
          <h1>
            Domain <mark>expiry</mark> checker
          </h1>
          <p>
            Check when a domain expires and, more usefully, what happens after that
            date passes. A domain does not become available the morning it expires.
            It goes through grace, redemption and pending delete first, and that
            takes two to three months. This shows the exact date, how long is left,
            and which stage the domain is in right now.
          </p>
        </header>

        <DomainExpiryTool initialName={first(params.name)} />

        <hr className="domain-divider" />

        <article className="domain-reference-content">
          <section>
            <h2>What does a domain expiry date mean?</h2>
            <p>
              It is the date the current registration period ends. It is not the date
              the domain stops working, and it is not the date somebody else can
              register it. Both of those come later, and how much later depends on your
              registrar.
            </p>
            <p>
              Domains are registered for a fixed term, usually one to ten years. When
              the term ends the registry does not simply delete the name, because that
              would make an accidental lapse unrecoverable. Instead it moves through a
              defined sequence with a recovery window built in.
            </p>
          </section>

          <section>
            <h2>What happens after a domain expires?</h2>
            <p>
              For generic endings under ICANN rules, roughly two to three months passes
              between the expiry date and the name being available to anyone.
            </p>
            <div className="domain-table-scroll">
              <table className="domain-table">
                <thead>
                  <tr>
                    <th>Stage</th>
                    <th>How long</th>
                    <th>What it means</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th>Auto renew grace</th>
                    <td>up to 45 days</td>
                    <td>
                      The registry has already renewed the name. Your registrar decides
                      whether to bill you or hand it back, and it can take the full
                      period to choose. The site may still work during this time.
                    </td>
                  </tr>
                  <tr>
                    <th>Redemption</th>
                    <td>30 days</td>
                    <td>
                      The domain has been deleted. Only the previous owner can recover
                      it, and it costs a redemption fee that is considerably more than a
                      renewal. Nobody else can register it.
                    </td>
                  </tr>
                  <tr>
                    <th>Pending delete</th>
                    <td>5 days</td>
                    <td>Nobody can do anything. Not recoverable, not registerable.</td>
                  </tr>
                  <tr>
                    <th>Released</th>
                    <td>immediate</td>
                    <td>Anyone can register it.</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              The 30 day redemption and 5 day pending delete are required of registries.
              The grace period is up to 45 days and registrars use it very differently,
              some deleting on day one and some on day forty.
            </p>
          </section>

          <section>
            <h2>How do you check when a domain expires?</h2>
            <p>
              Enter the domain above. You get the registry expiry date, how long is left
              in plain language, a bar showing how far through the term it is, and a
              marker on whichever lifecycle stage the domain currently sits in.
            </p>
          </section>

          <section>
            <h2>My domain is expiring soon, what should I do?</h2>
            <p>
              The date on this page is rarely the real risk. Domains are lost to failed
              payments and to renewal notices arriving at an email address nobody reads
              any more. Both are invisible in the public record, so both are worth
              checking in your registrar account instead.
            </p>
            <p>
              Three things to verify, in order: that auto renew is switched on, that the
              card on file has not expired, and that the contact email on the account is
              one you actually read. If those are right, an approaching expiry date is
              not a problem. If they are not, the date is the least of it.
            </p>
          </section>

          <section>
            <h2>When will an expired domain become available?</h2>
            <p>
              Nobody can tell you the exact date, and any tool that gives you one is
              guessing. Registrars choose when to delete within the grace period,
              registries batch their releases differently, and the stages above are the
              shape rather than a schedule.
            </p>
            <p>
              Worth being straight about the other part too: waiting for a good domain to
              drop is a competitive business with real money in it. Drop catching
              services hold multiple registry connections and take desirable names in the
              same second they release. If a name is genuinely valuable, refreshing this
              page is not going to win it.
            </p>
          </section>

          <section>
            <h2>Which expiry date should you trust?</h2>
            <p>
              The registry and the registrar each publish their own, and they are
              separate fields rather than one field written twice. When they differ it
              usually means a renewal has gone through at one and not reached the other
              yet.
            </p>
            <p>
              The registry date is the one that governs deletion, so that is the one to
              plan around, and it is what the countdown on this page uses. If your
              registrar shows a later date than the registry, that is worth a support
              ticket rather than a shrug.
            </p>
          </section>

          <section>
            <h2>Do country domains follow the same rules?</h2>
            <p>
              No. Everything above describes generic endings under ICANN policy. Country
              endings set their own lifecycles, and several look nothing like this. Some
              have no redemption period at all, some hold names far longer, some release
              on a fixed schedule.
            </p>
            <p>
              When you are working with one of those, the registry&apos;s own
              documentation is the only reliable source, and this page will show you the
              dates it publishes without pretending the ICANN stages apply.
            </p>
          </section>

          <section>
            <h2>Related tools</h2>
            <p>
              The <Link href="/domain-tools/epp-status-codes">status codes reference</Link>{" "}
              explains every lifecycle code in full, including{" "}
              <code>redemptionPeriod</code> and <code>pendingDelete</code>. For the
              complete record behind the date, use the{" "}
              <Link href="/domain-tools/domain-lookup">domain registration lookup</Link>,
              and to see whether a name is registered at all, the{" "}
              <Link href="/domain-tools/domain-availability">availability checker</Link>.
            </p>
          </section>
        </article>
      </main>
    </AppShell>
  );
}
