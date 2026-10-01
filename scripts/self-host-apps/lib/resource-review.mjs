const resourceKinds = new Set(["ram", "storage"]);
const estimateKinds = new Set(["derived", "estimated"]);
const confidences = new Set(["high", "medium", "low"]);
const methods = new Set(["measurement", "calculation", "published_estimate"]);
const text = value => typeof value === "string" && value.trim().length > 0;
const number = value => (typeof value === "number" || (typeof value === "string" && value.trim() !== "")) && Number.isFinite(Number(value));

export function hasCompleteResourceEstimate(row, resourceKind) {
  if (!resourceKinds.has(resourceKind)) return false;

  const prefix = resourceKind === "ram" ? "ram" : "storage";
  const minimum = row?.[`${prefix}_estimate_min_${resourceKind === "ram" ? "mb" : "gb"}`];
  const maximum = row?.[`${prefix}_estimate_max_${resourceKind === "ram" ? "mb" : "gb"}`];
  const kind = row?.[`${prefix}_estimate_kind`];
  const confidence = row?.[`${prefix}_estimate_confidence`];
  const basis = row?.[`${prefix}_estimate_basis`];
  const sourceUrls = row?.[`${prefix}_source_urls`];

  return number(minimum) && Number(minimum) >= 0
    && number(maximum) && Number(maximum) >= Number(minimum)
    && estimateKinds.has(kind)
    && confidences.has(confidence)
    && text(basis) && !/deployment-shape-v1/i.test(basis)
    && Array.isArray(sourceUrls) && sourceUrls.length > 0
    && sourceUrls.every(url => typeof url === "string" && /^https?:\/\//.test(url));
}

export function buildResourceReviewQueue(rows) {
  return rows.flatMap(row => {
    const missing = [];
    if (!hasCompleteResourceEstimate(row, "ram")) missing.push("ram");
    if (!hasCompleteResourceEstimate(row, "storage")) missing.push("storage");
    const sourceLeads = [...new Set([row.install_docs_url, row.docs_url, row.website_url, row.source_code_url].filter(value => /^https?:\/\//.test(value ?? "")))];
    return missing.map(resourceKind => ({ slug: row.slug, resource_kind: resourceKind, status: "needs_review", source_leads: sourceLeads }));
  });
}

export function validateResourceEstimate(record) {
  const prefix = `${record?.slug ?? "Estimate"}/${record?.resource_kind ?? "unknown"}`;
  if (!text(record?.slug)) throw new Error(`${prefix}: slug required`);
  if (!resourceKinds.has(record.resource_kind)) throw new Error(`${prefix}: invalid resource_kind`);
  if (record.unit !== (record.resource_kind === "ram" ? "mb" : "gb")) throw new Error(`${prefix}: wrong unit`);
  if (!number(record.estimate_min) || Number(record.estimate_min) < 0) throw new Error(`${prefix}: invalid estimate_min`);
  if (!number(record.estimate_max) || Number(record.estimate_max) < Number(record.estimate_min)) throw new Error(`${prefix}: invalid estimate_max`);
  if (!estimateKinds.has(record.estimate_kind)) throw new Error(`${prefix}: invalid estimate_kind`);
  if (!confidences.has(record.confidence)) throw new Error(`${prefix}: invalid confidence`);
  if (!text(record.basis)) throw new Error(`${prefix}: a reviewed basis is required`);
  if (/deployment-shape-v1/i.test(record.basis)) throw new Error(`${prefix}: generated deployment-shape ranges are not reviewed estimates`);
  if (!Array.isArray(record.source_urls) || record.source_urls.length === 0 || record.source_urls.some(url => typeof url !== "string" || !/^https?:\/\//.test(url))) throw new Error(`${prefix}: source URLs required`);
  if (!text(record.review?.method)) throw new Error(`${prefix}: review method required`);
  const appEstimate = record.review?.method === "app_estimate";
  if (!appEstimate && !methods.has(record.review?.method)) throw new Error(`${prefix}: app estimate, measurement, calculation, or published estimate required`);
  if (!appEstimate && !text(record.review?.workload)) throw new Error(`${prefix}: reviewed workload required`);
  if (!appEstimate && !text(record.review?.explanation)) throw new Error(`${prefix}: review explanation required`);
  return {
    slug: record.slug.trim(), resource_kind: record.resource_kind, unit: record.unit,
    estimate_min: Number(record.estimate_min), estimate_max: Number(record.estimate_max),
    estimate_kind: record.estimate_kind, confidence: record.confidence, basis: record.basis.trim(),
    source_urls: [...new Set(record.source_urls)],
    note: appEstimate ? (record.note?.trim() || null)
      : [`Workload: ${record.review.workload.trim()}`, record.review.explanation.trim(), record.note?.trim()].filter(Boolean).join(" "),
  };
}
