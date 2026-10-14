/**
 * Can this domain move to another registrar right now, and what is stopping it?
 *
 * Every check reports its own state with the evidence behind it. "Unknown" is a
 * first class answer here and shows up often, because a lot of what decides a
 * transfer is in the registrar account and not in any public record. Findings are
 * never collapsed into a score.
 */

import { evaluateLock, pendingPolicy, policyInForce, type TransferPolicyVersion } from "./transfer-policy.ts";
import type { DomainRegistration } from "./types.ts";

export type FindingState = "blocked" | "risk" | "clear" | "unknown";

export type TransferFinding = {
  id: string;
  title: string;
  state: FindingState;
  /** Plain sentence a reader can act on. */
  detail: string;
  /** True when the reader can clear this themselves. */
  selfServiceable: boolean;
  evidence: string | null;
};

export type TransferReadiness = {
  registration: DomainRegistration;
  policy: TransferPolicyVersion;
  pendingPolicyChange: TransferPolicyVersion | null;
  /** ccTLD and infrastructure transfer rules come from their registry. */
  policyApplies?: boolean;
  findings: TransferFinding[];
  /** What we cannot see at all, listed so the answer is not mistaken for complete. */
  cannotCheck: string[];
  summary: string;
};

function daysUntil(iso: string | null, now: Date) {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return Math.ceil((date.getTime() - now.getTime()) / 86_400_000);
}

