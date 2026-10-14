/**
 * The RDAP HTTP client.
 *
 * Availability is decided by HTTP status, never by the response body. Bodies are
 * not consistent between registries: Verisign returns 404 with a completely empty
 * body, while PIR and CentralNic return 404 with a full RDAP error object. Any
 * parser that requires an error object breaks on .com.
 */

import { rdapServiceForTld, whoisServiceForTld, type TldCoverage } from "./bootstrap.ts";
import { readCachedRdap, writeCachedRdap } from "./cache.ts";
import { acquireEndpointSlot, reportEndpointResult } from "./throttle.ts";
import type { RdapFetch, RdapFetchStatus, RdapSource } from "./types.ts";
import { fetchWhois } from "./whois.ts";

const USER_AGENT = "Stack127-domain-tools/1.0 (+https://stack127.com/domain-tools)";
const MAX_RESPONSE_BYTES = 1_000_000;
const DEFAULT_TIMEOUT_MS = 12_000;

function statusFromHttp(httpStatus: number): RdapFetchStatus {
  if (httpStatus === 200) return "registered";
  if (httpStatus === 404) return "not_registered";
  if (httpStatus === 429) return "rate_limited";
  if (httpStatus === 403) return "blocked";
  return "registry_error";
}

async function readBounded(response: Response): Promise<{ body: unknown; raw: string }> {
  const reader = response.body?.getReader();
  if (!reader) return { body: null, raw: "" };
  const chunks: Uint8Array[] = [];
  let length = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    length += value.byteLength;
    if (length > MAX_RESPONSE_BYTES) {
      await reader.cancel();
      throw new Error("oversized_response");
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  const raw = new TextDecoder().decode(bytes);
  if (!raw.trim()) return { body: null, raw: "" };
  try {
    return { body: JSON.parse(raw), raw };
  } catch {
    // A 404 with an unparseable or empty body is normal and still means the name
    // is not in the registry. Only surface the parse failure on a 200.
    return { body: null, raw };
  }
}

export type FetchOptions = {
  signal?: AbortSignal;
  timeoutMs?: number;
  /** Skip the cache entirely. Used by the contract tests. */
  bypassCache?: boolean;
};

async function fetchRdapUrl(url: string, source: RdapSource, options: FetchOptions = {}, tld?: string): Promise<RdapFetch> {
  const now = new Date().toISOString();

  if (!options.bypassCache) {
    const cached = await readCachedRdap(url, source);
    if (cached) return { ...cached, fromCache: true };
  }

  const slot = acquireEndpointSlot(url, Date.now(), tld);
  if (!slot.allowed) {
    return {
      status: "rate_limited",
      httpStatus: null,
      url,
      source,
      protocol: "rdap",
      retryAfterSeconds: slot.retryAfterSeconds,
      body: null,
      error:
        slot.reason === "circuit_open"
          ? "This registry recently refused our requests, so we have paused contacting it."
          : "We are contacting this registry too often right now.",
      fetchedAt: now,
      fromCache: false,
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? DEFAULT_TIMEOUT_MS);
  const abort = () => controller.abort();
  options.signal?.addEventListener("abort", abort, { once: true });
  if (options.signal?.aborted) controller.abort();

  try {
    const response = await fetch(url, {
      headers: { accept: "application/rdap+json, application/json", "user-agent": USER_AGENT },
      redirect: "follow",
      signal: controller.signal,
    });
    reportEndpointResult(url, response.status, Date.now(), response.headers.get("retry-after"));
    const { body } = await readBounded(response);
    let status = statusFromHttp(response.status);
    // A successful HTTP response is not necessarily a domain record (HTML, error
    // objects and redirects to generic landing pages must remain non-answers).
    if (status === "registered" && (!body || typeof body !== "object" ||
      !("objectClassName" in body) || !(tld ? ["domain"] : ["domain", "ip network", "autnum"]).includes(String(body.objectClassName)))) {
      status = "registry_error";
    }
    const result: RdapFetch = {
      status,
      httpStatus: response.status,
      url,
      source,
      protocol: "rdap",
      body,
      error: response.status === 200 && status === "registry_error" ? "The registry returned a response we could not read." : null,
      fetchedAt: now,
      fromCache: false,
    };
    // Never cache a throttle or a block as if it were an answer.
    if (!options.bypassCache && (status === "registered" || status === "not_registered")) await writeCachedRdap(url, result);
    return result;
  } catch (error) {
    const aborted = controller.signal.aborted;
    reportEndpointResult(url, null);
    return {
      status: aborted ? "timeout" : "registry_error",
      httpStatus: null,
      url,
      source,
      protocol: "rdap",
      body: null,
      error: aborted
        ? "The registry did not answer in time."
        : error instanceof Error && error.message === "oversized_response"
          ? "The registry sent a response that was too large to read."
          : "We could not reach the registry.",
      fetchedAt: now,
      fromCache: false,
    };
  } finally {
    clearTimeout(timeout);
    options.signal?.removeEventListener("abort", abort);
  }
}

export function registryUrlFor(coverage: TldCoverage, domain: string) {
  if (!coverage.url || coverage.source === "whois") return null;
  return `${coverage.url}domain/${encodeURIComponent(domain)}`;
}

/** Query the registry that operates this TLD. */
export async function fetchRegistry(domain: string, tld: string, options?: FetchOptions) {
  const coverage = rdapServiceForTld(tld);
  const whois = whoisServiceForTld(tld);
  if (coverage.source === "whois" && whois) return { coverage, fetch: await fetchWhois(domain, tld, whois, options) };
  const url = registryUrlFor(coverage, domain);
  if (!url) {
    const fetchResult: RdapFetch = {
      status: "no_service",
      httpStatus: null,
      url: null,
      source: "registry",
      body: null,
      error: `We do not know of a verified registration service for .${coverage.tld}.`,
      fetchedAt: new Date().toISOString(),
      fromCache: false,
    };
    return { coverage, fetch: fetchResult };
  }
  return { coverage, fetch: await fetchRdapUrl(url, "registry", options, tld) };
}

/**
 * Follow the registry's rel="related" link to the registrar's own RDAP service.
 * Optional, slower, and less reliable than the registry, so a failure here must
 * degrade the page quietly rather than fail the lookup.
 */
export function registrarUrlFrom(registryBody: unknown): string | null {
  if (!registryBody || typeof registryBody !== "object") return null;
  const links = (registryBody as { links?: unknown }).links;
  if (!Array.isArray(links)) return null;
  for (const link of links) {
    if (!link || typeof link !== "object") continue;
    const { rel, href, type } = link as { rel?: unknown; href?: unknown; type?: unknown };
    if (rel !== "related" || typeof href !== "string") continue;
    if (typeof type === "string" && !type.includes("rdap")) continue;
    if (!href.startsWith("https://")) continue;
    return href;
  }
  return null;
}

export async function fetchRegistrar(url: string, options?: FetchOptions, tld?: string) {
  return fetchRdapUrl(url, "registrar", { ...options, timeoutMs: options?.timeoutMs ?? 8_000 }, tld);
}

/** IP and ASN objects use the same client but a different bootstrap. Exposed for reuse. */
export async function fetchRdapObject(url: string, source: RdapSource, options?: FetchOptions) {
  return fetchRdapUrl(url, source, options);
}
