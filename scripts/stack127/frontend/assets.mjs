import { readdir, stat, readFile } from "node:fs/promises";
import path from "node:path";

export const freeFileLimit = 20_000;
export const freeFileSizeLimit = 25 * 1024 * 1024;

export async function assertNoPrivateCredentials(directory, environment = process.env) {
  const credentials = Object.entries(environment).filter(([name, value]) =>
    !name.startsWith("NEXT_PUBLIC_") && /(?:SECRET|TOKEN|PASSWORD|DATABASE_(?:POOLER_)?URL|PRIVATE_KEY)/.test(name)
      && typeof value === "string" && value.length >= 16,
  ).map(([name, value]) => ({ name, value: Buffer.from(value) }));
  async function walk(folder) {
    for (const entry of await readdir(folder, { withFileTypes: true })) {
      const file = path.join(folder, entry.name);
      if (entry.isDirectory()) await walk(file);
      else if (entry.isFile()) {
        const data = await readFile(file);
        const found = credentials.find(credential => data.includes(credential.value));
        if (found) throw new Error(`Private credential ${found.name} appears in exported file ${path.relative(directory, file)}.`);
      }
    }
  }
  await walk(directory);
}

export async function inspectAssets(directory) {
  const files = [];
  async function walk(folder) {
    for (const entry of await readdir(folder, { withFileTypes: true })) {
      const file = path.join(folder, entry.name);
      if (entry.isDirectory()) await walk(file);
      else if (entry.isFile()) files.push({ path: path.relative(directory, file), size: (await stat(file)).size });
      else throw new Error(`Static output contains a non-file entry: ${file}`);
    }
  }
  await walk(directory);
  const uploaded = files.filter(file => !["_headers", "_redirects"].includes(file.path));
  if (uploaded.length > freeFileLimit) throw new Error(`Cloudflare Free allows ${freeFileLimit} files; output has ${uploaded.length}.`);
  const oversized = uploaded.find(file => file.size > freeFileSizeLimit);
  if (oversized) throw new Error(`Cloudflare's 25 MiB file limit exceeded: ${oversized.path}`);
  if (!files.some(file => file.path === "index.html") || !files.some(file => file.path === "404.html")) {
    throw new Error("Static output must contain the homepage and a real 404 page.");
  }
  return { files: uploaded.length, bytes: uploaded.reduce((sum, file) => sum + file.size, 0), remainingFiles: freeFileLimit - uploaded.length };
}

export function routeParameters(template, pages) {
  const parts = template.split("/");
  return pages.flatMap(page => {
    const values = (`/${page.slug}`).split("/");
    if (values.length !== parts.length) return [];
    const parameters = {};
    for (let index = 0; index < parts.length; index++) {
      const match = /^\[([^.[\]]+)\]$/.exec(parts[index]);
      if (match) {
        if (!values[index]) return [];
        parameters[match[1]] = values[index];
      } else if (parts[index] !== values[index]) return [];
    }
    if (template === "/[slug]" && page.page_family !== "catalog") return [];
    return [parameters];
  });
}

export function staticHeaders(sha) {
  if (!/^[a-f0-9]{40}$/.test(sha)) throw new Error("Static hosting requires an exact release SHA.");
  // Stable paths revalidate. Only content-addressed Next files are immutable.
  return `/*\n  X-Stack127-Frontend-SHA: ${sha}\n  X-Content-Type-Options: nosniff\n/_next/static/*\n  Cache-Control: public, max-age=31536000, immutable\n/*.txt\n  X-Robots-Tag: noindex\n/404\n  Cache-Control: no-store\n  X-Robots-Tag: noindex\n/frontend-release.json\n  X-Robots-Tag: noindex\nhttps://:subdomain.workers.dev/*\n  X-Robots-Tag: noindex\nhttps://:version.:subdomain.workers.dev/*\n  X-Robots-Tag: noindex\n`;
}
