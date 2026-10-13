import type { DelegationCheck, NameserverReachability } from "../../../../lib/dns/diagnostic-types.ts";

export type DelegationTone = "success" | "warning" | "danger";

function sameMembers(left: string[], right: string[]) {
  const leftSet = new Set(left);
  const rightSet = new Set(right);
  return leftSet.size === rightSet.size && [...leftSet].every((value) => rightSet.has(value));
}

export function nameserverGlueKind(hostname: string, zone: string, parentZone: string) {
  if (hostname === zone || hostname.endsWith(`.${zone}`)) return "required" as const;
  if (hostname === parentZone || hostname.endsWith(`.${parentZone}`)) return "sibling" as const;
  return "not-required" as const;
}

function firstFinding(result: DelegationCheck, matcher: RegExp) {
  return result.findings.find((finding) => matcher.test(finding)) ?? null;
}

function failureLead(finding: string) {
  return `The delegation first fails at ${finding[0]?.toLowerCase()}${finding.slice(1)}`;
}

function completedChecks(result: DelegationCheck) {
  return result.reachability.filter((check) => !check.skippedReason);
}

export function checkedAddressCount(result: DelegationCheck) {
  return new Set(completedChecks(result).map((check) => check.server.address)).size;
}

function nameserverSetMismatch(result: DelegationCheck) {
  const parent = new Set(result.parentDelegatedNameservers);
  const child = new Set(result.childPublishedNameservers);
  const parentOnly = [...parent].find((hostname) => !child.has(hostname));
  if (parentOnly) return `${parentOnly} appears at the parent but not in the zone's own NS records.`;
  const childOnly = [...child].find((hostname) => !parent.has(hostname));
  if (childOnly) return `${childOnly} appears in the zone but not at the parent.`;
  return null;
}

function transportIssue(check: NameserverReachability) {
  if (!check.udp.reachable) return `${check.server.hostname} did not answer over UDP at ${check.server.address}.`;
  if (!check.tcp.reachable) return `${check.server.hostname} did not answer over TCP at ${check.server.address}.`;
  if (check.udp.authoritative !== true) return `${check.server.hostname} replied over UDP at ${check.server.address}, but the reply was not authoritative for this zone.`;
  if (check.tcp.authoritative !== true) return `${check.server.hostname} replied over TCP at ${check.server.address}, but the reply was not authoritative for this zone.`;
  if (!check.soa) return `${check.server.hostname} replied at ${check.server.address}, but did not return an authoritative SOA.`;
  return null;
}

export function delegationDiagnosis(result: DelegationCheck): { leadFinding: string | null; text: string; tone: DelegationTone } {
  if (!result.parentDelegatedNameservers.length) {
    return {
      leadFinding: null,
      text: `The parent referral for ${result.zone} did not provide a usable nameserver set, so no authoritative server could be tested.`,
      tone: "warning",
    };
  }
  if (!result.childPublishedNameservers.length) {
    return {
      leadFinding: null,
      text: `${result.zone} did not publish a usable nameserver set from an authoritative server.`,
      tone: "danger",
    };
  }

  const mismatch = firstFinding(result, /appears at the parent|appears in the zone but not at the parent/i)
    ?? nameserverSetMismatch(result);
  if (mismatch) return { leadFinding: mismatch, text: failureLead(mismatch), tone: "danger" };
  const glue = firstFinding(result, /required glue|different addresses in the parent glue/i);
  if (glue) return { leadFinding: glue, text: failureLead(glue), tone: "danger" };
  const noAddress = firstFinding(result, /did not resolve to a public IPv4 or IPv6 address/i);
  if (noAddress) return { leadFinding: noAddress, text: failureLead(noAddress), tone: "danger" };

  const checked = completedChecks(result);
  if (!checked.length) {
    return {
      leadFinding: null,
      text: sameMembers(result.parentDelegatedNameservers, result.childPublishedNameservers)
        ? `The parent and child nameserver sets agree, but this checker could not test any address${result.ipv6Connectivity === false ? " because it has no IPv6 route" : ""}.`
        : `The delegation sets were found, but this checker could not test a nameserver address.`,
      tone: "warning",
    };
  }

  const transportFinding = firstFinding(result, /did not answer over (UDP|TCP)|did not claim authority/i);
  if (transportFinding) return { leadFinding: transportFinding, text: failureLead(transportFinding), tone: "danger" };
  for (const check of checked) {
    const issue = transportIssue(check);
    if (issue) return { leadFinding: null, text: failureLead(issue), tone: "danger" };
  }

  const remaining = result.findings[0] ?? null;
  if (remaining) return { leadFinding: remaining, text: failureLead(remaining), tone: "warning" };

  const count = result.parentDelegatedNameservers.length;
  return {
    leadFinding: null,
    text: `${result.zone} has a healthy delegation. The parent and child publish the same ${count} nameserver${count === 1 ? "" : "s"}, and every checked address returned an authoritative SOA over UDP and TCP.`,
    tone: "success",
  };
}

