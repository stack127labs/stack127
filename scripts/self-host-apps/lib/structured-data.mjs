function decodeHtmlEntities(value) {
  return String(value ?? "")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)));
}

export function parseJsonLd(html) {
  const values = [];
  const pattern = /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;

  while ((match = pattern.exec(html)) !== null) {
    const raw = match[1].replace(/^\s*<!--|-->\s*$/g, "").trim();
    if (!raw) continue;

    try {
      values.push(JSON.parse(raw));
      continue;
    } catch {
      // Some sites HTML-encode JSON-LD even though the script body should be raw JSON.
    }

    try {
      values.push(JSON.parse(decodeHtmlEntities(raw)));
    } catch {
      // Invalid structured data is ignored so one page cannot stop a discovery run.
    }
  }

  return values;
}

function graphNodes(value) {
  if (!value || typeof value !== "object") return [];
  if (Array.isArray(value)) return value.flatMap(graphNodes);
  if (Array.isArray(value["@graph"])) return [value, ...value["@graph"].flatMap(graphNodes)];
  return [value];
}

function hasType(value, expected) {
  const types = Array.isArray(value?.["@type"]) ? value["@type"] : [value?.["@type"]];
  return types.includes(expected);
}

export function jsonLdNodes(html, type) {
  return parseJsonLd(html)
    .flatMap(graphNodes)
    .filter((value) => hasType(value, type));
}

export function itemListEntries(html) {
  return jsonLdNodes(html, "ItemList").flatMap((list) => {
    if (!Array.isArray(list.itemListElement)) return [];

    return list.itemListElement.map((entry) => {
      const item = entry?.item && typeof entry.item === "object" ? entry.item : entry;
      return {
        name: item?.name ?? entry?.name ?? null,
        url: item?.url ?? entry?.url ?? null,
        description: item?.description ?? entry?.description ?? null,
        position: entry?.position ?? null,
        payload: entry,
      };
    });
  });
}

export function softwareApplication(html) {
  return jsonLdNodes(html, "SoftwareApplication")[0] ?? null;
}
