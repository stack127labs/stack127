import { buildUnifiedAliasChain } from "./alias-chain.ts";
import { normalizeDnsInput } from "./normalize-name.ts";
import { normalizeProviderResponse } from "./normalize-provider-response.ts";
import type {
  DnsFlags,
  DnsLookupRequest,
  DnsLookupResponse,
  DnsQueryResult,
  DnsRecordType,
  DnsResolver,
  DnsSelection,
  DnsWarning,
} from "./types.ts";
import { dnsRecordTypes } from "./types.ts";

export const COMMON_RECORD_TYPES: DnsRecordType[] = [
  "A",
  "AAAA",
  "CNAME",
  "MX",
  "NS",
  "TXT",
  "CAA",
  "SOA",
];

type LookupOptions = {
  fetchImpl?: typeof fetch;
  signal?: AbortSignal;
  timeoutMs?: number;
};

const emptyFlags: DnsFlags = {
  authenticatedData: null,
  checkingDisabled: null,
  recursionDesired: null,
  recursionAvailable: null,
  truncated: null,
};

export function isDnsResolver(value: unknown): value is DnsResolver {
  return value === "cloudflare" || value === "google";
}

export function normalizeSelection(value: unknown): DnsSelection {
  if (value === "common") return "common";
  const upper = typeof value === "string" ? value.toUpperCase() : "";
  if (dnsRecordTypes.includes(upper as DnsRecordType)) return upper as DnsRecordType;
  throw new Error("Choose a supported DNS record type.");
}

export function resolverLabel(resolver: DnsResolver) {
  return resolver === "cloudflare" ? "Cloudflare" : "Google Public DNS";
}

function providerUrl(resolver: DnsResolver, name: string, type: DnsRecordType) {
  const url = new URL(
    resolver === "cloudflare"
      ? "https://cloudflare-dns.com/dns-query"
      : "https://dns.google/resolve",
  );
  url.searchParams.set("name", name);
  url.searchParams.set("type", type);
  url.searchParams.set("do", "false");
  url.searchParams.set("cd", "false");
  return url;
}

function failedResult(name: string, type: string, outcome: "provider_error" | "timeout", code: string, message: string, rawResponse: unknown): DnsQueryResult {
  return {
    requestedName: name,
    requestedType: type,
    responseCode: null,
    responseCodeNumber: null,
    outcome,
    flags: { ...emptyFlags },
    questions: null,
    terminalRecords: [],
    aliasChain: [],
    authorityRecords: null,
    additionalRecords: null,
    comments: null,
    warnings: [],
    error: { code, message },
    rawResponse,
  };
}

async function fetchOne(
  name: string,
  type: DnsRecordType,
  resolver: DnsResolver,
  cnameAsTerminal: boolean,
  options: LookupOptions,
) {
  const fetchImpl = options.fetchImpl ?? fetch;
  const timeoutController = new AbortController();
  const timeout = setTimeout(() => timeoutController.abort(), options.timeoutMs ?? 3000);
  const onParentAbort = () => timeoutController.abort();
  options.signal?.addEventListener("abort", onParentAbort, { once: true });

  try {
    const response = await fetchImpl(providerUrl(resolver, name, type), {
      headers: { accept: "application/dns-json" },
      redirect: "error",
      signal: timeoutController.signal,
    });
    const contentType = response.headers.get("content-type") ?? "";
    const contentLength = Number(response.headers.get("content-length") ?? 0);
    if (Number.isFinite(contentLength) && contentLength > 262_144) {
      return failedResult(name, type, "provider_error", "provider_response_too_large", `${resolverLabel(resolver)} returned an oversized response.`, null);
    }
    const responseText = await response.text();
    if (responseText.length > 262_144) {
      return failedResult(name, type, "provider_error", "provider_response_too_large", `${resolverLabel(resolver)} returned an oversized response.`, null);
    }
    let rawResponse: unknown = { body: responseText.slice(0, 16_384) };
    if (contentType.includes("json")) {
      try {
        rawResponse = JSON.parse(responseText);
      } catch {
        return failedResult(name, type, "provider_error", "provider_invalid_json", `${resolverLabel(resolver)} returned invalid JSON.`, rawResponse);
      }
    }
    if (!response.ok) {
      const code = response.status === 429 ? "provider_rate_limited" : "provider_http_error";
      return failedResult(name, type, "provider_error", code, `${resolverLabel(resolver)} returned HTTP ${response.status}.`, rawResponse);
    }
    return normalizeProviderResponse({
      provider: resolver,
      requestedName: name,
      requestedType: type,
      rawResponse,
      cnameAsTerminal,
    });
  } catch (error) {
    const timedOut = timeoutController.signal.aborted;
    return failedResult(
      name,
      type,
      timedOut ? "timeout" : "provider_error",
      timedOut ? "provider_timeout" : "provider_unavailable",
      timedOut
        ? `${resolverLabel(resolver)} did not answer within the lookup timeout.`
        : `${resolverLabel(resolver)} could not be reached.`,
      error instanceof Error ? { name: error.name, message: error.message } : null,
    );
  } finally {
    clearTimeout(timeout);
    options.signal?.removeEventListener("abort", onParentAbort);
  }
}

export async function lookupDns(
  request: DnsLookupRequest,
  options: LookupOptions = {},
): Promise<DnsLookupResponse> {
  if (!isDnsResolver(request.resolver)) throw new Error("Choose Cloudflare or Google Public DNS.");
  const selection = normalizeSelection(request.selection);
  const normalized = normalizeDnsInput(request.name);
  const recordTypes = selection === "common" ? COMMON_RECORD_TYPES : [selection];
  const started = performance.now();

  const queryResults = await Promise.all(recordTypes.map((type) => fetchOne(
    normalized.normalizedName,
    type,
    request.resolver,
    selection === "CNAME",
    options,
  )));

  const aliasObservations = queryResults
    .filter((result) => result.aliasChain.length > 0)
    .map((result) => ({ requestedType: result.requestedType, aliasChain: result.aliasChain }));
  const unified = buildUnifiedAliasChain(normalized.normalizedName, aliasObservations);
  const failures = queryResults.filter((result) => result.outcome === "provider_error" || result.outcome === "timeout");
  const warnings: DnsWarning[] = [...unified.warnings];
  if (failures.length > 0 && failures.length < queryResults.length) {
    warnings.push({
      code: "partial_lookup_failure",
      message: `${failures.length} of ${queryResults.length} DNS queries could not be completed.`,
    });
  }

  return {
    query: {
      originalInput: normalized.originalInput,
      normalizedName: normalized.normalizedName,
      selection,
      resolver: request.resolver,
      dnssecRecordsRequested: false,
      checkingDisabled: false,
    },
    checkedAt: new Date().toISOString(),
    durationMs: Math.round(performance.now() - started),
    aliasChain: unified.aliasChain,
    aliasObservations,
    queryResults,
    warnings,
  };
}
