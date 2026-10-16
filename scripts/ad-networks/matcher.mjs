function sourceNetworkSlugs(discoverySources) {
  const aliases = new Map([
    ["sovran", "sovrn"],
    ["snigel", "publisher-collective"],
    ["anymind", "anymind-anymanager"],
    ["teads-outbrain", "teads"],
    ["outbrain", "teads"],
  ]);
  const slugs = new Set();
  for (const source of discoverySources ?? []) {
    const key = source?.source_key;
    if (typeof key !== "string") continue;
    const candidate = key.split(":").at(-1);
    if (candidate) slugs.add(aliases.get(candidate) ?? candidate);
  }
  return slugs;
}

function evidenceForManager(variable, fetchEvidence, parserVersion) {
  return {
    checked_url: fetchEvidence.finalUrl ?? fetchEvidence.checkedUrl,
    requested_url: fetchEvidence.checkedUrl,
    checked_at: fetchEvidence.checkedAt,
    matched_signal: `MANAGERDOMAIN=${variable.value}${variable.country ? `,${variable.country}` : ""}`,
    manager_domain: variable.value,
    country: variable.country ?? null,
    ads_txt_sha256: fetchEvidence.sha256,
    parser_version: parserVersion,
    matcher_version: MATCHER_VERSION,
  };
}

export const MATCHER_VERSION = "ad-network-1.2.1";

function directAdsenseSellerIds(parsed, signature) {
  const pattern = new RegExp(signature.seller_id_pattern ?? "^pub-\\d{16}$", "i");
  return new Set(parsed.sellers
    .filter((seller) => seller.adSystem === (signature.ad_system ?? "google.com")
      && seller.relationship === (signature.seller_relationship ?? "DIRECT")
      && pattern.test(seller.sellerId))
    .map((seller) => seller.sellerId.toLowerCase()));
}

function pageAdsenseSellerIds(html) {
  const normalizedHtml = html.toLowerCase();
  if (!["google-adsense-account", "adsbygoogle", "data-ad-client"]
    .some((marker) => normalizedHtml.includes(marker))) return new Set();
  return new Set([...normalizedHtml.matchAll(/ca-pub-(\d{16})/g)]
    .map((match) => `pub-${match[1]}`));
}

function directAdSystems(parsed) {
  return new Set(parsed.sellers
    .filter((seller) => seller.relationship === "DIRECT")
    .map((seller) => seller.adSystem));
}

function signatureRequirementsMatch(signature, network, { managers, directSystems, sourceSlugs }) {
  const requiredManagers = signature.requires_manager_domains ?? [];
  if (requiredManagers.length && !requiredManagers.some((domain) => managers.has(domain))) return false;
  const requiredDirectSystems = signature.requires_direct_ad_system_domains ?? [];
  if (requiredDirectSystems.length && !requiredDirectSystems.some((domain) => directSystems.has(domain))) return false;
  if (signature.requires_discovery_source && !sourceSlugs.has(network.slug)) return false;
  return true;
}

export function needsHomepage(parsed, networks, discoverySources = []) {
  const managers = new Set(parsed.managerDomains.map((item) => item.value));
  const directSystems = directAdSystems(parsed);
  const sourceSlugs = sourceNetworkSlugs(discoverySources);
  return networks.some((network) => (network.program_signatures ?? []).some((signature) => {
    if (signature.kind === "adsense_account_match") {
      return directAdsenseSellerIds(parsed, signature).size > 0;
    }
    return signature.kind === "html_substring"
      && signatureRequirementsMatch(signature, network, { managers, directSystems, sourceSlugs });
  }));
}

