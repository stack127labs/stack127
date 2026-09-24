import { PageCanvas } from "@/app/ui/site/page-canvas";
import "../../(catalogs)/domain-tools/domain-tools.css";
import { ListChecks } from "lucide-react";
import Link from "next/link";
import { AppShell } from "../../../ui/site/app-shell";
import { DomainToolsSidebar } from "../../(catalogs)/domain-tools/domain-tools-sidebar";
import { STATUS_CODES, STATUS_GROUP_TITLES, type StatusGroup } from "@/lib/domain/status-codes.ts";
import { StatePill } from "../../(catalogs)/domain-tools/domain-lookup-client";
import { PageTitleIcon } from "../../../ui/site/page-title-icon";
import { PageHeader } from "../../../ui/site/page-header";
import { proseSectionFlowClassName } from "../../../ui/site/prose";

/** Who set it decides what you can do, so that is what the tone encodes. */
const GROUP_TONE: Record<StatusGroup, "good" | "warn" | "bad" | "quiet"> = {
  normal: "good",
  registrar_lock: "warn",
  registry_lock: "bad",
  in_progress: "quiet",
  lifecycle: "quiet",
};

const GROUP_PILL: Record<StatusGroup, string> = {
  normal: "Nothing to do",
  registrar_lock: "Usually yours to remove",
  registry_lock: "Not yours to remove",
  in_progress: "Clears on its own",
  lifecycle: "Time sensitive",
};

const GROUP_ORDER: StatusGroup[] = ["normal", "registrar_lock", "registry_lock", "in_progress", "lifecycle"];

const GROUP_INTRO: Record<StatusGroup, string> = {
  normal: "Nothing to do. These are what a healthy domain looks like.",
  registrar_lock:
    "Your registrar put these on. That matters, because it usually means you can take them off yourself from your account.",
  registry_lock:
    "The registry that runs the ending put these on. You cannot remove them yourself, and the route is through your registrar.",
  in_progress: "Something is part way through. These clear on their own once the registry finishes.",
  lifecycle: "Where the domain sits between being registered and being released.",
};

