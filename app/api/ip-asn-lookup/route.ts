import { NextResponse } from "next/server";
import { consumeDnsLookupLimit } from "@/lib/dns/rate-limit.ts";
import { NetworkInputError } from "@/lib/ip-asn/input.ts";
import { isSameOriginIpAsnRequest, networkClientKey, readIpAsnJsonBody } from "@/lib/ip-asn/api.ts";
import { lookupNetwork } from "@/lib/ip-asn/resolve.ts";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function errorResponse(status: number, code: string, message: string, headers?: HeadersInit) {
  return NextResponse.json(
    { error: { code, message } },
    { status, headers: { "cache-control": "no-store", ...headers } },
  );
}

export async function POST(request: Request) {
  if (!isSameOriginIpAsnRequest(request)) return errorResponse(403, "cross_origin_request", "Lookups must come from the stack127 site.");

  let body: Record<string, unknown>;
  try {
    body = await readIpAsnJsonBody(request);
  } catch (error) {
    const tooLarge = error instanceof Error && error.message === "request_too_large";
    return errorResponse(tooLarge ? 413 : 400, "invalid_request", "Send a small, valid lookup request.");
  }

  if (typeof body.query !== "string") return errorResponse(400, "invalid_query", "Enter an IP address or ASN.");
  const limit = consumeDnsLookupLimit(`ip-asn-lookup:${networkClientKey(request)}`, 1);
  if (!limit.allowed) {
    return errorResponse(429, "rate_limited", "Too many lookups. Try again shortly.", {
      "retry-after": String(limit.retryAfterSeconds),
      "x-ratelimit-remaining": String(limit.remainingRequests),
    });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20_000);
  request.signal.addEventListener("abort", () => controller.abort(), { once: true });
  try {
    const result = await lookupNetwork(body.query, { signal: controller.signal });
    return NextResponse.json(result, {
      headers: {
        "cache-control": "no-store",
        "x-content-type-options": "nosniff",
        "x-ratelimit-remaining": String(limit.remainingRequests),
      },
    });
  } catch (error) {
    if (error instanceof NetworkInputError) return errorResponse(400, error.code, error.message);
    if (controller.signal.aborted) return errorResponse(504, "check_timeout", "The lookup took too long and was stopped.");
    return errorResponse(502, "check_failed", "We could not complete this lookup.");
  } finally {
    clearTimeout(timeout);
  }
}
