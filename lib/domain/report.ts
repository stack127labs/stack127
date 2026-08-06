/**
 * Registration data and our own DNS checks, side by side.
 *
 * The point of this page is the gap between the two. A registry can hold one
 * nameserver set while the live zone serves another, and DNSSEC can be switched
 * on at the registry while the chain is broken. Neither is visible to a tool that
 * owns only one side.
 *
 * Findings are observations with evidence. There is no score, grade or badge, and
 * a domain with findings is not automatically misconfigured.
 */

import { checkDelegation } from "../dns/diagnostics.ts";
import { lookupDomain } from "./lookup.ts";
import type { DomainRegistration } from "./types.ts";

export type ReportFindingState = "attention" | "decide" | "context";

export type ReportFinding = {
  id: string;
  title: string;
  state: ReportFindingState;
  detail: string;
  evidence: string | null;
  /** Where to go to investigate this properly. */
  tool: { label: string; href: string } | null;
};

export type DomainReport = {
  registration: DomainRegistration | null;
  registrationError: string | null;
  delegation: Awaited<ReturnType<typeof checkDelegation>> | null;
  delegationError: string | null;
  findings: ReportFinding[];
  ranChecks: string[];
  skippedChecks: { name: string; reason: string }[];
  summary: string;
  checkedAt: string;
  durationMs: number;
};

function normalizeHost(value: string) {
  return value.toLowerCase().replace(/\.$/, "");
}

