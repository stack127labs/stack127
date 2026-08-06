import "../../domain-tools/domain-tools.css";
import { ArrowLeftRight } from "lucide-react";
import Link from "next/link";
import { AppShell } from "../../../app-shell";
import { DomainToolsSidebar } from "../../domain-tools/domain-tools-sidebar";
import { TransferReadinessTool } from "./transfer-readiness-tool";
import { pendingPolicy, policyInForce } from "@/lib/domain/transfer-policy.ts";
import { PageTitleIcon } from "../../../page-title-icon";
import { proseSectionFlowClassName } from "../../../prose";

type SearchParams = Record<string, string | string[] | undefined>;
const first = (value: string | string[] | undefined) => (Array.isArray(value) ? (value[0] ?? "") : (value ?? ""));

export default async function TransferReadinessPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const current = policyInForce();
  const pending = pendingPolicy();

  return (
    <AppShell
      mainLabel="Domain Transfer Readiness"
      menuLabel="Domain tools"
      sidebar={<DomainToolsSidebar active="transfer" />}
      sidebarLabel="Domain tools sidebar"
    >
      <main className="domain-tool-main">
        <header className="domain-page-header">
          <h1>
            <PageTitleIcon>
              <ArrowLeftRight strokeWidth={2.2} />
            </PageTitleIcon>{" "}
            Domain <mark>transfer</mark> readiness: can this domain be transferred?
          </h1>
          <p>
            Check whether a domain can move to another registrar right now, and if
            not, what is stopping it. The answer is spread across status codes, dates
            and ICANN policy, so this pulls it together into a list of what is
            blocking you, separates the locks you can remove yourself from the ones
            you cannot, and is straight about the parts no public tool can see.
          </p>
        </header>

        <TransferReadinessTool initialName={first(params.name)} />

        <hr className="domain-divider" />

          <article className={`domain-reference-content ${proseSectionFlowClassName}`}>
          <section>
            <h2>How does a domain transfer work?</h2>
            <p>Five steps, and most of the pain is in the first two.</p>
            <ol>
              <li>Unlock the domain at your current registrar.</li>
              <li>Get the authorization code, sometimes called an EPP code or auth code.</li>
              <li>Start the transfer at the registrar you are moving to and pay for it.</li>
              <li>Approve the confirmation email sent to the registrant address on record.</li>
              <li>Wait. Registries allow the losing registrar up to five days to respond.</li>
            </ol>
            <p>
              A transfer normally includes a year&apos;s renewal in the price, so the
              expiry date moves forward rather than resetting to today.
            </p>
          </section>

          <section>
            <h2>Why is my domain transfer blocked?</h2>
            <p>
              Usually one of four things, and the check above tells you which. The
              important split is between locks your registrar set and locks the registry
              set, because that decides whether this takes two minutes or two weeks.
            </p>
            <div className="domain-table-scroll">
              <table className="domain-table">
                <tbody>
                  <tr>
                    <th>
                      <code>clientTransferProhibited</code>
                    </th>
                    <td>
                      Your registrar&apos;s standard lock. It is on most domains by
                      default, it is good for security, and there is a switch in your
                      account that turns it off.
                    </td>
                  </tr>
                  <tr>
                    <th>
                      <code>serverTransferProhibited</code>
                    </th>
                    <td>
                      The registry set this. A dispute, a court order, registry policy, or
                      a high-security lock you may have requested yourself. You cannot
                      remove it and your registrar has to find out why.
                    </td>
                  </tr>
                  <tr>
                    <th>Recently registered</th>
                    <td>
                      ICANN policy locks a newly registered domain against transfer for a
                      period. Currently {current.afterRegistrationDays} days.
                    </td>
                  </tr>
                  <tr>
                    <th>Recently transferred</th>
                    <td>
                      The same lock applies after each move between registrars.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2>What is the 60 day transfer lock?</h2>
            <p>
              ICANN policy stops a domain being transferred for {current.afterRegistrationDays} days
              after it is first registered, and again for {current.afterTransferDays} days
              after each transfer between registrars. There is also a lock after a change
              of registrant, which no public tool can see because registrant changes are
              not published anywhere.
            </p>
            {pending ? (
              <p>
                This is currently changing. The GNSO Council approved a reform on 12 March
                2025 and the ICANN Board adopted it on 7 June 2026, shortening the locks
                to {pending.afterRegistrationDays} days and removing the change of
                registrant lock entirely. It has not taken effect yet: an implementation
                review team has to draft the policy language first, and no effective date
                has been published. The check above uses the rule genuinely in force
                today, and it will not print a specific future date on which a lock lifts,
                because registrars measure the clock from different starting points and
                the policy is mid-change.
              </p>
            ) : null}
          </section>

          <section>
            <h2>Will transferring a domain take my site down?</h2>
            <p>
              It can, in two specific ways, and both are avoidable if you know about them
              beforehand. This is the part people find out afterwards.
            </p>
            <p>
              <strong>DNS hosting.</strong> A transfer moves the registration, not your
              DNS. If your current registrar is also serving your zone, those records can
              disappear when the domain leaves, and the website and email go with them.
              Move DNS to its new home first, confirm it is answering, then transfer.
            </p>
            <p>
              <strong>DNSSEC.</strong> If the domain is signed, the DS record has to be
              handled at both ends. Getting it wrong means the domain stops resolving
              entirely for anyone using a validating resolver, which is a total outage
              rather than a partial one. Check the state of the chain with the{" "}
              <Link href="/dnssec-checker">DNSSEC chain checker</Link> before
              you start.
            </p>
          </section>

          <section>
            <h2>What can this check not see?</h2>
            <p>
              Everything that lives in your registrar account rather than the public
              record, and any one of these can stop a transfer even when the checks above
              all pass.
            </p>
            <ul>
              <li>Whether you can actually get the authorization code.</li>
              <li>
                Whether the registrant email still works. Approval goes there, and an
                abandoned address is the single most common reason a transfer stalls.
              </li>
              <li>Unpaid balances or unverified contact details on the account.</li>
              <li>Whether a change of registrant happened recently.</li>
            </ul>
            <p>
              Before starting a transfer, check the registrant email on file is one you
              can read. That one thing prevents most failed transfers.
            </p>
          </section>

          <section>
            <h2>Do country domains transfer the same way?</h2>
            <p>
              No. Everything above is ICANN policy for generic endings.{" "}
              <code>.uk</code>, <code>.de</code> and <code>.nl</code> each run their own
              process with their own authorization mechanism and timings, and none of the
              locks described here apply to them.
            </p>
            <p>
              For those, the registry&apos;s own documentation is the source worth reading.{" "}
              <code>.uk</code> transfers work by changing a tag rather than using an auth
              code, which surprises people coming from <code>.com</code>.
            </p>
          </section>

          <section>
            <h2>Related tools</h2>
            <p>
              The <Link href="/epp-status-codes">status codes reference</Link>{" "}
              explains every lock in full. The{" "}
              <Link href="/domain-registrar">registrar lookup</Link> gives you
              contact details for the registrar you are leaving, and the{" "}
              <Link href="/domain-lookup">domain registration lookup</Link>{" "}
              shows the whole record.
            </p>
          </section>
        </article>
      </main>
    </AppShell>
  );
}
