function clean(value) {
  return String(value ?? "").replace(/[\u2013\u2014]/g, ",").replace(/\s+/g, " ").trim();
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function supportMeaning(level) {
  return {
    "1": "Reverse-engineered protocol",
    "2": "Public protocol fragments",
    "3": "Published protocol",
    "4": "Vendor-provided protocol",
    "5": "Vendor-provided protocol and hardware",
  }[String(level)] ?? "Support evidence recorded by NUT";
}

export function parseNutHcl(text) {
  const rows = [];
  for (const [index, line] of String(text ?? "").split(/\r?\n/).entries()) {
    const fields = [...line.matchAll(/"([^"]*)"/g)].map((match) => clean(match[1]));
    if (fields.length < 6) continue;
    const sourceUrls = [...line.matchAll(/https?:\/\/[^\s#]+/g)].map((match) => match[0].replace(/[),.;]+$/, ""));
    rows.push({
      connection: fields[4],
      driver: fields[5],
      line: index + 1,
      manufacturer: fields[0],
      model: fields[3],
      sourceUrls,
      supportLevel: fields[2],
      type: fields[1],
    });
  }
  return rows;
}

export function groupUpsRows(rows) {
  const groups = new Map();
  for (const row of rows.filter((item) => item.type === "ups")) {
    const key = `${row.manufacturer}\u0000${row.model}`;
    const current = groups.get(key) ?? { manufacturer: row.manufacturer, model: row.model, rows: [] };
    current.rows.push(row);
    groups.set(key, current);
  }
  return [...groups.values()];
}

function scopeForModel(model) {
  return /\b(?:all|any|assorted|family|families|range|series|various)\b|\*|\(various\)/i.test(model) ? "family" : "model";
}

export function buildNutRecord(group, options = {}) {
  const rows = group.rows;
  const levels = unique(rows.map((row) => row.supportLevel)).sort((left, right) => Number(right) - Number(left));
  const drivers = unique(rows.map((row) => row.driver));
  const connections = unique(rows.map((row) => row.connection || "Connection not specified in HCL"));
  const scope = scopeForModel(group.model);
  const configFacts = rows.map((row, index) => ({
    label: rows.length === 1 ? "Configuration" : `Configuration ${index + 1}`,
    value: `${row.connection || "Connection not specified"}; ${row.driver}; support ${row.supportLevel}/5`,
  }));
  const sourceUrls = unique(rows.flatMap((row) => row.sourceUrls));
  const supportValue = levels.length === 1 ? `${levels[0]}/5, ${supportMeaning(levels[0])}` : `${levels.join(" or ")}/5 depending on connection`;
  const driverValue = drivers.length === 1 ? drivers[0] : `${drivers.length} supported drivers`;
  const connectionValue = connections.length === 1 ? connections[0] : connections.join(" + ");
  const identityFacts = [
    { label: "Manufacturer", value: group.manufacturer },
    { label: "HCL model", value: group.model },
    { label: "Record scope", value: scope === "family" ? "Product family" : "Named model" },
  ];
  const compatibilityFacts = [
    { label: "Support level", value: supportValue },
    { label: "Driver", value: drivers.join("; ") },
    { label: "Connection", value: connectionValue },
  ];
  const facts = [...identityFacts, ...compatibilityFacts, ...configFacts];
  const pinnedSource = `https://github.com/networkupstools/nut/blob/${options.commit}/data/driver.list.in`;

  return {
    added: null,
    card: {
      compatibility: { label: "NUT support", status: "confirmed", value: supportValue },
      facts: [
        { label: "Driver", value: driverValue },
        { label: "Connection", value: connectionValue },
      ],
    },
    category: scope === "family" ? "Product family" : "Named model",
    detail_sections: [
      { facts: identityFacts, heading: "UPS identity" },
      { facts: compatibilityFacts, heading: "NUT compatibility" },
      { facts: configFacts, heading: "Connection configurations" },
    ],
    evidence: [
      { label: "NUT HCL", value: `${rows.length} source ${rows.length === 1 ? "row" : "rows"}` },
      { label: "Support", value: supportValue },
    ],
    facts,
    features: unique([scope === "family" ? "Product family" : "Named model", ...drivers, ...connections, ...levels.map((level) => `Support ${level}/5`)]),
    image_path: options.imagePath ?? null,
    image_quality: options.imageQuality ?? null,
    image_source_url: options.imageSourceUrl ?? null,
    model: group.model,
    name: `${group.manufacturer} ${group.model}`,
    notes: scope === "family" ? ["This HCL entry covers a product family. Confirm the exact regional model and connection before buying."] : [],
    provenance: facts.map((item) => ({ field: item.label, source: "Network UPS Tools HCL", url: pinnedSource })),
    search_terms: unique([group.manufacturer, group.model, ...drivers, ...connections, ...levels.map((level) => `support level ${level}`)]),
    slug: options.slug,
    source_links: [
      { label: "NUT compatibility list", url: `https://networkupstools.org/stable-hcl.html?manufacturer=${encodeURIComponent(group.manufacturer)}&model=${encodeURIComponent(group.model)}` },
      { label: "Pinned HCL source", url: pinnedSource },
      ...sourceUrls.map((url, index) => ({ label: `Upstream reference ${index + 1}`, url })),
    ],
    stats: [
      { label: "support", value: levels.map((level) => `${level}/5`).join(" or ") },
      { label: "driver", value: driverValue },
    ],
    vendor: group.manufacturer,
  };
}
