import type { TransferFinding, TransferReadiness } from "../../../../lib/domain/transfer-readiness.ts";

const SUBJECT_ORDER = ["client-lock", "server-lock", "pending-transfer", "lifecycle", "registration-lock", "transfer-lock", "expiry", "dnssec", "nameservers"];
const STATE_ORDER: Record<TransferFinding["state"], number> = { blocked: 0, risk: 1, unknown: 2, clear: 3 };

export function transferPolicyApplies(result: TransferReadiness) {
  const type = result.registration.query.tldType;
  return type === "generic" || type === "sponsored" || type === undefined;
}

function countWord(count: number) {
  const words = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
  return words[count] ?? String(count);
}

export function transferConclusion(result: TransferReadiness) {
  const { registration } = result;
  const domain = registration.query.unicode ?? registration.query.domain;
  if (registration.status === "not_registered") return `${domain} has no registry record, so there is no registered domain to transfer.`;
  if (registration.status === "no_service") return `stack127 has no lookup service it can use for .${registration.query.tld}, so public transfer readiness cannot be checked.`;
  if (registration.status !== "registered") return `Public transfer readiness could not be checked for ${domain}.`;
  if (!transferPolicyApplies(result)) return `ICANN's gTLD Transfer Policy does not govern .${registration.query.tld}. Check the transfer rules for this country-code ending.`;

  const blocked = result.findings.filter((finding) => finding.state === "blocked");
  if (!blocked.length) return `No public blocker was found for ${domain}. Auth code, account state, approval email, and registrar-specific steps can still stop the transfer.`;
  const yours = blocked.filter((finding) => finding.selfServiceable).length;
  const external = blocked.length - yours;
  const owners = [
    yours ? `${countWord(yours).toLowerCase()} you can clear in your account` : null,
    external ? `${countWord(external).toLowerCase()} ${external === 1 ? "requires" : "require"} waiting or registrar help` : null,
  ].filter(Boolean).join(", and ");
  return `${domain} cannot be transferred now. ${countWord(blocked.length)} public blocker${blocked.length === 1 ? " is" : "s are"} visible: ${owners}.`;
}

export function orderedTransferFindings(findings: TransferFinding[]) {
  return [...findings].sort((a, b) => {
    const state = STATE_ORDER[a.state] - STATE_ORDER[b.state];
    if (state) return state;
    return SUBJECT_ORDER.indexOf(a.id) - SUBJECT_ORDER.indexOf(b.id);
  });
}

export function findingAction(finding: TransferFinding, domain: string) {
  if (finding.id === "client-lock" && finding.state === "blocked") return { label: "Unlock this in your registrar account", href: null };
  if (finding.id === "server-lock" && finding.state === "blocked") return { label: "Ask your registrar why the registry lock is present", href: null };
  if (finding.id === "pending-transfer" && finding.state === "blocked") return { label: "Confirm the active transfer with your registrar", href: null };
  if (finding.id === "lifecycle" && finding.state === "blocked") return { label: "Contact the current registrar about recovery", href: null };
  if (finding.id === "registration-lock" && finding.state === "blocked") return { label: "Wait for the policy lock to end", href: null };
  if (finding.id === "transfer-lock" && finding.state === "blocked") return { label: "Wait for the policy lock to end", href: null };
  if (finding.id === "dnssec" && finding.state === "risk") return { label: "Check the DNSSEC chain", href: `/dnssec-checker?name=${encodeURIComponent(domain)}` };
  if (finding.id === "nameservers") return { label: "Check nameserver delegation", href: `/nameserver-checker?name=${encodeURIComponent(domain)}` };
  return null;
}

export function publicFindingDetail(finding: TransferFinding) {
  if (finding.id === "client-lock") return finding.state === "blocked" ? "Unlock the registrar transfer lock before starting." : "No registrar transfer lock is published.";
  if (finding.id === "server-lock") return finding.state === "blocked" ? "This lock needs registrar help." : "No registry transfer lock is published.";
  if (finding.id === "pending-transfer") return finding.state === "blocked" ? "Another registrar transfer is already running." : "No pending transfer status is published.";
  if (finding.id === "lifecycle") return finding.state === "blocked" ? "Restore the domain first if recovery is still allowed." : "No redemption or pending-delete status is published.";
  if (finding.id === "dnssec" && finding.state === "risk") return "Coordinate the DS record at both registrars before the move.";
  if (finding.id === "nameservers" && finding.state === "risk") return "Registration moves, but DNS and email hosting do not.";
  return finding.detail;
}

export function formatTransferDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "long", timeZone: "UTC", year: "numeric" });
}

export function sourceHost(url: string | null) {
  if (!url) return null;
  try { return new URL(url).host; } catch { return null; }
}
