import {
  domainClientKey,
  domainErrorResponse,
  domainFailureResponse,
  domainJson,
  isSameOriginDomainRequest,
  readDomainJsonBody,
} from "@/lib/domain/api.ts";
import { checkMultipleTlds, DEFAULT_TLDS, MAX_TLDS } from "@/lib/domain/multi-tld.ts";
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

  if (typeof body.name !== "string") return domainErrorResponse(400, "invalid_name", "Enter a name to check.");
  const tlds = Array.isArray(body.tlds)
    ? body.tlds.filter((tld): tld is string => typeof tld === "string").slice(0, MAX_TLDS)
    : [...DEFAULT_TLDS];

  // One unit per TLD, so a twelve ending check costs twelve and nobody can run
  // this repeatedly. The global per registry limiter runs underneath this.
  const limit = consumeDnsLookupLimit(`domain-multi:${domainClientKey(request)}`, Math.max(1, tlds.length));
  if (!limit.allowed) {
    return domainErrorResponse(
      429,
      "rate_limited",
      "That is a lot of checking in a short time. Try again in a few minutes.",
      { "retry-after": String(limit.retryAfterSeconds) },
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);
  request.signal.addEventListener("abort", () => controller.abort(), { once: true });

  try {
    const result = await checkMultipleTlds(body.name, tlds, controller.signal);
    return domainJson(result, Math.min(limit.remainingRequests, limit.remainingUnits));
  } catch (error) {
    return domainFailureResponse(error, controller.signal.aborted);
  } finally {
    clearTimeout(timeout);
  }
}
