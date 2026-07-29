import { Network } from "lucide-react";
import Link from "next/link";
import { AppShell } from "../../app-shell";
import { dotBandClassName } from "../../dot-band";
import { Doodle } from "../../doodle";
import { siteDoodleArrowLoopArt } from "../art/site--doodle-arrow-loop";
import { DnsToolsSidebar } from "./dns-tools-sidebar";
import { PageTitleIcon } from "../../page-title-icon";

export default function DnsToolsPage() {
  return (
    <AppShell
      mainLabel="DNS tools"
      menuLabel="DNS tools"
      sidebar={<DnsToolsSidebar active="hub" />}
      sidebarLabel="DNS tools sidebar"
    >
      <div className={`${dotBandClassName} dns-hero-band`}>
        <div className="dns-hero-band-inner">
          <header className="dns-page-header">
            <h1>
              <PageTitleIcon>
                <Network strokeWidth={2.2} />
              </PageTitleIcon>{" "}
              DNS <mark>tools</mark>
            </h1>
            <p>
              A small set of tools for seeing what your domain is really doing in DNS. Look up
              records, follow a lookup from the root servers down to the final answer, compare
              what public resolvers still have cached against the real source, and check the
              quieter pieces that break email, certificates, and websites when they go wrong.
            </p>
          </header>
        </div>
        <Doodle className="dns-hero-doodle" placement="corner" svg={siteDoodleArrowLoopArt} />
      </div>
      <main className="dns-hub-main dns-hub-after-hero">

        <section aria-labelledby="available-tools-title" className="dns-hub-section">
          <h2 id="available-tools-title">What are you trying to fix?</h2>
          <Link className="dns-tool-card" href="/dns-tools/dns-lookup">
            <span className="dns-tool-card-copy">
              <strong className="dns-tool-card-name">DNS Lookup</strong>
              <span className="dns-tool-card-reason">I only need to see the current records.</span>
              <small>DNS lookup shows what a public resolver or the domain's authoritative nameserver returns now.</small>
            </span>
            <span aria-hidden="true">→</span>
          </Link>
          <Link className="dns-tool-card" href="/dns-tools/dns-trace">
            <span className="dns-tool-card-copy">
              <strong className="dns-tool-card-name">DNS Trace Explorer</strong>
              <span className="dns-tool-card-reason">The domain returns SERVFAIL.</span>
              <small>DNS Trace Explorer follows the handoffs from the root and shows where the path stops.</small>
            </span>
            <span aria-hidden="true">→</span>
          </Link>
          <Link className="dns-tool-card" href="/dns-tools/dns-change-checker">
            <span className="dns-tool-card-copy"><strong className="dns-tool-card-name">DNS Change Checker</strong><span className="dns-tool-card-reason">A DNS change still looks old.</span><small>DNS Change Checker compares the source with the copies held by public resolver caches.</small></span><span aria-hidden="true">→</span>
          </Link>
          <Link className="dns-tool-card" href="/dns-tools/nameserver-checker">
            <span className="dns-tool-card-copy"><strong className="dns-tool-card-name">Nameserver Delegation Checker</strong><span className="dns-tool-card-reason">I moved nameservers.</span><small>Nameserver Delegation Checker checks the parent handoff, glue, and whether every server answers.</small></span><span aria-hidden="true">→</span>
          </Link>
          <Link className="dns-tool-card" href="/dns-tools/dnssec-checker">
            <span className="dns-tool-card-copy"><strong className="dns-tool-card-name">DNSSEC Chain Checker</strong><span className="dns-tool-card-reason">DNSSEC looks broken.</span><small>DNSSEC Chain Checker validates the signed chain from the root to one answer.</small></span><span aria-hidden="true">→</span>
          </Link>
          <Link className="dns-tool-card" href="/dns-tools/soa-checker">
            <span className="dns-tool-card-copy"><strong className="dns-tool-card-name">SOA Consistency Checker</strong><span className="dns-tool-card-reason">Nameservers may be out of sync.</span><small>SOA Consistency Checker compares the serial and timing values served by every nameserver.</small></span><span aria-hidden="true">→</span>
          </Link>
          <Link className="dns-tool-card" href="/dns-tools/caa-checker">
            <span className="dns-tool-card-copy"><strong className="dns-tool-card-name">CAA Policy Checker</strong><span className="dns-tool-card-reason">A certificate will not issue.</span><small>CAA Policy Checker finds which certificate authorities may issue normal and wildcard certificates.</small></span><span aria-hidden="true">→</span>
          </Link>
        </section>
      </main>
    </AppShell>
  );
}
