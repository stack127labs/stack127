function decodeHtml(value) {
  return String(value ?? "")
    .replaceAll("&amp;", "&")
    .replaceAll("&#038;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#039;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)));
}

function cleanText(value) {
  return decodeHtml(String(value ?? "").replace(/<[^>]+>/g, " "))
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[\u2013\u2014]/g, ",")
    .replace(/\s+/g, " ")
    .trim();
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function frequencyPlans(value) {
  return [...String(value ?? "").matchAll(/(?:^|,\s)([A-Z][A-Z0-9_]*):/g)].map((match) => match[1]);
}

function frequencySummary(value) {
  const labels = {
    ANZ: "AU/NZ",
    EU: "EU",
    EU_LR: "EU LR",
    HK: "Hong Kong",
    IL: "Israel",
    IN: "India",
    JP: "Japan",
    KR: "Korea",
    RU: "Russia",
    US: "US",
    US_LR: "US LR",
  };
  const plans = frequencyPlans(value).map((plan) => labels[plan] ?? plan.replaceAll("_", " "));
  return plans.length > 0 ? plans.join(" + ") : "See certified regions";
}

function detailFact(label, value) {
  return value ? { label, value } : null;
}

export function parseAllianceProductDetail(html) {
  const fields = new Map();
  const segments = String(html).split(/<tr><th class=["']th-min-with["'][^>]*>/i).slice(1);
  for (const segment of segments) {
    const rowEnd = segment.search(/<\/td><\/tr>/i);
    const row = rowEnd >= 0 ? segment.slice(0, rowEnd + 10) : segment;
    const label = cleanText(row.match(/<div>([\s\S]*?)<\/div><\/th>/i)?.[1]);
    if (!label) continue;
    const cell = row.match(/<td[^>]*>([\s\S]*)$/i)?.[1] ?? "";
    const value = cleanText(cell);
    if (value) fields.set(label, value);
  }

  const recognition = [];
  if (/title=["'](?:LR Certified|Z-Wave Long Range Certified)["']/i.test(html)) recognition.push("Long Range");
  if (/title=["']Z-Wave Plus Certified["']/i.test(html)) recognition.push("Z-Wave Plus");
  if (/title=["']Z-Wave Certified["']/i.test(html) && !recognition.includes("Z-Wave Plus")) recognition.push("Z-Wave");

  const imageUrls = unique(
    [...String(html).matchAll(/<img[^>]+src=["']([^"']*\/wp-content\/uploads\/products\/[^"']+)["']/gi)]
      .map((match) => decodeHtml(match[1])),
  );
  const documents = unique(
    [...String(html).matchAll(/<a[^>]+href=["']([^"']+)["'][^>]*>([^<]+)<\/a>/gi)]
      .filter((match) => /\.(?:pdf|docx?|txt)(?:\?|$)/i.test(match[1]))
      .map((match) => JSON.stringify({ label: cleanText(match[2]), url: decodeHtml(match[1]) })),
  ).map((value) => JSON.parse(value));

  return { documents, fields, imageUrls, recognition };
}

export function buildAllianceRecord(apiRecord, detail, options) {
  const aliases = { Identifier: ["Identifier", "Product Identifier"] };
  const field = (label) => (aliases[label] ?? [label]).map((key) => detail.fields.get(key)).find(Boolean) ?? "";
  const vendor = field("Brand") || field("Brand Owner") || "Unbranded";
  const model = field("Identifier") || field("Certification Number") || apiRecord.slug;
  const category = field("Categories").split(",")[0]?.trim() || field("Device Type") || "Other";
  const recognition = detail.recognition.length > 0 ? detail.recognition : ["Z-Wave"];
  const recognitionValue = ["Z-Wave Plus", "Long Range", "Z-Wave"].filter((item) => recognition.includes(item)).join(" + ");
  const softwareValue = options.zwaveJsMatches.length > 0
    ? `${options.zwaveJsMatches.length} Z-Wave JS ${options.zwaveJsMatches.length === 1 ? "config" : "configs"}`
    : "No Z-Wave JS match";
  const allianceFacts = [
    detailFact("Certification Number", field("Certification Number")),
    detailFact("Certified name", field("Name") || cleanText(apiRecord.title?.rendered)),
    detailFact("Brand", vendor),
    detailFact("Brand owner", field("Brand Owner")),
    detailFact("Identifier", field("Identifier")),
    detailFact("Product line", field("Product Line")),
    detailFact("OEM version", field("OEM Version")),
    detailFact("Hardware platform", field("Hardware Platform")),
    detailFact("Z-Wave version", field("Z-Wave Version")),
    detailFact("Manufacturer ID", field("Manufacturer ID")),
    detailFact("Product type ID", field("Product Type ID")),
    detailFact("Product ID", field("Product ID")),
  ].filter(Boolean);
  const radioFacts = [
    detailFact("Frequency plans", field("Frequency Plans")),
    detailFact("Countries and regions", field("Countries / Regions")),
    detailFact("Z-Wave range", field("Radio Range Z-Wave (m)") ? `${field("Radio Range Z-Wave (m)")} m` : ""),
    detailFact("Z-Wave Long Range", field("Radio Range Z-Wave LR (m)") ? `${field("Radio Range Z-Wave LR (m)")} m` : ""),
    detailFact("Recognition", recognitionValue),
  ].filter(Boolean);
  const capabilityFacts = [
    detailFact("Category", field("Categories")),
    detailFact("Device type", field("Device Type")),
    detailFact("Library type", field("Library Type")),
    detailFact("Supports NWI", field("Supports NWI")),
    detailFact("Supports Explorer Frames", field("Supports Explorer Frames")),
  ].filter(Boolean);
  const configFacts = options.zwaveJsMatches.flatMap((match) => [
    detailFact("Z-Wave JS label", match.label),
    detailFact("Manufacturer ID", match.manufacturerId),
    detailFact("Product type and ID", match.identifiers?.join(", ")),
    detailFact("Firmware range", match.firmware),
    detailFact("Configuration parameters", String(match.parameters ?? 0)),
    detailFact("Association groups", String(match.associations ?? 0)),
  ]).filter(Boolean);
  const sourceLinks = [
    { label: "Z-Wave Alliance certification", url: apiRecord.link },
    ...(field("Product URL") ? [{ label: "Manufacturer product page", url: field("Product URL") }] : []),
    ...options.zwaveJsMatches.map((match) => ({ label: "Z-Wave JS configuration", url: match.url })),
    ...detail.documents,
  ];
  const facts = [...allianceFacts, ...radioFacts, ...capabilityFacts, ...configFacts];

  return {
    added: apiRecord.date?.slice(0, 10) ?? null,
    card: {
      compatibility: { label: "Certification", status: "confirmed", value: recognitionValue },
      facts: [
        { label: "Frequency", value: frequencySummary(field("Frequency Plans")) },
        { label: "Software config", value: softwareValue },
      ],
    },
    category,
    detail_sections: [
      { facts: allianceFacts, heading: "Certified identity" },
      { facts: radioFacts, heading: "Radio and region" },
      { facts: capabilityFacts, heading: "Certified capabilities" },
      { facts: configFacts.length > 0 ? configFacts : [{ label: "Z-Wave JS", value: "No exact configuration match" }], heading: "Software configuration" },
    ],
    evidence: [
      { label: "Alliance", value: field("Certification Number") || "certified record" },
      { label: "Z-Wave JS", value: softwareValue },
    ],
    facts,
    features: unique([category, field("Device Type"), ...recognition, ...frequencyPlans(field("Frequency Plans"))]),
    image_path: options.imagePath,
    image_quality: options.imageQuality ?? "official-source",
    image_source_url: options.imageSourceUrl,
    model,
    name: field("Name") || cleanText(apiRecord.title?.rendered),
    notes: field("Short Description") ? [field("Short Description")] : [],
    provenance: unique(facts.map((fact) => fact.label)).map((fieldName) => ({ field: fieldName, source: "Z-Wave Alliance", url: apiRecord.link })),
    search_terms: unique([field("Certification Number"), field("Brand Owner"), field("Product Line"), field("OEM Version"), field("Hardware Platform"), field("Frequency Plans"), field("Countries / Regions"), field("Device Type")]),
    slug: apiRecord.slug,
    source_links: sourceLinks,
    stats: [
      { label: "frequency", value: frequencySummary(field("Frequency Plans")) },
      { label: "software config", value: softwareValue },
    ],
    vendor,
  };
}

function recordFact(record, label) {
  return record.facts.find((item) => item.label === label)?.value ?? "";
}

function normalizedGroupValue(value) {
  return cleanText(value).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export function zWaveProductGroupKey(record) {
  const protocolIds = ["Manufacturer ID", "Product type ID", "Product ID"].map((label) => normalizedGroupValue(recordFact(record, label)));
  if (protocolIds.every(Boolean)) return ["protocol", normalizedGroupValue(record.vendor), ...protocolIds].join("|");
  return ["identity", record.vendor, record.name, record.model].map(normalizedGroupValue).join("|");
}

export function addZWaveRecordToGroups(groups, record) {
  const key = zWaveProductGroupKey(record);
  const group = groups.get(key) ?? { records: [], key };
  group.records.push(record);
  groups.set(key, group);
  return groups;
}

export function finalizeZWaveGroups(groups, options = {}) {
  const slugify = options.slugify ?? ((value) => normalizedGroupValue(value).replaceAll(" ", "-"));
  const usedSlugs = new Set();
  const results = [];
  for (const group of groups.values()) {
    const records = [...group.records].sort((left, right) => String(right.added ?? "").localeCompare(String(left.added ?? "")));
    const imageRecord = records.find((record) => record.image_path && record.image_source_url) ?? null;
    const representative = imageRecord ?? records[0];
    const certificates = unique(records.map((record) => recordFact(record, "Certification Number")));
    const frequencies = unique(records.map((record) => recordFact(record, "Frequency plans")));
    const recognitions = ["Z-Wave Plus", "Long Range", "Z-Wave"].filter((value) => records.some((record) => record.features.includes(value)));
    const configs = unique(records.flatMap((record) => record.source_links.filter((link) => link.label === "Z-Wave JS configuration").map((link) => JSON.stringify(link)))).map((link) => JSON.parse(link));
    const supportingLinks = unique(records.flatMap((record) => record.source_links
      .filter((link) => !["Z-Wave Alliance certification", "Z-Wave JS configuration"].includes(link.label))
      .map((link) => JSON.stringify(link)))).map((link) => JSON.parse(link)).slice(0, 20);
    const variants = records.map((record) => ({
      certificate_id: recordFact(record, "Certification Number") || "Alliance record",
      certified_date: record.added,
      firmware_version: recordFact(record, "Firmware range") || null,
      hardware_version: recordFact(record, "Hardware platform") || null,
      matter_version: recordFact(record, "Z-Wave version") || null,
      product_id: [recordFact(record, "Product type ID"), recordFact(record, "Product ID")].filter(Boolean).join(" / ") || null,
      source_url: record.source_links.find((link) => link.label === "Z-Wave Alliance certification")?.url ?? record.source_links[0]?.url ?? "",
      transport: recordFact(record, "Frequency plans") || null,
      vendor_id: recordFact(record, "Manufacturer ID") || null,
    }));
    let slug = slugify(`${representative.vendor}-${representative.name}-${representative.model}`) || "z-wave-product";
    const baseSlug = slug;
    let suffix = 2;
    while (usedSlugs.has(slug)) slug = `${baseSlug}-${suffix++}`;
    usedSlugs.add(slug);
    const coverageFacts = [
      { label: "Certification records", value: String(variants.length) },
      { label: "Certification numbers", value: certificates.join(", ") || "Not published by the Alliance" },
      { label: "Certified frequency plans", value: frequencies.join("; ") || "Not published by the Alliance" },
    ];
    results.push({
      ...representative,
      card: {
        compatibility: { label: "Certification", status: "confirmed", value: recognitions.join(" + ") || "Z-Wave" },
        facts: [
          { label: "Frequency", value: unique(records.map((record) => record.card.facts.find((fact) => fact.label === "Frequency")?.value)).join(" + ") },
          { label: "Software config", value: configs.length ? `${configs.length} Z-Wave JS ${configs.length === 1 ? "config" : "configs"}` : "No Z-Wave JS match" },
        ],
      },
      certification_variant_kind: "z-wave",
      certification_variants: variants,
      detail_sections: [
        representative.detail_sections.find((section) => section.heading === "Certified identity"),
        { facts: coverageFacts, heading: "Certification coverage" },
        representative.detail_sections.find((section) => section.heading === "Radio and region"),
        representative.detail_sections.find((section) => section.heading === "Certified capabilities"),
        representative.detail_sections.find((section) => section.heading === "Software configuration"),
      ].filter(Boolean),
      facts: [...representative.facts, ...coverageFacts],
      features: unique(records.flatMap((record) => record.features)),
      image_path: imageRecord ? `/hardware-directory-images/z-wave-devices/${slug}.webp` : null,
      image_quality: imageRecord?.image_quality ?? null,
      image_source_slug: imageRecord?.slug ?? null,
      image_source_url: imageRecord?.image_source_url ?? null,
      provenance: unique(records.flatMap((record) => record.provenance.map((item) => JSON.stringify(item)))).map((item) => JSON.parse(item)),
      search_terms: unique(records.flatMap((record) => [record.model, ...record.search_terms, ...record.facts.map((fact) => fact.value)])),
      slug,
      source_links: [
        { label: "Latest Z-Wave Alliance certification", url: variants[0].source_url },
        ...configs,
        ...supportingLinks,
      ],
    });
  }
  return results.sort((left, right) => left.vendor.localeCompare(right.vendor) || left.name.localeCompare(right.name) || left.model.localeCompare(right.model));
}
