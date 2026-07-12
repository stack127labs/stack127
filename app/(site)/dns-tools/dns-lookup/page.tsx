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
          <h1>DNS lookup</h1>
          <p>
            See the records that Cloudflare or Google Public DNS currently returns for a domain or hostname. If you are unsure where to begin, leave Common records selected. It checks the records most often used by websites, email, certificates, and domain verification.
          </p>
        </header>

        <DnsLookupTool
          initialName={firstValue(params.name)}
          initialResolver={resolver}
          initialSelection={initialSelection(firstValue(params.type))}
        />

        <article className="dns-reference-content">
          <section id="read-results">
            <h2>Read the answer</h2>
            <p>DNS does not always connect a name directly to an address. A hostname can first point to another hostname, which then owns the final record. The lookup keeps that path visible instead of making the answer look simpler than it is.</p>
            <figure className="dns-answer-path">
              <div>
                <code>www.example.com</code>
                <span aria-hidden="true">→</span>
                <code>edge.example.net</code>
                <span aria-hidden="true">→</span>
                <code>192.0.2.42</code>
              </div>
              <figcaption>Here, <code>www.example.com</code> is an alias. The A record belongs to <code>edge.example.net</code>, so that owner name stays attached to the address in the result.</figcaption>
            </figure>
            <p>Resolver TTL tells you how much cache time the selected resolver reported when the lookup ran. A result of 300 seconds means about five minutes remained at that moment. It may be lower than the TTL set by the domain owner because some of the cache lifetime has already passed.</p>
          </section>

          <section id="record-types">
            <h2>Record types</h2>
            <p>Common records is a good first look because it asks for A, AAAA, CNAME, MX, NS, TXT, CAA, and SOA separately. Choose one type when you already know which part of the domain you are checking.</p>
            <div className="dns-table-scroll">
              <table className="dns-record-table">
                <thead><tr><th scope="col">Type</th><th scope="col">What it shows</th></tr></thead>
                <tbody>
                  <tr><th scope="row">A</th><td>The IPv4 addresses used by the name.</td></tr>
                  <tr><th scope="row">AAAA</th><td>The IPv6 addresses used by the name.</td></tr>
                  <tr><th scope="row">CNAME</th><td>The other hostname that this name points to.</td></tr>
                  <tr><th scope="row">MX</th><td>The servers that receive email, along with the order in which they should be tried.</td></tr>
                  <tr><th scope="row">NS</th><td>The nameservers published for the name.</td></tr>
                  <tr><th scope="row">TXT</th><td>Text used for verification and email policies. The lookup returns the value but does not validate SPF, DKIM, or DMARC.</td></tr>
                  <tr><th scope="row">CAA</th><td>The certificate authorities allowed to issue certificates for the domain.</td></tr>
                  <tr><th scope="row">SOA</th><td>The zone's primary nameserver, serial number, and timing information.</td></tr>
                  <tr><th scope="row">SRV</th><td>The hostname and port used by a particular network service.</td></tr>
                  <tr><th scope="row">DS</th><td>The DNSSEC link published by the parent zone.</td></tr>
                  <tr><th scope="row">DNSKEY</th><td>The public keys published by a DNSSEC-signed zone.</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <section id="status-meanings">
            <h2>When the answer looks wrong</h2>
            <p>The response code tells you whether the resolver answered the query, but it does not tell the whole story. Read it together with the records that came back.</p>
            <div className="dns-table-scroll">
              <table className="dns-status-table">
                <thead><tr><th scope="col">Response</th><th scope="col">What it means</th></tr></thead>
                <tbody>
                  <tr><th scope="row">NOERROR with records</th><td>The query worked and the resolver returned the record type you asked for.</td></tr>
                  <tr><th scope="row">NOERROR without records</th><td>The name can still exist, but it does not publish that particular record type.</td></tr>
                  <tr><th scope="row">NXDOMAIN</th><td>The resolver says the exact name does not exist. Check the spelling and whether you meant the root domain or a subdomain.</td></tr>
                  <tr><th scope="row">SERVFAIL</th><td>The resolver could not finish the lookup. A broken delegation, an upstream timeout, or DNSSEC validation trouble can cause it, so the code alone does not identify the problem.</td></tr>
                  <tr><th scope="row">REFUSED</th><td>The resolver chose not to answer, usually because of its own policy.</td></tr>
                </tbody>
              </table>
            </div>
            <p>Cloudflare and Google may briefly disagree after a DNS change because they can hold answers fetched at different times. Compare the values and remaining Resolver TTL, but remember that this is still one resolver's view. It does not test global propagation, website health, mail delivery, DMARC policy, or the full DNSSEC chain.</p>
          </section>

          <aside className="dns-scope-note">
            <p>The name you enter is sent to the public resolver you select. Version127 does not save lookup history, and queried names or returned values are not included in analytics.</p>
          </aside>
        </article>
      </main>
    </AppShell>
  );
}
