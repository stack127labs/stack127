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
            Check the DNS records that Cloudflare or Google Public DNS currently returns for a domain or hostname. The lookup shows addresses, aliases, mail servers, verification text, nameservers, Resolver TTL, and the exact DNS response. If you are unsure which record you need, leave Common selected.
          </p>
        </header>

        <DnsLookupTool
          initialName={firstValue(params.name)}
          initialResolver={resolver}
          initialSelection={initialSelection(firstValue(params.type))}
        />

        <article className="dns-reference-content">
          <section id="how-to-check">
            <h2>How to check DNS records</h2>
            <p>A DNS lookup asks for records attached to one exact name. The root domain, a website hostname, and a mail hostname can all return different answers, so begin with the name used by the service you are checking.</p>
            <ol className="dns-reading-steps">
              <li>Enter the domain or hostname. Use <code>example.com</code> for the root domain, <code>www.example.com</code> for the website hostname, or <code>mail.example.com</code> for a mail hostname. You can also paste an HTTP or HTTPS URL, and the tool will use its hostname.</li>
              <li>Leave Common selected for a useful first check. It sends separate queries for A, AAAA, CNAME, MX, NS, TXT, CAA, and SOA. Choose one record type when you already know what you need to verify.</li>
              <li>Choose Cloudflare or Google Public DNS. These are public recursive resolvers, so the result is the answer that resolver has now, including any cached data.</li>
              <li>Select Look up DNS. Start with the response status, then compare the returned owner names and values with the settings at your DNS provider.</li>
              <li>If you recently changed DNS, repeat the lookup with the other resolver or check again after the reported Resolver TTL has fallen. A difference between two resolvers can be temporary, but this tool does not claim that a change has propagated everywhere.</li>
            </ol>
          </section>

          <section id="read-results">
            <h2>What DNS lookup results mean</h2>
            <p>DNS stores different kinds of information as separate records. A resolver answers a question made from a name and a record type, such as “What A records exist for <code>www.example.com</code>?” Common is a bundle of several separate questions, not an <code>ANY</code> query and not a complete copy of the domain's DNS zone.</p>
            <p>The first thing to read is the owner name. A record can belong to the name you entered, or the name can be an alias that leads to another hostname. This tool keeps that path visible so the final address is not shown as if it belonged to the original name.</p>
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
            <div className="dns-table-scroll">
              <table className="dns-guide-table dns-result-guide">
                <thead><tr><th scope="col">Part of the result</th><th scope="col">What it tells you</th></tr></thead>
                <tbody>
                  <tr><th scope="row">Queried name</th><td>The normalized domain or hostname sent to the resolver. Check this first when a lookup returns an unexpected answer.</td></tr>
                  <tr><th scope="row">Owner name</th><td>The hostname that actually owns the record. It may differ from your input when a CNAME alias is involved.</td></tr>
                  <tr><th scope="row">Record value</th><td>The useful answer: an IP address, target hostname, mail server, text value, nameserver, service endpoint, or DNSSEC value depending on the type.</td></tr>
                  <tr><th scope="row">Resolver TTL</th><td>The remaining cache lifetime reported by the selected resolver. For example, 300 seconds means about five minutes remained when the lookup ran. It can be lower than the TTL configured by the domain owner.</td></tr>
                  <tr><th scope="row">Response status</th><td>Whether the resolver answered successfully, found that the exact name does not exist, could not finish the lookup, or refused the query.</td></tr>
                  <tr><th scope="row">DNSSEC authentication</th><td>Whether the selected resolver reports that it authenticated the returned data. A No result can be normal for an unsigned domain and is not a complete DNSSEC diagnosis.</td></tr>
                  <tr><th scope="row">Raw response</th><td>The complete JSON returned for that query. It is useful when you need provider fields that the readable table does not emphasize.</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <section id="record-types">
            <h2>Which DNS record type should you check?</h2>
            <p>The right type depends on the problem. A and AAAA usually matter for website addresses, MX for incoming mail, TXT for verification and email policy text, and NS for delegation. If that distinction is unfamiliar, use Common and read the groups that return records.</p>
            <div className="dns-table-scroll">
              <table className="dns-record-table">
                <thead><tr><th scope="col">Type</th><th scope="col">What it shows</th></tr></thead>
                <tbody>
                  <tr><th scope="row">A</th><td>The IPv4 address used by a domain or hostname. Check it when a website or service points to the wrong IPv4 server.</td></tr>
                  <tr><th scope="row">AAAA</th><td>The IPv6 address used by a domain or hostname. A site can have correct A records but broken or outdated AAAA records.</td></tr>
                  <tr><th scope="row">CNAME</th><td>The canonical hostname used by an alias. It is common for <code>www</code>, hosted services, and CDN-backed hostnames.</td></tr>
                  <tr><th scope="row">MX</th><td>The servers that receive email for a domain. The preference number controls which server is tried first, with lower values preferred.</td></tr>
                  <tr><th scope="row">NS</th><td>The nameservers published for the name. Use it to check delegation after moving DNS providers.</td></tr>
                  <tr><th scope="row">TXT</th><td>Text used for domain verification and email policies. The lookup returns the value but does not validate SPF, DKIM, or DMARC.</td></tr>
                  <tr><th scope="row">CAA</th><td>The certificate authorities permitted to issue certificates for the domain.</td></tr>
                  <tr><th scope="row">SOA</th><td>The zone's primary nameserver, serial number, and timing values used by DNS operators.</td></tr>
                  <tr><th scope="row">SRV</th><td>The target hostname and port for a named service, together with priority and weight.</td></tr>
                  <tr><th scope="row">DS</th><td>The DNSSEC link published by the parent zone. It identifies the child zone key that the parent trusts.</td></tr>
                  <tr><th scope="row">DNSKEY</th><td>The public keys published inside a DNSSEC-signed zone.</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <section id="use-cases">
            <h2>When a DNS lookup helps</h2>
            <p>A lookup is most useful when you have an expected value to compare with the public answer. It can confirm that a record is visible and point you toward the next check, but it does not test the web server, mail server, certificate, or application behind that record.</p>
            <div className="dns-table-scroll">
              <table className="dns-guide-table dns-use-case-table">
                <thead><tr><th scope="col">What you are checking</th><th scope="col">Start with</th><th scope="col">What to compare</th></tr></thead>
                <tbody>
                  <tr><th scope="row">A website points to the wrong server</th><td>A, AAAA, and CNAME</td><td>Compare the returned address or alias target with the value supplied by your host or CDN.</td></tr>
                  <tr><th scope="row">Incoming email is routed incorrectly</th><td>MX</td><td>Compare every mail server and preference number with your email provider's setup.</td></tr>
                  <tr><th scope="row">Domain ownership verification is pending</th><td>TXT</td><td>Query the exact name supplied by the service and compare the complete text value, including prefixes and punctuation.</td></tr>
                  <tr><th scope="row">A certificate authority cannot issue</th><td>CAA</td><td>Check whether the intended certificate authority is permitted by the returned CAA records.</td></tr>
                  <tr><th scope="row">A DNS provider or nameserver was changed</th><td>NS and SOA</td><td>Compare resolver answers with the nameservers and zone information expected from the new provider.</td></tr>
                  <tr><th scope="row">DNSSEC records are being checked</th><td>DS and DNSKEY</td><td>Confirm that records are present and inspect the resolver's authentication state, then use a full DNSSEC chain checker for diagnosis.</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <section id="status-meanings">
            <h2>When the answer looks wrong</h2>
            <p>A DNS response can be successful without containing the record type you asked for. Read the status together with the returned records before deciding that the domain is broken.</p>
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
            <p>Cloudflare and Google may briefly disagree after a DNS change because each resolver can hold an answer fetched at a different time. Compare the values and remaining Resolver TTL. If both resolvers return the old value, check whether you changed the correct DNS zone and exact hostname before waiting longer.</p>
            <p>This remains a resolver lookup, not an authoritative nameserver test or a global propagation map. It also does not test website health, mail delivery, SPF, DKIM, DMARC policy, certificate issuance, or the complete DNSSEC chain.</p>
          </section>

          <aside className="dns-scope-note">
            <p>The name you enter is sent to the public resolver you select. Version127 does not save lookup history, and queried names or returned values are not included in analytics.</p>
          </aside>
        </article>
      </main>
    </AppShell>
  );
}
