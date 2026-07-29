import Link from "next/link";
import { AppShell } from "../../app-shell";
import { dotBandClassName } from "../../dot-band";
import { Doodle } from "../../doodle";
import { siteDoodlePlantArt } from "../art/site--doodle-plant";
import { DomainToolsSidebar } from "./domain-tools-sidebar";
import { coverageSummary } from "@/lib/domain/bootstrap.ts";

const tools = [
  {
    href: "/domain-tools/domain-lookup",
    name: "Domain Registration Lookup",
    reason: "I want the whole registration record.",
    detail:
      "Shows who the domain is registered through, when it was created, when it expires, what the registry is currently allowing, and what contact details have been withheld.",
  },
  {
    href: "/domain-tools/domain-age",
    name: "Domain Age Checker",
    reason: "I want to know how old this domain is.",
    detail: "Gives the registration date and works out the age, and explains why that is not the same as the age of the site.",
  },
  {
    href: "/domain-tools/domain-expiry",
    name: "Domain Expiry Checker",
    reason: "I want to know when this expires.",
    detail: "Shows the date and, more usefully, what happens in the two or three months after it passes.",
  },
  {
    href: "/domain-tools/domain-availability",
    name: "Domain Availability Checker",
    reason: "I want to know if a name is taken.",
    detail: "Asks the registry directly. We sell nothing, so there is no reason for us to be anything other than straight with you.",
  },
  {
    href: "/domain-tools/multi-tld-availability",
    name: "Multi-TLD Availability",
    reason: "I want one name checked across several endings.",
    detail: "One name against a handful of endings at once, with every row reporting its own outcome.",
  },
  {
    href: "/domain-tools/domain-owner",
    name: "Domain Registrant Lookup",
    reason: "I want to know who is behind a domain.",
    detail:
      "Shows what is published, exactly which fields were withheld and how, and the routes that still exist for making contact.",
  },
  {
    href: "/domain-tools/domain-registrar",
    name: "Registrar Lookup",
    reason: "I need the registrar, or somewhere to report abuse.",
    detail: "Names the registrar, gives the abuse contact, and untangles the registry and reseller confusion.",
  },
  {
    href: "/domain-tools/transfer-readiness",
    name: "Domain Transfer Readiness",
    reason: "I want to move this to another registrar.",
    detail: "Works out what is blocking the move, separates what you can fix from what you cannot, and says what it cannot see.",
  },
  {
    href: "/domain-tools/domain-report",
    name: "Domain Registration Report",
    reason: "I want the registration and the DNS checked together.",
    detail: "Runs both engines and looks for the places where the registry and the live DNS disagree.",
  },
  {
    href: "/domain-tools/epp-status-codes",
    name: "Domain status codes",
    reason: "My domain has a status I do not understand.",
    detail: "Explains every status code, who set it, and whether it is yours to remove.",
  },
  {
    href: "/domain-tools/punycode-converter",
    name: "Punycode and IDN Converter",
    reason: "This name has odd characters in it.",
    detail: "Converts between the readable form and the ASCII form DNS carries, and flags names that mix writing systems.",
  },
  {
    href: "/domain-tools/tld-directory",
    name: "TLD Directory",
    reason: "I want to know who runs an ending.",
    detail: "Every ending in the root zone, its operator, whether it is signed, and whether we can look names up under it.",
  },
];

export default function DomainToolsPage() {
  const coverage = coverageSummary();

  return (
    <AppShell
      mainLabel="Domain tools"
      menuLabel="Domain tools"
      sidebar={<DomainToolsSidebar active="hub" />}
      sidebarLabel="Domain tools sidebar"
    >
      <div className={`${dotBandClassName} domain-hero-band`}>
        <div className="domain-hero-band-inner">
          <header className="domain-page-header">
            <h1>
              Free domain <mark>lookup tools</mark>
            </h1>
            <p>
              Look up who registered a domain, when it was created, when it expires,
              whether a name is available, and what its status codes actually mean.
              Every answer comes from the registry that runs the ending rather than from
              a reseller trying to sell you something, and none of these tools ask you
              to sign up.
            </p>
          </header>
        </div>
        <Doodle className="domain-hero-doodle" placement="corner" svg={siteDoodlePlantArt} />
      </div>
      <main className="domain-hub-main domain-hub-after-hero">

        <section aria-labelledby="tools-title" className="domain-hub-section">
          <h2 id="tools-title">Which domain tool do you need?</h2>
          {tools.map((tool) => (
            <Link className="domain-tool-card" href={tool.href} key={tool.href}>
              <span className="domain-tool-card-copy">
                <strong className="domain-tool-card-name">{tool.name}</strong>
                <span className="domain-tool-card-reason">{tool.reason}</span>
                <small>{tool.detail}</small>
              </span>
              <span aria-hidden="true">→</span>
            </Link>
          ))}
        </section>

        <hr className="domain-divider" />

        <article className="domain-reference-content">
          <section>
            <h2>Is WHOIS still a thing?</h2>
            <p>
              Not really, and that is worth knowing before you trust an old tool. WHOIS
              was a plain text service that answered on port 43, and ICANN stopped
              requiring registries and registrars to run it on 28 January 2025. It has
              been replaced by RDAP, which returns properly structured data over a secure
              connection.
            </p>
            <p>
              Most people still call it a WHOIS lookup, and that is fine. What matters is
              that RDAP carries information the old format could not, including a
              machine-readable list of exactly which contact fields a registrar withheld.
              Every tool here reads RDAP.
            </p>
            <p>
              One thing that trips everybody up: there are two servers holding two
              different records, and they do not say the same things. The registry runs
              the ending and is the authority on dates, status codes, nameservers and
              DNSSEC. The registrar is the company the domain was bought through, and for
              most endings it is the only party holding any contact details.
            </p>
            <p className="domain-source-path">
              <code>you</code>
              <span aria-hidden="true">→</span>
              <code>registry</code>
              <span aria-hidden="true">→</span>
              <code>registrar</code>
            </p>
          </section>

          <section>
            <h2>Which domain extensions can be looked up?</h2>
            <p>
              Not every ending publishes RDAP. Of the {coverage.rootZoneTlds.toLocaleString("en-US")} endings in
              the root zone, {coverage.covered.toLocaleString("en-US")} are ones we can
              look up, using the official IANA directory plus a small reviewed list of
              registries that run RDAP without being listed there. The
              remaining {coverage.uncovered.toLocaleString("en-US")} we cannot check at
              all, and the tools say so rather than showing you a blank that looks like
              an answer. The{" "}
              <Link href="/domain-tools/tld-directory">TLD directory</Link> lists every one,
              and it was last refreshed on {coverage.checkedAt}.
            </p>
            <p>
              None of these tools can show you history. RDAP returns the current state of
              a record and nothing else, so there is no previous owner, no past
              nameserver, and no record of what changed last week. Anything claiming
              otherwise is selling you an archive someone built by saving daily copies.
            </p>
          </section>

          <section>
            <h2>Are these domain lookups private?</h2>
            <p>
              The name you enter is sent to the registry and registrar that operate that
              ending. There is no way around that, since they are the ones holding the
              answer. On our side we keep the registry&apos;s answer for a short while so
              that repeated lookups do not hammer them, and that cached answer is stored
              against the domain name only. Your address is used briefly to stop one
              person overloading the tools, it is never written next to a lookup, and we
              do not build any record of who searched for what.
            </p>
          </section>
        </article>
      </main>
    </AppShell>
  );
}
