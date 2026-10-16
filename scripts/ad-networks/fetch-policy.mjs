import { createHash } from "node:crypto";
import dns from "node:dns/promises";
import { isIP } from "node:net";
import { getDomain } from "tldts";
import { sharedHostSlot } from './shared-fetch-slots.mjs';

export const USER_AGENT = "stack127bot/1.0 (+https://stack127.com/ad-networks)";
const TRANSIENT_STATUSES = new Set([408, 425, 429, 500, 502, 503, 504]);
const MAX_REDIRECTS = 5;
const MAX_EXTERNAL_REDIRECTS = 1;
const DEFAULT_BODY_LIMIT = 5 * 1024 * 1024;

function ipv4Number(address) {
  return address.split(".").reduce((value, part) => ((value << 8) | Number(part)) >>> 0, 0);
}

function inIpv4Range(address, network, bits) {
  const mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0;
  return (ipv4Number(address) & mask) === (ipv4Number(network) & mask);
}

export function isPublicAddress(address) {
  const version = isIP(address);
  if (version === 4) {
    const blocked = [
      ["0.0.0.0", 8], ["10.0.0.0", 8], ["100.64.0.0", 10],
      ["127.0.0.0", 8], ["169.254.0.0", 16], ["172.16.0.0", 12],
      ["192.0.0.0", 24], ["192.0.2.0", 24], ["192.168.0.0", 16],
      ["198.18.0.0", 15], ["198.51.100.0", 24], ["203.0.113.0", 24],
      ["224.0.0.0", 4], ["240.0.0.0", 4],
    ];
    return !blocked.some(([network, bits]) => inIpv4Range(address, network, bits));
  }
  if (version === 6) {
    const normalized = address.toLowerCase();
    if (normalized === "::" || normalized === "::1") return false;
    if (normalized.startsWith("fc") || normalized.startsWith("fd") || normalized.startsWith("fe8") || normalized.startsWith("fe9") || normalized.startsWith("fea") || normalized.startsWith("feb")) return false;
    if (normalized.startsWith("2001:db8:")) return false;
    if (normalized.startsWith("::ffff:")) {
      const embedded = normalized.slice(7);
      return isIP(embedded) === 4 && isPublicAddress(embedded);
    }
    return true;
  }
  return false;
}

const resolver = new dns.Resolver({ timeout: 3000, tries: 1 });
// c-ares avoids filling libuv's shared getaddrinfo pool with slow/dead domains.
async function publicLookup(hostname) {
  const answers = await Promise.allSettled([resolver.resolve4(hostname), resolver.resolve6(hostname)]);
  const addresses = answers.flatMap((answer, index) => answer.status === 'fulfilled'
    ? answer.value.map(address => ({ address, family: index === 0 ? 4 : 6 })) : []);
  if (!addresses.length) throw new Error('unresolved_target');
  return addresses;
}
export async function assertPublicUrl(value, lookup = publicLookup) {
  const url = value instanceof URL ? value : new URL(value);
  if (!new Set(["http:", "https:"]).has(url.protocol)) throw new Error("unsupported_protocol");
  if (url.username || url.password) throw new Error("url_credentials_not_allowed");
  if (url.port && !new Set(["80", "443"]).has(url.port)) throw new Error("nonstandard_port_not_allowed");
  const hostname = url.hostname.replace(/\.$/, "").toLowerCase();
  if (!hostname || hostname === "localhost" || hostname.endsWith(".localhost") || hostname.endsWith(".local")) {
    throw new Error("private_hostname_not_allowed");
  }
  if (isIP(hostname)) {
    if (!isPublicAddress(hostname)) throw new Error("private_address_not_allowed");
    return url;
  }
  const addresses = await lookup(hostname, { all: true, verbatim: true });
  if (!addresses.length || addresses.some((entry) => !isPublicAddress(entry.address))) {
    throw new Error("private_or_unresolved_target");
  }
  return url;
}

async function sleep(milliseconds) {
  await new Promise((resolve) => setTimeout(resolve, milliseconds));
}

