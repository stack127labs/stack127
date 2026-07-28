import Link from "next/link";
import { AppShell } from "../../../app-shell";
import { DomainToolsSidebar } from "../domain-tools-sidebar";
import { MultiTldTool } from "./multi-tld-tool";

export default function MultiTldAvailabilityPage() {
  return (
    <AppShell
      mainLabel="Multi-TLD Availability"
      menuLabel="Domain tools"
      sidebar={<DomainToolsSidebar active="multi-tld" />}
      sidebarLabel="Domain tools sidebar"
    >
      <main className="domain-tool-main">
        <header className="domain-page-header">
          <h1>Check a domain name across multiple extensions</h1>
          <p>
            Enter one name and check it against several endings at once. Each is
            asked of the registry that runs it, and every row reports its own
            outcome, so a check that failed is never quietly presented as a name
            that is free.
          </p>
        </header>

        <MultiTldTool />

        <hr className="domain-divider" />

        <article className="domain-reference-content">
          <section>
            <h2>How to check one name across several endings</h2>
            <p>
              Type the name without an ending, tick the endings you care about, and run
              it. Up to twelve at a time. Each row is a separate question to a different
              registry, which is why they settle at slightly different speeds.
            </p>
            <p>
              This is the tool for the moment you have picked a name and want to know what
              you can actually get. It is not a name generator and it does not suggest
              alternatives.
            </p>
          </section>

          <section>
            <h2>What do the four results mean?</h2>
            <div className="domain-table-scroll">
              <table className="domain-table">
                <tbody>
                  <tr>
                    <th>No registration found</th>
                    <td>
                      The registry has no record. Usually registerable, but read the
                      premium pricing note below before you plan around it.
                    </td>
                  </tr>
                  <tr>
                    <th>Taken</th>
                    <td>Somebody holds it. The registrar and expiry date are shown where published.</td>
                  </tr>
                  <tr>
                    <th>Cannot check</th>
                    <td>
                      That ending publishes no registration service, so no tool can
                      answer. Not a statement about the name.
                    </td>
                  </tr>
                  <tr>
                    <th>Check failed</th>
                    <td>
                      The registry rate limited us, refused, or did not answer. Also not a
                      statement about the name.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              Those last two are the ones to watch. A checker that renders a failed lookup
              as a green tick is actively harmful, because you make decisions on it. Here
              they stay clearly marked as unanswered.
            </p>
          </section>

          <section>
            <h2>Why is a free name sometimes not for sale?</h2>
            <p>
              Because the registration record says nothing about price or eligibility.
              Registries reserve names, block whole categories, and price a great many
              ordinary strings as premium, which on newer endings can mean hundreds or
              thousands a year rather than the usual fee.
            </p>
            <p>
              This matters more here than on a single check. Seeing a name free across
              eight endings looks like an open goal, and some of those are very likely
              priced well above standard. Check the price at a registrar before building
              anything around the result.
            </p>
          </section>

          <section>
            <h2>Which endings should you check?</h2>
            <p>
              Depends what you are doing, and it is worth being honest that the default
              selection here leans toward generic endings. That is not a preference, it is
              availability: many country endings publish no registration service, so no
              tool can check them.
            </p>
            <ul>
              <li>
                <strong>A business or product.</strong> <code>.com</code> still carries the
                most recognition, with <code>.co</code> and your country ending as the
                usual fallbacks.
              </li>
              <li>
                <strong>Software or a developer tool.</strong> <code>.dev</code>,{" "}
                <code>.app</code> and <code>.io</code> are conventional and understood.
              </li>
              <li>
                <strong>Protecting a brand.</strong> Register the obvious variants rather
                than every ending in existence. Full defensive registration across the root
                is not achievable and not worth attempting.
              </li>
            </ul>
            <p>
              Endings that cannot be checked are still selectable, and they say so plainly
              rather than being hidden from the list.
            </p>
          </section>

          <section>
            <h2>Why is the check limited to twelve endings?</h2>
            <p>
              Each ending is a separate request to a different registry, and registries
              limit how often any one source may ask. Every visitor here shares one
              outbound address, so one person checking fifty endings on repeat can get
              everybody throttled across every domain tool at once.
            </p>
            <p>
              Hence the cap, plus a per-visitor limit and a shared budget per registry. If
              you hit a limit, the page says so rather than returning an empty result that
              looks like an answer.
            </p>
          </section>

          <section>
            <h2>Related tools</h2>
            <p>
              For one name with the full reasoning behind the answer, use the{" "}
              <Link href="/domain-tools/domain-availability">domain availability checker</Link>.
              To see who holds a name that came back taken, use the{" "}
              <Link href="/domain-tools/domain-lookup">domain registration lookup</Link>.
              To see every ending that exists and which ones can be checked, see the{" "}
              <Link href="/domain-tools/tld-directory">TLD directory</Link>.
            </p>
          </section>
        </article>
      </main>
    </AppShell>
  );
}
