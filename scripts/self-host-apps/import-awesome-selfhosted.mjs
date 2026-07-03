#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseArgs, numberArg } from "./lib/args.mjs";
import { validateRecord } from "./lib/schema.mjs";
import { readSource } from "./lib/sources.mjs";
import { rewriteSummaryFromInputs, slugify, trimSentence } from "./lib/summary-rules.mjs";

const defaultSourceUrl = "https://raw.githubusercontent.com/awesome-selfhosted/awesome-selfhosted/master/README.md";
const skipCategorySlugs = new Set([
  "table-of-contents",
  "software",
  "list-of-licenses",
  "anti-features",
  "external-links",
  "contributing",
  "license",
]);

const sourceCodeLabels = new Set(["source code", "source"]);
const docsLabels = new Set(["documentation", "docs", "doc"]);
const licenseLikePattern = /^[A-Z][A-Z0-9.+-]*(?:\/[A-Z][A-Z0-9.+-]*)*$/;

function stripMarkdown(value) {
  return String(value ?? "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/[_*]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanName(name) {
  return stripMarkdown(name)
    .replace(/\s+\u26a0\s*$/u, "")
    .replace(/\s+warning\s*$/i, "")
    .trim();
}

function normalizeLicense(value) {
  const token = String(value ?? "").trim();
  if (!licenseLikePattern.test(token)) return null;
  if (["Docker", "K8S", "Nodejs", "Javascript", "Typescript", "Python", "PHP", "Go", "Rust", "Ruby", "Java", "C", "C++", "C#", "Perl", "Shell", "deb"].includes(token)) {
    return null;
  }
  return token;
}

function normalizeTechTags(tokens) {
  return tokens
    .filter((token) => !normalizeLicense(token))
    .map((token) => token.trim())
    .filter(Boolean);
}

function extractLinks(markdown) {
  const links = [];
  const pattern = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g;
  let match;
  while ((match = pattern.exec(markdown)) !== null) {
    links.push({ label: stripMarkdown(match[1]).toLowerCase(), url: match[2] });
  }
  return links;
}

function removeMetadata(description) {
  return description
    .replace(/\s*\([^()]*\[[^\]]+\]\([^)]+\)[^()]*\)\s*/g, " ")
    .replace(/\(\s*[,;\s]*\)/g, " ")
    .replace(/\s*`[^`]+`(?:\s*`[^`]+`)*\s*$/g, " ")
    .replace(/\b(?:Source Code|Demo|Clients?|Mobile Clients?)\b\.?/gi, " ")
    .replace(/\s+\u26a0\s*/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseBullet(line, category) {
  const match = line.match(/^-\s+\[([^\]]+)\]\((https?:\/\/[^)]+)\)(.*?)\s+-\s+(.+)$/);
  if (!match) return null;

  const [, rawName, primaryUrl, nameSuffix, rawDescription] = match;
  const links = extractLinks(rawDescription);
  const sourceLink = links.find((link) => sourceCodeLabels.has(link.label) || link.label.includes("source code"));
  const docsLink = links.find((link) => docsLabels.has(link.label) || link.label.includes("documentation"));
  const tokens = Array.from(rawDescription.matchAll(/`([^`]+)`/g), (tokenMatch) => tokenMatch[1]);
  const license = tokens.map(normalizeLicense).find(Boolean) ?? null;
  const techTags = normalizeTechTags(tokens);
  const description = removeMetadata(rawDescription);

  return {
    name: cleanName(`${rawName}${nameSuffix ?? ""}`),
    website_url: primaryUrl,
    repository_url: sourceLink?.url ?? (isSourceRepo(primaryUrl) ? primaryUrl : null),
    docs_url: docsLink?.url ?? null,
    license,
    techTags,
    originalDescription: stripMarkdown(description),
    rawMarkdown: line,
    category,
  };
}

function isSourceRepo(url) {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return ["github.com", "gitlab.com", "codeberg.org", "git.sr.ht", "forgejo.org"].some((domain) => host === domain || host.endsWith(`.${domain}`));
  } catch {
    return false;
  }
}

function repoOwner(url) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (!["github.com", "gitlab.com", "codeberg.org"].includes(parsed.hostname.toLowerCase())) return null;
    const [owner] = parsed.pathname.split("/").filter(Boolean);
    return owner ?? null;
  } catch {
    return null;
  }
}

function publisherFromEntry(entry) {
  const owner = repoOwner(entry.repository_url);
  if (owner) {
    const host = new URL(entry.repository_url).origin;
    return {
      publisher_name: owner,
      publisher_url: `${host}/${owner}`,
      publisher_type: "unknown",
    };
  }

  try {
    const hostname = new URL(entry.website_url).hostname.replace(/^www\./, "");
    return {
      publisher_name: hostname,
      publisher_url: entry.website_url,
      publisher_type: "unknown",
    };
  } catch {
    return { publisher_name: null, publisher_url: null, publisher_type: "unknown" };
  }
}

function dockerSupport(techTags) {
  return techTags.some((tag) => /\bdocker\b/i.test(tag) || /\bk8s\b/i.test(tag)) ? "official" : "unknown";
}

function platformsFromEntry(entry) {
  const platforms = new Set(["web"]);
  const text = `${entry.originalDescription} ${entry.techTags.join(" ")}`.toLowerCase();
  if (/\bcli\b|\bterminal\b|\bcommand line\b/.test(text)) platforms.add("cli");
  if (/\bdesktop\b/.test(text)) platforms.add("desktop");
  if (/\bmobile\b|\bandroid\b|\bios\b/.test(text)) platforms.add("mobile");
  return Array.from(platforms);
}

function sourceKey(entry, slug) {
  return `${slug}:${slugify(entry.category.name)}`;
}

function buildSummary(entry) {
  let summary = rewriteSummaryFromInputs({
    name: entry.name,
    description: entry.originalDescription,
    topics: [entry.category.name, ...entry.techTags],
  });

  if (/^a\s+/i.test(summary)) {
    summary = trimSentence(summary.replace(/^a\s+/i, ""));
  }

  return summary;
}

function buildRecord(entry, sourceUrl, fetchedAt) {
  const slug = slugify(entry.name);
  const publisher = publisherFromEntry(entry);
  const categorySlug = slugify(entry.category.name);
  const summary = buildSummary(entry);

  return {
    slug,
    name: entry.name,
    summary,
    icon_url: null,
    website_url: entry.website_url,
    repository_url: entry.repository_url,
    docs_url: entry.docs_url,
    install_docs_url: null,
    docker_url: null,
    license: entry.license,
    ...publisher,
    published: false,
    maintenance_status: "unknown",
    github_owner: null,
    github_repo: null,
    github_stars: null,
    github_latest_release: null,
    github_latest_release_at: null,
    github_last_commit_at: null,
    github_checked_at: null,
    docker_support: dockerSupport(entry.techTags),
    compose_support: null,
    requires_database: null,
    database_types: [],
    ram_mb: null,
    storage_profile: "unknown",
    platforms: platformsFromEntry(entry),
    categories: [categorySlug],
    summary_source: "awesome_selfhosted_rewrite",
    summary_confidence: "medium",
    field_sources: [
      { field_name: "website_url", source: "awesome_selfhosted", source_url: sourceUrl, confidence: "medium" },
      { field_name: "repository_url", source: "awesome_selfhosted", source_url: sourceUrl, confidence: entry.repository_url ? "medium" : "unknown" },
      { field_name: "summary", source: "awesome_selfhosted_rewrite", source_url: sourceUrl, confidence: "medium" },
      { field_name: "categories", source: "awesome_selfhosted", source_url: sourceUrl, confidence: "medium" },
    ],
    source_payload: {
      source: "awesome_selfhosted",
      source_key: sourceKey(entry, slug),
      source_url: sourceUrl,
      payload: {
        fetched_at: fetchedAt,
        category: entry.category.name,
        category_slug: categorySlug,
        name: entry.name,
        website_url: entry.website_url,
        repository_url: entry.repository_url,
        docs_url: entry.docs_url,
        license: entry.license,
        tech_tags: entry.techTags,
        description: entry.originalDescription,
        markdown: entry.rawMarkdown,
      },
    },
  };
}

function parseAwesomeSelfhosted(text) {
  const entries = [];
  let category = null;

  for (const line of text.split(/\r?\n/)) {
    const heading = line.match(/^###\s+(.+)$/);
    if (heading) {
      const name = stripMarkdown(heading[1]).replace(/\s+\(.+?\)\s*$/g, "").trim();
      const slug = slugify(name);
      category = skipCategorySlugs.has(slug) ? null : { name, slug };
      continue;
    }

    if (!category || !line.startsWith("- [")) continue;
    const parsed = parseBullet(line, category);
    if (parsed) entries.push(parsed);
  }

  return entries;
}

async function main() {
  const args = parseArgs();
  const sourceUrl = args.url || defaultSourceUrl;
  const fetchedAt = new Date().toISOString();
  const limit = numberArg(args, "limit", Number.POSITIVE_INFINITY);
  const text = await readSource({ file: args.file, url: args.file ? undefined : sourceUrl });
  const seen = new Set();
  const skippedDuplicates = [];
  const invalid = [];
  const records = [];

  for (const entry of parseAwesomeSelfhosted(text)) {
    if (records.length >= limit) break;
    const record = buildRecord(entry, sourceUrl, fetchedAt);
    if (!record.slug || seen.has(record.slug)) {
      skippedDuplicates.push(record.slug || entry.name);
      continue;
    }

    const validation = validateRecord(record, { draft: true });
    if (validation.errors.length > 0) {
      invalid.push({ slug: record.slug, errors: validation.errors });
      continue;
    }

    seen.add(record.slug);
    records.push(record);
  }

  const output = {
    source: {
      name: "awesome_selfhosted",
      url: sourceUrl,
      fetched_at: fetchedAt,
      count: records.length,
      skipped_duplicates: skippedDuplicates.length,
      invalid: invalid.length,
    },
    apps: records,
  };

  const out = args.out ?? path.join("scripts/self-host-apps/batches", `${new Date().toISOString().slice(0, 10)}-awesome-selfhosted.json`);
  await mkdir(path.dirname(out), { recursive: true });
  await writeFile(out, `${JSON.stringify(output, null, 2)}\n`);

  console.log(`Parsed ${records.length} Awesome Selfhosted app(s).`);
  console.log(`Skipped duplicate slug(s): ${skippedDuplicates.length}.`);
  console.log(`Skipped invalid row(s): ${invalid.length}.`);
  console.log(`Wrote ${out}.`);

  if (invalid.length > 0) {
    console.warn(JSON.stringify(invalid.slice(0, 10), null, 2));
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
