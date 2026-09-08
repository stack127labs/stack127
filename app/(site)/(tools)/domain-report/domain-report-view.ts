import type { DomainReport, ReportFinding, ReportFindingState } from "../../../../lib/domain/report.ts";

function reportDomain(result: DomainReport, fallback = "this domain") {
  return result.registration?.query.unicode ?? result.delegation?.zone ?? fallback;
}

function completed(result: DomainReport, name: string) {
  return result.ranChecks.includes(name);
}

export function reportLead(result: DomainReport, fallback?: string) {
  const domain = reportDomain(result, fallback);
  const registrationDone = completed(result, "Registration record");
  const delegationDone = completed(result, "Nameserver delegation");
  const attention = deduplicatedFindings(result).filter((finding) => finding.state === "attention");
  if (!registrationDone && !delegationDone) return `This report could not check ${domain}. No registration or DNS conclusion is available.`;
  if (!registrationDone) return `The registration check is unavailable for ${domain}. The nameserver-delegation check completed, so no registration conclusion is available.`;
  if (result.registration?.status === "not_registered") {
    return delegationDone
      ? `No registration record was found for ${domain}. The nameserver-delegation check also completed; this does not prove the name is available.`
      : `No registration record was found for ${domain}. The nameserver-delegation check is unavailable; this does not prove the name is available.`;
  }
  if (!delegationDone) return `The nameserver-delegation check is unavailable for ${domain}. The registration check completed, so no live DNS conclusion is available.`;
  if (attention.length) return `${attention[0].title} for ${domain}. Both the registration and nameserver-delegation checks completed.`;
  const registrar = result.registration?.registrar.name;
  return `No attention findings were found in the completed registration and nameserver-delegation checks for ${domain}.${registrar ? ` The registration record names ${registrar} as registrar.` : ""}`;
}

function skippedReason(result: DomainReport, name: string) {
  return result.skippedChecks.find((item) => item.name === name)?.reason ?? "No usable result was returned.";
}

function host(url: string | null) {
  if (!url) return null;
  try { return new URL(url).host; } catch { return null; }
}

export function coverageRows(result: DomainReport) {
  const registrationDone = completed(result, "Registration record");
  const delegationDone = completed(result, "Nameserver delegation");
  return [
    {
      id: "registration",
      check: "Registration record",
      state: registrationDone ? "Completed" : "Unavailable",
      source: result.registration?.registryFetch ? host(result.registration.registryFetch.url) ?? "Registry RDAP" : "Not available",
      note: registrationDone ? (result.registration?.registryFetch?.fromCache ? "Cached response" : "Registry response") : skippedReason(result, "Registration record"),
    },
    {
      id: "delegation",
      check: "Nameserver delegation",
      state: delegationDone ? "Completed" : "Unavailable",
      source: delegationDone ? "stack127 server" : "Not available",
      note: delegationDone ? "Live DNS snapshot" : skippedReason(result, "Nameserver delegation"),
    },
  ];
}

export type NameserverStage = { id: "registration" | "parent" | "child"; label: string; names: string[] | null };

export function nameserverStages(result: DomainReport): NameserverStage[] {
  const stages: NameserverStage[] = [];
  if (completed(result, "Registration record") && result.registration) stages.push({ id: "registration", label: "Registration record", names: [...new Set(result.registration.nameservers.map((item) => item.hostname.toLowerCase().replace(/\.$/, "")))].sort() });
  if (completed(result, "Nameserver delegation") && result.delegation) {
    stages.push({ id: "parent", label: "Parent referral", names: [...new Set(result.delegation.parentDelegatedNameservers)].sort() });
    stages.push({ id: "child", label: "Child zone", names: [...new Set(result.delegation.childPublishedNameservers)].sort() });
  }
  return stages.length >= 2 ? stages : [];
}

export function nameserverStageAgreement(stages: NameserverStage[]) {
  if (stages.length < 2) return null;
  const key = (names: string[] | null) => JSON.stringify(names ?? []);
  return stages.every((stage) => key(stage.names) === key(stages[0].names)) ? "Nameserver sources agree" : "Nameserver sources differ";
}

export function deduplicatedFindings(result: DomainReport) {
  const seen = new Set<string>();
  return result.findings.filter((finding) => {
    if (seen.has(finding.id)) return false;
    seen.add(finding.id);
    return true;
  });
}

export function findingSource(finding: ReportFinding) {
  if (["ns-match", "ns-mismatch", "parent-mismatch"].includes(finding.id)) return "Registration and DNS";
  if (["dnssec-signed", "dnssec-unsigned", "hold", "expiry-soon"].includes(finding.id)) return "Registration record";
  if (finding.id.startsWith("dns-")) return "DNS delegation";
  return "Registration and DNS";
}

export function findingEvidence(finding: ReportFinding) {
  if (["ns-match", "ns-mismatch", "parent-mismatch"].includes(finding.id)) return null;
  return finding.evidence;
}

export function findingGroups(result: DomainReport) {
  const groups: Array<{ state: ReportFindingState; title: string; findings: ReportFinding[] }> = [
    { state: "attention", title: "Needs attention", findings: [] },
    { state: "decide", title: "Needs a decision", findings: [] },
    { state: "context", title: "Context", findings: [] },
  ];
  for (const finding of deduplicatedFindings(result)) {
    if (finding.id === "ns-match" && nameserverStages(result).length) continue;
    groups.find((group) => group.state === finding.state)?.findings.push(finding);
  }
  return groups.filter((group) => group.findings.length);
}

export function findingDetail(finding: ReportFinding) {
  if (finding.id === "ns-mismatch") return "The registration record and live zone publish different nameserver sets.";
  if (finding.id === "parent-mismatch") return "The parent referral does not match the registration record.";
  if (finding.id === "dnssec-signed") return "A DS record is published. This report did not validate the DNSSEC chain.";
  if (finding.id === "dnssec-unsigned") return "No DS record is published. This is a delegation state, not a validation result.";
  if (finding.id === "hold") return "The returned hold status stops registry DNS publication.";
  if (finding.id === "expiry-soon") return "The published registry expiry is close or has passed.";
  return finding.detail;
}

export function reportSourceRows(result: DomainReport) {
  const rows: Array<{ id: string; label: string; value: string }> = [];
  for (const [label, fetch] of [["Registry RDAP", result.registration?.registryFetch], ["Registrar RDAP", result.registration?.registrarFetch]] as const) {
    if (!fetch) continue;
    rows.push({ id: label, label, value: `${host(fetch.url) ?? "Host not reported"}, fetched ${formatReportDate(fetch.fetchedAt)}, ${fetch.fromCache ? "cached" : "live response"}` });
  }
  if (result.delegation) rows.push({ id: "dns", label: "DNS delegation", value: `${result.delegation.zone} via parent .${result.delegation.parentZone}, checked ${formatReportDate(result.delegation.checkedAt)}` });
  return rows;
}

export function formatReportDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "long", timeZone: "UTC", year: "numeric" });
}
