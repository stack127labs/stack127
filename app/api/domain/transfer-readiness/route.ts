import {
  domainClientKey,
  domainErrorResponse,
  domainFailureResponse,
  domainJson,
  isSameOriginDomainRequest,
  readDomainJsonBody,
} from "@/lib/domain/api.ts";
import { lookupDomain } from "@/lib/domain/lookup.ts";
import { assessTransfer } from "@/lib/domain/transfer-readiness.ts";
import { consumeDnsLookupLimit } from "@/lib/dns/rate-limit.ts";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isSameOriginDomainRequest(request)) {
    return domainErrorResponse(403, "cross_origin_request", "Domain checks must come from the Version127 site.");
  }

  let body: Record<string, unknown>;
  try {
    body = await readDomainJsonBody(request);
  } catch (error) {
    const tooLarge = error instanceof Error && error.message === "request_too_large";
    return domainErrorResponse(tooLarge ? 413 : 400, "invalid_request", "Send a small, valid request.");
  }

  if (typeof body.name !== "string") return domainErrorResponse(400, "invalid_name", "Enter a domain name.");

  const limit = consumeDnsLookupLimit(`domain-transfer:${domainClientKey(request)}`, 2);
  if (!limit.allowed) {
    return domainErrorResponse(429, "rate_limited", "Too many checks. Try again shortly.", {
      "retry-after": String(limit.retryAfterSeconds),
    });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25_000);
  request.signal.addEventListener("abort", () => controller.abort(), { once: true });

  try {
    const registration = await lookupDomain(body.name, { signal: controller.signal });
    return domainJson(assessTransfer(registration), Math.min(limit.remainingRequests, limit.remainingUnits));
  } catch (error) {
    return domainFailureResponse(error, controller.signal.aborted);
  } finally {
    clearTimeout(timeout);
  }
}
