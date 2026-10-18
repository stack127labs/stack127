import { getDomain } from "tldts";
import { summarizeAdsTxt, homepageFacts } from "./enrichment-parsers.mjs";
import { PARSER_VERSION, parseAdsTxt } from "./ads-txt.mjs";
import { fetchAdsTxt, fetchDeclaredSubdomainAdsTxt, fetchHomepage } from "./fetch-policy.mjs";
import { MATCHER_VERSION, matchNetworks, needsHomepage } from "./matcher.mjs";
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

export async function verifyPublisher(publisher, networks, {
  fetchAdsTxt: fetchAds = fetchAdsTxt,
  fetchDeclaredSubdomainAdsTxt: fetchSubdomain = fetchDeclaredSubdomainAdsTxt,
  fetchHomepage: fetchPage = fetchHomepage,
} = {}) {
  const checkedAt = new Date().toISOString();
  const mayUseConditional = publisher.ads_txt_summary != null && publisher.last_check_evidence?.parser_version === PARSER_VERSION
    && publisher.last_check_evidence?.matcher_version === MATCHER_VERSION;
  let fetchResult = await fetchAds(publisher.normalized_domain, {
    etag: mayUseConditional ? publisher.ads_txt_etag : null,
    lastModified: mayUseConditional ? publisher.ads_txt_last_modified : null,
  });

  if (fetchResult.outcome !== "parsed") {
    if (fetchResult.outcome === "no_ads_txt") {
      const emptyParsed = parseAdsTxt("");
      const pageOnlyNetworks = networks.filter((network) => (network.program_signatures ?? [])
        .some((signature) => signature.kind === "html_substring" && signature.allow_without_ads_txt));
      if (needsHomepage(emptyParsed, pageOnlyNetworks, publisher.discovery_sources)) {
        const homepage = await fetchPage(publisher.normalized_domain).catch(() => null);
        const matches = gateReviewMatches({ matches: matchNetworks({
          parsed: emptyParsed,
          networks: pageOnlyNetworks,
          fetchEvidence: { ...fetchResult, checkedAt },
          homepage,
          discoverySources: publisher.discovery_sources,
        }), relationships: publisher.review_relationships, networks: pageOnlyNetworks,
          parsed: emptyParsed, fetchResult, homepage, checkedAt, discoverySources: publisher.discovery_sources });
        if (matches.confirmed.length || matches.review.length) {
          return {
            outcome: matches.confirmed.length ? "matched" : "no_ads_txt",
            checkedAt,
            matches,
            homepageFacts: homepage ? homepageFacts(homepage.html, homepage.finalUrl) : null,
            evidence: publicEvidence(fetchResult, emptyParsed, matches, checkedAt),
            etag: fetchResult.etag,
            lastModified: fetchResult.lastModified,
          };
        }
      }
    }
    const unchangedSlugs = fetchResult.outcome === "not_modified"
      ? publisher.last_check_evidence?.confirmed_networks ?? []
      : [];
    const unchangedNetworkIds = networks
      .filter((network) => unchangedSlugs.includes(network.slug))
      .map((network) => network.id);
    const evidence = publicEvidence(fetchResult, null, null, checkedAt);
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
    return {
      outcome: fetchResult.outcome,
      checkedAt,
      evidence,
      unchangedNetworkIds,
      etag: fetchResult.etag,
      lastModified: fetchResult.lastModified,
    };
  }

  let parsed = parseAdsTxt(fetchResult.text);
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
  }

  if (!parsed.sellers.length && !parsed.variables.length && parsed.errors.length) {
    fetchResult.reason = "no_valid_ads_txt_records";
    return {
      outcome: "invalid_ads_txt",
      checkedAt,
      evidence: publicEvidence(fetchResult, parsed, null, checkedAt),
      adsTxtSummary: summarizeAdsTxt(fetchResult.text),
      sha256: fetchResult.sha256,
      etag: fetchResult.etag,
      lastModified: fetchResult.lastModified,
    };
  }

  const homepage = needsHomepage(parsed, networks, publisher.discovery_sources)
    ? await fetchPage(publisher.normalized_domain).catch(() => null)
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
  const outcome = matches.confirmed.length ? "matched" : "no_match";
  return {
    outcome,
    checkedAt,
    matches,
    adsTxtSummary: summarizeAdsTxt(fetchResult.text),
    homepageFacts: homepage ? homepageFacts(homepage.html, homepage.finalUrl) : null,
    evidence: publicEvidence(fetchResult, parsed, matches, checkedAt),
    sha256: fetchResult.sha256,
    etag: fetchResult.etag,
    lastModified: fetchResult.lastModified,
  };
}
