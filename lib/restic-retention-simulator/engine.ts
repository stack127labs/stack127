export type ResticGroupBy = "host" | "paths" | "tags";

export type ResticPolicy = Readonly<{
  keepLast: number;
  keepDaily: number;
  keepWeekly: number;
  keepMonthly: number;
  keepYearly: number;
}>;

export type ResticSnapshot = Readonly<{
  id: string;
  time: string;
  hostname?: string;
  host?: string;
  paths?: string[];
  tags?: string[];
}>;

export type ResticInput = Readonly<{
  snapshots: ResticSnapshot[];
  policy: ResticPolicy;
  groupBy: ResticGroupBy;
  timezone: string;
}>;

export type ResticRow = Readonly<{
  id: string;
  time: string;
  group: string;
  state: "kept" | "pruned";
  reasons: string[];
}>;

export type ResticValues = Readonly<{
  rows: ResticRow[];
  keptCount: number;
  prunedCount: number;
  groups: number;
  timezone: string;
  timezoneWarning: string | null;
  resolutionVersion: "restic-retention-v1";
}>;

export type ResticResult = Readonly<{
  status: "valid" | "invalid";
  values: ResticValues | null;
  issues: string[];
}>;

export const DEFAULT_RESTIC_INPUT: ResticInput = {
  snapshots: [
    { id: "a1b2c3", time: "2026-09-15T22:00:00Z", hostname: "nas", paths: ["/srv"], tags: ["daily"] },
    { id: "d4e5f6", time: "2026-09-14T22:00:00Z", hostname: "nas", paths: ["/srv"], tags: ["daily"] },
    { id: "g7h8i9", time: "2026-09-08T22:00:00Z", hostname: "nas", paths: ["/srv"], tags: ["weekly"] },
  ],
  policy: { keepLast: 1, keepDaily: 2, keepWeekly: 4, keepMonthly: 6, keepYearly: 2 },
  groupBy: "host",
  timezone: "UTC",
};

const policyKeys: (keyof ResticPolicy)[] = ["keepLast", "keepDaily", "keepWeekly", "keepMonthly", "keepYearly"];

function objectLike(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validTimezone(timezone: string) {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: timezone }).format();
    return true;
  } catch {
    return false;
  }
}

function validList(value: unknown) {
  return value === undefined || (Array.isArray(value) && value.every((item) => typeof item === "string"));
}

function issueList(input: unknown): string[] {
  const issues: string[] = [];
  if (!objectLike(input)) return ["Input must be an object."];
  const snapshots = input.snapshots;
  if (!Array.isArray(snapshots) || snapshots.length === 0) issues.push("Add at least one snapshot.");
  if (Array.isArray(snapshots) && snapshots.length > 1000) issues.push("Use 1000 snapshots or fewer.");
  const ids = new Set<string>();
  if (Array.isArray(snapshots)) {
    snapshots.forEach((snapshot, index) => {
      if (!objectLike(snapshot)) {
        issues.push(`Snapshot ${index + 1} must be an object.`);
        return;
      }
      if (typeof snapshot.id !== "string" || snapshot.id.trim() === "") issues.push(`Snapshot ${index + 1} needs an id.`);
      else {
        const id = snapshot.id.trim();
        if (ids.has(id)) issues.push(`Snapshot id ${id} is duplicated.`);
        else ids.add(id);
      }
      if (typeof snapshot.time !== "string" || !Number.isFinite(Date.parse(snapshot.time))) issues.push(`Snapshot ${index + 1} needs an ISO time.`);
      if (snapshot.hostname !== undefined && typeof snapshot.hostname !== "string") issues.push(`Snapshot ${index + 1} hostname must be text.`);
      if (snapshot.host !== undefined && typeof snapshot.host !== "string") issues.push(`Snapshot ${index + 1} host must be text.`);
      if (!validList(snapshot.paths)) issues.push(`Snapshot ${index + 1} paths must be strings.`);
      if (!validList(snapshot.tags)) issues.push(`Snapshot ${index + 1} tags must be strings.`);
    });
  }
  if (!objectLike(input.policy)) issues.push("Add a retention policy.");
  else {
    let positive = false;
    for (const key of policyKeys) {
      const value = input.policy[key];
      if (!Number.isInteger(value) || Number(value) < 0 || Number(value) > 365) issues.push(`${key} must be an integer from 0 to 365.`);
      else if (Number(value) > 0) positive = true;
    }
    if (!positive) issues.push("Set at least one retention rule above zero.");
  }
  if (input.groupBy !== "host" && input.groupBy !== "paths" && input.groupBy !== "tags") issues.push("Choose host, paths, or tags grouping.");
  if (typeof input.timezone !== "string" || input.timezone.trim() === "") issues.push("Choose a timezone.");
  return issues;
}

function groupValue(snapshot: ResticSnapshot, groupBy: ResticGroupBy) {
  if (groupBy === "host") {
    const value = snapshot.hostname?.trim() || snapshot.host?.trim() || "(none)";
    return { key: JSON.stringify([value]), label: value };
  }
  const values = [...(snapshot[groupBy] ?? [])].map((value) => value.trim()).filter(Boolean).sort();
  return {
    key: JSON.stringify(values),
    label: values.length ? JSON.stringify(values) : "(none)",
  };
}

