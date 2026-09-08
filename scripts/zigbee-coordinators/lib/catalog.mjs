function clean(value) {
  return String(value ?? "").replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"').replace(/[\u2013\u2014]/g, ",").replace(/\s+/g, " ").trim();
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

export function findChipset(text) {
  const patterns = [
    /CC2674P10/i, /CC2652P10/i, /CC2652P7/i, /CC2652P/i, /CC2652R(?:B|1)?/i,
    /CC1352P(?:7)?/i, /CC2538/i, /CC2531/i, /CC2530/i, /EFR32MG24/i, /EFR32MG21/i,
    /EM3587/i, /JN5169/i, /XBee 3/i, /XBee S2C/i,
  ];
  return patterns.find((pattern) => pattern.test(text))?.exec(text)?.[0].toUpperCase().replace("XBEE", "XBee") ?? "Not published in source";
}

export function findConnection(text) {
  const values = [];
  if (/poe/i.test(text)) values.push("PoE");
  if (/ethernet|\btcp\b|\blan\b/i.test(text)) values.push("Ethernet");
  if (/wi-?fi|wifi/i.test(text)) values.push("Wi-Fi");
  if (/usb/i.test(text)) values.push("USB");
  if (/gpio|raspbee|pizigate|pi hat/i.test(text)) values.push("GPIO");
  return unique(values).join(" + ") || "Module or board connection";
}

export function buildCoordinatorRecord(parsed, options) {
  const compatibilityLabels = { deconz: "deCONZ", iob: "ioBroker", iobroker: "ioBroker", tasmota: "Tasmota", z2m: "Zigbee2MQTT", z4d: "deCONZ", zha: "ZHA" };
  const compatible = unique(parsed.compatible.map((value) => compatibilityLabels[value] ?? value));
  const compatibility = compatible.join(" + ") || "Compatibility record available";
  const identityFacts = [
    { label: "Manufacturer", value: parsed.vendor },
    { label: "Retail model", value: parsed.model },
    { label: "Record title", value: clean(parsed.title) },
    { label: "Added to source", value: parsed.dateAdded ?? "Date not published" },
  ];
  const hardwareFacts = [
    { label: "Connection", value: options.connection },
    { label: "Radio chipset", value: options.chipset },
  ];
  const compatibilityFacts = compatible.map((value) => ({ label: value, value: "Listed by the compatibility source" }));
  const facts = [...identityFacts, ...hardwareFacts, ...compatibilityFacts];

  return {
    added: parsed.dateAdded,
    card: {
      compatibility: { label: "Works with", status: "reported", value: compatibility },
      facts: [
        { label: "Connection", value: options.connection },
        { label: "Radio", value: options.chipset },
      ],
    },
    category: "Coordinator",
    detail_sections: [
      { facts: identityFacts, heading: "Exact adapter" },
      { facts: hardwareFacts, heading: "Connection and radio" },
      { facts: compatibilityFacts.length > 0 ? compatibilityFacts : [{ label: "Compatibility", value: "See the source record" }], heading: "Software compatibility" },
    ],
    evidence: compatible.map((value) => ({ label: value, value: "listed" })),
    facts,
    features: unique([...compatible, options.connection, options.chipset]),
    image_path: options.imagePath,
    image_quality: "source-product-image",
    image_source_url: options.imageSourceUrl,
    model: parsed.model,
    name: clean(parsed.title),
    notes: ["Match firmware to the radio chipset and adapter role before flashing."],
    provenance: facts.map((item) => ({ field: item.label, source: "Blakadder Zigbee coordinator record", url: options.recordUrl })),
    search_terms: unique([parsed.vendor, parsed.model, options.chipset, options.connection, ...compatible]),
    slug: options.slug,
    source_links: [
      { label: "Compatibility record", url: options.recordUrl },
      { label: "Pinned source record", url: options.pinnedRecordUrl },
      ...(options.manufacturerUrl ? [{ label: "Manufacturer page", url: options.manufacturerUrl }] : []),
    ],
    stats: [
      { label: "connection", value: options.connection },
      { label: "radio", value: options.chipset },
    ],
    vendor: parsed.vendor,
  };
}
