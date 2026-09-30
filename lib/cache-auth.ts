import { createHmac, timingSafeEqual } from "node:crypto";
import { getPool } from "./db";
let keyPromise: Promise<string> | null = null;
export async function cacheAuthorized(request: Request) {
  if (!keyPromise) keyPromise = getPool().query<{ signing_key: string }>(
    "select signing_key from public.stack127_cache_credentials where id = true",
  ).then(result => {
    if (!result.rows[0]?.signing_key) throw new Error("Cache authentication unavailable");
    return result.rows[0].signing_key;
  }).catch(error => { keyPromise = null; throw error; });
  const expected = createHmac("sha256", await keyPromise).update("stack127-cache-revalidation-v1").digest("hex");
  const received = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  return /^[a-f0-9]{64}$/.test(received) && timingSafeEqual(Buffer.from(received), Buffer.from(expected));
}
