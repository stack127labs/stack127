import Link from "next/link";
import { coverageSummary } from "@/lib/domain/bootstrap.ts";
import { proseSectionFlowClassName } from "@/app/ui/site/prose";

export function DomainCatalogReference() {
  const coverage = coverageSummary();
  return (
    <>
        <section className="domain-reference-content">
          <h2>Domain references</h2>
          <p>
            Use the <Link href="/epp-status-codes">domain status code reference</Link> to understand
            registry and registrar locks. The <Link href="/tld-directory">TLD directory</Link> shows
            which domain endings have RDAP and DNSSEC support.
          </p>
        </section>
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
    </>
  );
}
