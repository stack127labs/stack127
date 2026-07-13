import { AppShell } from "../../../app-shell";
import { DnsToolsSidebar } from "../dns-tools-sidebar";
import { DnsTraceTool } from "./dns-trace-tool";
import { TRACE_RECORD_TYPES, type DnsTraceRecordType } from "@/lib/dns/trace-types.ts";
import styles from "./dns-trace.module.css";

type SearchParams = Record<string, string | string[] | undefined>;

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function initialRecordType(value: string): DnsTraceRecordType {
  const normalized = value.toUpperCase();
  return TRACE_RECORD_TYPES.includes(normalized as DnsTraceRecordType)
    ? normalized as DnsTraceRecordType
    : "A";
}

export default async function DnsTracePage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  return (
    <AppShell
      mainLabel="DNS Trace Explorer"
      menuLabel="DNS tools"
      sidebar={<DnsToolsSidebar active="trace" />}
      sidebarLabel="DNS tools sidebar"
    >
      <main className={styles.main}>
        <header className="dns-page-header">
          <h1>DNS Trace Explorer</h1>
          <p>Follow one DNS question from the root nameservers to the server that gives the final answer. If the journey stops, you can see exactly where it happened.</p>
        </header>

        <DnsTraceTool
          initialName={firstValue(params.name)}
          initialRecordType={initialRecordType(firstValue(params.type))}
        />

        <article className="dns-reference-content">
          <section id="how-dns-trace-works">
            <h2>How a DNS trace works</h2>
            <p>DNS is arranged like a path. The root knows where to find <code>.com</code>, the <code>.com</code> nameservers know who handles <code>example.com</code>, and that domain's nameserver gives the final record. This tool walks that path itself instead of asking a public resolver to do it in the background.</p>
            <figure className={styles.journey}>
              <div><code>Root</code><span aria-hidden="true">→</span><code>.com</code><span aria-hidden="true">→</span><code>example.com</code><span aria-hidden="true">→</span><code>Answer</code></div>
              <figcaption>Each server either returns the answer or points the trace to the next part of DNS.</figcaption>
            </figure>
          </section>

          <section id="reading-a-trace">
            <h2>What each step tells you</h2>
            <p>A referral is simply one nameserver saying, “I do not hold the final answer, but these servers are closer to it.” When the referral includes an address for the next nameserver, that address appears as glue. The trace keeps the server, response time, response code, nameservers, glue, TTL, and raw reply together so you can see where every detail came from.</p>
          </section>

          <section id="trace-stops">
            <h2>Where a DNS trace can stop</h2>
            <p>A trace normally ends with a record or a clear answer that the name does not exist. When something is wrong, the last completed step often tells you which part needs attention.</p>
            <div className="dns-table-scroll">
              <table className="dns-status-table">
                <thead><tr><th scope="col">Where it stops</th><th scope="col">What that usually means</th></tr></thead>
                <tbody>
                  <tr><th scope="row">At the root</th><td>The top-level domain may not exist, or the trace could not reach a root server.</td></tr>
                  <tr><th scope="row">At the TLD</th><td>The parent zone did not provide a usable delegation for the domain.</td></tr>
                  <tr><th scope="row">Before the domain's server</th><td>The delegation listed nameservers, but the trace could not find a safe public address for them.</td></tr>
                  <tr><th scope="row">At the domain's server</th><td>The nameserver may have timed out, refused the question, returned an error, or answered without the record you requested.</td></tr>
                  <tr><th scope="row">After an alias</th><td>The CNAME target may be missing, unreachable, or part of an alias loop.</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <section id="trace-vs-lookup">
            <h2>DNS trace and DNS lookup are different</h2>
            <p>DNS Lookup shows the answer held by Cloudflare, Google, another public resolver, or an authoritative server. DNS Trace Explorer ignores recursive caches and follows the delegation path from the root. Use the lookup when you need the current answer people may receive. Use the trace when you need to understand how DNS reaches that answer.</p>
          </section>

          <aside className="dns-scope-note">
            <p>The trace runs from the Version127 server, so it does not describe your ISP's cache or test worldwide propagation. It also shows DNSSEC records without validating the complete chain. We do not save the names you trace or include them in analytics.</p>
          </aside>
        </article>
      </main>
    </AppShell>
  );
}
