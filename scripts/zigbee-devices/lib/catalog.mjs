function unquote(value) {
  const trimmed = String(value ?? "").trim();
  const first = trimmed.at(0);
  const last = trimmed.at(-1);

  if ((first === '"' && last === '"') || (first === "'" && last === "'")) {
    return trimmed.slice(1, -1).trim();
  }

  return trimmed;
}

function parseInlineList(value) {
  const trimmed = String(value ?? "").trim();

  if (!trimmed) return [];

  const body = trimmed.startsWith("[") && trimmed.endsWith("]")
    ? trimmed.slice(1, -1)
    : trimmed;

  return body
    .split(",")
    .map(unquote)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseFrontmatter(text) {
  const match = String(text).match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) return null;

  const values = new Map();

  for (const line of match[1].split(/\r?\n/)) {
    if (!line || /^\s/.test(line) || line.trimStart().startsWith("#")) continue;
    const separator = line.indexOf(":");
    if (separator < 1) continue;
    values.set(line.slice(0, separator).trim(), line.slice(separator + 1).trim());
  }

  return values;
}

export function parseCompatibilityRecord(text, fileName) {
  const values = parseFrontmatter(text);
  if (!values) return null;

  const model = unquote(values.get("model"));
  const vendor = unquote(values.get("vendor"));
  const title = unquote(values.get("title"));

  if (!model || !vendor || !title) return null;

  return {
    category: unquote(values.get("category")) || "other",
    compatible: parseInlineList(values.get("compatible")).map((value) => value.toLowerCase()),
    dateAdded: unquote(values.get("date_added")) || null,
    fileName,
    model,
    supports: parseInlineList(values.get("supports")),
    title,
    vendor,
    zigbeeModels: parseInlineList(values.get("zigbeemodel")),
    zigbee2mqttModel: unquote(values.get("z2m")) || null,
  };
}

function exposeName(expose) {
  if (!expose || typeof expose !== "object") return "";
  return String(expose.name ?? expose.property ?? expose.type ?? "").trim();
}

export function flattenExposes(exposes) {
  const names = new Set();

  function visit(expose) {
    if (!expose || typeof expose !== "object") return;

    const name = exposeName(expose);
    if (name) names.add(name);

    if (Array.isArray(expose.features)) {
      for (const feature of expose.features) visit(feature);
    }
  }

  for (const expose of Array.isArray(exposes) ? exposes : []) visit(expose);

  return [...names].sort((left, right) => left.localeCompare(right));
}

const categoryAliases = new Map([
  ["bulb", "light"],
  ["light", "light"],
  ["dimmer", "switch"],
  ["switch", "switch"],
  ["sensor", "sensor"],
  ["plug", "plug"],
  ["remote", "remote"],
  ["remote, battery", "remote"],
  ["hvac", "climate"],
  ["cover", "cover"],
  ["lock", "lock"],
  ["router", "router"],
  ["misc", "other"],
  ["other", "other"],
]);

function normalizeCategory(value) {
  return categoryAliases.get(String(value).toLowerCase()) ?? "other";
}

