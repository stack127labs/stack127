import { Globe } from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/app/app-shell";
import { EntryHero } from "@/app/entry-hero";
import { PageCanvas } from "@/app/page-canvas";
import { siteSpotDomainToolsArt } from "../../art/site--spot-domain-tools";
import { ToolCatalogSidebar } from "../_components/tool-catalog-sidebar";
import { coverageSummary } from "@/lib/domain/bootstrap.ts";
import { PageTitleIcon } from "@/app/page-title-icon";
import { PageHeader } from "@/app/page-header";
import { proseSectionFlowClassName } from "@/app/prose";
import { domainAgeArt } from "../_components/art/domain-age";
import { domainAvailabilityArt } from "../_components/art/domain-availability";
import { domainExpiryArt } from "../_components/art/domain-expiry";
import { domainLookupArt } from "../_components/art/domain-lookup";
import { domainOwnerArt } from "../_components/art/domain-owner";
import { domainRegistrarArt } from "../_components/art/domain-registrar";
import { domainReportArt } from "../_components/art/domain-report";
import { eppStatusArt } from "../_components/art/epp-status";
import { multiTldArt } from "../_components/art/multi-tld";
import { punycodeArt } from "../_components/art/punycode";
import { tldDirectoryArt } from "../_components/art/tld-directory";
import { transferReadinessArt } from "../_components/art/transfer-readiness";
import { ToolCatalog, type CatalogTool } from "../_components/tool-catalog";

const tools: CatalogTool[] = [
  {
    href: "/domain-lookup",
    name: "Domain lookup",
    description: "Read the registrar, dates, status codes, nameservers, and published contact fields.",
    art: domainLookupArt,
  },
  {
    href: "/domain-age",
    name: "Domain age checker",
    description: "Find the registration date and measure the domain's age without treating it as the age of the website.",
    art: domainAgeArt,
  },
  {
    href: "/domain-expiry",
    name: "Domain expiry checker",
    description: "See the expiry date and the renewal or deletion stages that may follow it.",
    art: domainExpiryArt,
  },
  {
    href: "/domain-availability",
    name: "Domain availability",
    description: "Ask the registry whether a domain is registered, available, or unknown.",
    art: domainAvailabilityArt,
  },
  {
    href: "/multi-tld-availability",
    name: "Multi-TLD availability",
    description: "Check one name across several domain endings and keep each registry answer separate.",
    art: multiTldArt,
  },
  {
    href: "/domain-owner",
    name: "Registrant lookup",
    description: "See which owner details are public, which were withheld, and how contact may still work.",
    art: domainOwnerArt,
  },
  {
    href: "/domain-registrar",
    name: "Registrar lookup",
    description: "Find the registrar, its abuse contact, and any reseller shown in the record.",
    art: domainRegistrarArt,
  },
  {
    href: "/transfer-readiness",
    name: "Transfer readiness",
    description: "Check visible transfer blocks and separate what you can fix from what the lookup cannot see.",
    art: transferReadinessArt,
  },
  {
    href: "/domain-report",
    name: "Domain report",
    description: "Check registration and live DNS together, then surface the places where they disagree.",
    art: domainReportArt,
  },
  {
    href: "/epp-status-codes",
    name: "Domain status codes",
    description: "Understand what each EPP status means, who set it, and whether you can remove it.",
    art: eppStatusArt,
  },
  {
    href: "/punycode-converter",
    name: "Punycode converter",
    description: "Convert between a readable internationalized name and the ASCII form used by DNS.",
    art: punycodeArt,
  },
  {
    href: "/tld-directory",
    name: "TLD directory",
    description: "Find who runs each root-zone ending and whether it supports DNSSEC and RDAP lookups.",
    art: tldDirectoryArt,
  },
];

export default function DomainToolsPage() {
  const coverage = coverageSummary();

  return (
    <AppShell
      mainLabel="Domain tools"
      menuLabel="Tool catalogs"
      sidebar={<ToolCatalogSidebar active="domain-tools" />}
      sidebarLabel="Tool catalogs sidebar"
    >
      <EntryHero art={siteSpotDomainToolsArt} wide>
        <PageHeader>
            <h1>
              <PageTitleIcon>
                <Globe strokeWidth={2.2} />
              </PageTitleIcon>{" "}
              Free domain <mark>lookup tools</mark> that answer from the registry
            </h1>
            <p>
              Check registration, availability, ownership, expiry, transfers, and status codes
              using current registry and registrar data.
            </p>
        </PageHeader>
      </EntryHero>
      <PageCanvas>
        <ToolCatalog heading="Choose a domain check" tools={tools} />

        <hr className="domain-divider" />

        <article className={`domain-reference-content ${proseSectionFlowClassName}`}>
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
              <Link href="/tld-directory">TLD directory</Link> lists every one,
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
      </PageCanvas>
    </AppShell>
  );
}
