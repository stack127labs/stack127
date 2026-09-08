const asinPattern = /^[A-Z0-9]{10}$/;

export function buildCreatorsApiSearchRequest(identity, options = {}) {
  const marketplace = options.marketplace ?? "www.amazon.com";
  const partnerTag = options.partnerTag ?? "stack127-20";
  return {
    itemCount: 10,
    itemPage: 1,
    keywords: `${String(identity.vendor ?? "").trim()} ${String(identity.model ?? "").trim()}`.trim(),
    marketplace,
    partnerTag,
    resources: ["itemInfo.byLineInfo", "itemInfo.externalIds", "itemInfo.title"],
    searchIndex: "All",
  };
}

function canonicalAmazonUrl(asin) {
  return `https://www.amazon.com/dp/${asin}`;
}

export function normalizeCreatorsApiSearchResponse(payload) {
  const searchResult = payload?.searchResult ?? {};
  const results = [];
  for (const item of searchResult.items ?? []) {
    const asin = String(item.asin ?? "").trim().toUpperCase();
    const title = String(item.itemInfo?.title?.displayValue ?? "").trim();
    const brand = String(item.itemInfo?.byLineInfo?.brand?.displayValue ?? "").trim();
    if (!asinPattern.test(asin) || !title) continue;
    results.push({
      asin,
      title: brand && !title.toLowerCase().includes(brand.toLowerCase()) ? `${brand} ${title}` : title,
      url: canonicalAmazonUrl(asin),
    });
  }
  return {
    results,
    search_url: typeof searchResult.searchURL === "string" ? searchResult.searchURL : null,
  };
}

export function tokenEndpointForVersion(version) {
  if (version === "3.1") return "https://api.amazon.com/auth/o2/token";
  if (version === "3.2") return "https://api.amazon.co.uk/auth/o2/token";
  if (version === "3.3") return "https://api.amazon.co.jp/auth/o2/token";
  throw new Error("AMAZON_CREATORS_API_VERSION must be 3.1, 3.2, or 3.3.");
}
