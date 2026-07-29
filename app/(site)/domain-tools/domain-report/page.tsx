import Link from "next/link";
import { AppShell } from "../../../app-shell";
import { DomainToolsSidebar } from "../domain-tools-sidebar";
import { DomainReportTool } from "./domain-report-tool";

type SearchParams = Record<string, string | string[] | undefined>;
const first = (value: string | string[] | undefined) => (Array.isArray(value) ? (value[0] ?? "") : (value ?? ""));

export default async function DomainReportPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;

  return (
    <AppShell
      mainLabel="Domain Registration Report"
      menuLabel="Domain tools"
      sidebar={<DomainToolsSidebar active="report" />}
      sidebarLabel="Domain tools sidebar"
    >
      <main className="domain-tool-main">
        <header className="domain-page-header">
          <h1>
            Domain <mark>health check</mark>: registration and DNS together
          </h1>
          <p>
            Check a domain&apos;s registration record and its live DNS in one go, and
            find the places where the two disagree. A registry can hold one set of
            nameservers while the zone serves another. DNSSEC can be switched on at
            the registry while the chain is broken. Neither shows up if you only look
            at one side, which is what most tools do.
          </p>
        </header>

        <DomainReportTool initialName={first(params.name)} />

        <hr className="domain-divider" />

        <article className="domain-reference-content">
          <section>
            <h2>What does this report check?</h2>
            <p>
              Two things at once, and then the gap between them. On the registration
              side: registrar, dates, status codes, nameservers on record, and DNSSEC
              delegation. On the DNS side: the parent delegation and what the zone itself
              actually publishes.
            </p>
            <p>
              The report also lists what did not run. A combined check that quietly drops
              a step is worse than no check, because a gap reads like a pass.
            </p>
          </section>

          <section>
            <h2>Why do nameservers differ between the registry and DNS?</h2>
            <p>
              This is the mismatch worth understanding, because it produces faults that
              are genuinely miserable to diagnose. A nameserver list can live in three
              places, and they normally agree.
            </p>
            <p className="domain-source-path">
              <code>registry record</code>
              <span aria-hidden="true">→</span>
              <code>parent delegation</code>
              <span aria-hidden="true">→</span>
              <code>the zone itself</code>
            </p>
            <p>
              When they do not agree, you get answers that work sometimes and fail other
              times, depending on which server a resolver happened to ask. It usually
              means a nameserver change was made in one place and not the other, often
              during a migration that looked finished.
            </p>
          </section>

          <section>
            <h2>Does DNSSEC enabled mean DNSSEC is working?</h2>
            <p>
              No, and the difference matters more than most DNSSEC settings. The
              registration record tells you whether a DS record exists, which is a
              delegation fact. It says nothing about whether the signatures validate.
            </p>
            <p>
              A domain with DNSSEC switched on and a broken chain does not degrade
              gracefully. It stops resolving completely for everyone behind a validating
              resolver, while continuing to work fine for anyone who is not. That is why
              this report flags a signed delegation and sends you to the{" "}
              <Link href="/dns-tools/dnssec-checker">DNSSEC chain checker</Link>, which
              runs a real validator rather than reading a flag.
            </p>
          </section>

          <section>
            <h2>Why is my domain registered but not resolving?</h2>
            <p>
              If DNS checks come back clean and nothing loads, the answer is often in the
              registration record rather than in DNS at all.
            </p>
            <p>
              A hold status tells the registry to stop publishing the domain, so nothing
              under it resolves while the registration stays perfectly valid. No amount
              of DNS debugging reveals it, because DNS is behaving correctly by having
              nothing to serve. The other common cause is no nameservers on record at
              all. This report is where those two halves finally sit next to each other.
            </p>
          </section>

          <section>
            <h2>Why is there no score or grade?</h2>
            <p>
              Because there is no single correct configuration for every domain, so a
              total would be inventing a standard that does not exist. A perfectly healthy
              domain can show several findings, and a domain scoring well can still be
              badly broken in a way the score never looked at.
            </p>
            <p>
              Each finding is an observation with the evidence behind it and a link to the
              tool that investigates it properly. This page is for locating a problem. The
              focused tools are for diagnosing it.
            </p>
          </section>

          <section>
            <h2>What this report does not cover</h2>
            <ul>
              <li>
                <strong>Website security.</strong> No TLS certificates, open ports,
                blocklists, headers or content checks. This is not a security scanner.
              </li>
              <li>
                <strong>Email deliverability.</strong> Reading a TXT record is not
                validating SPF, DKIM or DMARC, and pretending otherwise would be worse
                than staying out of it.
              </li>
              <li>
                <strong>Monitoring.</strong> One point in time, no history, no alerts, and
                nothing stored.
              </li>
              <li>
                <strong>Anything private.</strong> No registrar account state, no hosting,
                no billing.
              </li>
            </ul>
          </section>

          <section>
            <h2>Related tools</h2>
            <p>
              The DNS side has much deeper tools of its own:{" "}
              <Link href="/dns-tools/nameserver-checker">nameserver delegation</Link>,{" "}
              <Link href="/dns-tools/soa-checker">SOA consistency</Link> and{" "}
              <Link href="/dns-tools/caa-checker">CAA policy</Link>. On the registration
              side, the{" "}
              <Link href="/domain-tools/domain-lookup">domain registration lookup</Link>{" "}
              shows the complete record and{" "}
              <Link href="/domain-tools/epp-status-codes">status codes</Link> explains
              anything the report flagged.
            </p>
          </section>
        </article>
      </main>
    </AppShell>
  );
}