export default function EppStatusCodesPage() {
  return (
    <AppShell
      mainLabel="Domain status codes"
      menuLabel="Domain tools"
      sidebar={<DomainToolsSidebar />}
      sidebarLabel="Domain tools sidebar"
    >
      <PageCanvas as="main" className="domain-tool-main">
        <PageHeader>
          <h1>
            <PageTitleIcon>
              <ListChecks strokeWidth={2.2} />
            </PageTitleIcon>{" "}
            Domain <mark>status codes</mark> explained
          </h1>
          <p>
            Every domain carries status codes, and they are usually why a transfer is
            refused, a site suddenly goes dark, or a registrar dashboard shows
            something alarming. They are written for software rather than people.
            Here is what each one means in plain terms, who set it, whether you can
            remove it yourself, and what to do about it.
          </p>
        </PageHeader>

          <article className={`domain-reference-content ${proseSectionFlowClassName}`}>
          <section>
            <h2>Why is the same code written two different ways?</h2>
            <p>
              You will see these in two spellings and they are the same thing. Your
              registrar and older tools show <code>clientTransferProhibited</code>. The
              modern registry data shows{" "}
              <code>client transfer prohibited</code>. Nothing has changed except the
              formatting, so both are listed below.
            </p>
            <p>
              One that trips people up: <code>ok</code> and <code>active</code> are also
              the same status, not two different ones.
            </p>
          </section>

          <section>
            <h2>What is the difference between client and server status codes?</h2>
            <p>
              This is the useful split. Codes starting with <code>client</code> were set
              by your registrar, which means there is usually a switch in your account
              that turns them off. Codes starting with <code>server</code> were set by
              the registry that runs the ending, and no amount of clicking in your
              account will move them. If you are stuck, that prefix tells you whether to
              look in your own settings or pick up the phone.
            </p>
            <p className="domain-source-path">
              <code>client…</code>
              <span aria-hidden="true">→</span>
              <span>your registrar, usually yours to change</span>
            </p>
            <p className="domain-source-path">
              <code>server…</code>
              <span aria-hidden="true">→</span>
              <span>the registry, not yours to change</span>
            </p>
          </section>

          <section>
            <h2>My domain is registered but the site is down. Why?</h2>
            <p>
              Check for <code>client hold</code> or <code>server hold</code> first. Those
              two tell the registry to stop publishing the domain, so nothing under it
              resolves at all, while the registration itself remains perfectly valid.
              People lose hours in DNS tools before finding it, because DNS is not the
              problem. <code>client hold</code> is nearly always unpaid invoices or an
              unverified contact address.
            </p>
            <p>
              The other one worth knowing: <code>inactive</code> means no nameservers are
              on record. It looks alarming and usually is not, it just means nothing has
              been pointed anywhere yet.
            </p>
          </section>

          {GROUP_ORDER.map((group) => (
            <section key={group}>
              <div className="domain-answer-head">
                <h2>{STATUS_GROUP_TITLES[group]}</h2>
                <StatePill tone={GROUP_TONE[group]}>{GROUP_PILL[group]}</StatePill>
              </div>
              <p>{GROUP_INTRO[group]}</p>
              <div className="domain-table-scroll">
                <table className="domain-table">
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>What it means</th>
                      <th>What to do</th>
                      <th>Effect</th>
                    </tr>
                  </thead>
                  <tbody>
                    {STATUS_CODES.filter((code) => code.group === group).map((code) => (
                      <tr key={code.rdap}>
                        <td>
                          <code>{code.rdap}</code>
                          {code.epp && code.epp !== code.rdap ? (
                            <>
                              <br />
                              <code>{code.epp}</code>
                            </>
                          ) : null}
                        </td>
                        <td>{code.meaning}</td>
                        <td>{code.action ?? "Nothing. This one is informational."}</td>
                        <td>
                          {code.removesFromDns ? (
                            <StatePill tone="bad">Stops DNS</StatePill>
                          ) : (
                            <span className="domain-state-quiet">Resolving is unaffected</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}

          <section>
            <h2>Why was this status code set on my domain?</h2>
            <p>
              Why it was set. <code>server transfer prohibited</code> could be a trademark
              dispute, a court order, a registry security action, or a lock you asked for
              yourself and forgot about. The code carries no reason and the reason is not
              published anywhere public. Your registrar can usually find out.
            </p>
            <p>
              Registries occasionally publish codes that are entirely their own invention
              and appear in no standard. Those are shown exactly as the registry returned
              them, marked as having no explanation available, rather than being matched to
              something plausible-looking. If you hit one, the registry that runs the ending
              is the only place it is documented.
            </p>
          </section>

          <section>
            <h2>Are status codes on my domain a bad sign?</h2>
            <p>
              Usually not. A healthy domain normally carries at least one, and{" "}
              <code>clientTransferProhibited</code> is the default lock most registrars
              apply precisely because it protects you from an unauthorised transfer.
              Seeing it is a good sign, not a problem to fix.
            </p>
            <p>
              The ones actually worth acting on are the two hold codes, anything starting
              with <code>server</code>, and the lifecycle codes that mean a domain is on
              its way out. Everything else is either informational or something that
              clears on its own.
            </p>
          </section>

          <section>
            <h2>Related tools</h2>
            <p>
              The <Link href="/domain-lookup">registration lookup</Link> shows
              every status on a domain alongside the rest of its record. If you are
              specifically trying to move a domain, the{" "}
              <Link href="/transfer-readiness">transfer readiness check</Link>{" "}
              works out which of these are actually in your way, and for the life cycle
              codes the <Link href="/domain-expiry">expiry checker</Link> lays
              out the stages in order.
            </p>
            <p>
              ICANN also publishes{" "}
              <a href="https://www.icann.org/resources/pages/epp-status-codes-2014-06-16-en">
                its own reference for these codes
              </a>
              , which is worth reading if you want the formal definitions rather than the
              practical ones.
            </p>
          </section>
        </article>
      </PageCanvas>
    </AppShell>
  );
}
