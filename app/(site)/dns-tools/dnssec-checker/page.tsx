import { AppShell } from "../../../app-shell";
import { DnsToolsSidebar } from "../dns-tools-sidebar";
import { DnssecChecker } from "./dnssec-checker";
import { DNSSEC_RECORD_TYPES, type DnssecRecordType } from "@/lib/dns/dnssec-types.ts";
import styles from "../dns-diagnostics.module.css";

type SearchParams = Record<string, string | string[] | undefined>;
const first = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] ?? "" : value ?? "";
function initialType(value: string): DnssecRecordType { const upper = value.toUpperCase(); return DNSSEC_RECORD_TYPES.includes(upper as DnssecRecordType) ? upper as DnssecRecordType : "A"; }

export default async function DnssecCheckerPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  return <AppShell mainLabel="DNSSEC Chain Checker" menuLabel="DNS tools" sidebar={<DnsToolsSidebar active="dnssec" />} sidebarLabel="DNS tools sidebar"><main className={styles.main}>
    <header className="dns-page-header"><h1>DNSSEC Chain Checker</h1><p>Cryptographically validate a DNS answer from the root trust anchor to the record you asked for. The result shows every DS, DNSKEY, signature, or denial step the validator checked, then keeps the requested answer and raw evidence beside it.</p></header>
    <DnssecChecker initialName={first(params.name)} initialRecordType={initialType(first(params.type))} />
    <article className="dns-reference-content">
      <section><h2>How to check DNSSEC</h2><p>Enter the exact domain or hostname and choose the record you want to validate. This is important because DNSSEC validates an answer, not a domain-shaped badge. An A record can validate successfully, a missing TXT record can have a valid signed proof of absence, and a name that does not exist can have a valid signed NXDOMAIN proof.</p></section>
      <section><h2>What this validator actually checks</h2><p>The validator starts with the DNS root trust anchor and verifies each cryptographic link itself. It checks the parent's DS record against the child's DNSKEY, verifies the signed key set, and finally verifies the requested answer or its signed proof of absence. A public resolver's AD flag is kept only as supporting evidence and does not decide the verdict.</p></section>
      <section><h2>What the results mean</h2><div className="dns-table-scroll"><table className="dns-status-table"><tbody><tr><th>Secure</th><td>The requested answer, signed absence, or signed NXDOMAIN proof validates all the way to the root.</td></tr><tr><th>Insecure</th><td>The validator proved that the signed chain ends at an unsigned delegation. DNSSEC is not protecting the answer, but the chain is not broken.</td></tr><tr><th>Bogus</th><td>The name is expected to validate, but a DS link, key, signature, or denial proof failed. Validating resolvers can return SERVFAIL.</td></tr><tr><th>Indeterminate</th><td>The check could not finish with enough evidence for a safe verdict. Run it again before changing DNS.</td></tr></tbody></table></div></section>
      <section><h2>How DS, DNSKEY, and RRSIG fit together</h2><p>The parent publishes a DS record that identifies a key in the child zone. The child publishes that key in its DNSKEY set, and its RRSIG records carry the signatures made by those keys. You need every link to agree. Simply finding DS and DNSKEY records is not enough, which is why the page shows the validator's actual verification steps first.</p></section>
      <section><h2>What to fix when DNSSEC is bogus</h2><p>Look at the first failed step. A DS failure usually means the registrar still has an old digest or key tag. A DNSKEY failure points to missing, expired, or incorrectly signed key data. An answer or denial failure points to the zone signatures themselves. If you are moving DNS providers, either complete the new signing chain before changing delegation or remove the old DS safely before the old keys disappear.</p></section>
    </article>
  </main></AppShell>;
}