// Serialize request starts per registrable host, including redirects and retries.
// Slots expire after the request completes; a slow host cannot hold up other hosts.
const hostSlots = new Map();
async function requestOnce(url, options, dependencies) {
  const host = getDomain(url.hostname, { allowPrivateDomains: true }) ?? url.hostname;
  const previous = hostSlots.get(host) ?? Promise.resolve();
  let unlock, sharedUnlock, released = false;
  const slot = new Promise(resolve => { unlock = resolve; });
  hostSlots.set(host, slot);
  const release = () => {
    if (released) return; released = true;
    try {sharedUnlock?.();}
    catch(error){console.error(`Shared fetch lease release failed for ${host}: ${error.message}; its bounded lease will expire.`);}
    finally {setTimeout(() => { unlock(); if (hostSlots.get(host) === slot) hostSlots.delete(host); }, 1000);}
  };
  await previous;
  try {
    sharedUnlock=await dependencies.sharedHostSlot(host,{leaseMs:2*(options.timeoutMs??15000)+60000});
    const response = await requestPublic(url, options, dependencies);
    if (!response.body) { release(); return response; }
    const reader = response.body.getReader();
    const body = new ReadableStream({
      async pull(controller) {
        try {
          const { done, value } = await reader.read();
          if (done) { controller.close(); release(); } else controller.enqueue(value);
        } catch (error) { controller.error(error); release(); }
      },
      async cancel(reason) { try { await reader.cancel(reason); } finally { release(); } },
    });
    return new Response(body, { status: response.status, statusText: response.statusText, headers: response.headers });
  } catch (error) { release(); throw error; }
}
async function requestPublic(url, options, dependencies) {
  await validateTarget(url, options, dependencies);
  return dependencies.fetch(url, {
    method: options.method ?? "GET",
    redirect: "manual",
    headers: { "User-Agent": USER_AGENT, ...options.headers },
    signal: AbortSignal.timeout(options.timeoutMs ?? 15_000),
  });
}

async function validateTarget(url, options, dependencies) {
  let timer;
  try {
    await Promise.race([assertPublicUrl(url, dependencies.lookup), new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error('dns_timeout')), options.timeoutMs ?? 15000);
    })]);
  } finally { clearTimeout(timer); }
}

export async function safeFetch(value, options = {}, dependencies = {}) {
  const runtime = { fetch: dependencies.fetch ?? fetch, lookup: dependencies.lookup ?? publicLookup,
    sharedHostSlot:dependencies.sharedHostSlot??sharedHostSlot };
  const original = new URL(value);
  const originalRoot = getDomain(original.hostname, { allowPrivateDomains: true }) ?? original.hostname;
  let url = original;
  let redirects = 0;
  let externalRedirects = 0;

  while (true) {
    // Hooks can make their own requests (for example robots.txt). Reject unsafe
    // redirect destinations before a hook can contact their origin.
    if (options.beforeRequest) {
      await validateTarget(url, options, runtime);
      await options.beforeRequest(url, { redirects });
    }
    let response;
    for (let attempt = 0; attempt < (options.attempts ?? 3); attempt += 1) {
      try {
        response = await requestOnce(url, options, runtime);
      } catch (error) {
        if (attempt + 1 >= (options.attempts ?? 3)) throw error;
        await sleep(Math.min(1000 * (2 ** attempt), 5000));
        continue;
      }
      if (!TRANSIENT_STATUSES.has(response.status) || attempt + 1 >= (options.attempts ?? 3)) break;
      const retryAfter = Number(response.headers.get("retry-after"));
      await response.body?.cancel();
      await sleep(Number.isFinite(retryAfter) && retryAfter > 0
        ? Math.min(retryAfter * 1000, 30_000)
        : Math.min(1000 * (2 ** attempt), 5000));
    }

    if (![301, 302, 303, 307, 308].includes(response.status)) {
      return { response, finalUrl: url.toString(), redirects, externalRedirects };
    }
    await response.body?.cancel();
    if (++redirects > (options.maxRedirects ?? MAX_REDIRECTS)) throw new Error("too_many_redirects");
    const location = response.headers.get("location");
    if (!location) throw new Error("redirect_without_location");
    const next = new URL(location, url);
    const nextRoot = getDomain(next.hostname, { allowPrivateDomains: true }) ?? next.hostname;
    if (nextRoot !== originalRoot && ++externalRedirects > MAX_EXTERNAL_REDIRECTS) {
      throw new Error("too_many_external_redirects");
    }
    url = next;
  }
}

