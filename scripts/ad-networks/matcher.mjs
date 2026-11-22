import { parse } from 'parse5';
import { parse as parseJavaScript } from 'acorn';

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

export const MATCHER_VERSION = "ad-network-1.5.2";

const javascriptTypes = new Set(['text/javascript', 'application/javascript',
  'text/ecmascript', 'application/ecmascript', 'application/x-javascript',
  'application/x-ecmascript', 'text/jscript', 'text/livescript', 'text/x-javascript',
  'text/x-ecmascript', ...Array.from({ length: 6 }, (_, i) => `text/javascript1.${i}`)]);

// Each rule lists only sources its loader actually activates. The source-code
// audit and measured site counts are in content_docs/ad-networks/maintenance.md.
const deferredSources = new Map([
  ['litespeed/javascript', { sources: ['data-src', 'src'] }],
  ...['rocketlazyloadscript', 'text/rocketlazyloadscript'].map(type => [type,
    { sources: ['data-rocket-src', 'src'], savedType: 'data-rocket-type' }]),
  ['pmdelayedscript', { sources: ['data-src', 'src'], savedType: 'data-perfmatters-type' }],
  ['pencilazyscript', { sources: ['src'], savedType: 'data-pencilazy-type' }],
  ['o/js-lzl', { sources: ['data-src', 'src'], savedType: 'data-type' }],
  ['starcache/delay', { sources: ['data-starcache-src', 'src'], savedType: 'data-starcache-type' }],
]);
const categories = new Set(['preferences', 'statistics', 'marketing']);
const activationSources = ['src', 'data-src', 'data-rocket-src', 'data-wpmeteor-src',
  'consent-original-src-_', 'data-starcache-src', 'data-md-delayed-src',
  'data-borlabs-script-blocker-src', 'data-cmplz-src'];
const value = (attributes, name) => attributes.get(name)?.trim() ?? '';

const isJavaScript = type => type === '' || type === 'module' || javascriptTypes.has(type.split(';')[0].trim());

function activation(type, attributes) {
  const held = (sources, savedType) => {
    const restored = savedType ? value(attributes, savedType).toLowerCase() : '';
    // Only this measured chain has an audited second activation step.
    const liteSpeedChain = normalized === 'pmdelayedscript' && restored === 'litespeed/javascript';
    if (savedType && !isJavaScript(restored) && !liteSpeedChain) return null;
    return { sources, held: true, module: savedType ? restored === 'module' : normalized.endsWith('-module') || normalized === 'module' };
  };
  const normalized = type.trim().toLowerCase();
  if (normalized === 'pmdelayedscript' && value(attributes, 'data-perfmatters-type').toLowerCase() !== 'litespeed/javascript') {
    return held(['src'], 'data-perfmatters-type');
  }
  if (deferredSources.has(normalized)) {
    const { sources, savedType } = deferredSources.get(normalized);
    return held(sources, savedType);
  }
  if (/^[a-f0-9]{24}-(?:text\/javascript|application\/javascript|module)$/.test(normalized)) return held(['src']);
  if (normalized === 'javascript/blocked' && value(attributes, 'data-wpmeteor-type')
    && isJavaScript(value(attributes, 'data-wpmeteor-type').toLowerCase())) return held(['data-wpmeteor-src'], 'data-wpmeteor-type');
  if (normalized === 'application/consent' && value(attributes, 'consent-required') && value(attributes, 'consent-original-type-_')
    && isJavaScript(value(attributes, 'consent-original-type-_').toLowerCase())) return held(['consent-original-src-_', 'src'], 'consent-original-type-_');
  if (normalized === 'didomi/javascript'
    && ['data-vendor', 'data-vendor-raw', 'data-purposes'].some(name => value(attributes, name))) return held(['src']);
  if (normalized === 'text/template' && value(attributes, 'data-borlabs-script-blocker-id')) {
    return held(['data-borlabs-script-blocker-src', 'src']);
  }
  if (normalized === 'text/plain') {
    if (value(attributes, 'data-md-delayed-src')) return held(['data-md-delayed-src']);
    if (value(attributes, 'class').split(/\s+/).some(token => /^optanon-category-C\d+(?:-C\d+)*$/.test(token))) return held(['src']);
    const cookiebot = value(attributes, 'data-cookieconsent').split(',').map(item => item.trim());
    if (cookiebot.length && cookiebot.every(item => ['preferences', 'statistics', 'marketing'].includes(item))) return held(['src']);
    // Complianz selects these exact categories; data-service alone is metadata,
    // not enough to identify a held script. Its external source is cmplz-src.
    if (categories.has(value(attributes, 'data-category'))) return held(['data-cmplz-src']);
    if (value(attributes, 'data-cookiescript') === 'accepted') return held(['src']);
    // Orest Bida CookieConsent v2, measured with advertising consent.
    if (['necessary', 'analytics', 'advertising', 'targeting'].includes(value(attributes, 'data-cookiecategory'))) return held(['data-src', 'src'], 'data-type');
    if (['necessary', 'functional', 'analytics', 'performance', 'advertisement', 'marketing'].includes(value(attributes, 'data-faz-category'))) return held(['src'], 'data-faz-original-type');
    return null;
  }
  if (isJavaScript(normalized)) {
    return value(attributes, 'data-type') === 'lazy' ? held(['data-src'])
      : { sources: ['src'], held: false, module: normalized === 'module' };
  }
  return null;
}

