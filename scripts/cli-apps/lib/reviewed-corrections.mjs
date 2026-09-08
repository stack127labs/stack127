import { isDeepStrictEqual } from "node:util";
import { validateSummary } from "../../self-host-apps/lib/summary-rules.mjs";

export const correctionFields = new Set(["name", "summary", "website_url", "repository_url", "docs_url", "license", "language", "install_methods"]);

export function guardCorrection(record, current) {
  if (!record.slug || !record.fields || Object.keys(record.fields).length === 0) throw new Error("A slug and reviewed fields are required");
  const reviewTimestamp = Date.parse(record.reviewed_at);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(record.reviewed_at ?? "") || !Number.isFinite(reviewTimestamp) || new Date(reviewTimestamp).toISOString().slice(0, 10) !== record.reviewed_at) throw new Error("A valid review date is required");
  for (const [field, value] of Object.entries(record.fields)) {
    if (!correctionFields.has(field)) throw new Error(`${field}: partial correction not allowed`);
    if (field === "install_methods") {
      if (!Array.isArray(value) || !Array.isArray(current.install_methods) || new Set(value).size !== value.length || value.some(method => typeof method !== "string" || !current.install_methods.includes(method))) {
        throw new Error("install_methods: this partial workflow only removes unsupported methods from the existing list");
      }
    } else if (value !== null && typeof value !== "string") throw new Error(`${field}: expected text or null`);
    if (!Object.hasOwn(record.expected ?? {}, field)) throw new Error(`${field}: expected value required`);
    if (!isDeepStrictEqual(current[field], record.expected[field])) throw new Error(`${record.slug}: ${field} changed since review`);
    if (!/^https:\/\//.test(record.sources?.[field] ?? "")) throw new Error(`${field}: reviewed source URL required`);
    if (field.endsWith("_url") && value !== null && !/^https:\/\//.test(value)) throw new Error(`${field}: HTTPS URL required`);
    if (["summary", "name"].includes(field) && !value?.trim()) throw new Error(`${field}: cannot be empty`);
    if (field === "summary") {
      const { errors } = validateSummary(value);
      if (errors.length) throw new Error(`${record.slug}: ${errors.join("; ")}`);
    }
  }
}