export async function buildDomainReport(rawInput: string, signal?: AbortSignal): Promise<DomainReport> {
  const startedAt = Date.now();
  const findings: ReportFinding[] = [];
  const ranChecks: string[] = [];
  const skippedChecks: { name: string; reason: string }[] = [];

  // Both halves run at once and report independently, so a failure on one side
  // still produces a usable page rather than an empty one.
  const [registrationResult, delegationResult] = await Promise.allSettled([
    lookupDomain(rawInput, { signal }),
    checkDelegation(rawInput, { signal }),
  ]);

  const registration = registrationResult.status === "fulfilled" ? registrationResult.value : null;
  const registrationError =
    registrationResult.status === "rejected"
      ? registrationResult.reason instanceof Error
        ? registrationResult.reason.message
        : "The registration lookup failed."
      : null;

  const delegation = delegationResult.status === "fulfilled" ? delegationResult.value : null;
  const delegationError =
    delegationResult.status === "rejected"
      ? delegationResult.reason instanceof Error
        ? delegationResult.reason.message
        : "The DNS delegation check failed."
      : null;

  if (registration && registration.status === "registered") ranChecks.push("Registration record");
  else if (registration?.status === "no_service") {
    skippedChecks.push({
      name: "Registration record",
      reason: `No RDAP service is known for .${registration.query.tld}, so the registration half of this report is unavailable.`,
    });
  } else if (registration?.status === "not_registered") {
    ranChecks.push("Registration record");
  } else {
    skippedChecks.push({ name: "Registration record", reason: registrationError ?? "The registry did not answer." });
  }

  if (delegation) ranChecks.push("Nameserver delegation");
  else skippedChecks.push({ name: "Nameserver delegation", reason: delegationError ?? "The DNS check did not finish." });

  // The cross source finding this page exists for.
  if (registration?.status === "registered" && delegation) {
    const registryNs = new Set(registration.nameservers.map((nameserver) => normalizeHost(nameserver.hostname)));
    const zoneNs = new Set((delegation.childPublishedNameservers ?? []).map(normalizeHost));
    const parentNs = new Set((delegation.parentDelegatedNameservers ?? []).map(normalizeHost));

    if (registryNs.size && zoneNs.size) {
      const onlyRegistry = [...registryNs].filter((host) => !zoneNs.has(host));
      const onlyZone = [...zoneNs].filter((host) => !registryNs.has(host));
      if (onlyRegistry.length || onlyZone.length) {
        findings.push({
          id: "ns-mismatch",
          title: "The registry and the live zone list different nameservers",
          state: "attention",
          detail:
            "The nameservers recorded at the registry are not the same as the ones the zone itself publishes. That usually means a nameserver change was made in one place and not the other, and it can cause answers that come and go depending on which server a resolver happens to ask.",
          evidence: `registry: ${[...registryNs].join(", ") || "none"} · zone: ${[...zoneNs].join(", ") || "none"}`,
          tool: { label: "Nameserver Delegation Checker", href: "/nameserver-checker" },
        });
      } else {
        findings.push({
          id: "ns-match",
          title: "The registry and the live zone agree on nameservers",
          state: "context",
          detail: "The nameservers on record at the registry are the same ones the zone publishes.",
          evidence: [...registryNs].join(", "),
          tool: null,
        });
      }
    }

    if (parentNs.size && registryNs.size) {
      const parentOnly = [...parentNs].filter((host) => !registryNs.has(host));
      if (parentOnly.length) {
        findings.push({
          id: "parent-mismatch",
          title: "The parent delegation does not match the registry record",
          state: "attention",
          detail:
            "The nameservers the parent zone hands out differ from what the registry says it holds. These normally move together, so a difference is worth looking at.",
          evidence: `parent: ${[...parentNs].join(", ")}`,
          tool: { label: "Nameserver Delegation Checker", href: "/nameserver-checker" },
        });
      }
    }

    // DNSSEC delegation is not a validation result, and the difference matters.
    if (registration.dnssecSigned === true) {
      findings.push({
        id: "dnssec-signed",
        title: "DNSSEC is switched on at the registry",
        state: "decide",
        detail:
          "The registry holds a DS record for this domain, which means resolvers will check signatures. That is a delegation fact, not proof the chain actually validates. If the signing is broken, the domain stops resolving completely rather than partly.",
        evidence: `delegationSigned: true${registration.dsRecordCount ? `, ${registration.dsRecordCount} DS record(s)` : ""}`,
        tool: { label: "DNSSEC Chain Checker", href: "/dnssec-checker" },
      });
    } else if (registration.dnssecSigned === false) {
      findings.push({
        id: "dnssec-unsigned",
        title: "DNSSEC is not switched on",
        state: "context",
        detail:
          "The registry holds no DS record, so resolvers will not check signatures for this domain. That is normal and is not a fault.",
        evidence: "delegationSigned: false",
        tool: null,
      });
    }

    const holds = registration.statuses.filter((status) => status.rdap === "client hold" || status.rdap === "server hold");
    if (holds.length) {
      findings.push({
        id: "hold",
        title: "The registry is not publishing this domain in DNS",
        state: "attention",
        detail:
          "A hold status tells the registry to stop publishing the domain, so nothing under it resolves even though the registration is valid. This is the explanation when a domain looks registered but the site is dark.",
        evidence: holds.map((status) => status.rdap).join(", "),
        tool: { label: "Domain status codes", href: "/epp-status-codes" },
      });
    }

    const expiry = registration.registryExpiryDate ? new Date(registration.registryExpiryDate) : null;
    if (expiry && !Number.isNaN(expiry.getTime())) {
      const days = Math.ceil((expiry.getTime() - Date.now()) / 86_400_000);
      if (days <= 30) {
        findings.push({
          id: "expiry-soon",
          title: days < 0 ? "The registry expiry date has passed" : `It expires in ${days} days`,
          state: "attention",
          detail:
            days < 0
              ? "The registry expiry date is in the past. The domain may be in a grace period, but this is the point where names get lost."
              : "The expiry date is close. Worth checking that auto renew is on and that the card on file still works, because a failed payment is the usual cause of a lost domain.",
          evidence: registration.registryExpiryDate,
          tool: { label: "Domain Expiry Checker", href: "/domain-expiry" },
        });
      }
    }
  }

  if (delegation?.findings?.length) {
    for (const finding of delegation.findings) {
      findings.push({
        id: `dns-${finding.slice(0, 24)}`,
        title: "DNS delegation",
        state: "attention",
        detail: finding,
        evidence: null,
        tool: { label: "Nameserver Delegation Checker", href: "/nameserver-checker" },
      });
    }
  }

  const attention = findings.filter((finding) => finding.state === "attention").length;
  const domain = registration?.query.domain ?? rawInput;
  const summary =
    registration?.status === "not_registered"
      ? `${domain} is not registered, so there is no registration record to report on.`
      : attention === 0
        ? `Nothing on ${domain} needs attention from what we can see here.`
        : `${attention} thing${attention === 1 ? "" : "s"} on ${domain} ${attention === 1 ? "is" : "are"} worth a look.`;

  return {
    registration,
    registrationError,
    delegation,
    delegationError,
    findings,
    ranChecks,
    skippedChecks,
    summary,
    checkedAt: new Date().toISOString(),
    durationMs: Date.now() - startedAt,
  };
}
