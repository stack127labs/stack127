import type { MultiTldRow } from "../../../../../lib/domain/multi-tld-shared.ts";

export type MultiTldDisplayRow = (MultiTldRow & { unicodeDomain?: string | null }) | {
  tld: string;
  domain: string;
  state: "checking";
};

export function stateLabel(state: MultiTldDisplayRow["state"]) {
  if (state === "not_registered") return "No registration found";
  if (state === "registered") return "Registered";
  if (state === "cannot_check") return "Cannot check";
  if (state === "check_failed") return "Check failed";
  return "Checking...";
}

function countSentence(count: number, singular: string, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

export function multiTldSummary(rows: MultiTldRow[]) {
  const noRegistration = rows.filter((row) => row.state === "not_registered").length;
  const registered = rows.filter((row) => row.state === "registered").length;
  const cannotCheck = rows.filter((row) => row.state === "cannot_check").length;
  const failed = rows.filter((row) => row.state === "check_failed").length;
  const details = [
    registered ? countSentence(registered, "registered", "registered") : null,
    cannotCheck ? `${cannotCheck} cannot be checked` : null,
    failed ? `${countSentence(failed, "check")} failed` : null,
  ].filter(Boolean);
  return {
    detail: details.length ? `${details.join(". ")}.` : "Every selected ending returned no registration record.",
    noRegistration,
    value: `${noRegistration} of ${rows.length}`,
  };
}

export function resultDetail(row: MultiTldRow) {
  if (row.state === "cannot_check") return `No known RDAP service for .${row.tld}`;
  if (row.state === "check_failed") return row.detail || "The registry check failed.";
  return null;
}

export function formatMultiTldDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-GB", {
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    timeZone: "UTC",
    timeZoneName: "short",
    year: "numeric",
  });
}

export function sourceAndFreshness(row: MultiTldRow) {
  if (row.state === "cannot_check") return { freshness: null, source: "No RDAP service" };
  return {
    freshness: row.fetchedAt ? `Fetched ${formatMultiTldDate(row.fetchedAt)}${row.fromCache ? ", from cache" : ", live response"}` : null,
    source: row.sourceHost ?? "Registry source not reported",
  };
}
