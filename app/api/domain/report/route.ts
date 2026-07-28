import {
  domainClientKey,
  domainErrorResponse,
  domainFailureResponse,
  domainJson,
  isSameOriginDomainRequest,
  readDomainJsonBody,
} from "@/lib/domain/api.ts";
import { buildDomainReport } from "@/lib/domain/report.ts";
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

  // This runs both engines, so it is the most expensive page here.
  const limit = consumeDnsLookupLimit(`domain-report:${domainClientKey(request)}`, 11);
  if (!limit.allowed) {
    return domainErrorResponse(429, "rate_limited", "Too many reports. Try again shortly.", {
      "retry-after": String(limit.retryAfterSeconds),
    });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 40_000);
  request.signal.addEventListener("abort", () => controller.abort(), { once: true });

  try {
    const report = await buildDomainReport(body.name, controller.signal);
    return domainJson(report, Math.min(limit.remainingRequests, limit.remainingUnits));
  } catch (error) {
    return domainFailureResponse(error, controller.signal.aborted);
  } finally {
    clearTimeout(timeout);
  }
}