export function remainingDelegationFindings(result: DelegationCheck, leadFinding: string | null) {
  return result.findings.filter((finding) => finding !== leadFinding);
}

export function delegationContextNotes(result: DelegationCheck) {
  const seen = new Set<string>();
  return (result.notes ?? []).filter((note) => {
    if (/IPv6 checks were skipped/i.test(note)) return false;
    if (seen.has(note)) return false;
    seen.add(note);
    return true;
  });
}

export function delegationHostnames(result: DelegationCheck) {
  return [...new Set([
    ...result.parentDelegatedNameservers,
    ...result.childPublishedNameservers,
    ...result.nameserverAddresses.map((entry) => entry.hostname),
    ...result.authoritativeAddressObservations.map((entry) => entry.hostname),
  ])];
}

export function delegationRow(result: DelegationCheck, hostname: string) {
  const glueKind = nameserverGlueKind(hostname, result.zone, result.parentZone);
  const parentGlue = [...new Set(result.parentGlue.filter((item) => item.hostname === hostname).map((item) => item.address))];
  const addressObservations = result.authoritativeAddressObservations.filter((item) => item.hostname === hostname);
  const authoritativeObservations = addressObservations.filter((item) => item.authoritative === true);
  const zoneAddresses = [...new Set(authoritativeObservations.flatMap((item) => item.addresses))];
  const testedAddresses = [...new Set(result.nameserverAddresses.find((item) => item.hostname === hostname)?.addresses ?? [])];
  const addressError = addressObservations.find((item) => item.error)?.error ?? null;
  return {
    child: result.childPublishedNameservers.includes(hostname) ? "Yes" : "No",
    glueRule: glueKind === "required" ? "Required" : glueKind === "sibling" ? "Optional sibling" : "Not required",
    parent: result.parentDelegatedNameservers.includes(hostname) ? "Yes" : "No",
    parentGlue: parentGlue.length ? parentGlue : ["No records"],
    testedAddresses: testedAddresses.length ? testedAddresses : ["No public addresses"],
    zoneAddresses: zoneAddresses.length
      ? zoneAddresses
      : addressObservations.length
        ? [addressError ?? "No records"]
        : ["Not checked"],
  };
}

export function transportText(check: NameserverReachability, transport: "udp" | "tcp") {
  if (check.skippedReason) return ["Not run", "No IPv6 route in checker"];
  const state = check[transport];
  if (!state.reachable) return ["No reply", state.error ?? "No response captured"];
  return [
    `Answered${state.responseCode ? `, ${state.responseCode}` : ""}`,
    state.authoritative === true ? "Authoritative" : state.authoritative === false ? "Not authoritative" : "Authority not reported",
  ];
}

export function networkDetails(result: DelegationCheck, address: string) {
  const detail = result.addressDetails.find((item) => item.address === address);
  if (!detail) return ["Not reported"];
  return [
    detail.networkName,
    detail.asn === null ? null : `AS${detail.asn}`,
    detail.prefix,
    detail.countryCode,
  ].filter((value): value is string => Boolean(value));
}
