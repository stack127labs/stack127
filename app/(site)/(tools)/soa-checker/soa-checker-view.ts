import { negativeCacheTtlSeconds } from "../../../../lib/dns/diagnostic-presentation.ts";
import type { SoaRecord } from "../../../../lib/dns/diagnostic-types.ts";
import { compareSerials } from "../../../../lib/dns/serial-arithmetic.ts";

export type SoaObservation = {
  server: { hostname: string; address: string };
  skippedReason: "checker_ipv6_unavailable" | null;
  soa: SoaRecord | null;
  authoritative: boolean;
  error: string | null;
  rawResponses: { udp?: unknown; tcp?: unknown } | null;
};

export type SoaCheckerResult = {
  checkedAt: string;
  durationMs: number;
  ipv6Connectivity: boolean | null;
  query: { inputName: string; zone: string };
  observations: SoaObservation[];
  summary: {
    allAnswered: boolean;
    serialsAgree: boolean;
    newestSerial: number | null;
    differences: string[];
  };
};

export type SoaDifferenceField =
  | "serial"
  | "ownerName"
  | "primaryNameserver"
  | "responsibleMailbox"
  | "refreshSeconds"
  | "retrySeconds"
  | "expireSeconds"
  | "minimumSeconds"
  | "ttlSeconds"
  | "negativeCacheTtlSeconds";

const comparedFields: Array<{
  key: SoaDifferenceField;
  label: string;
  value: (soa: SoaRecord) => string | number | null;
}> = [
  { key: "serial", label: "serial", value: (soa) => soa.serial },
  { key: "ownerName", label: "owner", value: (soa) => soa.ownerName },
  { key: "primaryNameserver", label: "MNAME", value: (soa) => soa.primaryNameserver },
  { key: "responsibleMailbox", label: "RNAME", value: (soa) => soa.responsibleMailbox },
  { key: "refreshSeconds", label: "refresh", value: (soa) => soa.refreshSeconds },
  { key: "retrySeconds", label: "retry", value: (soa) => soa.retrySeconds },
  { key: "expireSeconds", label: "expire", value: (soa) => soa.expireSeconds },
  { key: "minimumSeconds", label: "MINIMUM", value: (soa) => soa.minimumSeconds },
  { key: "ttlSeconds", label: "SOA TTL", value: (soa) => soa.ttlSeconds },
  { key: "negativeCacheTtlSeconds", label: "negative-cache time", value: negativeCacheTtlSeconds },
];

export const soaDifferenceLabels = Object.fromEntries(
  comparedFields.map(({ key, label }) => [key, label]),
) as Record<SoaDifferenceField, string>;

function list(values: string[]) {
  if (values.length < 2) return values[0] ?? "values";
  if (values.length === 2) return `${values[0]} and ${values[1]}`;
  return `${values.slice(0, -1).join(", ")}, and ${values.at(-1)}`;
}

function trimSentence(value: string) {
  return value.trim().replace(/[.!?]+$/, "");
}

function unambiguousNewest(serials: number[]) {
  const distinct = [...new Set(serials)];
  if (distinct.length === 0) return { serialOrder: "unavailable" as const, newestSerial: null };
  if (distinct.length === 1) return { serialOrder: "same" as const, newestSerial: distinct[0] };

  const candidates = distinct.filter((candidate) => distinct.every((other) => {
    if (candidate === other) return true;
    return compareSerials(candidate, other) === "left-newer";
  }));
  return candidates.length === 1
    ? { serialOrder: "defined" as const, newestSerial: candidates[0] }
    : { serialOrder: "undefined" as const, newestSerial: null };
}

export function buildSoaComparison(result: SoaCheckerResult) {
  const checked = result.observations.filter((observation) => !observation.skippedReason);
  const skipped = result.observations.filter((observation) => observation.skippedReason);
  const usable = checked.filter((observation): observation is SoaObservation & { soa: SoaRecord } => (
    observation.authoritative && observation.soa !== null
  ));
  const failed = checked.find((observation) => !observation.authoritative || !observation.soa);
  const differingFields = comparedFields
    .filter(({ value }) => new Set(usable.map((observation) => String(value(observation.soa)))).size > 1)
    .map(({ key }) => key);
  const serial = unambiguousNewest(usable.map((observation) => observation.soa.serial));
  const zone = result.query.zone;

  if (!result.observations.length) {
    return {
      differingFields,
      lead: `No authoritative SOA records were available for ${zone}, so serial and field agreement cannot be determined.`,
      newestSerial: null,
      serialOrder: "unavailable" as const,
      showTable: false,
      state: "incomplete" as const,
    };
  }

  if (!checked.length) {
    return {
      differingFields,
      lead: `No SOA comparison could be completed for ${zone} because this checker had no route to any discovered address.`,
      newestSerial: null,
      serialOrder: "unavailable" as const,
      showTable: true,
      state: "incomplete" as const,
    };
  }

  if (failed) {
    const source = `${failed.server.hostname} at ${failed.server.address}`;
    const reason = failed.error ? `; ${trimSentence(failed.error)}` : "";
    return {
      differingFields,
      lead: `The SOA comparison for ${zone} is incomplete because ${source} did not return an authoritative SOA${reason}.`,
      newestSerial: serial.newestSerial,
      serialOrder: serial.serialOrder,
      showTable: true,
      state: "incomplete" as const,
    };
  }

  const differenceLabels = differingFields.map((field) => soaDifferenceLabels[field]);
  if (serial.serialOrder === "undefined") {
    const otherDifferences = differenceLabels.filter((label) => label !== "serial");
    const suffix = otherDifferences.length ? ` ${list(otherDifferences)} also differ.` : "";
    return {
      differingFields,
      lead: `SOA records for ${zone} use different serials, but RFC 1982 cannot order them unambiguously.${suffix}`,
      newestSerial: null,
      serialOrder: serial.serialOrder,
      showTable: true,
      state: "disagree" as const,
    };
  }

  if (differingFields.includes("serial")) {
    return {
      differingFields,
      lead: `SOA records for ${zone} disagree. RFC 1982 identifies serial ${serial.newestSerial?.toLocaleString("en-US")} as newest; ${list(differenceLabels)} differ across the checked authoritative replies.`,
      newestSerial: serial.newestSerial,
      serialOrder: serial.serialOrder,
      showTable: true,
      state: "disagree" as const,
    };
  }

  if (differingFields.length) {
    return {
      differingFields,
      lead: `The SOA serial is ${serial.newestSerial?.toLocaleString("en-US")} on every checked address for ${zone}, but ${list(differenceLabels)} differ.`,
      newestSerial: serial.newestSerial,
      serialOrder: serial.serialOrder,
      showTable: true,
      state: "disagree" as const,
    };
  }

  const addressSubject = skipped.length
    ? "All addresses this checker could query"
    : `All ${checked.length.toLocaleString("en-US")} ${checked.length === 1 ? "checked address" : "checked addresses"}`;
  return {
    differingFields,
    lead: `${addressSubject} for ${zone} returned authoritative SOA records and agree on every value, including serial ${serial.newestSerial?.toLocaleString("en-US")}.`,
    newestSerial: serial.newestSerial,
    serialOrder: serial.serialOrder,
    showTable: true,
    state: "agree" as const,
  };
}