function inlinePayload(body, module = false) {
  const comments = [];
  try {
    // Parsing never executes page code or proves control flow. Strip comments
    // without damaging URLs/regexes; preserve all ordinary inline string matches.
    parseJavaScript(body, { ecmaVersion: 'latest', sourceType: module ? 'module' : 'script',
      onComment: (_, __, start, end) => comments.push([start, end]) });
    const chunks = [];
    let offset = 0;
    for (const [start, end] of comments) {
      chunks.push(body.slice(offset, start), ' ');
      offset = end;
    }
    chunks.push(body.slice(offset));
    return { text: chunks.join(''), parseFailed: false };
  } catch { return { text: body, parseFailed: true }; }
}
const escapeAttribute = text => text.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');

function pageSignals(html) {
  // HTML parsing keeps script-looking text in textarea/style/noscript inert.
  const pending = [parse(html, { scriptingEnabled: true, sourceCodeLocationInfo: true })];
  const scripts = [], accountElements = [], uncertainPayloads = [];
  let hasEthicalPublisher = false;
  const inert = new Set(['template','textarea','style','title','xmp','iframe','noembed','noframes','noscript','plaintext']);
  while (pending.length) {
    const node = pending.pop();
    if (inert.has(node.tagName)) continue;
    if (node.namespaceURI === 'http://www.w3.org/1999/xhtml') {
      const attributes = new Map(node.attrs.map(({ name, value }) => [name, value]));
      if (node.tagName === 'script') {
        const language = attributes.get('language')?.trim().toLowerCase();
        const type = attributes.has('type') ? attributes.get('type').trim()
          : language ? `text/${language}` : '';
        const loader = activation(type, attributes);
        if (loader && node.sourceCodeLocation?.endTag) {
          // Attribute-copy order differs between loaders. Never choose a winner
          // when known activation attributes (including plain src) disagree.
          const candidates = (loader.held ? activationSources : loader.sources)
            .filter(name => attributes.has(name)).map(name => value(attributes, name));
          if (new Set(candidates).size > 1) {
            uncertainPayloads.push(...candidates);
            if (candidates.some(source => /^(?:https?:)?\/\/pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js(?:[?#]|$)/i.test(source))) {
              uncertainPayloads.push(value(attributes, 'data-ad-client'));
            }
            continue;
          }
          // A source-backed script ignores its inline body. An unused attribute
          // (original-src, check-url, etc.) must never supply a match.
          const source = loader.sources.map(name => value(attributes, name)).find(Boolean);
          if (source) {
            scripts.push(`<script src="${escapeAttribute(source)}"></script>`);
            // AdSense consumes this one account option on its actual loader.
            if (/^(?:https?:)?\/\/pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js(?:[?#]|$)/i.test(source)) {
              accountElements.push(`adsbygoogle ${value(attributes, 'data-ad-client')}`);
            }
          } else {
            const body = inlinePayload(html.slice(node.sourceCodeLocation.startTag.endOffset,
              node.sourceCodeLocation.endTag.startOffset), loader.module);
            // Held code never confirms: its strings may be settings, examples,
            // or unreachable calls. Parse failures also cannot prove absence.
            if (loader.held || body.parseFailed) uncertainPayloads.push(body.text);
            else if (body.text) scripts.push(`<script>${body.text}</script>`);
          }
        }
      } else {
        if (attributes.get('data-ea-publisher')?.trim()) hasEthicalPublisher = true;
        const accountMeta = node.tagName === 'meta' && attributes.get('name')?.toLowerCase() === 'google-adsense-account';
        const accountSlot = node.tagName === 'ins' && attributes.has('data-ad-client')
          && attributes.get('class')?.split(/\s+/).includes('adsbygoogle');
        const location = node.sourceCodeLocation?.startTag ?? node.sourceCodeLocation;
        if ((accountMeta || accountSlot) && location) accountElements.push(`google-adsense-account ${value(attributes, accountMeta ? 'content' : 'data-ad-client')}`);
      }
    }
    for (let i = (node.childNodes?.length ?? 0) - 1; i >= 0; i--) pending.push(node.childNodes[i]);
  }
  return { scripts:scripts.join('\n'), accountMarkup:[...scripts,...accountElements].join('\n'), uncertainPayloads: uncertainPayloads.join('\n').toLowerCase(), hasEthicalPublisher };
}

export function scriptMarkup(html) { return pageSignals(html).scripts; }

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

function signatureRequirementsMatch(signature, network, { managers, directSystems, sellerSystems, sourceSlugs }) {
  const requiredManagers = signature.requires_manager_domains ?? [];
  if (requiredManagers.length && !requiredManagers.some((domain) => managers.has(domain))) return false;
  const requiredDirectSystems = signature.requires_direct_ad_system_domains ?? [];
  if (requiredDirectSystems.length && !requiredDirectSystems.some((domain) => directSystems.has(domain))) return false;
  if (signature.requires_discovery_source && !sourceSlugs.has(network.slug)) return false;
  // New unguarded tag patterns still need this network's own current seller system.
  // A RESELLER record can corroborate a distinctive tag; it never confirms by itself.
  if (!signature.allow_without_ads_txt && !requiredManagers.length && !requiredDirectSystems.length
    && (network.ad_system_domains??[]).length && !(network.ad_system_domains??[]).some(domain=>sellerSystems.has(domain))) return false;
  return true;
}

export function hasHomepageSignature(network) {
  return (network.program_signatures ?? []).some(({ kind }) =>
    kind === "adsense_account_match" || kind === "html_substring");
}

export function needsHomepage(parsed, networks, discoverySources = []) {
  const managers = new Set(parsed.managerDomains.map((item) => item.value));
  const directSystems = directAdSystems(parsed);
  const sourceSlugs = sourceNetworkSlugs(discoverySources);
  const sellerSystems = new Set(parsed.sellers.map(seller=>seller.adSystem));
  return networks.some((network) => (network.program_signatures ?? []).some((signature) => {
    if (signature.kind === "adsense_account_match") {
      return directAdsenseSellerIds(parsed, signature).size > 0;
    }
    return signature.kind === "html_substring"
      && signatureRequirementsMatch(signature, network, { managers, directSystems, sellerSystems, sourceSlugs });
  }));
}

export function matchNetworks({ parsed, networks, fetchEvidence, homepage, discoverySources }) {
  const confirmed = new Map();
  const review = new Map();
  const inconclusive = new Set();
  const confirm = match => {
    const previous = confirmed.get(match.networkId);
    match.signals = [...(previous?.signals ?? (previous ? [previous.evidence] : [])), match.evidence];
    confirmed.set(match.networkId, match);
  };
  const managers = new Set(parsed.managerDomains.map((item) => item.value));
  const directSystems = directAdSystems(parsed);
  const sourceSlugs = sourceNetworkSlugs(discoverySources);
  const sellerSystems = new Set(parsed.sellers.map(seller=>seller.adSystem));

  for (const variable of parsed.managerDomains) {
    for (const network of networks) {
      if (!(network.manager_domains ?? []).includes(variable.value)) continue;
      confirm({
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
    const signals = pageSignals(homepage.html);
    const normalizedScripts = signals.scripts.toLowerCase();
    for (const network of networks) {
      if (confirmed.get(network.id)?.verificationMethod === "ads_txt_managerdomain") continue;
      for (const signature of network.program_signatures ?? []) {
        if (signature.kind === "adsense_account_match") {
          const sellerIds = directAdsenseSellerIds(parsed, signature);
          const pageIds = pageAdsenseSellerIds(signals.accountMarkup);
          if ([...sellerIds].some(id => signals.uncertainPayloads.includes(`ca-${id}`))) inconclusive.add(network.id);
          for (const matchedId of sellerIds) {
            if (!pageIds.has(matchedId)) continue;
            confirm({
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
          }
          continue;
        }
        if (signature.kind !== "html_substring" || typeof signature.value !== "string") continue;
        if (!signatureRequirementsMatch(signature, network, { managers, directSystems, sellerSystems, sourceSlugs })) continue;
        if (signals.uncertainPayloads.includes(signature.value.toLowerCase())) inconclusive.add(network.id);
        const present = signature.allow_without_ads_txt && signature.value === 'data-ea-publisher='
          ? signals.hasEthicalPublisher : normalizedScripts.includes(signature.value.toLowerCase());
        if (!present) continue;
        confirm({
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

  return { confirmed: [...confirmed.values()], review: [...review.values()],
    inconclusiveNetworkIds: [...inconclusive].filter(id => !confirmed.has(id)) };
}
