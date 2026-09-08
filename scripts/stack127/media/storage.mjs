import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";

export const mediaBucket = "stack127-media";

const allowedContentTypes = new Set([
  "image/avif",
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const extensionByContentType = new Map([
  ["image/avif", "avif"],
  ["image/gif", "gif"],
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

function unquote(value) {
  return value.replace(/^['"]|['"]$/g, "");
}

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return;

  for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const equalsIndex = trimmed.indexOf("=");
    if (equalsIndex === -1) continue;
    const key = trimmed.slice(0, equalsIndex).trim();
    const value = unquote(trimmed.slice(equalsIndex + 1).trim());
    if (key && process.env[key] === undefined) process.env[key] = value;
  }
}

export function loadMediaEnv() {
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SECRET_KEY) return;
  loadEnvFile(process.env.NODE_ENV === "production" ? ".env.database" : ".env.local");
}

function safeSegment(value, label) {
  const segment = String(value ?? "").trim().toLowerCase();
  if (!/^[a-z0-9]+(?:[._-][a-z0-9]+)*$/.test(segment)) {
    throw new Error(`${label} must be a lowercase path-safe segment`);
  }
  return segment;
}

function safeObjectPath(value) {
  const path = String(value ?? "").replace(/^\/+/, "");
  const segments = path.split("/");
  if (segments.length < 2 || segments.some((segment) => !segment || segment === "." || segment === "..")) {
    throw new Error("objectPath must be a safe relative path");
  }
  return segments.join("/");
}

function normalizedSupabaseUrl(value) {
  const url = new URL(String(value ?? ""));
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error("SUPABASE_URL must use http(s)");
  }
  url.pathname = "";
  url.search = "";
  url.hash = "";
  return url.href.replace(/\/$/, "");
}

export function contentDigest(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

export function imageContentType(bytes) {
  if (!Buffer.isBuffer(bytes) || bytes.length < 12) {
    throw new Error("media file is empty or too small");
  }
  if (bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return "image/png";
  }
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes.subarray(0, 6).toString("ascii") === "GIF87a" || bytes.subarray(0, 6).toString("ascii") === "GIF89a") {
    return "image/gif";
  }
  if (bytes.subarray(0, 4).toString("ascii") === "RIFF" && bytes.subarray(8, 12).toString("ascii") === "WEBP") {
    return "image/webp";
  }
  if (bytes.subarray(4, 12).toString("ascii").includes("ftypavif")) return "image/avif";
  throw new Error("unsupported image content");
}

export function extensionForContentType(contentType) {
  const extension = extensionByContentType.get(contentType);
  if (!extension) throw new Error(`unsupported media content type: ${contentType}`);
  return extension;
}

export function mediaObjectPath({ directory, digest, extension, kind = "images", slug }) {
  const normalizedDigest = String(digest ?? "").toLowerCase();
  if (!/^[a-f0-9]{64}$/.test(normalizedDigest)) throw new Error("digest must be a SHA-256 hex value");

  return [
    "directories",
    safeSegment(directory, "directory"),
    safeSegment(kind, "kind"),
    `${safeSegment(slug, "slug")}-${normalizedDigest.slice(0, 16)}.${safeSegment(extension, "extension")}`,
  ].join("/");
}

export function publicMediaUrl({ objectPath, supabaseUrl }) {
  const base = normalizedSupabaseUrl(supabaseUrl);
  const encodedPath = safeObjectPath(objectPath).split("/").map(encodeURIComponent).join("/");
  return `${base}/storage/v1/object/public/${mediaBucket}/${encodedPath}`;
}

export function isManagedMediaUrl(value, { directory, kind } = {}) {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") return false;
    const prefix = `/storage/v1/object/public/${mediaBucket}/directories/`;
    if (!url.pathname.startsWith(prefix)) return false;
    const relative = decodeURIComponent(url.pathname.slice(prefix.length));
    const segments = relative.split("/");
    if (segments.length !== 3 || segments.some((segment) => !segment || segment === "." || segment === "..")) return false;
    if (directory && segments[0] !== directory) return false;
    if (kind && segments[1] !== kind) return false;
    return true;
  } catch {
    return false;
  }
}

export async function uploadMediaObject({
  bytes,
  contentType,
  fetchImpl = fetch,
  objectPath,
  secretKey,
  supabaseUrl,
}) {
  loadMediaEnv();
  const body = Buffer.isBuffer(bytes) ? bytes : Buffer.from(bytes);
  const type = contentType ?? imageContentType(body);
  if (!allowedContentTypes.has(type)) throw new Error(`unsupported media content type: ${type}`);
  if (body.length > 10 * 1024 * 1024) throw new Error("media object exceeds the 10 MB bucket limit");

  const base = normalizedSupabaseUrl(supabaseUrl ?? process.env.SUPABASE_URL);
  const key = secretKey ?? process.env.SUPABASE_SECRET_KEY;
  if (!key) throw new Error("SUPABASE_SECRET_KEY is required to upload media");
  const encodedPath = safeObjectPath(objectPath).split("/").map(encodeURIComponent).join("/");
  let lastError;
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      const response = await fetchImpl(`${base}/storage/v1/object/${mediaBucket}/${encodedPath}`, {
        method: "POST",
        headers: {
          apikey: key,
          authorization: `Bearer ${key}`,
          "cache-control": "max-age=31536000, immutable",
          "content-type": type,
          "x-upsert": "true",
        },
        body,
        signal: AbortSignal.timeout(45_000),
      });
      if (response.ok) return publicMediaUrl({ objectPath, supabaseUrl: base });
      const detail = (await response.text()).slice(0, 500);
      lastError = new Error(`Supabase Storage upload failed (${response.status}): ${detail}`);
      if (response.status !== 429 && response.status < 500) throw lastError;
    } catch (error) {
      lastError = error;
    }
    if (attempt < 4) await new Promise((resolve) => setTimeout(resolve, 250 * 2 ** (attempt - 1)));
  }
  throw lastError;
}

export async function verifyMediaObject(url, { fetchImpl = fetch } = {}) {
  if (!isManagedMediaUrl(url)) throw new Error("refusing to verify an unmanaged media URL");
  let response = await fetchImpl(url, { method: "HEAD", signal: AbortSignal.timeout(20_000) });
  if (response.status === 405) {
    response = await fetchImpl(url, {
      headers: { range: "bytes=0-31" },
      signal: AbortSignal.timeout(20_000),
    });
  }
  if (!response.ok) throw new Error(`public media verification failed (${response.status}): ${url}`);
  const contentType = response.headers.get("content-type")?.split(";", 1)[0] ?? "";
  if (!allowedContentTypes.has(contentType)) throw new Error(`public media has invalid content type ${contentType}: ${url}`);
  return true;
}