function slugify(value) {
  return String(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function z2mDeviceSlug(model) {
  return String(model)
    .trim()
    .replace(/[^A-Za-z0-9._-]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function githubAssetUrl(commit, fileName) {
  const encodedFileName = encodeURIComponent(fileName.replace(/\.md$/i, ".webp"));
  return `https://github.com/blakadder/zigbee/blob/${encodeURIComponent(String(commit).trim())}/assets/images/devices/${encodedFileName}`;
}

function z2mImageName(model) {
  return `${String(model).replaceAll("/", "-").replaceAll(":", "-").replaceAll("'", "-").replaceAll(" ", "-")}.png`;
}

function serializeFingerprints(fingerprints) {
  const unique = new Map();

  for (const fingerprint of Array.isArray(fingerprints) ? fingerprints : []) {
    if (!fingerprint || typeof fingerprint !== "object") continue;
    const modelId = String(fingerprint.modelID ?? "").trim();
    const manufacturerName = String(fingerprint.manufacturerName ?? "").trim();
    if (!modelId && !manufacturerName) continue;

    const key = `${manufacturerName}\u0000${modelId}`;
    unique.set(key, {
      manufacturer_name: manufacturerName || null,
      model_id: modelId || null,
    });
  }

  return [...unique.values()].sort((left, right) =>
    `${left.manufacturer_name ?? ""}${left.model_id ?? ""}`.localeCompare(
      `${right.manufacturer_name ?? ""}${right.model_id ?? ""}`,
    ),
  );
}

function identityKey(vendor, model) {
  return `${String(vendor ?? "").trim().toLowerCase()}\u0000${String(model ?? "").trim().toLowerCase()}`;
}

function groupBy(values, keyFor) {
  const groups = new Map();
  for (const value of values) {
    const key = keyFor(value);
    const group = groups.get(key) ?? [];
    group.push(value);
    groups.set(key, group);
  }
  return groups;
}

const compatibilityLabels = {
  "24d": "Unverified platform",
  deconz: "deCONZ",
  "deconz.zha": ["deCONZ", "ZHA"],
  ihost: "SONOFF iHost",
  iob: "ioBroker",
  iobroker: "ioBroker",
  sz2m: "Unverified platform",
  tasmota: "Tasmota",
  z2m: "Zigbee2MQTT",
  z4d: "Zigbee4Domoticz",
  zha: "ZHA",
  zigbee2mqtt: "Zigbee2MQTT",
};

export function normalizeCompatibilityCodes(codes) {
  return [...new Set((Array.isArray(codes) ? codes : []).flatMap((rawCode) => {
    const code = String(rawCode ?? "").trim().toLowerCase();
    if (!code) return [];
    const label = compatibilityLabels[code];
    return label ? (Array.isArray(label) ? label : [label]) : [String(rawCode).trim()];
  }))];
}

export function expandZigbee2mqttDefinitions(definitions) {
  const definitionMap = new Map(definitions.map((definition) => [definition.model, definition]));
  const pageDefinitions = [];

  for (const definition of definitions) {
    const whiteLabels = Array.isArray(definition.whiteLabel) ? definition.whiteLabel : [];
    const fingerprintLabels = whiteLabels.filter((whiteLabel) => Array.isArray(whiteLabel.fingerprint) && whiteLabel.fingerprint.length > 0);
    const remainingLabels = whiteLabels.filter((whiteLabel) => !Array.isArray(whiteLabel.fingerprint) || whiteLabel.fingerprint.length === 0);
    pageDefinitions.push({ ...definition, whiteLabel: remainingLabels.length > 0 ? remainingLabels : undefined });

    for (const whiteLabel of fingerprintLabels) {
      const nestedLabels = whiteLabels.filter((candidate) => candidate.whiteLabelOf === whiteLabel.model);
      pageDefinitions.push({
        ...definition,
        description: whiteLabel.description || definition.description,
        isWhiteLabel: true,
        model: whiteLabel.model,
        vendor: whiteLabel.vendor ?? definition.vendor,
        whiteLabel: nestedLabels.length > 0 ? nestedLabels : undefined,
        whiteLabelFingerprint: whiteLabel.fingerprint,
      });
    }
  }

  const marketed = [...pageDefinitions.map((definition) => ({
    baseModel: definition.model,
    definition,
    description: definition.description,
    imageFallbackModel: definition.model,
    isWhiteLabel: Boolean(definition.isWhiteLabel),
    model: definition.model,
    vendor: definition.vendor,
  }))];

  for (const definition of pageDefinitions) {
    for (const whiteLabel of definition.whiteLabel ?? []) {
      const explicitParent = whiteLabel.whiteLabelOf ? definitionMap.get(whiteLabel.whiteLabelOf) : null;
      const parent = explicitParent ?? definition;
      marketed.push({
        baseModel: parent.model,
        definition,
        description: whiteLabel.description ?? definition.description,
        imageFallbackModel: parent.model,
        isWhiteLabel: true,
        model: whiteLabel.model,
        vendor: whiteLabel.vendor ?? definition.vendor,
        whiteLabelFingerprint: whiteLabel.fingerprint,
      });
    }
  }

  return marketed;
}

function inferCategory(capabilities, description) {
  const text = `${capabilities.join(" ")} ${description}`.toLowerCase();
  if (/\b(?:plug|outlet|socket)\b/.test(text)) return "plug";
  if (capabilities.includes("light") || /\b(?:bulb|light|lamp)\b/.test(text)) return "light";
  if (capabilities.includes("lock") || /\block\b/.test(text)) return "lock";
  if (capabilities.includes("cover") || /\b(?:blind|curtain|cover|shade)\b/.test(text)) return "cover";
  if (capabilities.includes("climate") || /\b(?:thermostat|radiator|hvac)\b/.test(text)) return "climate";
  if (capabilities.includes("switch") || /\b(?:switch|dimmer|relay)\b/.test(text)) return "switch";
  if (capabilities.includes("action") && capabilities.includes("battery")) return "remote";
  if (/\b(?:sensor|detector|meter|monitor)\b/.test(text)) return "sensor";
  if (/\brouter\b/.test(text)) return "router";
  return "other";
}

function uniqueSlug(used, value) {
  const base = slugify(value) || "zigbee-device";
  let slug = base;
  let suffix = 2;
  while (used.has(slug)) {
    slug = `${base}-${suffix}`;
    suffix += 1;
  }
  used.add(slug);
  return slug;
}

function compatibilitySection(values) {
  return values.length > 0
    ? values.map((value) => ({
      label: value,
      value: value === "Unverified platform" ? "Source platform code could not be mapped" : "Support record available",
    }))
    : [{ label: "Controller listings", value: "None listed in source record" }];
}

export function buildCatalog({
  availableZ2mImages = [],
  blakadderImageFiles = {},
  blakadderCommit,
  compatibilityRecords,
  definitions,
  generatedAt,
  packageVersion,
  supplementalImageFiles = {},
  supplementalImageUrls = {},
  z2mAddedAt = {},
  z2mIoCommit = "current",
}) {
  const validRecords = compatibilityRecords.filter(Boolean);
  const coordinators = validRecords.filter((record) => record.category.toLowerCase() === "coordinator");
  const communityRecords = validRecords.filter((record) => record.category.toLowerCase() !== "coordinator");
  const byIdentity = groupBy(communityRecords, (record) => identityKey(record.vendor, record.model));
  const byModel = groupBy(communityRecords, (record) => record.model.toLowerCase());
  const byZigbee2mqttModel = groupBy(communityRecords.filter((record) => record.zigbee2mqttModel), (record) => record.zigbee2mqttModel.toLowerCase());
  const availableImages = new Set(availableZ2mImages);
  const officialRecords = expandZigbee2mqttDefinitions(definitions);
  const devices = [];
  const failures = [];
  const matchedCommunity = new Set();
  const usedSlugs = new Set();
  let overlapTotal = 0;
  let whiteLabelTotal = 0;

  for (const official of officialRecords) {
    const definition = official.definition;
    const capabilities = flattenExposes(definition.exposes);
    const vendor = String(official.vendor).trim();
    const model = String(official.model).trim();
    const exact = byIdentity.get(identityKey(vendor, model)) ?? [];
    const modelMatches = byModel.get(model.toLowerCase()) ?? [];
    const aliasMatches = byZigbee2mqttModel.get(model.toLowerCase()) ?? [];
    const record = exact.length === 1
      ? exact[0]
      : exact.length === 0 && modelMatches.length === 1
        ? modelMatches[0]
        : exact.length === 0 && modelMatches.length === 0 && aliasMatches.length === 1
          ? aliasMatches[0]
          : null;
    if (record) {
      matchedCommunity.add(record);
      overlapTotal += 1;
    }
    if (official.isWhiteLabel) whiteLabelTotal += 1;
    const ownImage = z2mImageName(model);
    const fallbackImage = z2mImageName(official.imageFallbackModel);
    const imageFile = availableImages.size === 0 || availableImages.has(ownImage) ? ownImage : availableImages.has(fallbackImage) ? fallbackImage : null;
    const slug = uniqueSlug(usedSlugs, `${vendor}-${model}`);
    if (!imageFile) failures.push({ model, reason: "Official Zigbee2MQTT product image is missing", vendor });
    const compatibility = [...new Set([
      "Zigbee2MQTT",
      ...normalizeCompatibilityCodes(record?.compatible ?? []),
    ])];
    const category = record ? normalizeCategory(record.category) : inferCategory(capabilities, official.description);
    const categoryValue = category.replace(/^./, (letter) => letter.toUpperCase());
    const capabilityValue = capabilities.length > 0 ? capabilities.slice(0, 4).join(", ") : "Support definition has no exposed fields";
    const identityFacts = [
      { label: "Manufacturer", value: vendor },
      { label: "Retail model", value: model },
      { label: "Description", value: String(official.description ?? "Zigbee device") },
      { label: "Device type", value: categoryValue },
      { label: "White-label model", value: official.isWhiteLabel ? "Yes" : "No" },
    ];
    const compatibilityFacts = compatibilitySection(compatibility);
    const featureFacts = [
      { label: "Exposed fields", value: capabilities.join(", ") || "No exposed fields published" },
      { label: "OTA updates", value: definition.ota ? "Listed" : "Not listed" },
      { label: "Zigbee model IDs", value: (definition.zigbeeModel ?? []).join(", ") || "Fingerprint matching used" },
    ];
    const sourceUrl = `https://www.zigbee2mqtt.io/devices/${z2mDeviceSlug(official.baseModel)}.html`;
    const recordUrl = record ? `https://zigbee.blakadder.com/${record.fileName.replace(/\.md$/i, ".html")}` : "";
    devices.push({
      battery_reporting: capabilities.includes("battery"),
      blakadder_url: recordUrl,
      card: {
        compatibility: { label: "Works with", status: "confirmed", value: compatibility.join(" + ") },
        facts: [{ label: "Type", value: categoryValue }, { label: "Capabilities", value: capabilityValue }],
      },
      category,
      date_added: z2mAddedAt[official.baseModel] ?? record?.dateAdded ?? null,
      detail_sections: [
        { facts: identityFacts, heading: "Exact device" },
        { facts: compatibilityFacts, heading: "Platform compatibility" },
        { facts: featureFacts, heading: "Exposed features" },
      ],
      fingerprints: serializeFingerprints(definition.fingerprint),
      image_path: `/zigbee-device-images/${slug}.webp`,
      image_quality: "official-zigbee2mqtt-product-image",
      image_source_file: imageFile ? `z2m:${imageFile}` : null,
      image_source_url: imageFile ? `https://github.com/Koenkk/zigbee2mqtt.io/blob/${z2mIoCommit}/public/images/devices/${encodeURIComponent(imageFile)}` : null,
      model,
      name: String(official.description ?? record?.title ?? model).trim(),
      ota: Boolean(definition.ota),
      provenance: [
        ...identityFacts.map((fact) => ({ field: fact.label, source: "Zigbee2MQTT", url: sourceUrl })),
        ...compatibilityFacts.map((fact) => fact.label === "Zigbee2MQTT" || !record
          ? { field: fact.label, source: "Zigbee2MQTT", url: sourceUrl }
          : { field: fact.label, source: "Blakadder Zigbee record", url: recordUrl }),
        ...featureFacts.map((fact) => ({ field: fact.label, source: "Zigbee2MQTT", url: sourceUrl })),
      ],
      slug,
      vendor,
      zha_reported_capabilities: [...new Set((record?.supports ?? []).map((value) => value.trim()).filter(Boolean))]
        .sort((left, right) => left.localeCompare(right)),
      zigbee2mqtt_capabilities: capabilities,
      zigbee2mqtt_url: sourceUrl,
      zigbee_models: [...new Set((definition.zigbeeModel ?? []).map((value) => String(value).trim()).filter(Boolean))]
        .sort((left, right) => left.localeCompare(right)),
    });
  }

  const communityGroups = groupBy(communityRecords.filter((record) => !matchedCommunity.has(record)), (record) => identityKey(record.vendor, record.model));
  for (const records of communityGroups.values()) {
    const record = records[0];
    const compatibility = normalizeCompatibilityCodes(records.flatMap((item) => item.compatible));
    const supports = [...new Set(records.flatMap((item) => item.supports))].sort((left, right) => left.localeCompare(right));
    const category = normalizeCategory(record.category);
    const categoryValue = category.replace(/^./, (letter) => letter.toUpperCase());
    const capabilityValue = supports.length > 0 ? supports.slice(0, 4).join(", ") : "Compatibility reported; feature list not published";
    const slug = uniqueSlug(usedSlugs, `${record.vendor}-${record.model}`);
    const communityImageFile = Object.hasOwn(blakadderImageFiles, record.fileName)
      ? blakadderImageFiles[record.fileName]
      : record.fileName.replace(/\.md$/i, ".webp");
    const supplementalImageFile = supplementalImageFiles[record.fileName] ?? null;
    if (!communityImageFile && !supplementalImageFile) failures.push({ model: record.model, reason: "Blakadder product image is missing", vendor: record.vendor });
    const recordUrl = `https://zigbee.blakadder.com/${record.fileName.replace(/\.md$/i, ".html")}`;
    const identityFacts = [{ label: "Manufacturer", value: record.vendor }, { label: "Retail model", value: record.model }, { label: "Description", value: record.title }, { label: "Device type", value: categoryValue }];
    const compatibilityFacts = compatibilitySection(compatibility);
    const featureFacts = [{ label: "Reported features", value: supports.join(", ") || "Feature list not published" }, { label: "Zigbee model IDs", value: records.flatMap((item) => item.zigbeeModels).join(", ") || "Not published" }];
    devices.push({
      battery_reporting: supports.some((value) => value.toLowerCase().includes("battery")),
      blakadder_url: recordUrl,
      card: {
        compatibility: {
          label: "Works with",
          status: compatibility.length > 0 ? "reported" : "limited",
          value: compatibility.join(" + ") || "No controller integration listed",
        },
        facts: [{ label: "Type", value: categoryValue }, { label: "Capabilities", value: capabilityValue }],
      },
      category,
      date_added: records.map((item) => item.dateAdded).filter(Boolean).sort().at(-1) ?? null,
      detail_sections: [{ facts: identityFacts, heading: "Exact device" }, { facts: compatibilityFacts, heading: "Platform compatibility" }, { facts: featureFacts, heading: "Reported features" }],
      fingerprints: [],
      image_path: `/zigbee-device-images/${slug}.webp`,
      image_quality: "community-product-image",
      image_source_file: communityImageFile ? `blakadder:${communityImageFile}` : supplementalImageFile ? `supplemental:${supplementalImageFile}` : null,
      image_source_url: communityImageFile
        ? `https://github.com/blakadder/zigbee/blob/${encodeURIComponent(String(blakadderCommit).trim())}/assets/images/devices/${encodeURIComponent(communityImageFile)}`
        : supplementalImageUrls[record.fileName] ?? null,
      model: record.model,
      name: record.title,
      ota: false,
      provenance: [...identityFacts, ...compatibilityFacts, ...featureFacts].map((fact) => ({ field: fact.label, source: "Blakadder Zigbee record", url: recordUrl })),
      slug,
      vendor: record.vendor,
      zha_reported_capabilities: supports,
      zigbee2mqtt_capabilities: [],
      zigbee2mqtt_url: compatibility.includes("Zigbee2MQTT") ? `https://www.zigbee2mqtt.io/supported-devices/?q=${encodeURIComponent(record.model)}` : "",
      zigbee_models: [...new Set(records.flatMap((item) => item.zigbeeModels))],
    });
  }

  devices.sort((left, right) =>
    left.vendor.localeCompare(right.vendor)
      || left.model.localeCompare(right.model)
      || left.slug.localeCompare(right.slug),
  );

  return {
    meta: {
      blakadder: {
        commit: blakadderCommit,
        license_urls: [
          "https://github.com/blakadder/zigbee/blob/master/LICENSE",
          "https://github.com/blakadder/zigbee/blob/master/LICENSE.md",
        ],
        source_url: "https://github.com/blakadder/zigbee",
      },
      device_count: devices.length,
      coverage: {
        blakadder_device_total: communityRecords.length,
        detail_total: devices.length,
        eligible_total: devices.length,
        excluded_total: coordinators.length,
        failures,
        image_total: devices.length - failures.length,
        missing_image_total: failures.length,
        overlap_total: overlapTotal,
        record_total: devices.length,
        source_total: officialRecords.length + validRecords.length,
        white_label_total: whiteLabelTotal,
        zigbee2mqtt_marketed_total: officialRecords.length,
      },
      excluded: { coordinators: coordinators.length },
      generated_at: generatedAt,
      matching_rule: "union of every Zigbee2MQTT marketed device and every non-coordinator Blakadder compatibility record; exact vendor/model matches share evidence",
      ready_for_catalog: true,
      ready_for_publication: failures.length === 0,
      source_revision: `zigbee2mqtt.io@${z2mIoCommit}; zigbee-herdsman-converters@${packageVersion}; blakadder/zigbee@${blakadderCommit}`,
      zigbee2mqtt: {
        license: "MIT",
        package: "zigbee-herdsman-converters",
        source_url: "https://github.com/Koenkk/zigbee-herdsman-converters",
        version: packageVersion,
        website_commit: z2mIoCommit,
      },
    },
    devices,
  };
}
