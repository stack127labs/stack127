/**
 * Sketched lucide icons. Redraws the lucide icons the site imports with rough.js,
 * the same library behind our marker art, so they look hand drawn.
 *
 * Usage:
 *   npm run stack127:icons
 *   node scripts/stack127/icons/generate-sketch-icons.mjs --check   # fail if the output is stale
 *
 * The script scans app/, lib/, and root .ts/.tsx files for named imports from
 * "@/app/ui/icons" (and any leftover "lucide-react" imports), reads each icon's
 * shapes from the installed lucide-react package, and writes
 * app/ui/icons/sketch-icons.generated.tsx. Seeds come from the icon name, so the
 * output never changes between runs. To add an icon, import it by its lucide
 * name from "@/app/ui/icons" and rerun the script.
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join, relative } from "node:path";
import { pathToFileURL } from "node:url";
import rough from "roughjs";

const ROOT = process.cwd();
const OUT = join(ROOT, "app/ui/icons/sketch-icons.generated.tsx");
const LUCIDE = join(ROOT, "node_modules/lucide-react/dist/esm");
const MODULES = new Set(["@/app/ui/icons", "lucide-react"]);
const TYPE_NAMES = new Set(["LucideIcon", "LucideProps", "SketchIcon", "SketchIconProps"]);

// The approved look. Changing any of these redraws every icon.
const STYLE = {
  roughness: 0.9,
  bowing: 1.2,
  strokeWidth: 1.9,
  // One pass per shape: half the path data of rough's default double stroke,
  // and cleaner at 13 to 18px. The wobble and bowing still read as hand drawn.
  disableMultiStroke: true,
  preserveVertices: true,
};
// One decimal on a 24 unit grid is under 0.07px at 15px, invisible, and keeps the module small.
const DECIMALS = 1;

function walk(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) walk(path, out);
    else if (/\.(tsx?|mjs)$/.test(entry.name) && !entry.name.endsWith(".generated.tsx")) out.push(path);
  }
  return out;
}

function usedIconNames() {
  const files = [...walk(join(ROOT, "app")), ...walk(join(ROOT, "lib"))];
  for (const entry of readdirSync(ROOT)) if (/\.tsx?$/.test(entry)) files.push(join(ROOT, entry));
  const names = new Set();
  const importRe = /import\s+(?:type\s+)?\{([^}]*)\}\s*from\s*["']([^"']+)["']/g;
  for (const file of files) {
    const source = readFileSync(file, "utf8");
    for (const match of source.matchAll(importRe)) {
      if (!MODULES.has(match[2])) continue;
      for (let spec of match[1].split(",")) {
        spec = spec.trim();
        if (!spec || spec.startsWith("type ")) continue;
        const name = spec.split(/\s+as\s+/)[0].trim();
        if (!TYPE_NAMES.has(name)) names.add(name);
      }
    }
  }
  return [...names].sort();
}

/** Maps every lucide-react export name (including aliases) to its icon file. */
function lucideExports() {
  const index = readFileSync(join(LUCIDE, "lucide-react.mjs"), "utf8");
  const map = new Map();
  for (const match of index.matchAll(/export \{([^}]*)\} from '\.\/icons\/([\w-]+)\.mjs'/g)) {
    for (const part of match[1].split(",")) {
      const alias = part.trim().replace(/^default as /, "");
      if (alias) map.set(alias, match[2]);
    }
  }
  return map;
}

function seedFor(name, index) {
  let hash = 2166136261;
  for (const char of `${name}:${index}`) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  return (hash >>> 0) % 2147483646 + 1;
}

const num = (attrs, key) => Number(attrs[key] ?? 0);

function sketch(name, iconNode) {
  const generator = rough.generator();
  const parts = [];
  iconNode.forEach(([tag, attrs], index) => {
    const options = { ...STYLE, seed: seedFor(name, index), stroke: "currentColor" };
    let drawable;
    if (tag === "path") drawable = generator.path(attrs.d, options);
    else if (tag === "circle") drawable = generator.circle(num(attrs, "cx"), num(attrs, "cy"), num(attrs, "r") * 2, options);
    else if (tag === "ellipse") drawable = generator.ellipse(num(attrs, "cx"), num(attrs, "cy"), num(attrs, "rx") * 2, num(attrs, "ry") * 2, options);
    else if (tag === "line") drawable = generator.line(num(attrs, "x1"), num(attrs, "y1"), num(attrs, "x2"), num(attrs, "y2"), options);
    else if (tag === "rect") {
      const [x, y, w, h] = ["x", "y", "width", "height"].map((key) => num(attrs, key));
      const r = Math.min(num(attrs, "rx") || num(attrs, "ry"), w / 2, h / 2);
      drawable = r > 0
        ? generator.path(`M${x + r} ${y}h${w - 2 * r}a${r} ${r} 0 0 1 ${r} ${r}v${h - 2 * r}a${r} ${r} 0 0 1 -${r} ${r}h-${w - 2 * r}a${r} ${r} 0 0 1 -${r} -${r}v-${h - 2 * r}a${r} ${r} 0 0 1 ${r} -${r}z`, options)
        : generator.rectangle(x, y, w, h, options);
    } else if (tag === "polyline" || tag === "polygon") {
      const values = attrs.points.trim().split(/[\s,]+/).map(Number);
      const points = [];
      for (let i = 0; i < values.length; i += 2) points.push([values[i], values[i + 1]]);
      drawable = tag === "polygon" ? generator.polygon(points, options) : generator.linearPath(points, options);
    } else {
      throw new Error(`${name}: unsupported lucide element <${tag}>`);
    }
    for (const path of generator.toPaths(drawable)) parts.push(path.d);
  });
  return parts.join("")
    .replace(/-?\d*\.?\d+(?:e-?\d+)?/g, (value) => String(Number(Number(value).toFixed(DECIMALS))))
    .replace(/,/g, " ")
    .replace(/\s+/g, " ")
    .replace(/ ?([MLCZmlcz]) ?/g, "$1")
    .replace(/ -/g, "-")
    .replace(/(^|[^\d.])0\./g, "$1.")
    .trim();
}

async function main() {
  const check = process.argv.includes("--check");
  const exportsMap = lucideExports();
  const names = usedIconNames();
  const missing = names.filter((name) => !exportsMap.has(name));
  if (missing.length) throw new Error(`Not a lucide icon name: ${missing.join(", ")}`);

  const lines = [];
  for (const name of names) {
    const file = exportsMap.get(name);
    const { __iconNode } = await import(pathToFileURL(join(LUCIDE, "icons", `${file}.mjs`)).href);
    lines.push(`export const ${name} = /*#__PURE__*/ createSketchIcon("${file}", "${sketch(file, __iconNode)}");`);
  }

  const output = [
    "// Generated by scripts/stack127/icons/generate-sketch-icons.mjs. Do not edit.",
    "// Lucide shapes (ISC license) redrawn with rough.js. Rerun `npm run stack127:icons` after adding an import.",
    'import { createSketchIcon } from "./sketch-icon";',
    "",
    ...lines,
    "",
  ].join("\n");

  const current = existsSync(OUT) ? readFileSync(OUT, "utf8") : "";
  if (check) {
    if (current !== output) {
      console.error(`${relative(ROOT, OUT)} is out of date. Run npm run stack127:icons.`);
      process.exit(1);
    }
    console.log(`${names.length} sketched icons are current.`);
    return;
  }
  writeFileSync(OUT, output);
  console.log(`Wrote ${names.length} sketched icons to ${relative(ROOT, OUT)} (${(Buffer.byteLength(output) / 1024).toFixed(1)} KB).`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
