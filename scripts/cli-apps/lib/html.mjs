export function decodeEntities(text) {
  return String(text ?? "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, "/");
}

export function extractSitemapLocs(xml) {
  return [...String(xml ?? "").matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1]);
}

export function matchAllLinks(html, pattern) {
  return [...String(html ?? "").matchAll(pattern)].map((m) => m[1]);
}

/** Parse every JSON-LD block and return flattened @graph entries. */
export function extractJsonLd(html) {
  const blocks = [...String(html ?? "").matchAll(
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,
  )];
  const entries = [];

  for (const block of blocks) {
    try {
      const parsed = JSON.parse(block[1]);
      if (Array.isArray(parsed)) entries.push(...parsed);
      else if (parsed && Array.isArray(parsed["@graph"])) entries.push(...parsed["@graph"]);
      else if (parsed) entries.push(parsed);
    } catch {
      // Malformed JSON-LD is skipped; collectors fall back to HTML parsing.
    }
  }

  return entries;
}
