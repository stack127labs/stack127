#!/usr/bin/env node
// Downloads one app icon from its official source, normalizes it to a 128×128 PNG,
// and records where it came from.
//
// Usage:
//   node scripts/indie-hacker-apps/save-icon.mjs <category> <slug> <image-url> --page <page-url> --kind <kind> [--note "..."]
//   node scripts/indie-hacker-apps/save-icon.mjs <category> <slug> --file <local-image> --image-url <original-url> --page <page-url> --kind <kind>
//
// <kind> is one of: apple-touch-icon, manifest-icon, favicon, svg-icon, press-kit, logo-mark, app-store, github-avatar, other.
// Writes public/indie-hacker-apps/icons/<category>/<slug>.png and
// dev-space/indie-hacker-apps/<research_dir>/icons/<slug>.json.
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const config = JSON.parse(readFileSync(path.join(root, "lib/indie-hacker-apps/categories.json"), "utf8"));
const KINDS = ["apple-touch-icon", "manifest-icon", "favicon", "svg-icon", "press-kit", "logo-mark", "app-store", "github-avatar", "other"];

const args = process.argv.slice(2);
const flag = (name) => { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : undefined; };
const positional = args.filter((a, i) => !a.startsWith("--") && !(i > 0 && args[i - 1].startsWith("--")));
const [categorySlug, slug, imageUrl] = positional;
const page = flag("page");
const kind = flag("kind");
const file = flag("file");
const note = flag("note") ?? "";
// With --file, --image-url records where the downloaded file came from.
const fileOrigin = flag("image-url");

function fail(message) { console.error(`ERROR ${message}`); process.exit(1); }

const category = config.categories.find((c) => c.slug === categorySlug || c.research_dir === categorySlug);
if (!category) fail(`unknown category ${categorySlug}`);
const dir = path.join(root, "dev-space/indie-hacker-apps", category.research_dir);
const cardPath = path.join(dir, "cards", `${slug}.json`);
if (!existsSync(cardPath)) fail(`no card for ${slug} in ${category.slug}`);
const card = JSON.parse(readFileSync(cardPath, "utf8"));
if (!file && !/^https?:\/\//.test(imageUrl ?? "")) fail("give an image URL or --file");
if (file && !/^https?:\/\//.test(fileOrigin ?? "")) fail("with --file, give --image-url: the official URL the file was downloaded from");
if (!/^https?:\/\//.test(page ?? "")) fail("--page must be the http(s) page where the icon is published (official site, press kit, app store page)");
if (!KINDS.includes(kind)) fail(`--kind must be one of ${KINDS.join(", ")}`);

// Pulls the largest PNG out of an .ico file. BMP-only icons are rejected.
function pngFromIco(bytes) {
  if (bytes.readUInt16LE(0) !== 0 || bytes.readUInt16LE(2) !== 1) return null;
  const count = bytes.readUInt16LE(4);
  let best = null;
  for (let i = 0; i < count; i += 1) {
    const at = 6 + i * 16;
    const width = bytes[at] || 256;
    const size = bytes.readUInt32LE(at + 8);
    const offset = bytes.readUInt32LE(at + 12);
    const data = bytes.subarray(offset, offset + size);
    const isPng = data.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
    if (isPng && (!best || width > best.width)) best = { width, data };
  }
  return best?.data ?? null;
}

async function load() {
  if (file) return { bytes: readFileSync(file), contentType: "" };
  let last;
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      const response = await fetch(imageUrl, {
        redirect: "follow",
        signal: AbortSignal.timeout(20_000),
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36",
          Accept: "image/avif,image/webp,image/png,image/svg+xml,image/x-icon,image/*,*/*;q=0.8",
        },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const bytes = Buffer.from(await response.arrayBuffer());
      if (bytes.length > 8_000_000) throw new Error("image over 8 MB");
      return { bytes, contentType: response.headers.get("content-type") ?? "" };
    } catch (error) { last = error; }
  }
  fail(`could not download ${imageUrl}: ${last?.message}`);
}

const { bytes: raw, contentType } = await load();
let bytes = raw;
const looksIco = /icon|ico/i.test(contentType) || /\.ico(\?|$)/i.test(imageUrl ?? file ?? "") || (raw.readUInt16LE(0) === 0 && raw.readUInt16LE(2) === 1);
if (looksIco) {
  const png = pngFromIco(raw);
  if (!png) fail("this .ico holds only BMP images; use the site's apple-touch-icon, manifest icon or SVG instead");
  bytes = png;
}
if (/text\/html/i.test(contentType) || /^\s*<(!doctype|html)/i.test(raw.subarray(0, 200).toString())) fail("the URL returned an HTML page, not an image");

let meta;
try { meta = await sharp(bytes, { density: 384 }).metadata(); } catch (error) { fail(`not a readable image: ${error.message}`); }
const isSvg = meta.format === "svg";
if (!isSvg && (meta.width < 32 || meta.height < 32)) fail(`image is only ${meta.width}×${meta.height}; find a source at least 64×64 (apple-touch-icon, manifest icon, SVG, press kit)`);

const png = await sharp(bytes, { density: 384 })
  .resize(128, 128, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png({ compressionLevel: 9 })
  .toBuffer();

// Reject images that are almost entirely empty or a single flat colour.
const { data, info } = await sharp(png).raw().ensureAlpha().toBuffer({ resolveWithObject: true });
let visible = 0;
const colours = new Set();
for (let i = 0; i < data.length; i += info.channels) {
  if (data[i + 3] > 24) { visible += 1; colours.add(`${data[i] >> 4},${data[i + 1] >> 4},${data[i + 2] >> 4}`); }
}
const coverage = visible / (info.width * info.height);
if (coverage < 0.02) fail("the image is almost entirely transparent");
// A one-colour logo on a transparent background is fine; a solid filled square is not.
if (colours.size < 2 && coverage > 0.9) fail("the image is a solid square of one colour, not an icon");

const outDir = path.join(root, "public/indie-hacker-apps/icons", category.slug);
mkdirSync(outDir, { recursive: true });
mkdirSync(path.join(dir, "icons"), { recursive: true });
writeFileSync(path.join(outDir, `${slug}.png`), png);

const host = (u) => { try { return new URL(u).hostname.replace(/^www\./, ""); } catch { return ""; } };
const record = {
  slug,
  name: card.name,
  official_url: card.url,
  image_url: file ? fileOrigin : imageUrl,
  source_page: page,
  kind,
  source_host: host(file ? fileOrigin : imageUrl),
  original: { format: meta.format, width: meta.width ?? null, height: meta.height ?? null },
  sha256: createHash("sha256").update(png).digest("hex"),
  note,
  saved_at: new Date().toISOString().slice(0, 10),
};
writeFileSync(path.join(dir, "icons", `${slug}.json`), `${JSON.stringify(record, null, 2)}\n`);
console.log(`OK ${category.slug}/${slug} ${meta.format} ${meta.width ?? "svg"}×${meta.height ?? ""} from ${record.source_host} (official site ${host(card.url)})`);
