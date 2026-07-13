import Link from "next/link";
import { AppShell } from "../../app-shell";
import { DnsToolsSidebar } from "./dns-tools-sidebar";

export default function DnsToolsPage() {
  return (
    <AppShell
      mainLabel="DNS tools"
      menuLabel="DNS tools"
      sidebar={<DnsToolsSidebar active="hub" />}
      sidebarLabel="DNS tools sidebar"
    >
      <main className="dns-hub-main">
        <header className="dns-page-header">
          <h1>DNS tools</h1>
          <p>
            A small set of tools for seeing what your domain is really doing in DNS. Look up
            records, follow a lookup from the root servers down to the final answer, compare what
            public resolvers still have cached against the real source, and check the quieter
            pieces that break email, certificates, and websites when they go wrong.
          </p>
        </header>

        <section aria-labelledby="available-tools-title" className="dns-hub-section">
          <h2 id="available-tools-title">Available now</h2>
          <Link className="dns-tool-card" href="/dns-tools/dns-lookup">
            <span>
              <strong>DNS lookup</strong>
              <small>Check records through a public resolver or the domain's authoritative nameserver.</small>
            </span>
            <span aria-hidden="true">→</span>
          </Link>
          <Link className="dns-tool-card" href="/dns-tools/dns-trace">
            <span>
              <strong>DNS Trace Explorer</strong>
              <small>Follow a DNS question from the root to the nameserver that gives the final answer.</small>
            </span>
            <span aria-hidden="true">→</span>
          </Link>
          <Link className="dns-tool-card" href="/dns-tools/dns-change-checker">
            <span><strong>DNS Change Checker</strong><small>See if a DNS change is live at the source and which resolvers still show the old answer.</small></span><span aria-hidden="true">→</span>
          </Link>
          <Link className="dns-tool-card" href="/dns-tools/nameserver-checker">
            <span><strong>Nameserver Delegation Checker</strong><small>Check that the handoff to your nameservers lines up and that each one answers.</small></span><span aria-hidden="true">→</span>
          </Link>
          <Link className="dns-tool-card" href="/dns-tools/dnssec-checker">
            <span><strong>DNSSEC Chain Checker</strong><small>Validate the signed chain from the DNS root to the answer you requested.</small></span><span aria-hidden="true">→</span>
          </Link>
          <Link className="dns-tool-card" href="/dns-tools/soa-checker">
            <span><strong>SOA Consistency Checker</strong><small>Compare serials and zone timing across every authoritative nameserver.</small></span><span aria-hidden="true">→</span>
          </Link>
          <Link className="dns-tool-card" href="/dns-tools/caa-checker">
            <span><strong>CAA Policy Checker</strong><small>Find the effective certificate authority policy for normal and wildcard certificates.</small></span><span aria-hidden="true">→</span>
          </Link>
        </section>
      </main>
    </AppShell>
  );
}
