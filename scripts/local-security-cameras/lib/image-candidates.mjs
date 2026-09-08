function decodeEntities(value) {
  return String(value ?? "")
    .replaceAll("&amp;", "&")
    .replaceAll("&#038;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#039;", "'");
}

function absolute(value, pageUrl) {
  try {
    return new URL(decodeEntities(value), pageUrl).href;
  } catch {
    return null;
  }
}

function normalized(value) {
  return String(value ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function productObjects(value, result = []) {
  if (Array.isArray(value)) {
    for (const item of value) productObjects(item, result);
    return result;
  }
  if (!value || typeof value !== "object") return result;
  const types = Array.isArray(value["@type"]) ? value["@type"] : [value["@type"]];
  if (types.some((type) => String(type).toLowerCase() === "product")) result.push(value);
  for (const nested of Object.values(value)) productObjects(nested, result);
  return result;
}

function imageValues(value) {
  if (Array.isArray(value)) return value.flatMap(imageValues);
  if (typeof value === "string") return [value];
  if (value && typeof value === "object") return imageValues(value.url ?? value.contentUrl);
  return [];
}

export function extractProductImageCandidates(html, pageUrl, model) {
  const candidates = [];
  const metaPatterns = [
    /<meta[^>]+(?:property|name)=["']og:image["'][^>]+content=["']([^"']+)["']/gi,
    /<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']og:image["']/gi,
    /<meta[^>]+(?:property|name)=["']twitter:image(?::src)?["'][^>]+content=["']([^"']+)["']/gi,
    /<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']twitter:image(?::src)?["']/gi,
    /<link[^>]+rel=["']image_src["'][^>]+href=["']([^"']+)["']/gi,
    /<link[^>]+href=["']([^"']+)["'][^>]+rel=["']image_src["']/gi,
  ];
  for (const pattern of metaPatterns) {
    for (const match of String(html).matchAll(pattern)) candidates.push(match[1]);
  }

  const wantedModel = normalized(model);
  for (const match of String(html).matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const parsed = JSON.parse(decodeEntities(match[1]).trim());
      for (const product of productObjects(parsed)) {
        const identities = [product.model, product.sku, product.mpn, product.name].map(normalized).filter(Boolean);
        if (wantedModel && !identities.some((identity) => identity.includes(wantedModel) || wantedModel.includes(identity))) continue;
        candidates.push(...imageValues(product.image));
      }
    } catch {
      continue;
    }
  }

  return [...new Set(candidates.map((value) => absolute(value, pageUrl)).filter(Boolean))];
}

export function extractExactModelImageCandidates(html, pageUrl, model) {
  const wantedModel = normalized(model);
  if (wantedModel.length < 4) return [];
  const candidates = [];
  for (const match of String(html ?? "").matchAll(/<img\b[^>]*>/gi)) {
    const tag = match[0];
    const identity = normalized([
      tag.match(/\balt=["']([^"']*)["']/i)?.[1],
      tag.match(/\btitle=["']([^"']*)["']/i)?.[1],
      tag.match(/\bdata-product-name=["']([^"']*)["']/i)?.[1],
    ].filter(Boolean).join(" "));
    const values = [
      tag.match(/\bsrc=["']([^"']+)["']/i)?.[1],
      tag.match(/\bdata-src=["']([^"']+)["']/i)?.[1],
      tag.match(/\bdata-original=["']([^"']+)["']/i)?.[1],
      ...(tag.match(/\bsrcset=["']([^"']+)["']/i)?.[1] ?? "").split(",").map((item) => item.trim().split(/\s+/)[0]),
    ].filter(Boolean);
    for (const value of values) {
      if (!identity.includes(wantedModel) && !normalized(value).includes(wantedModel)) continue;
      candidates.push(value);
    }
  }
  return [...new Set(candidates.map((value) => absolute(value, pageUrl)).filter(Boolean))];
}
