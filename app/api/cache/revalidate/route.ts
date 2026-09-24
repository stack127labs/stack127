import { createHmac, timingSafeEqual } from "node:crypto";
import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Payload = { paths?: string[]; tags?: string[] };

let signingKeyPromise: Promise<string> | null = null;

function signingKey() {
  if (!signingKeyPromise) {
    signingKeyPromise = getPool().query<{ signing_key: string }>(
      "select signing_key from public.stack127_cache_credentials where id = true",
    ).then((result) => {
      const key = result.rows[0]?.signing_key;
      if (!key) throw new Error("Cache signing key is missing.");
      return key;
    }).catch((error) => {
      signingKeyPromise = null;
      throw error;
    });
  }
  return signingKeyPromise;
}

async function authorized(request: Request) {
  const key = await signingKey();
  const expected = createHmac("sha256", key).update("stack127-cache-revalidation-v1").digest("hex");
  const received = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  return received.length === expected.length && timingSafeEqual(Buffer.from(received), Buffer.from(expected));
}

export async function POST(request: Request) {
  let isAuthorized: boolean;
  try {
    isAuthorized = await authorized(request);
  } catch {
    return NextResponse.json({ error: "Cache authentication unavailable" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: { "Cache-Control": "no-store" } });
  }

  let payload: Payload;
  try {
    payload = await request.json() as Payload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const paths = payload.paths ?? [];
  const tags = payload.tags ?? [];
  if (!Array.isArray(paths) || !Array.isArray(tags) || paths.length > 200 || tags.length > 200 ||
    paths.some((path) => typeof path !== "string" || !/^\/(?:[a-z0-9/_-]*)$/.test(path)) ||
    tags.some((tag) => typeof tag !== "string" || !/^[a-z0-9:_-]{1,128}$/.test(tag))) {
    return NextResponse.json({ error: "Invalid targets" }, { status: 400 });
  }

  for (const tag of new Set(tags)) revalidateTag(tag, { expire: 0 });
  for (const path of new Set(paths)) revalidatePath(path);
  return NextResponse.json({ ok: true, paths: paths.length, tags: tags.length }, { headers: { "Cache-Control": "no-store" } });
}
