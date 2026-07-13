import { AppShell } from "../../../app-shell";
import { DnsToolsSidebar } from "../dns-tools-sidebar";
import { DnsChangeChecker } from "./dns-change-checker";
import { CHANGE_RECORD_TYPES, type ChangeRecordType } from "@/lib/dns/diagnostic-types.ts";
import styles from "../dns-diagnostics.module.css";

type SearchParams = Record<string, string | string[] | undefined>;
const first = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] ?? "" : value ?? "";

function initialType(value: string): ChangeRecordType {
  const upper = value.toUpperCase();
  return CHANGE_RECORD_TYPES.includes(upper as ChangeRecordType) ? upper as ChangeRecordType : "A";
}

export default async function DnsChangeCheckerPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  return (
    <AppShell mainLabel="DNS Change Checker" menuLabel="DNS tools" sidebar={<DnsToolsSidebar active="change" />} sidebarLabel="DNS tools sidebar">
      <main className={styles.main}>
        <header className="dns-page-header">
          <h1>DNS Change Checker</h1>
          <p>Check whether a DNS change is live at the source, then see which public resolvers are still returning an older answer. You get the authoritative records, cached answers, TTLs, and raw responses in one comparison.</p>
        </header>
        <DnsChangeChecker initialName={first(params.name)} initialRecordType={initialType(first(params.type))} />
        <article className="dns-reference-content">
          <section>
            <h2>How to check a DNS change</h2>
            <p>Enter the exact domain or hostname you changed, choose the record type, and run the check. If you know the new value, add it as the expected answer. We ask the domain's authoritative nameservers first, then compare their answer with Cloudflare, Google, Quad9, and the other public resolvers available in the lookup tool.</p>
          </section>
          <section>
            <h2>What the comparison tells you</h2>
            <p>The authoritative nameservers are the source. If they all return the new record, your DNS provider is publishing the change consistently. Public resolvers keep their own cached copies, so some can still return the old value even after the source is correct. If the authoritative servers disagree with each other, fix that first. Waiting for caches will not make an inconsistent source correct.</p>
          </section>
          <section>
            <h2>How to read Resolver TTL</h2>
            <p>Resolver TTL is the remaining cache lifetime reported by that resolver. A smaller number often means the cached answer is closer to being refreshed, but it is not a countdown we can guarantee. The resolver may refresh early, keep serving stale data during a failure, or return a different answer from another location.</p>
          </section>
          <section>
            <h2>When different answers are normal</h2>
            <p>Not every difference means a change is stuck. Large services can return different A or AAAA records based on where the request comes from, and DNS providers can rotate addresses between replies. MX, NS, and TXT record order can also change without changing the record set. This checker ignores order, but it does not pretend to measure DNS everywhere in the world.</p>
          </section>
        </article>
      </main>
    </AppShell>
  );
}
