import Link from "next/link";
import { AppShell } from "../../app-shell";
import { DnsToolsSidebar } from "./dns-tools-sidebar";

const plannedTools = [
  "DNS change checker",
  "Nameserver checker",
  "DNS compare",
  "DNS trace",
  "DNSSEC checker",
];

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
          <p className="dns-page-kicker">Network tools</p>
          <h1>DNS tools</h1>
          <p>
            Check what public DNS resolvers return, read the exact response state, and keep
            cached resolver answers separate from authoritative configuration.
          </p>
        </header>

        <section aria-labelledby="available-tools-title" className="dns-hub-section">
          <h2 id="available-tools-title">Available now</h2>
          <Link className="dns-tool-card" href="/dns-tools/dns-lookup">
            <span>
              <strong>DNS lookup</strong>
              <small>Check common or individual records through Cloudflare or Google Public DNS.</small>
            </span>
            <span aria-hidden="true">→</span>
          </Link>
        </section>

        <section aria-labelledby="planned-tools-title" className="dns-hub-section">
          <h2 id="planned-tools-title">Planned next</h2>
          <p>
            These will become links only when each tool has working diagnostics and reviewed explanations.
          </p>
          <ul className="dns-planned-list">
            {plannedTools.map((tool) => <li key={tool}>{tool}</li>)}
          </ul>
        </section>
      </main>
    </AppShell>
  );
}
