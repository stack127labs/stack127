import { AppShell } from "../../../app-shell";
import { DnsToolsSidebar } from "../dns-tools-sidebar";
import { CaaChecker } from "./caa-checker";
import styles from "../dns-diagnostics.module.css";

type SearchParams = Record<string, string | string[] | undefined>;
const first = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] ?? "" : value ?? "";

export default async function CaaCheckerPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  return <AppShell mainLabel="CAA Policy Checker" menuLabel="DNS tools" sidebar={<DnsToolsSidebar active="caa" />} sidebarLabel="DNS tools sidebar"><main className={styles.main}>
    <header className="dns-page-header"><h1>CAA Policy Checker</h1><p>Find the CAA policy that applies to an exact certificate name, then see which certificate authorities it allows for normal and wildcard certificates. The result shows the records, the search path that found them, and the policy those records create.</p></header>
    <CaaChecker initialName={first(params.name)} />
    <article className="dns-reference-content">
      <section><h2>How to check a CAA policy</h2><p>Enter the exact hostname the certificate will cover. Checking <code>www.example.com</code> can produce a different answer from checking <code>example.com</code>, so use the real name from the certificate request. We query CAA through a recursive resolver, follow an alias when needed, and then continue up the original certificate name until the first policy is found.</p></section>
      <section><h2>Where the effective policy comes from</h2><p>CAA inheritance is simple once you see the path. A policy on the exact name wins. If none exists there, the search moves to its parent, then the next parent. A CNAME can point the lookup at an alias target, but it does not make the alias target's parent domains part of the original certificate name's inheritance tree. The result shows every place we looked so you do not have to guess which record set won.</p></section>
      <section><h2>Normal and wildcard certificates</h2><p><code>issue</code> controls normal certificates. <code>issuewild</code> controls wildcard certificates when that tag exists; otherwise wildcard requests use the <code>issue</code> policy too. If a policy contains only <code>issuewild</code>, normal certificate issuance is not restricted by CAA.</p></section>
      <section><h2>How to read CAA records</h2><div className="dns-table-scroll"><table className="dns-status-table"><tbody><tr><th><code>issue</code></th><td>Allows the named certificate authority to issue normal certificates.</td></tr><tr><th><code>issuewild</code></th><td>Allows the named certificate authority to issue wildcard certificates.</td></tr><tr><th><code>iodef</code></th><td>Gives a mail or web address where a certificate authority may report a policy problem.</td></tr><tr><th>Empty issuer</th><td>A value such as <code>CAA 0 issue ";"</code> blocks that kind of issuance.</td></tr><tr><th>Critical flag</th><td>A certificate authority must not issue if it cannot understand a property marked critical.</td></tr></tbody></table></div><p>Several non-empty <code>issue</code> or <code>issuewild</code> records are additive. Every issuer listed by that tag is allowed.</p></section>
      <section><h2>What this result does not promise</h2><p>CAA is one permission check in certificate issuance, not a list of certificates that already exist. This page does not inspect certificate history, contact an <code>iodef</code> destination, or promise that an allowed certificate authority will issue. The authority still has to validate domain control and apply its own rules.</p></section>
    </article>
  </main></AppShell>;
}
