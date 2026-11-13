import { getDomain } from "tldts";
import { summarizeAdsTxt, homepageFacts } from "./enrichment-parsers.mjs";
import { PARSER_VERSION, parseAdsTxt } from "./ads-txt.mjs";
import { fetchAdsTxt, fetchDeclaredSubdomainAdsTxt, fetchHomepage, homepageChallenge } from "./fetch-policy.mjs";
import { MATCHER_VERSION, matchNetworks, needsHomepage, hasHomepageSignature } from "./matcher.mjs";
import { gateReviewMatches } from "./review-rules.mjs";

function publicEvidence(fetchResult, parsed, matches, checkedAt) {
  return {
    checked_url: fetchResult.checkedUrl ?? null,
    final_url: fetchResult.finalUrl ?? null,
    checked_at: checkedAt,
    http_status: fetchResult.httpStatus ?? null,
    content_type: fetchResult.contentType ?? null,
    redirects: fetchResult.redirects ?? 0,
    external_redirects: fetchResult.externalRedirects ?? 0,
    ads_txt_sha256: fetchResult.sha256 ?? null,
    parser_version: parsed?.parserVersion ?? null,
    matcher_version: MATCHER_VERSION,
    seller_records: parsed?.sellers.length ?? null,
    manager_domains: parsed?.managerDomains.map(({ value, country }) => ({ value, country: country ?? null })) ?? [],
    parse_errors: parsed?.errors.length ?? null,
    confirmed_networks: matches?.confirmed.map((match) => match.slug) ?? [],
    review_networks: matches?.review.map((match) => match.slug) ?? [],
    reason: fetchResult.reason ?? null,
  };
}

async function checkHomepage(domain, fetchPage) {
  try {
    const page = await fetchPage(domain);
    if (page?.outcome === "inconclusive") return { ...page, html: undefined };
    if (!page?.html?.trim()) return { ...page, outcome: "inconclusive", reason: page?.reason ?? "homepage_unavailable" };
    if (page.outcome === "fetched") return page; // The fetcher already checked challenges.
    if (homepageChallenge(page.html)) return { ...page, html: undefined, outcome: "inconclusive", reason: "challenge_page" };
    return { ...page, outcome: "fetched" };
  } catch (error) {
    return { outcome: "inconclusive", reason: error.cause?.code ?? error.message };
  }
}

function homepageResult(homepage, parsed, networks, publisher, matches, forceUnknown = false) {
  const positive = new Set(matches?.confirmed.map(match => String(match.networkId)) ?? []);
  const unknown = networks.filter(network => !positive.has(String(network.id))
    && (forceUnknown ? hasHomepageSignature(network)
      : parsed && homepage?.outcome !== "fetched" && needsHomepage(parsed, [network], publisher.discovery_sources)));
  return {
    inconclusiveNetworkIds: unknown.map(network => network.id),
    homepageEvidence: {
      outcome: homepage?.outcome ?? "not_needed", http_status: homepage?.httpStatus ?? null,
      final_url: homepage?.finalUrl ?? null, reason: homepage?.reason ?? null,
    },
    inconclusiveSlugs: unknown.map(network => network.slug),
  };
}

