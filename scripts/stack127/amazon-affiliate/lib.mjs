const asinPattern = /^[A-Z0-9]{10}$/;

function normalizedWords(value) {
  return String(value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

function compact(value) {
  return normalizedWords(value).join("");
}

function amazonUsAsin(value) {
  try {
    const url = new URL(String(value).trim());
    const host = url.hostname.toLowerCase();
    if (url.protocol !== "https:" || (host !== "amazon.com" && !host.endsWith(".amazon.com"))) return null;
    const match = url.pathname.match(/\/(?:dp|gp\/product)\/([A-Za-z0-9]{10})(?:[/?]|$)/);
    const asin = match?.[1]?.toUpperCase() ?? "";
    return asinPattern.test(asin) ? asin : null;
  } catch {
    return null;
  }
}

function canonicalAmazonUrl(asin) {
  return `https://www.amazon.com/dp/${asin}`;
}

export function extractAmazonCandidatesFromFrontmatter(text) {
  const block = String(text).match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? "";
  const unique = new Map();
  for (const line of block.split(/\r?\n/)) {
    const match = line.match(/^link\d*:\s*['"]?([^'"\s]+)['"]?\s*$/i);
    if (!match) continue;
    const asin = amazonUsAsin(match[1]);
    if (asin) unique.set(asin, { asin, url: canonicalAmazonUrl(asin) });
  }
  return [...unique.values()];
}

export function extractAmazonMarkdownProduct(markdown, expectedAsin) {
  const asin = String(expectedAsin ?? "").trim().toUpperCase();
  if (!asinPattern.test(asin)) return null;
  const source = String(markdown ?? "");
  const sourceAsin = source.match(/^URL Source:\s*https?:\/\/(?:www\.)?amazon\.com\/(?:[^\s]*\/)?(?:dp|gp\/product)\/([A-Za-z0-9]{10})(?:[/?\s]|$)/mi)?.[1]?.toUpperCase();
  const rawTitle = source.match(/^Title:\s*(.+)$/mi)?.[1]?.trim() ?? "";
  const title = rawTitle
    .replace(/^Amazon\.com:\s*/i, "")
    .replace(/\s+(?:-|:)\s+Amazon\.com\s*$/i, "")
    .replace(/\s*:\s*(?:Electronics|Tools & Home Improvement|Camera & Photo|Home & Kitchen)\s*$/i, "")
    .trim();
  if (sourceAsin !== asin || !title || /page not found|robot check|sorry/i.test(title)) return null;
  return { asin, title, url: canonicalAmazonUrl(asin) };
}

export function scoreAmazonCandidate(identity, candidate) {
  const searchable = `${candidate.title} ${decodeURIComponent(candidate.url)}`;
  const model = compact(identity.model);
  const exactModel = model.length >= 4 && compact(searchable).includes(model);
  const ignoredVendorWords = new Set(["and", "company", "corporation", "inc", "limited", "llc", "ltd", "technology", "technologies"]);
  const vendorWords = normalizedWords(identity.vendor).filter((word) => word.length >= 3 && !ignoredVendorWords.has(word));
  const titleWords = new Set(normalizedWords(searchable));
  const vendorMatch = vendorWords.some((word) => titleWords.has(word));
  const ignoredNameWords = new Set(["amazon", "compatible", "device", "home", "matter", "plus", "smart", "wireless", "with", "zigbee"]);
  const nameWords = [...new Set(normalizedWords(identity.name).filter((word) => word.length >= 4 && !ignoredNameWords.has(word)))];
  const nameOverlap = nameWords.filter((word) => titleWords.has(word)).length;
  const score = (exactModel ? 4 : 0) + (vendorMatch ? 2 : 0) + Math.min(1, nameOverlap);
  return { exact_model: exactModel, name_overlap: nameOverlap, score, vendor_match: vendorMatch };
}
