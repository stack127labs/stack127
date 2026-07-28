/**
 * ICANN Transfer Policy lock periods, as a versioned rule set.
 *
 * This is versioned rather than a constant because the policy is mid change. The
 * 60 day locks are genuinely in force today, so the tool computes a real answer.
 * A shorter replacement has been adopted but not implemented, so it sits here
 * with a null effective date and switching over is a one line change.
 *
 * Getting this wrong makes the page actively harmful: a reader planning around a
 * wrong date misses a renewal.
 */

export type TransferPolicyVersion = {
  id: string;
  label: string;
  /** ISO date the version took effect, or null when adopted but not yet implemented. */
  effectiveDate: string | null;
  /** Lock after a new registration. */
  afterRegistrationDays: number;
  /** Lock after a transfer between registrars. */
  afterTransferDays: number;
  /** Lock after a change of registrant, or null when the version removes it. */
  afterRegistrantChangeDays: number | null;
  source: string;
  verifiedAt: string;
  note: string;
};

export const TRANSFER_POLICY_VERSIONS: TransferPolicyVersion[] = [
  {
    id: "2016-transfer-policy",
    label: "Transfer Policy in force today",
    effectiveDate: "2016-12-01",
    afterRegistrationDays: 60,
    afterTransferDays: 60,
    afterRegistrantChangeDays: 60,
    source: "https://www.icann.org/en/contracted-parties/accredited-registrars/resources/domain-name-transfers/policy",
    verifiedAt: "2026-07-28",
    note: "Sixty days after a new registration, after a transfer between registrars, and after a change of registrant. A registrar may offer an opt out of the change of registrant lock, but only before the change is made.",
  },
  {
    id: "2026-transfer-policy-review",
    label: "Adopted, waiting to be implemented",
    effectiveDate: null,
    afterRegistrationDays: 30,
    afterTransferDays: 30,
    afterRegistrantChangeDays: null,
    source: "https://www.icann.org/en/board-activities-and-meetings/materials/approved-resolutions-regular-meeting-of-the-icann-board-07-06-2026-en",
    verifiedAt: "2026-07-28",
    note: "The GNSO Council approved all 47 Transfer Policy Review recommendations on 12 March 2025 and the ICANN Board adopted them on 7 June 2026 in resolution 2026.06.07.04, directing implementation subject to prioritization. The locks become 720 hours, which is 30 days, and the change of registrant lock goes away. No effective date has been published, and an Implementation Review Team has to draft the policy language first.",
  },
];

export function policyInForce(now = new Date()): TransferPolicyVersion {
  const active = TRANSFER_POLICY_VERSIONS.filter(
    (version) => version.effectiveDate !== null && new Date(version.effectiveDate) <= now,
  );
  // Newest effective version wins.
  active.sort((a, b) => (a.effectiveDate as string).localeCompare(b.effectiveDate as string));
  const current = active[active.length - 1];
  if (!current) throw new Error("No transfer policy version is in force.");
  return current;
}

export function pendingPolicy(): TransferPolicyVersion | null {
  return TRANSFER_POLICY_VERSIONS.find((version) => version.effectiveDate === null) ?? null;
}

export type LockEvaluation = {
  /** "locked", "clear", or "unknown" when the source date was not published. */
  state: "locked" | "clear" | "unknown";
  daysElapsed: number | null;
  daysRemaining: number | null;
  lockDays: number;
};

export function evaluateLock(since: string | null, lockDays: number, now = new Date()): LockEvaluation {
  if (!since) return { state: "unknown", daysElapsed: null, daysRemaining: null, lockDays };
  const start = new Date(since);
  if (Number.isNaN(start.getTime())) return { state: "unknown", daysElapsed: null, daysRemaining: null, lockDays };
  const elapsedMs = now.getTime() - start.getTime();
  const daysElapsed = Math.floor(elapsedMs / 86_400_000);
  if (daysElapsed >= lockDays) return { state: "clear", daysElapsed, daysRemaining: 0, lockDays };
  return { state: "locked", daysElapsed, daysRemaining: lockDays - daysElapsed, lockDays };
}