export async function verifyPublisher(publisher, networks, {
  fetchAdsTxt: fetchAds = fetchAdsTxt,
  fetchDeclaredSubdomainAdsTxt: fetchSubdomain = fetchDeclaredSubdomainAdsTxt,
  fetchHomepage: fetchPage = fetchHomepage,
} = {}) {
  const checkedAt = new Date().toISOString();
  // Cache the complete parse locally, never the truncated public preview. A 304
  // validates only this ads.txt representation; homepage evidence is fetched anew.
  const cache = publisher.last_check_evidence?.ads_txt_cache;
  const root = getDomain(publisher.normalized_domain, { allowPrivateDomains: true });
  // fetchAdsTxt always requests the root file. A declared subdomain's separate
  // representation must never supply validators or a cached parse for that URL.
  const rootCache = !cache?.checkedUrl || new URL(cache.checkedUrl).hostname === root;
  const reusable = rootCache && cache?.parsed?.parserVersion === PARSER_VERSION
    && Array.isArray(cache.parsed.sellers) && Array.isArray(cache.parsed.variables);
  let fetchResult = await fetchAds(publisher.normalized_domain, reusable ? {
    etag: cache.etag, lastModified: cache.lastModified,
  } : {});
  let cachedParse = null;
  if (fetchResult.outcome === "not_modified") {
    if (reusable) {
      cachedParse = cache.parsed;
      fetchResult = { ...fetchResult, outcome: "parsed", sha256: cache.sha256,
        checkedUrl: cache.checkedUrl, finalUrl: cache.finalUrl,
        etag: fetchResult.etag ?? cache.etag, lastModified: fetchResult.lastModified ?? cache.lastModified };
    } else fetchResult = await fetchAds(publisher.normalized_domain, {});
  }

  if (fetchResult.outcome !== "parsed") {
    if (fetchResult.outcome === "no_ads_txt") {
      const emptyParsed = parseAdsTxt("");
      const pageOnlyNetworks = networks.filter((network) => (network.program_signatures ?? [])
        .some((signature) => signature.kind === "html_substring" && signature.allow_without_ads_txt));
      if (needsHomepage(emptyParsed, pageOnlyNetworks, publisher.discovery_sources)) {
        const homepage = await checkHomepage(publisher.normalized_domain, fetchPage);
        const matches = gateReviewMatches({ matches: matchNetworks({
          parsed: emptyParsed,
          networks: pageOnlyNetworks,
          fetchEvidence: { ...fetchResult, checkedAt },
          homepage,
          discoverySources: publisher.discovery_sources,
        }), relationships: publisher.review_relationships, networks: pageOnlyNetworks,
          parsed: emptyParsed, fetchResult, homepage, checkedAt, discoverySources: publisher.discovery_sources });
        const home = homepageResult(homepage, emptyParsed, networks, publisher, matches);
        return {
          inconclusiveNetworkIds: home.inconclusiveNetworkIds,
          outcome: matches.confirmed.length ? "matched" : "no_ads_txt",
          checkedAt,
          matches,
          homepageFacts: homepage?.outcome === "fetched" ? homepageFacts(homepage.html, homepage.finalUrl) : null,
          evidence: { ...publicEvidence(fetchResult, emptyParsed, matches, checkedAt), homepage: home.homepageEvidence, inconclusive_networks: home.inconclusiveSlugs },
          etag: fetchResult.etag,
          lastModified: fetchResult.lastModified,
        };
      }
    }
    const unchangedSlugs = fetchResult.outcome === "not_modified"
      ? publisher.last_check_evidence?.confirmed_networks ?? []
      : [];
    const unchangedNetworkIds = networks
      .filter((network) => !hasHomepageSignature(network) && unchangedSlugs.includes(network.slug))
      .map((network) => network.id);
    const evidence = { ...publicEvidence(fetchResult, null, null, checkedAt), ...(reusable ? { ads_txt_cache: cache } : {}) };
    if (fetchResult.outcome === "not_modified") {
      evidence.ads_txt_sha256 = publisher.ads_txt_hash ?? publisher.last_check_evidence?.ads_txt_sha256 ?? null;
      evidence.parser_version = publisher.last_check_evidence?.parser_version ?? null;
      evidence.matcher_version = publisher.last_check_evidence?.matcher_version ?? MATCHER_VERSION;
      evidence.seller_records = publisher.last_check_evidence?.seller_records ?? null;
      evidence.manager_domains = publisher.last_check_evidence?.manager_domains ?? [];
      evidence.parse_errors = publisher.last_check_evidence?.parse_errors ?? null;
      evidence.confirmed_networks = unchangedSlugs;
      evidence.review_networks = publisher.last_check_evidence?.review_networks ?? [];
    }
    const home = homepageResult(null, null, networks, publisher, null, fetchResult.outcome === "not_modified");
    evidence.homepage = home.homepageEvidence;
    evidence.inconclusive_networks = home.inconclusiveSlugs;
    return {
      inconclusiveNetworkIds: home.inconclusiveNetworkIds,
      outcome: fetchResult.outcome,
      checkedAt,
      evidence,
      unchangedNetworkIds,
      etag: fetchResult.etag,
      lastModified: fetchResult.lastModified,
    };
  }

  let parsed = cachedParse ?? parseAdsTxt(fetchResult.text);
  const registrableDomain = getDomain(publisher.normalized_domain, { allowPrivateDomains: true });
  if (
    registrableDomain
    && publisher.normalized_domain !== registrableDomain
    && parsed.subdomains.some((entry) => entry.value === publisher.normalized_domain)
  ) {
    const subdomainResult = await fetchSubdomain(publisher.normalized_domain);
    if (subdomainResult.outcome !== "parsed") {
      return {
        outcome: subdomainResult.outcome,
        checkedAt,
        evidence: publicEvidence(subdomainResult, null, null, checkedAt),
        etag: subdomainResult.etag,
        lastModified: subdomainResult.lastModified,
      };
    }
    fetchResult = subdomainResult;
    parsed = parseAdsTxt(fetchResult.text);
    cachedParse = null;
  }

  if (!parsed.sellers.length && !parsed.variables.length && parsed.errors.length) {
    fetchResult.reason = "no_valid_ads_txt_records";
    return {
      outcome: "invalid_ads_txt",
      checkedAt,
      evidence: publicEvidence(fetchResult, parsed, null, checkedAt),
      adsTxtSummary: cachedParse ? null : summarizeAdsTxt(fetchResult.text),
      sha256: fetchResult.sha256,
      etag: fetchResult.etag,
      lastModified: fetchResult.lastModified,
    };
  }

  const homepage = needsHomepage(parsed, networks, publisher.discovery_sources)
    ? await checkHomepage(publisher.normalized_domain, fetchPage)
    : null;
  const evidenceInput = { ...fetchResult, checkedAt };
  const matches = gateReviewMatches({matches:matchNetworks({
    parsed,
    networks,
    fetchEvidence: evidenceInput,
    homepage,
    discoverySources: publisher.discovery_sources,
  }),relationships:publisher.review_relationships,networks,parsed,fetchResult,homepage,checkedAt,
    discoverySources:publisher.discovery_sources});
  const home = homepageResult(homepage, parsed, networks, publisher, matches);
  const outcome = matches.confirmed.length ? "matched" : "no_match";
  return {
    outcome,
    checkedAt,
    inconclusiveNetworkIds: home.inconclusiveNetworkIds,
    matches,
    adsTxtSummary: cachedParse ? null : summarizeAdsTxt(fetchResult.text),
    homepageFacts: homepage?.outcome === "fetched" ? homepageFacts(homepage.html, homepage.finalUrl) : null,
    evidence: { ...publicEvidence(fetchResult, parsed, matches, checkedAt), ads_txt_cache: {
      parsed, sha256: fetchResult.sha256, etag: fetchResult.etag, lastModified: fetchResult.lastModified,
      checkedUrl: fetchResult.checkedUrl, finalUrl: fetchResult.finalUrl,
    }, homepage: home.homepageEvidence, inconclusive_networks: home.inconclusiveSlugs },
    sha256: fetchResult.sha256,
    etag: fetchResult.etag,
    lastModified: fetchResult.lastModified,
  };
}