export function matchNetworks({ parsed, networks, fetchEvidence, homepage, discoverySources }) {
  const confirmed = new Map();
  const review = new Map();
  const managers = new Set(parsed.managerDomains.map((item) => item.value));
  const directSystems = directAdSystems(parsed);
  const sourceSlugs = sourceNetworkSlugs(discoverySources);

  for (const variable of parsed.managerDomains) {
    for (const network of networks) {
      if (!(network.manager_domains ?? []).includes(variable.value)) continue;
      confirmed.set(network.id, {
        networkId: network.id,
        slug: network.slug,
        status: "confirmed",
        relationshipType: "primary_or_exclusive_manager",
        verificationMethod: "ads_txt_managerdomain",
        evidence: evidenceForManager(variable, fetchEvidence, parsed.parserVersion),
      });
    }
  }

  if (homepage?.html) {
    const normalizedHtml = homepage.html.toLowerCase();
    for (const network of networks) {
      if (confirmed.has(network.id)) continue;
      for (const signature of network.program_signatures ?? []) {
        if (signature.kind === "adsense_account_match") {
          const sellerIds = directAdsenseSellerIds(parsed, signature);
          const pageIds = pageAdsenseSellerIds(homepage.html);
          const matchedId = [...sellerIds].find((sellerId) => pageIds.has(sellerId));
          if (!matchedId) continue;
          confirmed.set(network.id, {
            networkId: network.id,
            slug: network.slug,
            status: "confirmed",
            relationshipType: signature.relationship_type ?? "active_network_use",
            verificationMethod: "ads_txt_and_adsense_account",
            evidence: {
              checked_url: fetchEvidence.finalUrl ?? fetchEvidence.checkedUrl,
              requested_url: fetchEvidence.checkedUrl,
              checked_at: fetchEvidence.checkedAt,
              matched_signal: `${signature.ad_system ?? "google.com"},${matchedId},${signature.seller_relationship ?? "DIRECT"} + ca-${matchedId}`,
              seller_id: matchedId,
              page_url: homepage.finalUrl,
              identity_source: signature.source_url ?? null,
              ads_txt_sha256: fetchEvidence.sha256,
              parser_version: parsed.parserVersion,
              matcher_version: MATCHER_VERSION,
            },
          });
          continue;
        }
        if (signature.kind !== "html_substring" || typeof signature.value !== "string") continue;
        if (!signatureRequirementsMatch(signature, network, { managers, directSystems, sourceSlugs })) continue;
        if (!normalizedHtml.includes(signature.value.toLowerCase())) continue;
        confirmed.set(network.id, {
          networkId: network.id,
          slug: network.slug,
          status: "confirmed",
          relationshipType: signature.relationship_type ?? "active_network_use",
          verificationMethod: signature.allow_without_ads_txt ? "page_signature" : "ads_txt_and_page_signature",
          evidence: {
            checked_url: fetchEvidence.finalUrl ?? fetchEvidence.checkedUrl,
            requested_url: fetchEvidence.checkedUrl,
            checked_at: fetchEvidence.checkedAt,
            matched_signal: `page:${signature.value}`,
            corroborating_manager_domains: [...managers],
            corroborating_direct_ad_systems: [...directSystems],
            corroborating_discovery_source: signature.requires_discovery_source ? network.slug : null,
            page_url: homepage.finalUrl,
            ads_txt_sha256: fetchEvidence.sha256,
            parser_version: parsed.parserVersion,
            matcher_version: MATCHER_VERSION,
          },
        });
      }
    }
  }

  const sellerSystems = new Set(parsed.sellers.map((seller) => seller.adSystem));
  for (const network of networks) {
    if (confirmed.has(network.id) || !sourceSlugs.has(network.slug)) continue;
    if ((network.program_signatures ?? []).some((signature) => signature.kind === "adsense_account_match")) continue;
    const matchedSystem = (network.ad_system_domains ?? []).find((domain) => sellerSystems.has(domain));
    if (!matchedSystem) continue;
    const seller = parsed.sellers.find((item) => item.adSystem === matchedSystem);
    review.set(network.id, {
      networkId: network.id,
      slug: network.slug,
      status: "needs_review",
      relationshipType: "unknown",
      verificationMethod: "discovery_hint_and_ads_txt_system",
      evidence: {
        checked_url: fetchEvidence.finalUrl ?? fetchEvidence.checkedUrl,
        requested_url: fetchEvidence.checkedUrl,
        checked_at: fetchEvidence.checkedAt,
        matched_signal: `${seller.adSystem},${seller.sellerId},${seller.relationship}`,
        reason: "An ad-system record authorizes selling but does not prove managed-network membership.",
        ads_txt_sha256: fetchEvidence.sha256,
        parser_version: parsed.parserVersion,
        matcher_version: MATCHER_VERSION,
      },
    });
  }

  return { confirmed: [...confirmed.values()], review: [...review.values()] };
}