export function assessTransfer(registration: DomainRegistration, now = new Date()): TransferReadiness {
  const policy = policyInForce(now);
  const findings: TransferFinding[] = [];
  const statuses = registration.statuses.map((status) => status.rdap);
  const has = (value: string) => statuses.includes(value);
  const policyApplies = registration.query.tldType !== "country-code" && registration.query.tldType !== "infrastructure";

  // Registrar lock. The most common blocker and the one the reader owns.
  if (has("client transfer prohibited")) {
    findings.push({
      id: "client-lock",
      title: "Registrar transfer lock",
      state: "blocked",
      detail:
        "Your registrar has locked this domain against transfers. This is the normal default lock, and you can turn it off yourself in your registrar account, usually shown as a domain lock or transfer lock.",
      selfServiceable: true,
      evidence: "client transfer prohibited",
    });
  } else {
    findings.push({
      id: "client-lock",
      title: "Registrar transfer lock",
      state: "clear",
      detail: "There is no registrar transfer lock on this domain.",
      selfServiceable: true,
      evidence: null,
    });
  }

  // Registry lock. The reader cannot clear this one.
  if (has("server transfer prohibited")) {
    findings.push({
      id: "server-lock",
      title: "Registry transfer lock",
      state: "blocked",
      detail:
        "The registry itself is blocking transfers. This comes from a dispute, a court order, registry policy, or a security lock, and you cannot remove it yourself. Ask your registrar what it is for.",
      selfServiceable: false,
      evidence: "server transfer prohibited",
    });
  } else {
    findings.push({
      id: "server-lock",
      title: "Registry transfer lock",
      state: "clear",
      detail: "No registry transfer lock is published.",
      selfServiceable: false,
      evidence: null,
    });
  }

  if (has("pending transfer")) {
    findings.push({
      id: "pending-transfer",
      title: "A transfer is already running",
      state: "blocked",
      detail:
        "This domain is already in the middle of a transfer. If you did not start it, contact your registrar now, because a transfer can still be refused while it is pending.",
      selfServiceable: false,
      evidence: "pending transfer",
    });
  } else {
    findings.push({
      id: "pending-transfer",
      title: "Pending transfer",
      state: "clear",
      detail: "No pending transfer status is published.",
      selfServiceable: false,
      evidence: null,
    });
  }

  if (has("pending delete") || has("redemption period")) {
    findings.push({
      id: "lifecycle",
      title: "The domain is on its way out",
      state: "blocked",
      detail: has("pending delete")
        ? "This domain is in pending delete. It cannot be transferred or restored, and it will be released shortly."
        : "This domain is in the redemption period. It has been deleted and has to be restored by the current registrant before anything else can happen.",
      selfServiceable: false,
      evidence: has("pending delete") ? "pending delete" : "redemption period",
    });
  } else {
    findings.push({
      id: "lifecycle",
      title: "Deletion lifecycle",
      state: "clear",
      detail: "No redemption or pending-delete status is published.",
      selfServiceable: false,
      evidence: null,
    });
  }

  // Time since registration, under the policy actually in force.
  const sinceRegistration = evaluateLock(registration.registrationDate, policy.afterRegistrationDays, now);
  findings.push({
    id: "registration-lock",
    title: "Time since it was registered",
    state: sinceRegistration.state === "locked" ? "blocked" : sinceRegistration.state === "clear" ? "clear" : "unknown",
    detail:
      sinceRegistration.state === "locked"
        ? `This domain was registered ${sinceRegistration.daysElapsed} days ago. ICANN policy currently locks a new registration for ${policy.afterRegistrationDays} days, so roughly ${sinceRegistration.daysRemaining} days are left.`
        : sinceRegistration.state === "clear"
          ? `It was registered ${sinceRegistration.daysElapsed} days ago, well past the ${policy.afterRegistrationDays} day lock on new registrations.`
          : "The registry does not publish a registration date for this domain, so we cannot check the new registration lock.",
    selfServiceable: false,
    evidence: registration.registrationDate,
  });

  // Time since a previous transfer. Optional event, and its absence is unknown.
  if (registration.transferDate) {
    const sinceTransfer = evaluateLock(registration.transferDate, policy.afterTransferDays, now);
    findings.push({
      id: "transfer-lock",
      title: "Time since the last transfer",
      state: sinceTransfer.state === "locked" ? "blocked" : "clear",
      detail:
        sinceTransfer.state === "locked"
          ? `This domain changed registrar ${sinceTransfer.daysElapsed} days ago. Policy locks it for ${policy.afterTransferDays} days after a transfer, so roughly ${sinceTransfer.daysRemaining} days are left.`
          : `It last changed registrar ${sinceTransfer.daysElapsed} days ago, past the ${policy.afterTransferDays} day lock.`,
      selfServiceable: false,
      evidence: registration.transferDate,
    });
  } else {
    findings.push({
      id: "transfer-lock",
      title: "Time since the last transfer",
      state: "unknown",
      detail:
        "This registry does not publish a transfer date, so we cannot tell whether the domain moved registrar recently. If it did, a lock may still apply even though nothing here shows it.",
      selfServiceable: false,
      evidence: null,
    });
  }

  // Expiry proximity is a risk, not a block.
  const untilExpiry = daysUntil(registration.registryExpiryDate, now);
  if (untilExpiry !== null) {
    findings.push({
      id: "expiry",
      title: "How close it is to expiring",
      state: untilExpiry < 0 ? "risk" : untilExpiry <= 15 ? "risk" : "clear",
      detail:
        untilExpiry < 0
          ? `The registry expiry date passed ${Math.abs(untilExpiry)} days ago. Transferring an expired domain is unreliable, and renewing first is usually the safer order.`
          : untilExpiry <= 15
            ? `It expires in ${untilExpiry} days. A transfer can take up to five days, and some registrars refuse transfers close to expiry, so renew first if you can.`
            : `It expires in ${untilExpiry} days, which leaves comfortable room for a transfer.`,
      selfServiceable: true,
      evidence: registration.registryExpiryDate,
    });
  } else {
    findings.push({
      id: "expiry",
      title: "Expiry proximity",
      state: "unknown",
      detail: "The registry does not publish an expiry date.",
      selfServiceable: true,
      evidence: null,
    });
  }

  // DNSSEC is the most commonly missed transfer failure.
  if (registration.dnssecSigned === true) {
    findings.push({
      id: "dnssec",
      title: "DNSSEC is switched on",
      state: "risk",
      detail:
        "This domain is signed with DNSSEC. If the DS record is not handled on both sides of the move, the domain stops resolving for everyone using a validating resolver, and that break is total rather than partial. Plan the DS record with both registrars before you start.",
      selfServiceable: true,
      evidence: `delegationSigned: true${registration.dsRecordCount ? `, ${registration.dsRecordCount} DS record(s)` : ""}`,
    });
  } else if (registration.dnssecSigned === false) {
    findings.push({
      id: "dnssec",
      title: "DNSSEC",
      state: "clear",
      detail: "The registration record does not publish a signed delegation.",
      selfServiceable: true,
      evidence: "delegationSigned: false",
    });
  } else {
    findings.push({
      id: "dnssec",
      title: "DNSSEC",
      state: "unknown",
      detail: "The registry does not publish a DNSSEC state.",
      selfServiceable: true,
      evidence: null,
    });
  }

  if (registration.nameservers.length) {
    findings.push({
      id: "nameservers",
      title: "Where DNS is hosted",
      state: "risk",
      detail:
        "A transfer moves the registration, not your DNS hosting or email. If your current registrar is also serving DNS, the records can disappear when the domain leaves. Copy the zone to its new home before transferring.",
      selfServiceable: true,
      evidence: registration.nameservers.map((nameserver) => nameserver.hostname).join(", "),
    });
  } else {
    findings.push({
      id: "nameservers",
      title: "DNS hosting",
      state: "unknown",
      detail: "The registration record does not publish nameservers. Confirm DNS hosting before the transfer.",
      selfServiceable: true,
      evidence: null,
    });
  }

  if (registration.coverage?.source === "whois" && !registration.statuses.length) {
    for (const finding of findings.filter(finding => ["client-lock", "server-lock", "pending-transfer", "lifecycle"].includes(finding.id))) {
      finding.state = "unknown";
      finding.detail = "This WHOIS record does not publish exact EPP statuses, so we cannot check this condition.";
      finding.evidence = null;
    }
  }
  if (!policyApplies) {
    for (const finding of findings.filter(finding => ["registration-lock", "transfer-lock"].includes(finding.id))) {
      finding.state = "unknown";
      finding.detail = "This ending follows its registry's transfer rules. ICANN's transfer waiting periods do not establish whether it can move.";
    }
  }
  const blocked = findings.filter((finding) => finding.state === "blocked");
  const summary = blocked.length
    ? blocked.some((finding) => finding.selfServiceable)
      ? `${registration.query.domain} cannot be transferred right now, but at least one of the blockers is yours to clear.`
      : `${registration.query.domain} cannot be transferred right now, and the blockers are not ones you can clear yourself.`
    : `Nothing we can see is blocking a transfer of ${registration.query.domain}. The rest depends on your registrar account, which is not public.`;

  return {
    registration,
    policy,
    policyApplies,
    pendingPolicyChange: pendingPolicy(),
    findings,
    cannotCheck: [
      "Whether you can get the authorization code, which lives in your registrar account.",
      "Whether the registrant email on record still works. Transfer approval is sent there, and an old address is the most common reason a transfer stalls.",
      "Whether your registrar account has an unpaid balance or an unverified contact, both of which block a transfer outside the public record.",
      "Whether a change of registrant happened recently, which carries its own lock and is not published anywhere.",
    ],
    summary,
  };
}
