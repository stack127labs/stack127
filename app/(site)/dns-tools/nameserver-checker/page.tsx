import { AppShell } from "../../../app-shell";
import { DnsToolsSidebar } from "../dns-tools-sidebar";
import { NameserverChecker } from "./nameserver-checker";
import styles from "../dns-diagnostics.module.css";

type SearchParams = Record<string, string | string[] | undefined>;
const first = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] ?? "" : value ?? "";

export default async function NameserverCheckerPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  return (
    <AppShell mainLabel="Nameserver Delegation Checker" menuLabel="DNS tools" sidebar={<DnsToolsSidebar active="nameserver" />} sidebarLabel="DNS tools sidebar">
      <main className={styles.main}>
        <header className="dns-page-header"><h1>Nameserver Delegation Checker</h1><p>Check the full handoff from a parent zone to a domain's authoritative nameservers. The result compares both NS lists, checks the glue that makes the handoff possible, and confirms that every server can answer for the zone over UDP and TCP.</p></header>
        <NameserverChecker initialName={first(params.name)} />
        <article className="dns-reference-content">
          <section><h2>How to check nameserver delegation</h2><p>Enter a domain or any hostname below it. We find the authoritative zone, ask its parent which nameservers it delegates to, then ask those servers what the zone says about itself. We also resolve every nameserver address and test it directly, so the result checks more than a normal NS lookup.</p></section>
          <section><h2>How the DNS handoff works</h2><p>When someone looks up your domain, the parent zone points them toward your authoritative nameservers. For <code>example.com</code>, that first handoff comes from <code>com</code>. The nameservers then answer from inside the <code>example.com</code> zone. Both sides should describe the same destination.</p></section>
          <section><h2>What the results mean</h2><p>A matching parent and child list means the handoff is consistent. A nameserver on only one side is often a leftover from a provider change or a registrar update that was not completed. “Answered” means the server replied on that address. “Authoritative SOA” goes further and confirms that the reply claims authority for this zone.</p></section>
          <section><h2>When glue is needed</h2><p>If <code>ns1.example.com</code> serves <code>example.com</code>, the parent must include its address as glue. Otherwise a resolver would need to find <code>ns1.example.com</code> by asking the server it is still trying to locate. Glue for a sibling name can be useful but is not always required, while a nameserver outside the parent zone is resolved normally and does not need glue in this referral.</p></section>
          <section><h2>What to fix when the lists disagree</h2><p>Start with the registrar or parent-side delegation, then compare it with the NS records at your DNS provider. Remove old servers from both places, add every new server to both places, and add required glue before switching to an in-zone nameserver. If a server is listed correctly but does not answer authoritatively, fix or remove that server rather than waiting for DNS caches.</p></section>
        </article>
      </main>
    </AppShell>
  );
}
