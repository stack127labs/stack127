import type { ResourceRange } from "./engine";

export type RawResourcePlannerRange = {
  min: number | string | null;
  max: number | string | null;
  kind: string | null;
  confidence: string | null;
  basis: string | null;
  source_urls: unknown;
  note: string | null;
  checked_at: Date | string | null;
};

const MAX_RAM_MIB = 4096 * 1024;

function sourceUrls(value: unknown) {
  return Array.isArray(value)
    ? value.filter((url): url is string => typeof url === "string" && /^https?:\/\//i.test(url))
    : [];
}

function checkedDate(value: Date | string | null) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date.toISOString().slice(0, 10) : null;
}

export function normalizeResourcePlannerRange(
  raw: RawResourcePlannerRange | null,
  dimension: "ram" | "storage",
): ResourceRange | null {
  if (!raw || raw.min === null || raw.max === null || typeof raw.basis !== "string" || !raw.basis.trim()) return null;
  const min = Number(raw.min);
  const max = Number(raw.max);
  const urls = sourceUrls(raw.source_urls);
  if (!Number.isFinite(min) || !Number.isFinite(max) || min < 0 || max < min || urls.length === 0) return null;
  if (!("derived" === raw.kind || "estimated" === raw.kind)) return null;
  if (!("high" === raw.confidence || "medium" === raw.confidence || "low" === raw.confidence)) return null;
  if (dimension === "ram" && (min > MAX_RAM_MIB || max > MAX_RAM_MIB)) return null;
  return {
    ...(dimension === "ram" ? { minMb: min, maxMb: max } : { minGb: min, maxGb: max }),
    kind: raw.kind,
    confidence: raw.confidence,
    basis: raw.basis.trim(),
    sourceUrls: urls,
    note: raw.note,
    checkedAt: checkedDate(raw.checked_at),
  };
}