export async function readLimitedText(response, limit = DEFAULT_BODY_LIMIT) {
  if (!response.body) return "";
  const reader = response.body.getReader();
  const chunks = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > limit) {
      await reader.cancel();
      throw new Error("response_body_too_large");
    }
    chunks.push(value);
  }
  const body = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder("utf-8", { fatal: false }).decode(body);
}

async function fetchAdsUrl(target, conditional, dependencies) {
  const headers = { Accept: "text/plain" };
  if (conditional?.etag) headers["If-None-Match"] = conditional.etag;
  if (conditional?.lastModified) headers["If-Modified-Since"] = conditional.lastModified;
  const request = await safeFetch(target, {
    headers,
    timeoutMs: 15_000,
  }, dependencies);
  const { response } = request;
  const base = {
    checkedUrl: target.toString(),
    finalUrl: request.finalUrl,
    redirects: request.redirects,
    externalRedirects: request.externalRedirects,
    httpStatus: response.status,
    etag: response.headers.get("etag"),
    lastModified: response.headers.get("last-modified"),
    contentType: response.headers.get("content-type"),
  };
  if (response.status === 304) return { ...base, outcome: "not_modified" };
  if (response.status === 404 || response.status === 410) { await response.body?.cancel(); return { ...base, outcome: "no_ads_txt" }; }
  if (!response.ok) {
    await response.body?.cancel();
    return {
      ...base,
      outcome: TRANSIENT_STATUSES.has(response.status) || response.status === 401 || response.status === 403
        ? "temporary_error"
        : "invalid_ads_txt",
    };
  }
  if (!/^text\/plain(?:\s*;|$)/i.test(base.contentType ?? "")) {
    await response.body?.cancel();
    return { ...base, outcome: "invalid_ads_txt", reason: "content_type" };
  }
  const text = await readLimitedText(response);
  if (/^\s*<(?:!doctype\s+html|html|head|body)\b/i.test(text)) {
    return { ...base, outcome: "invalid_ads_txt", reason: "html_body" };
  }
  return {
    ...base,
    outcome: "parsed",
    text,
    sha256: createHash("sha256").update(text).digest("hex"),
  };
}

export async function fetchDeclaredSubdomainAdsTxt(domain, conditional = {}, dependencies = {}) {
  try {
    return await fetchAdsUrl(new URL(`https://${domain}/ads.txt`), conditional, dependencies);
  } catch (error) {
    return { outcome: "temporary_error", reason: error.message, checkedUrl: `https://${domain}/ads.txt` };
  }
}

export async function fetchAdsTxt(domain, conditional = {}, dependencies = {}) {
  const root = getDomain(domain, { allowPrivateDomains: true });
  if (!root) return { outcome: "invalid_domain", reason: "no_registrable_domain" };
  const hostname = domain.toLowerCase();
  let httpsResult;
  try {
    httpsResult = await fetchAdsUrl(new URL(`https://${root}/ads.txt`), conditional, dependencies);
  } catch (error) {
    try {
      const fallback = await fetchAdsUrl(new URL(`http://${root}/ads.txt`), conditional, dependencies);
      return { ...fallback, transportFallback: true, httpsError: error.message };
    } catch (fallbackError) {
      return { outcome: "temporary_error", reason: fallbackError.message, httpsError: error.message };
    }
  }
  if (hostname === root || httpsResult.outcome !== "parsed") return httpsResult;
  return { ...httpsResult, candidateHostname: hostname, registrableDomain: root };
}

export async function fetchHomepage(domain, dependencies = {}) {
  const root = getDomain(domain, { allowPrivateDomains: true });
  if (!root) return null;
  const target = new URL(`https://${domain}/`);
  const { response, finalUrl } = await safeFetch(target, {
    headers: { Accept: "text/html,application/xhtml+xml" },
    timeoutMs: 15_000,
  }, dependencies);
  if (!response.ok || !/^text\/html(?:\s*;|$)/i.test(response.headers.get("content-type") ?? "")) { await response.body?.cancel(); return null; }
  return { html: await readLimitedText(response, 2 * 1024 * 1024), finalUrl };
}
