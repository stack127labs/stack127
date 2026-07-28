/** Shared request handling for the domain tool routes, mirroring lib/dns/api.ts. */

import { NextResponse } from "next/server";
import { DomainInputError } from "./public-suffix.ts";

export function domainErrorResponse(status: number, code: string, message: string, headers?: HeadersInit) {
  return NextResponse.json(
    { error: { code, message } },
    { status, headers: { "cache-control": "no-store", ...headers } },
  );
}

export function domainJson(data: unknown, remaining: number) {
  return NextResponse.json(data, {
    headers: {
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
      "x-ratelimit-remaining": String(remaining),
    },
  });
}

function requestHost(request: Request) {
  return (
    request.headers.get("x-forwarded-host")?.split(",")[0]?.trim() ??
    request.headers.get("host") ??
    new URL(request.url).host
  );
}

export function isSameOriginDomainRequest(request: Request) {
  if (request.headers.get("sec-fetch-site") === "cross-site") return false;
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === requestHost(request);
  } catch {
    return false;
  }
}

export function domainClientKey(request: Request) {
  return (
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-real-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}

export async function readDomainJsonBody(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(contentLength) && contentLength > 4096) throw new Error("request_too_large");
  if (!request.body) throw new Error("invalid_json");
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let byteLength = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    byteLength += value.byteLength;
    if (byteLength > 4096) {
      await reader.cancel();
      throw new Error("request_too_large");
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(byteLength);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  let value: unknown;
  try {
    value = JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    throw new Error("invalid_json");
  }
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("invalid_json");
  return value as Record<string, unknown>;
}

/**
 * Input problems are the reader's to fix and get their own clear message.
 * Everything else stays generic so no upstream detail leaks out.
 */
export function domainFailureResponse(error: unknown, aborted: boolean) {
  if (error instanceof DomainInputError) return domainErrorResponse(400, error.code, error.message);
  if (aborted) return domainErrorResponse(504, "check_timeout", "The lookup took too long and was stopped.");
  return domainErrorResponse(502, "check_failed", "We could not complete this lookup.");
}
