import Link from "next/link";
import { AppShell } from "../../../app-shell";
import { DnsToolsSidebar } from "../dns-tools-sidebar";
import { DnsLookupTool } from "./dns-lookup-tool";
import type { DnsResolver, DnsSelection } from "@/lib/dns/types.ts";

type SearchParams = Record<string, string | string[] | undefined>;

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function initialSelection(value: string): DnsSelection {
  const allowed = new Set(["common", "A", "AAAA", "CNAME", "MX", "NS", "TXT", "CAA", "SOA", "SRV", "DS", "DNSKEY"]);
  const normalized = value === "common" ? value : value.toUpperCase();
  return allowed.has(normalized) ? normalized as DnsSelection : "common";
}

export default async function DnsLookupPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const resolverValue = firstValue(params.resolver);
  const resolver: DnsResolver = resolverValue === "google" ? "google" : "cloudflare";

  return (
    <AppShell
      mainLabel="DNS lookup"
      menuLabel="DNS tools"
      sidebar={<DnsToolsSidebar active="lookup" showPageLinks />}
      sidebarLabel="DNS lookup sidebar"
    >
      <main className="dns-lookup-main">
        <nav className="dns-breadcrumb" aria-label="Breadcrumb">
          <Link href="/dns-tools">DNS tools</Link><span aria-hidden="true">/</span><span>DNS lookup</span>
        </nav>
        <header className="dns-page-header">
          <p className="dns-page-kicker">DNS tool</p>
          <h1>DNS lookup</h1>
          <p>
            Enter a domain or hostname to see the public DNS records returned by Cloudflare or Google Public DNS. Results include record values, Resolver TTLs, aliases, and the exact DNS response state.
          </p>
        </header>

        <DnsLookupTool
          initialName={firstValue(params.name)}
          initialResolver={resolver}
          initialSelection={initialSelection(firstValue(params.type))}
        />

        <article className="dns-reference-content">
          <section>
            <h2>What this lookup checks</h2>
            <p>
              The tool asks the selected recursive resolver for the exact name and record type you choose. Common records runs separate A, AAAA, CNAME, MX, NS, TXT, CAA, and SOA queries. It does not use an ANY query.
            </p>
            <p>
              This is one resolver's current answer. It is not a country-by-country propagation test and it does not prove that a website or email service is configured correctly.
            </p>
          </section>

          <section id="record-types">
            <h2>Record types</h2>
            <dl className="dns-record-reference">
              <div><dt>A</dt><dd>IPv4 addresses for a name.</dd></div>
              <div><dt>AAAA</dt><dd>IPv6 addresses for a name.</dd></div>
              <div><dt>CNAME</dt><dd>An alias from one DNS name to another.</dd></div>
              <div><dt>MX</dt><dd>Mail exchangers and their priorities.</dd></div>
              <div><dt>NS</dt><dd>Nameservers published at the exact name.</dd></div>
              <div><dt>TXT</dt><dd>Text records used for verification and policies. A TXT result at <code>_dmarc</code> is not DMARC validation.</dd></div>
              <div><dt>CAA</dt><dd>Certificate authority issuance policy.</dd></div>
              <div><dt>SOA</dt><dd>Zone authority, serial, timing, and negative-cache fields.</dd></div>
              <div><dt>SRV</dt><dd>Service priority, weight, port, and target.</dd></div>
              <div><dt>DS</dt><dd>DNSSEC delegation signer data at the parent.</dd></div>
              <div><dt>DNSKEY</dt><dd>Public keys published by a DNSSEC-signed zone.</dd></div>
            </dl>
          </section>

          <section>
            <h2>Resolver TTL</h2>
            <p>
              Resolver TTL is the TTL in the selected resolver's response, usually the remaining cache lifetime. It may be lower than the TTL configured by the domain owner. It does not guarantee how long every resolver or user will keep the answer.
            </p>
          </section>

          <section>
            <h2>Aliases and record owners</h2>
            <p>
              A recursive answer can include a CNAME chain and terminal records for the alias target. The tool shows a compatible alias chain once, keeps each terminal record's actual owner name, and warns when separate queries disagree about the chain.
            </p>
          </section>

          <section id="status-meanings">
            <h2>DNS status meanings</h2>
            <dl className="dns-status-reference">
              <div><dt>NOERROR with records</dt><dd>The resolver completed the query and returned the requested terminal record type.</dd></div>
              <div><dt>NOERROR without records</dt><dd>The name can exist even when that exact record type is not published there.</dd></div>
              <div><dt>NXDOMAIN</dt><dd>The resolver reports that the queried DNS name does not exist.</dd></div>
              <div><dt>SERVFAIL</dt><dd>The resolver could not complete resolution. DNSSEC failure is one possible cause, not the only cause.</dd></div>
              <div><dt>REFUSED</dt><dd>The resolver refused the query.</dd></div>
            </dl>
          </section>

          <section>
            <h2>DNSSEC authentication reporting</h2>
            <p>
              If AD is true, the selected resolver reports that it authenticated the returned data. If AD is false, the name may simply be unsigned. Full DNSSEC chain diagnosis belongs in the later DNSSEC checker.
            </p>
          </section>

          <section id="limitations">
            <h2>Limitations and privacy</h2>
            <ul>
              <li>The DNS name is sent to the selected public resolver.</li>
              <li>Version127 does not save a lookup history.</li>
              <li>Share links expose the DNS name in the URL and run a fresh lookup when opened.</li>
              <li>Results describe a recursive resolver response, not authoritative configuration or global propagation.</li>
            </ul>
          </section>

          <section id="faq">
            <h2>FAQ</h2>
            <details><summary>Why does the result show no record?</summary><p>The exact name may exist without the selected type. Check the response code and owner names before treating an empty answer as a nonexistent domain.</p></details>
            <details><summary>Why can Cloudflare and Google show different answers?</summary><p>Recursive resolvers can hold answers fetched at different times. Their remaining cache lifetimes and current values can temporarily differ.</p></details>
            <details><summary>Does this check DNS propagation?</summary><p>No. It checks one selected public resolver. The later DNS Change Checker will compare authoritative and recursive answers without calling that comparison global propagation.</p></details>
            <details><summary>Does an AD flag prove DNSSEC is configured correctly?</summary><p>No. AD true reports authentication for that returned data. AD false also does not prove breakage because the name may be unsigned.</p></details>
          </section>
        </article>
      </main>
    </AppShell>
  );
}
