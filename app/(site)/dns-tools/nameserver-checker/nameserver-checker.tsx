"use client";

import { useMemo, useState, type FormEvent } from "react";
import type { DelegationCheck } from "@/lib/dns/diagnostic-types.ts";
import { csvFromRows } from "@/lib/dns/diagnostic-presentation.ts";
import { DiagnosticResultHeader, DownloadResultButton } from "../diagnostic-result-ui";
import styles from "../dns-diagnostics.module.css";

function sameMembers(left: string[], right: string[]) {
  return left.length === right.length && left.every((value) => right.includes(value));
}

function glueKind(hostname: string, zone: string, parentZone: string) {
  if (hostname === zone || hostname.endsWith(`.${zone}`)) return "required";
  if (hostname === parentZone || hostname.endsWith(`.${parentZone}`)) return "sibling";
  return "out-of-bailiwick";
}

function glueText(hostname: string, result: DelegationCheck) {
  const values = result.parentGlue.filter((glue) => glue.hostname === hostname).map((glue) => glue.address);
  if (values.length) return values.join(", ");
  const kind = glueKind(hostname, result.zone, result.parentZone);
  if (kind === "required") return "Missing required glue";
  if (kind === "sibling") return "No sibling glue supplied";
  return "Glue is not needed here";
}

function resultCsv(result: DelegationCheck) {
  const hostnames = [...new Set([...result.parentDelegatedNameservers, ...result.childPublishedNameservers])];
  return csvFromRows([
    ["nameserver", "listed at parent", "listed in child zone", "addresses", "parent glue", "udp", "tcp", "authoritative"],
    ...hostnames.map((hostname) => {
      const checks = result.reachability.filter((check) => check.server.hostname === hostname);
      return [hostname, result.parentDelegatedNameservers.includes(hostname), result.childPublishedNameservers.includes(hostname), result.nameserverAddresses.find((item) => item.hostname === hostname)?.addresses.join(" ") ?? "", result.parentGlue.filter((glue) => glue.hostname === hostname).map((glue) => glue.address).join(" "), checks.some((check) => check.udp.reachable), checks.some((check) => check.tcp.reachable), checks.some((check) => check.soa && (check.udp.authoritative || check.tcp.authoritative))];
    }),
  ]);
}

export function NameserverChecker({ initialName = "" }: { initialName?: string }) {
  const [name, setName] = useState(initialName);
  const [result, setResult] = useState<DelegationCheck | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const csv = useMemo(() => result ? resultCsv(result) : "", [result]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) return setError("Enter a domain or hostname.");
    setLoading(true); setError(null);
    try {
      const response = await fetch("/api/dns/nameserver-checker", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error?.message ?? "The nameserver check failed.");
      setResult(data);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "The nameserver check failed."); }
    finally { setLoading(false); }
  }

  const listsAgree = result ? sameMembers(result.parentDelegatedNameservers, result.childPublishedNameservers) : false;
  return <section className="dns-tool" aria-label="Nameserver delegation checker">
    <form className="dns-lookup-form" onSubmit={submit}>
      <label className="dns-name-field"><span>Domain or hostname</span><input autoCapitalize="none" autoComplete="off" onChange={(event) => setName(event.target.value)} placeholder="github.com" spellCheck={false} value={name} /></label>
      <button className="dns-submit" disabled={loading}>{loading ? "Checking nameservers..." : "Check nameservers"}</button>
      {error ? <p className="dns-form-error" role="alert">{error}</p> : null}
    </form>
    {result ? <section className={styles.results} aria-live="polite">
      <DiagnosticResultHeader action={<DownloadResultButton contents={csv} filename={`${result.zone}-nameservers.csv`} />} checkedAt={result.checkedAt} durationMs={result.durationMs} hostname={result.inputName}>
        <p>{listsAgree ? `The parent and ${result.zone} publish the same nameservers.` : `The parent and ${result.zone} publish different nameserver lists.`} We also asked every discovered address over UDP and TCP to make sure it can answer authoritatively.</p>
      </DiagnosticResultHeader>
      <div className={styles.flow} aria-label="DNS delegation path"><span className={styles.pathStep}><small>Parent zone</small><code>{result.parentZone}</code></span><span aria-hidden="true">→</span><span className={styles.pathStep}><small>Delegated zone</small><code>{result.zone}</code></span><span aria-hidden="true">→</span><span className={styles.pathStep}><small>Authoritative servers</small><strong>{result.parentDelegatedNameservers.length}</strong></span></div>
      {result.findings.length ? result.findings.map((finding) => <div className={styles.finding} data-tone="warning" key={finding}><p>{finding}</p></div>) : <div className={styles.finding} data-tone="good"><p>The parent and child lists agree, and every checked nameserver returned an authoritative answer on at least one transport.</p></div>}
      <section className={styles.section}><h3>Does the delegation agree?</h3><div className="dns-table-scroll"><table className={`dns-status-table ${styles.compactTable}`}><thead><tr><th>Nameserver</th><th>At parent</th><th>Inside the zone</th><th>Glue from parent</th></tr></thead><tbody>{[...new Set([...result.parentDelegatedNameservers, ...result.childPublishedNameservers])].map((hostname) => <tr key={hostname}><th><code>{hostname}</code></th><td>{result.parentDelegatedNameservers.includes(hostname) ? "Yes" : "No"}</td><td>{result.childPublishedNameservers.includes(hostname) ? "Yes" : "No"}</td><td>{glueText(hostname, result)}</td></tr>)}</tbody></table></div><p className={styles.inlineNote}>Glue is required when a nameserver lives inside the zone it serves. Sibling glue can help but is not always supplied. A nameserver outside the parent zone does not need glue in this referral.</p><details className={styles.raw}><summary>Raw parent and child NS responses</summary><pre>{JSON.stringify({ parent: result.parentObservations, child: result.childObservations }, null, 2)}</pre></details></section>
      <section className={styles.section}><h3>Can each nameserver answer?</h3><div className="dns-table-scroll"><table className={`dns-status-table ${styles.compactTable}`}><thead><tr><th>Server</th><th>UDP</th><th>TCP</th><th>Authoritative SOA</th></tr></thead><tbody>{result.reachability.map((check) => <tr key={`${check.server.hostname}-${check.server.address}`}><th><code>{check.server.hostname}</code><br/><small>{check.server.address}</small></th><td>{check.udp.reachable ? "Answered" : "No reply"}</td><td>{check.tcp.reachable ? "Answered" : "No reply"}</td><td>{check.soa && (check.udp.authoritative || check.tcp.authoritative) ? "Yes" : "No"}</td></tr>)}</tbody></table></div><details className={styles.raw}><summary>Raw reachability responses</summary><pre>{JSON.stringify(result.reachability, null, 2)}</pre></details></section>
    </section> : null}
  </section>;
}
