import Link from "next/link";
import { AppShell } from "../../../app-shell";
import { DomainToolsSidebar } from "../domain-tools-sidebar";
import { DomainRegistrarTool } from "./domain-registrar-tool";

type SearchParams = Record<string, string | string[] | undefined>;
const first = (value: string | string[] | undefined) => (Array.isArray(value) ? (value[0] ?? "") : (value ?? ""));

export default async function DomainRegistrarPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;

  return (
    <AppShell
      mainLabel="Registrar Lookup"
      menuLabel="Domain tools"
      sidebar={<DomainToolsSidebar active="registrar" />}
      sidebarLabel="Domain tools sidebar"
    >
      <main className="domain-tool-main">
        <header className="domain-page-header">
          <h1>Find a domain&apos;s registrar</h1>
          <p>
            Look up which company a domain is registered through, along with its
            abuse contact and IANA ID. Useful when you need to report something, take
            over a domain from a former agency or employee, or work out where you
            bought a name you have had for years.
          </p>
        </header>

        <DomainRegistrarTool initialName={first(params.name)} />

        <hr className="domain-divider" />

        <article className="domain-reference-content">
          <section>
            <h2>What is a domain registrar?</h2>
            <p>
              A registrar is a company accredited to sell domain names and hold the
              account they live in. When you buy a domain, a registrar is the party that
              actually registers it for you and where you log in to change nameservers,
              renew, or transfer it away.
            </p>
            <p>
              Every registered domain has exactly one registrar at a time, and the record
              names it. That is what this tool reads.
            </p>
          </section>

          <section>
            <h2>Registry, registrar, reseller: what is the difference?</h2>
            <p>
              Three different companies, and confusing them is why most people end up on
              a page like this.
            </p>
            <p className="domain-source-path">
              <code>registry</code>
              <span aria-hidden="true">→</span>
              <code>registrar</code>
              <span aria-hidden="true">→</span>
              <code>reseller</code>
              <span aria-hidden="true">→</span>
              <span>you</span>
            </p>
            <div className="domain-table-scroll">
              <table className="domain-table">
                <tbody>
                  <tr>
                    <th>Registry</th>
                    <td>
                      Runs the ending. Verisign runs <code>.com</code>, Nominet runs{" "}
                      <code>.uk</code>. One per ending. You never deal with them directly.
                    </td>
                  </tr>
                  <tr>
                    <th>Registrar</th>
                    <td>
                      Accredited to sell names in that ending and holds your account. This
                      is who the record names.
                    </td>
                  </tr>
                  <tr>
                    <th>Reseller</th>
                    <td>
                      Whoever actually took your money. Often a hosting company selling
                      through a registrar, and their name appears nowhere in the record.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2>Why is the registrar a company I have never heard of?</h2>
            <p>
              Almost always because you bought through a reseller. Plenty of hosts sell
              domains through Tucows, PDR or Enom, so that is the name on the official
              record even though your invoice says something completely different.
            </p>
            <p>
              The practical way to find who you actually pay: search your email for a
              domain renewal receipt. The reseller is on that, and the registrar usually
              is not. Once you know both, you know which one to contact for what. Billing
              and support go to the reseller; the underlying registration lives with the
              registrar.
            </p>
          </section>

          <section>
            <h2>How do you report abuse to a registrar?</h2>
            <p>
              Use the abuse contact from the result above. It is for the domain being used
              to cause harm: phishing pages, malware, spam campaigns. Accredited
              registrars are required to publish an address and to act on what arrives
              there.
            </p>
            <p>
              Include the exact domain, what you observed, when it happened, and evidence
              such as email headers or the specific URL. Vague reports get closed. It is
              also not a support channel, so a complaint about a website being merely
              annoying or wrong will be ignored, and reasonably so.
            </p>
            <p>
              If a registrar does not act on a genuine report, ICANN runs a complaint
              process that escalates it above them.
            </p>
          </section>

          <section>
            <h2>How do you regain access to a domain you own?</h2>
            <p>
              This comes up when an agency, a former employee or a long-gone contractor
              registered the name. The registrar is the only party who can help, and they
              will require proof.
            </p>
            <p>
              Expect to show that the registrant details on file match your organisation,
              or documentary evidence that the name belongs to you. It takes time and
              there is no shortcut. What this tool gives you is the correct company to
              start that conversation with, which is often the missing piece.
            </p>
            <p>
              What is not in any public record: your account username, which email address
              the account uses, or anything that helps with a password reset.
            </p>
          </section>

          <section>
            <h2>Can you tell when a domain changed registrar?</h2>
            <p>
              Sometimes. Some registries publish a transfer date and most do not. When it
              is there, the result shows it.
            </p>
            <p>
              When it is missing, a recent move is genuinely invisible. The record last
              changed date is not a substitute, because it moves for nameserver edits,
              renewals, contact changes and plenty else besides a transfer. Reading it as
              a transfer date is a common and understandable mistake.
            </p>
          </section>

          <section>
            <h2>What is an IANA registrar ID?</h2>
            <p>
              A number ICANN assigns to each accredited registrar. It is useful because
              registrar names get written inconsistently across systems while the number
              stays fixed, so if you are matching records or filing a complaint the ID is
              the unambiguous identifier.
            </p>
          </section>

          <section>
            <h2>Related tools</h2>
            <p>
              If you are trying to move a domain,{" "}
              <Link href="/domain-tools/transfer-readiness">transfer readiness</Link> works
              out what is standing in the way. For the complete record use the{" "}
              <Link href="/domain-tools/domain-lookup">domain registration lookup</Link>,
              and to find out who is behind the name rather than who sold it, see{" "}
              <Link href="/domain-tools/domain-owner">domain owner lookup</Link>.
            </p>
          </section>
        </article>
      </main>
    </AppShell>
  );
}