type LocalParts = { year: number; month: number; day: number; weekday: number };

function localParts(date: Date, timezone: string): LocalParts {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]));
  const weekday = ({ Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 } as Record<string, number>)[values.weekday] ?? 0;
  return { year: Number(values.year), month: Number(values.month), day: Number(values.day), weekday };
}

function bucketKey(date: Date, kind: "daily" | "weekly" | "monthly" | "yearly", timezone: string) {
  const local = localParts(date, timezone);
  if (kind === "daily") return `${local.year}-${String(local.month).padStart(2, "0")}-${String(local.day).padStart(2, "0")}`;
  if (kind === "monthly") return `${local.year}-${String(local.month).padStart(2, "0")}`;
  if (kind === "yearly") return String(local.year);
  const utcDay = Date.UTC(local.year, local.month - 1, local.day);
  const mondayOffset = (local.weekday + 6) % 7;
  const monday = new Date(utcDay - mondayOffset * 86_400_000);
  return `week-${monday.getUTCFullYear()}-${String(monday.getUTCMonth() + 1).padStart(2, "0")}-${String(monday.getUTCDate()).padStart(2, "0")}`;
}

function selectNewest(rows: ResticSnapshot[], count: number, reason: string, selected: Map<string, string[]>, timezone?: string, kind?: "daily" | "weekly" | "monthly" | "yearly") {
  if (count <= 0) return;
  if (!kind || !timezone) {
    rows.slice(0, count).forEach((row) => selected.set(row.id, [...(selected.get(row.id) ?? []), reason]));
    return;
  }
  const newestByBucket = new Map<string, ResticSnapshot>();
  rows.forEach((row) => {
    const key = bucketKey(new Date(row.time), kind, timezone);
    if (!newestByBucket.has(key)) newestByBucket.set(key, row);
  });
  const bucketRows = [...newestByBucket.values()].slice(0, count);
  bucketRows.forEach((row) => selected.set(row.id, [...(selected.get(row.id) ?? []), `${reason} (${bucketKey(new Date(row.time), kind, timezone)})`]));
  if (bucketRows.length < count && rows.length > bucketRows.length) {
    const oldest = rows.at(-1);
    if (oldest && !bucketRows.some((row) => row.id === oldest.id)) {
      selected.set(oldest.id, [...(selected.get(oldest.id) ?? []), `oldest ${kind} snapshot`]);
    }
  }
}

export function simulateResticRetention(input: unknown): ResticResult {
  const issues = issueList(input);
  if (issues.length || !objectLike(input)) return { status: "invalid", values: null, issues };
  const typed = input as ResticInput;
  const timezone = validTimezone(typed.timezone) ? typed.timezone : "UTC";
  const timezoneWarning = timezone === typed.timezone ? null : `Timezone ${typed.timezone} is not recognized; UTC used.`;
  const snapshots = typed.snapshots.map((snapshot) => ({
    ...snapshot,
    id: snapshot.id.trim(),
    time: new Date(snapshot.time).toISOString(),
    hostname: snapshot.hostname?.trim(),
    host: snapshot.host?.trim(),
    paths: snapshot.paths?.map((value) => value.trim()),
    tags: snapshot.tags?.map((value) => value.trim()),
  })).sort((a, b) => Date.parse(b.time) - Date.parse(a.time) || a.id.localeCompare(b.id));
  const groups = new Map<string, ResticSnapshot[]>();
  snapshots.forEach((snapshot) => {
    const group = groupValue(snapshot, typed.groupBy);
    groups.set(group.key, [...(groups.get(group.key) ?? []), snapshot]);
  });
  const selected = new Map<string, string[]>();
  for (const rows of groups.values()) {
    selectNewest(rows, typed.policy.keepLast, "keep-last", selected);
    selectNewest(rows, typed.policy.keepDaily, "keep-daily", selected, timezone, "daily");
    selectNewest(rows, typed.policy.keepWeekly, "keep-weekly", selected, timezone, "weekly");
    selectNewest(rows, typed.policy.keepMonthly, "keep-monthly", selected, timezone, "monthly");
    selectNewest(rows, typed.policy.keepYearly, "keep-yearly", selected, timezone, "yearly");
  }
  const resultRows: ResticRow[] = snapshots.map((snapshot) => ({
    id: snapshot.id,
    time: snapshot.time,
    group: groupValue(snapshot, typed.groupBy).label,
    state: selected.has(snapshot.id) ? "kept" : "pruned",
    reasons: selected.get(snapshot.id) ?? ["no rule selected this snapshot"],
  }));
  return {
    status: "valid",
    issues: [],
    values: {
      rows: resultRows,
      keptCount: resultRows.filter((row) => row.state === "kept").length,
      prunedCount: resultRows.filter((row) => row.state === "pruned").length,
      groups: groups.size,
      timezone,
      timezoneWarning,
      resolutionVersion: "restic-retention-v1",
    },
  };
}

export function formatResticResult(result: ResticResult) {
  if (result.status === "invalid" || !result.values) return result.issues.join("\n");
  return [
    `Kept ${result.values.keptCount} of ${result.values.rows.length} snapshots`,
    ...result.values.rows.map((row) => `${row.state.toUpperCase()} ${row.id} ${row.time} ${row.reasons.join(", ")}`),
  ].join("\n");
}
