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

function detachedText(value) {
  return Buffer.from(String(value ?? ""), "utf8").toString("utf8");
}

export function cleanText(value) {
  const cleaned = decodeHtml(String(value ?? "").replace(/<[^>]+>/g, " "))
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[\u2013\u2014]/g, ",")
    .replace(/\s+/g, " ")
    .trim();
  // CSA detail pages are roughly 230 KB each. V8 may otherwise retain those
  // backing strings through small regex slices stored in the product groups.
  return detachedText(cleaned);
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function normalized(value) {
  return cleanText(value).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function recordFact(record, label) {
  return record.facts.find((item) => item.label === label)?.value ?? "";
}

function recordSource(record) {
  return record.source_links.find((link) => link.label === "CSA certification")?.url ?? record.source_links[0]?.url ?? "";
}

function fact(label, value) {
  return value ? { label, value } : null;
}

export function parseMatterProductDetail(html) {
  const source = String(html ?? "");
  const fields = new Map();
  for (const match of source.matchAll(/<li class=["']item["'][^>]*>([\s\S]*?)<\/li>/gi)) {
    const label = cleanText(match[1].match(/<span class=["']label["'][^>]*>([\s\S]*?)<\/span>/i)?.[1]);
    if (!label) continue;
    const valueMarkup = match[1].match(/<span class=["']value["'][^>]*>([\s\S]*?)<\/span>/i)?.[1] ?? "";
    const value = cleanText(valueMarkup);
    if (value) fields.set(label, value);
  }

  const company = cleanText(source.match(/<p class=["'][^"']*entry-company[^"']*["'][^>]*>([\s\S]*?)<\/p>/i)?.[1]).replace(/^By\s+/i, "");
  const imageUrl = detachedText(decodeHtml(source.match(/<div class=["']entry-image["'][\s\S]*?<img[^>]+src=["']([^"']+)["']/i)?.[1] ?? ""));
  const links = [];
  for (const match of source.matchAll(/<li class=["']item["'][^>]*>([\s\S]*?)<\/li>/gi)) {
    const label = cleanText(match[1].match(/<span class=["']label["'][^>]*>([\s\S]*?)<\/span>/i)?.[1]);
    const link = match[1].match(/<a[^>]+href=["']([^"']+)["']/i)?.[1];
    if (label && link) links.push({ label, url: detachedText(decodeHtml(link)) });
  }

  return {
    company,
    fields,
    imageUrl: /CSA-Certified-Product-default/i.test(imageUrl) ? "" : imageUrl,
    links,
  };
}

function transportList(value, community) {
  const published = String(value ?? "").split(/\s*,\s*/).filter(Boolean);
  if (published.length > 0) return published;
  return [community?.supportsThread ? "Thread" : "", community?.supportsWifi ? "Wi-Fi" : "", community?.supportsBluetooth ? "Bluetooth" : ""].filter(Boolean);
}

export function buildMatterRecord(apiRecord, detail, options = {}) {
  const field = (label) => detail.fields.get(label) ?? "";
  const community = options.community ?? null;
  const certificate = field("Certificate ID") || `CSA record ${apiRecord.id}`;
  const vendor = detail.company || options.company || community?.manufacturer || "Manufacturer not published";
  const category = options.deviceType || community?.category || "Device type not published";
  const transports = transportList(field("Transport Interface"), community);
  const transportValue = transports.length > 0 ? transports.join(" + ") : "Not published by CSA";
  const certificationFacts = [
    fact("Certificate ID", field("Certificate ID")),
    fact("Certified date", field("Certified Date")),
    fact("Specification version", field("Specification Version")),
    fact("Product type", field("Product Type") || options.productType),
    fact("TIS/TRP tested", field("TIS/TRP Tested")),
  ].filter(Boolean);
  const identityFacts = [
    fact("Manufacturer", vendor),
    fact("Certified name", cleanText(apiRecord.title?.rendered)),
    fact("Description", cleanText(apiRecord.content?.rendered)),
    fact("Device type", category),
    fact("Vendor ID", field("Vendor ID")),
    fact("Product ID", field("Product ID")),
    fact("Primary device type ID", field("Primary Device Type ID")),
  ].filter(Boolean);
  const softwareFacts = [
    fact("Firmware version", field("Firmware Version")),
    fact("Hardware version", field("Hardware Version")),
    fact("Transport interface", field("Transport Interface")),
  ].filter(Boolean);
  const retailFacts = [
    fact("Retail name", community?.product),
    fact("EAN", community?.ean),
    fact("Community note", community?.note),
  ].filter(Boolean);
  const sourceLinks = [
    { label: "CSA certification", url: apiRecord.link },
    ...detail.links,
    ...(community?.buyLinks ?? []).map((url, index) => ({ label: index === 0 ? "Product page" : `Retail link ${index + 1}`, url })),
  ];
  const facts = [...identityFacts, ...certificationFacts, ...softwareFacts, ...retailFacts];

  return {
    added: apiRecord.date?.slice(0, 10) ?? null,
    card: {
      compatibility: { label: "Matter certification", status: "confirmed", value: certificate },
      facts: [
        { label: "Transport", value: transportValue },
        { label: "Matter version", value: field("Specification Version") || "Not published by CSA" },
      ],
    },
    category,
    detail_sections: [
      { facts: identityFacts, heading: "Certified identity" },
      { facts: certificationFacts, heading: "Certification" },
      { facts: softwareFacts.length > 0 ? softwareFacts : [{ label: "Technical versions", value: "Not published by CSA" }], heading: "Versions and transport" },
      ...(retailFacts.length > 0 ? [{ facts: retailFacts, heading: "Retail enrichment" }] : []),
    ],
    evidence: [
      { label: "CSA", value: certificate },
      { label: "Transport", value: transportValue },
    ],
    facts,
    features: unique([category, ...transports, field("Specification Version") ? `Matter ${field("Specification Version")}` : ""]),
    image_path: options.imagePath ?? null,
    image_quality: options.imageQuality ?? null,
    image_source_url: options.imageSourceUrl ?? null,
    model: field("Product ID") || field("Certificate ID") || String(apiRecord.id),
    name: cleanText(apiRecord.title?.rendered),
    notes: cleanText(apiRecord.excerpt?.rendered) ? [cleanText(apiRecord.excerpt.rendered)] : [],
    provenance: unique(facts.map((item) => item.label)).map((fieldName) => ({ field: fieldName, source: "Connectivity Standards Alliance", url: apiRecord.link })),
    search_terms: unique([certificate, vendor, category, field("Vendor ID"), field("Product ID"), field("Primary Device Type ID"), ...transports, community?.ean]),
    slug: options.slug,
    source_links: sourceLinks,
    stats: [
      { label: "transport", value: transportValue },
      { label: "certificate", value: certificate },
    ],
    vendor,
  };
}

export function matterProductGroupKey(record) {
  return [record.vendor, record.name, record.category].map(normalized).join("|");
}

export function addMatterRecordToGroups(groups, record) {
  const key = matterProductGroupKey(record);
  const current = groups.get(key) ?? {
    features: new Set(),
    imageRecord: null,
    key,
    productIds: new Set(),
    provenance: new Map(),
    representative: null,
    searchTerms: new Set(),
    variants: [],
    vendorIds: new Set(),
  };
  if (!current.representative || String(record.added ?? "").localeCompare(String(current.representative.added ?? "")) > 0) {
    current.representative = record;
  }
  if (record.image_path && record.image_source_url
    && (!current.imageRecord || String(record.added ?? "").localeCompare(String(current.imageRecord.added ?? "")) > 0)) {
    current.imageRecord = record;
  }
  const productId = recordFact(record, "Product ID");
  const vendorId = recordFact(record, "Vendor ID");
  if (productId) current.productIds.add(productId);
  if (vendorId) current.vendorIds.add(vendorId);
  for (const value of record.features) current.features.add(value);
  for (const value of [record.model, ...record.search_terms, ...record.facts.map((item) => item.value)]) {
    if (value) current.searchTerms.add(value);
  }
  for (const item of record.provenance) current.provenance.set(JSON.stringify(item), item);
  current.variants.push({
    certificate_id: recordFact(record, "Certificate ID") || record.evidence.find((item) => item.label === "CSA")?.value || "CSA record",
    certified_date: recordFact(record, "Certified date") || record.added,
    firmware_version: recordFact(record, "Firmware version") || null,
    hardware_version: recordFact(record, "Hardware version") || null,
    matter_version: recordFact(record, "Specification version") || null,
    product_id: productId || null,
    source_url: recordSource(record),
    transport: recordFact(record, "Transport interface") || record.card.facts.find((item) => item.label === "Transport")?.value || null,
    vendor_id: vendorId || null,
  });
  groups.set(key, current);
  return groups;
}

export function finalizeMatterGroups(groups, options = {}) {
  const usedSlugs = new Set();
  const slugify = options.slugify ?? ((value) => normalized(value).replaceAll(" ", "-"));
  const results = [];
  for (const group of groups.values()) {
    const representative = group.representative;
    const imageRecord = group.imageRecord;
    const productIds = [...group.productIds];
    const vendorIds = [...group.vendorIds];
    const transports = [...group.features].filter((value) => ["Thread", "Wi-Fi", "Bluetooth", "Ethernet"].includes(value));
    const variants = [...group.variants].sort((left, right) => String(right.certified_date ?? "").localeCompare(String(left.certified_date ?? "")));
    const matterVersions = unique(variants.map((variant) => variant.matter_version)).sort();
    const supportingLinks = unique(group.representative.source_links
      .filter((link) => link.label !== "CSA certification")
      .map((link) => JSON.stringify(link))).map((link) => JSON.parse(link)).slice(0, 20);
    const groupFacts = [
      { label: "Certification records", value: String(variants.length) },
      { label: "Vendor ID", value: vendorIds.join(", ") || "Not published by CSA" },
      { label: "Product IDs", value: productIds.join(", ") || "Not published by CSA" },
      { label: "Matter versions", value: matterVersions.join(", ") || "Not published by CSA" },
      { label: "Transports", value: transports.join(", ") || "Not published by CSA" },
    ];
    let slug = slugify(`${representative.vendor}-${representative.name}-${representative.category}`) || "matter-product";
    const baseSlug = slug;
    let suffix = 2;
    while (usedSlugs.has(slug)) {
      slug = `${baseSlug}-${suffix}`;
      suffix += 1;
    }
    usedSlugs.add(slug);
    results.push({
      ...representative,
      card: {
        compatibility: {
          label: "Matter certification",
          status: "confirmed",
          value: `${variants.length} CSA ${variants.length === 1 ? "record" : "records"}`,
        },
        facts: [
          { label: "Transport", value: transports.join(" + ") || "Not published by CSA" },
          { label: "Matter version", value: matterVersions.join(" + ") || "Not published by CSA" },
        ],
      },
      certification_variants: variants,
      detail_sections: [
        representative.detail_sections.find((section) => section.heading === "Certified identity") ?? representative.detail_sections[0],
        { facts: groupFacts, heading: "Certification coverage" },
        representative.detail_sections.find((section) => section.heading === "Versions and transport") ?? { facts: [], heading: "Versions and transport" },
      ].filter(Boolean),
      evidence: [
        { label: "CSA", value: `${variants.length} certification ${variants.length === 1 ? "record" : "records"}` },
        { label: "Transport", value: transports.join(" + ") || "Not published by CSA" },
      ],
      facts: [...representative.facts, ...groupFacts],
      features: [...group.features],
      image_path: imageRecord ? `/hardware-directory-images/matter-devices/${slug}.webp` : null,
      image_quality: imageRecord?.image_quality ?? null,
      image_source_slug: imageRecord?.slug ?? null,
      image_source_url: imageRecord?.image_source_url ?? null,
      model: productIds.length === 1 ? productIds[0] : `${productIds.length || variants.length} certified variants`,
      provenance: [...group.provenance.values()],
      search_terms: [...group.searchTerms],
      slug,
      source_links: [{ label: "Latest CSA certification", url: recordSource(representative) }, ...supportingLinks],
    });
  }
  return results.sort((left, right) => left.vendor.localeCompare(right.vendor) || left.name.localeCompare(right.name) || left.category.localeCompare(right.category));
}
