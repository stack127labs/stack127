import Link from "next/link";
import { AppShell } from "../../../app-shell";
import { DomainToolsSidebar } from "../domain-tools-sidebar";
import { DomainAvailabilityTool } from "./domain-availability-tool";

type SearchParams = Record<string, string | string[] | undefined>;
const first = (value: string | string[] | undefined) => (Array.isArray(value) ? (value[0] ?? "") : (value ?? ""));

export default async function DomainAvailabilityPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;

  return (
    <AppShell
      mainLabel="Domain Availability Checker"
      menuLabel="Domain tools"
      sidebar={<DomainToolsSidebar active="availability" />}
      sidebarLabel="Domain tools sidebar"
    >
      <main className="domain-tool-main">
        <header className="domain-page-header">
          <h1>
            Domain <mark>availability</mark> checker
          </h1>
          <p>
            Check whether a domain name is already registered by asking the registry
            that runs the ending directly. No adverts, no upsell, no suggested
            alternatives, and no record kept of the names you try. If a name is taken
            you also get who holds it and when it expires.
          </p>
        </header>

        <DomainAvailabilityTool initialName={first(params.name)} />

        <hr className="domain-divider" />

        <article className="domain-reference-content">
          <section>
            <h2>How does a domain availability check work?</h2>
            <p>
              Every domain ending has a registry that keeps the definitive list of names
              registered under it. This tool asks that registry whether it holds a record
              for the name you typed. If it does, the name is taken. If it does not, no
              registration exists.
            </p>
            <p>
              That is a different question from what a registrar&apos;s search box
              answers. A registrar is checking whether it can sell you something, which
              involves its own pricing, promotions and inventory. This checks the
              underlying fact.
            </p>
          </section>

          <section>
            <h2>How do you check if a domain name is available?</h2>
            <p>
              Type the name with its ending, like <code>example.com</code>, and press
              the button. You will get one of four answers, and only one of them means
              go.
            </p>
            <div className="domain-table-scroll">
              <table className="domain-table">
                <tbody>
                  <tr>
                    <th>No registration found</th>
                    <td>The registry has no record. Usually registerable, with the caveats below.</td>
                  </tr>
                  <tr>
                    <th>Taken</th>
                    <td>Somebody holds it. You also get the registrar and expiry date.</td>
                  </tr>
                  <tr>
                    <th>Cannot check</th>
                    <td>That ending publishes no registration service, so no tool can answer.</td>
                  </tr>
                  <tr>
                    <th>Check failed</th>
                    <td>The registry did not answer or refused. Not an answer about the name.</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              Those last two matter. A checker that shows a failed lookup as a green tick
              is worse than useless, because you plan around it. Here they stay clearly
              marked as what they are.
            </p>
          </section>

          <section>
            <h2>Does available always mean you can register it?</h2>
            <p>
              No, and this is the gap worth understanding before you plan around a free
              result. Several situations look identical from the outside:
            </p>
            <ul>
              <li>
                <strong>Reserved names.</strong> Registries hold back single letters, two
                letter names, country names and a long list of strings ICANN requires them
                to reserve. All unregistered, none available.
              </li>
              <li>
                <strong>Premium pricing.</strong> Plenty of free names are priced by the
                registry at hundreds or thousands a year rather than the usual fee. The
                registration record says nothing about price, and this is common on newer
                endings.
              </li>
              <li>
                <strong>Registry blocklists.</strong> Some endings block whole categories
                of name, and brand protection services block others.
              </li>
              <li>
                <strong>Just released.</strong> A name that finished its deletion cycle
                seconds ago is technically free and very likely to be caught by an
                automated service before you reach a checkout.
              </li>
            </ul>
            <p>
              The practical move is to treat a free result as promising rather than
              settled, and check the price at a registrar before committing to a name.
            </p>
          </section>

          <section>
            <h2>Why can you not just visit the website to check?</h2>
            <p>
              Because it gives wrong answers in both directions, and it is the most
              common way people get this wrong.
            </p>
            <p>
              A registered domain with no nameservers set resolves to nothing, so the
              browser says the site cannot be reached and you conclude the name is free.
              It is not. Going the other way, some endings use a wildcard that makes
              unregistered names appear to resolve, so you conclude a free name is taken.
            </p>
            <p>
              DNS answers a different question from registration. That is why this tool
              asks the registry rather than guessing from whether a site loads. If you do
              want to see what DNS is doing, the{" "}
              <Link href="/dns-tools/dns-lookup">DNS lookup tool</Link> is the right
              place.
            </p>
          </section>

          <section>
            <h2>Is it safe to check a domain name here?</h2>
            <p>
              There is a long-standing worry in the domain community about front running,
              where searching for a name somewhere leads to somebody else registering it.
              Worth being precise about what happens here rather than just reassuring you.
            </p>
            <p>
              The name goes to the registry that runs the ending, because that is who has
              the answer, and that part is unavoidable with any tool. On this side, the
              registry&apos;s reply is kept briefly so repeated checks do not hammer them,
              stored against the domain name and nothing else. Your IP address is used for
              a few minutes to stop one person overloading the tools and is never written
              next to a lookup. No list of searched names is built, and there is nothing
              being sold here that would give a reason to build one.
            </p>
          </section>

          <section>
            <h2>What if the name is already taken?</h2>
            <p>
              You get the registrar and the expiry date, which tells you more than a dead
              end. If the domain is in redemption or pending delete it is on its way out
              of the system, and the{" "}
              <Link href="/domain-tools/domain-expiry">expiry checker</Link> shows exactly
              where it sits in that cycle.
            </p>
            <p>
              Most good names are held by someone using them. Some are held by people
              waiting to sell. The registration record cannot tell you which, and neither
              can anyone else without asking.
            </p>
          </section>

          <section>
            <h2>Related tools</h2>
            <p>
              To try one name across several endings at once, use{" "}
              <Link href="/domain-tools/multi-tld-availability">multi-TLD availability</Link>.
              To see the full record on a name that came back taken, use the{" "}
              <Link href="/domain-tools/domain-lookup">domain registration lookup</Link>.
              To see which endings can be checked at all, see the{" "}
              <Link href="/domain-tools/tld-directory">TLD directory</Link>.
            </p>
          </section>
        </article>
      </main>
    </AppShell>
  );
}
