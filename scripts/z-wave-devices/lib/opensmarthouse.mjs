function normalized(value) {
  return String(value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function hex(value) {
  const text = String(value ?? "").trim().toLowerCase().replace(/^0x/, "");
  if (!/^[0-9a-f]+$/.test(text)) return null;
  return text.padStart(4, "0");
}

function manufacturerReference(value) {
  const parsed = Number.parseInt(String(value ?? "").replace(/^0x/i, ""), 16);
  return Number.isFinite(parsed) ? parsed : null;
}

function identityValues(device) {
  return [device.label, device.uuid, device.description].map(normalized).filter(Boolean);
}

function identityTokens(device) {
  return [device.label, device.uuid, device.description]
    .flatMap((value) => String(value ?? "").split(/[^a-z0-9]+/i))
    .map(normalized)
    .filter((value) => value.length >= 4);
}

function vendorMatches(vendor, device) {
  const left = normalized(vendor);
  const right = normalized(device.manufacturer_name);
  return Boolean(left && right && (left === right || left.includes(right) || right.includes(left)));
}

export function matchOpenSmartHouseDevice(fields, devices) {
  const manufacturerId = manufacturerReference(fields.get("Manufacturer ID"));
  const productType = hex(fields.get("Product Type ID"));
  const productId = hex(fields.get("Product ID"));
  if (manufacturerId !== null && productType && productId) {
    const protocolMatches = devices.filter((device) => {
      if (Number(device.manufacturer_ref) !== manufacturerId) return false;
      return String(device.device_ref ?? "")
        .split(",")
        .map((pair) => pair.trim().split(":"))
        .some(([type, id]) => hex(type) === productType && hex(id) === productId);
    });
    if (protocolMatches.length === 1) return { confidence: "exact-protocol-identifiers", device: protocolMatches[0] };
    if (protocolMatches.length > 1) {
      const identities = new Set(protocolMatches.map((device) => normalized(device.uuid || device.label)));
      if (identities.size === 1 && !identities.has("")) {
        return { confidence: "exact-protocol-identifiers-shared-product", device: protocolMatches[0] };
      }
    }
  }

  const model = normalized(fields.get("Identifier") ?? fields.get("Product Identifier"));
  if (!model || model.length < 3) return null;
  const exactModelMatches = devices.filter((device) => identityValues(device).some((value) => value === model));
  if (exactModelMatches.length === 1) return { confidence: "unique-exact-model", device: exactModelMatches[0] };

  const vendor = fields.get("Brand") ?? fields.get("Brand Owner");
  const vendorModelMatches = exactModelMatches.filter((device) => vendorMatches(vendor, device));
  if (vendorModelMatches.length === 1) return { confidence: "exact-model-and-vendor", device: vendorModelMatches[0] };

  const containedModelMatches = devices.filter((device) => vendorMatches(vendor, device)
    && identityTokens(device).some((value) => value.includes(model) || model.includes(value)));
  if (containedModelMatches.length === 1) return { confidence: "unique-model-token-and-vendor", device: containedModelMatches[0] };
  return null;
}

export function openSmartHouseCandidates(fields, devices) {
  const manufacturerId = manufacturerReference(fields.get("Manufacturer ID"));
  const model = normalized(fields.get("Identifier") ?? fields.get("Product Identifier"));
  const candidates = devices.filter((device) => {
    if (manufacturerId !== null && Number(device.manufacturer_ref) === manufacturerId) return true;
    return model.length >= 3 && identityValues(device).some((value) => value === model);
  });
  return [...new Map(candidates.map((device) => [device.id, device])).values()];
}

export function productImageDocument(documents) {
  const imageDocuments = documents.filter((document) => /\.(?:avif|gif|jpe?g|png|webp)$/i.test(document.file ?? ""));
  const labeled = imageDocuments.find((document) => /(?:product|device|manufacturer).*image|image.*(?:product|device|manufacturer)/i.test(document.label ?? ""));
  return labeled ?? (imageDocuments.length === 1 ? imageDocuments[0] : null);
}
