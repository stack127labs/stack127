import { isDeepStrictEqual } from "node:util";
import { appColumns } from "./schema.mjs";
import { validateSummary } from "./summary-rules.mjs";

export function guardPartialCorrection(record, current) {
  if (record.review_scope !== "partial") return;
  if (Object.hasOwn(record, "data_checked_at") || Object.hasOwn(record, "technical_facts_checked_at")) {
    throw new Error("Partial corrections cannot advance whole-record verification dates");
  }
  if (!record.data_source_urls?.some(url => /^https:\/\//.test(url))) throw new Error("Reviewed source URLs are required");
  const fields = [...appColumns.filter(field => !["slug", "data_source_urls"].includes(field)), "categories"];
  for (const field of fields.filter(field => Object.hasOwn(record, field))) {
    if (!Object.hasOwn(record.expected ?? {}, field)) throw new Error(`${record.slug}: expected value required for ${field}`);
    if (!isDeepStrictEqual(current[field], record.expected[field])) throw new Error(`${record.slug}: ${field} changed since review`);
  }
  if (Object.hasOwn(record, "summary")) {
    const { errors } = validateSummary(record.summary);
    if (errors.length) throw new Error(`${record.slug}: ${errors.join("; ")}`);
  }
}

export function guardInstallCorrection(record, currentOptions) {
  if (record.review_scope !== "partial") return;
  if (!Array.isArray(record.expected_install_options)) throw new Error(`${record.slug}: installation snapshot required`);
  if (!isDeepStrictEqual(record.expected_install_options, currentOptions)) throw new Error(`${record.slug}: installation options changed since review`);
}

export function mergeReviewedInstallOptions(existing, reviewed, methods) {
  if (!Array.isArray(methods) || methods.length === 0) throw new Error("Reviewed install methods are required");
  if (reviewed.some(option => !methods.includes(option.method))) throw new Error("Install correction contains an unreviewed method");
  return [...existing.filter(option => !methods.includes(option.method)), ...reviewed];
}
