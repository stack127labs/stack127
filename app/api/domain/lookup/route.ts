/**
 * One registration lookup, used by the flagship page and by every tool that
 * shows a view of the same response: age, expiry, availability, registrant,
 * registrar, and the status code explainer.
 */

import {
  domainClientKey,
  domainErrorResponse,
  domainFailureResponse,
  domainJson,
  isSameOriginDomainRequest,
  readDomainJsonBody,
} from "@/lib/domain/api.ts";
import { lookupDomain } from "@/lib/domain/lookup.ts";
import { consumeDnsLookupLimit } from "@/lib/dns/rate-limit.ts";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isSameOriginDomainRequest(request)) {
    return domainErrorResponse(403, "cross_origin_request", "Domain lookups must come from the version127 site.");
  }

  let body: Record<string, unknown>;
  try {
    body = await readDomainJsonBody(request);
  } catch (error) {
    const tooLarge = error instanceof Error && error.message === "request_too_large";
    return domainErrorResponse(tooLarge ? 413 : 400, "invalid_request", "Send a small, valid lookup request.");
  }

  if (typeof body.name !== "string") return domainErrorResponse(400, "invalid_name", "Enter a domain name.");

  // The registrar hop is a second outbound request, so it costs more.
  const includeRegistrar = body.includeRegistrar !== false;
  const limit = consumeDnsLookupLimit(`domain-lookup:${domainClientKey(request)}`, includeRegistrar ? 2 : 1);
  if (!limit.allowed) {
    return domainErrorResponse(429, "rate_limited", "Too many lookups. Try again shortly.", {
      "retry-after": String(limit.retryAfterSeconds),
    });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25_000);
  request.signal.addEventListener("abort", () => controller.abort(), { once: true });

  try {
    const result = await lookupDomain(body.name, { signal: controller.signal, includeRegistrar });
    return domainJson(result, Math.min(limit.remainingRequests, limit.remainingUnits));
  } catch (error) {
    return domainFailureResponse(error, controller.signal.aborted);
  } finally {
    clearTimeout(timeout);
  }
}
