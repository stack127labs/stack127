import { AppShell } from "../../../app-shell";
import { DnsToolsSidebar } from "../dns-tools-sidebar";
import { SoaChecker } from "./soa-checker";
import styles from "../dns-diagnostics.module.css";

type SearchParams = Record<string, string | string[] | undefined>;
const first = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] ?? "" : value ?? "";

export default async function SoaCheckerPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  return <AppShell mainLabel="SOA Consistency Checker" menuLabel="DNS tools" sidebar={<DnsToolsSidebar active="soa" />} sidebarLabel="DNS tools sidebar">
    <main className={styles.main}>
      <header className="dns-page-header"><h1>SOA Consistency Checker</h1><p>Ask every authoritative nameserver for the zone's SOA record and compare the replies. You can quickly spot an older zone copy, a secondary server that has stopped updating, or timing values that are not consistent across the nameservers.</p></header>
      <SoaChecker initialName={first(params.name)} />
      <article className="dns-reference-content">
        <section><h2>How to compare SOA records</h2><p>Enter a domain or hostname and run the check. We find its authoritative zone, resolve every nameserver address, and ask each address directly for the SOA record. Identical replies from IPv4 and IPv6 are kept together, while a different serial or timing value gets its own row.</p></section>
        <section><h2>What the serial tells you</h2><p>The serial identifies the version of the zone currently held by a nameserver. Matching serials usually mean the servers have received the same update. If they differ, the newest serial is the one a healthy secondary should eventually copy. A smaller number is not always older because serials wrap after 4,294,967,295, so this page uses DNS serial arithmetic instead of a normal number comparison.</p></section>
        <section><h2>What each SOA value means</h2><div className="dns-table-scroll"><table className="dns-status-table"><tbody><tr><th>Primary</th><td>The nameserver named as the original source of the zone.</td></tr><tr><th>Mailbox</th><td>The responsible contact written as a DNS name. The first dot normally stands for the <code>@</code> in an email address.</td></tr><tr><th>Refresh</th><td>How often a secondary should ask the primary whether the zone changed.</td></tr><tr><th>Retry</th><td>How soon a secondary should try again when a refresh fails.</td></tr><tr><th>Expire</th><td>How long a secondary may keep serving its copy when it cannot reach the primary.</td></tr><tr><th>Negative cache</th><td>How long a resolver may cache a negative answer, calculated from the lower of the SOA TTL and MINIMUM value.</td></tr></tbody></table></div></section>
        <section><h2>When different SOA records matter</h2><p>A short mismatch can happen while a zone transfer or provider update is still moving between servers. A mismatch that lasts longer than the refresh and retry schedule deserves attention. Check whether the older server can reach the primary, whether zone transfers are allowed, and whether every advertised nameserver is still meant to serve the zone. There is no universal ideal timing value, so the tool reports what differs without judging the zone by a made-up grade.</p></section>
      </article>
    </main>
  </AppShell>;
}
