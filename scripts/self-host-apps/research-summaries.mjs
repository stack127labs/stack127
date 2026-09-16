#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";
import { parseArgs, numberArg } from "./lib/args.mjs";
import { withClient } from "./lib/db.mjs";
import { mapConcurrent } from "./lib/http.mjs";

const userAgent = "stack127-self-host-summary-research/1.0";
const sourceLimit = 5;

function unique(values) {
  return [...new Set(values.filter((value) => typeof value === "string" && /^https?:\/\//i.test(value)))];
}

function summaryNeedsCleanup(value) {
  const text = String(value ?? "").trim();
  return !text
    || /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\u00A0\u200B-\u200F\u202A-\u202E]|`|\*\*|\[[^\]]+\]\([^)]*\)|\[\/?(?:br|b|i|u|url|img|span|color|size)(?:\]|[=\s])/i.test(text)
    || /<\/?[a-z][^>]*>/i.test(text)
    || /&#(?:x[0-9a-f]+|[0-9]+);|&[a-z][a-z0-9]+;/i.test(text)
    || /https?:\/\/|www\./i.test(text)
    || /\b(?:see here|for examples|required in|click here|learn more|visit|how to run|quick setup|setup process|before installing|after installing|please)\b|\benvironment variables?\s*:/i.test(text)
    || /\b(?:dockerfile|docker[- ]compose\.(?:ya?ml)|locustfile(?:\.py)?|(?:the\s+)?readme|(?:this|the)\s+repo(?:sitory)?|note\s*:|demo credentials|docker pull)\b|\/(?:mnt|app|config|data)\//i.test(text)
    || /\b(?:and|or|the|a|an|your|when|which|that|it|this)\s*[.!?]*$/i.test(text)
    || (text.match(/[.!?](\s|$)/g) ?? []).length > 1
    || /^.{2,48}:\s+\S/.test(text)
    || /^A[n]?\s+/i.test(text)
    || /;\s+/.test(text)
    || /\b(?:a|an)\s+(?:analytics|continuous|office|binary|application|mcp|captcha)\b|\ba,\s*[.!?]/i.test(text)
    || /\b(?:open[- ]source|self[- ]hosted|solution|platform|powerful|ultimate|all[- ]in[- ]one|seamless|robust)\b/i.test(text)
    || text.includes("—")
    || text.length < 50
    || text.split(/\s+/).filter(Boolean).length < 8;
}

function decodeEntities(value) {
  return String(value ?? "")
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&(nbsp|amp|lt|gt|quot|apos);/gi, (_, name) => ({
      nbsp: " ",
      amp: "&",
      lt: "<",
      gt: ">",
      quot: '"',
      apos: "'",
    })[name.toLowerCase()]);
}

function cleanText(value) {
  return decodeEntities(value)
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/\[\/?(?:br|b|i|u|url|img|span|color|size)(?:=[^\]]+)?\]/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/`{1,3}/g, "")
    .replace(/[*_~>#]+/g, " ")
    .replace(/https?:\/\/\S+/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function htmlMetaDescription(text) {
  const match = String(text ?? "").match(/<meta\b[^>]+(?:name|property)=["'](?:description|og:description)["'][^>]+content=["']([^"']+)["'][^>]*>/i)
    ?? String(text ?? "").match(/<meta\b[^>]+content=["']([^"']+)["'][^>]+(?:name|property)=["'](?:description|og:description)["'][^>]*>/i);
  return match ? cleanText(match[1]) : null;
}

function titleText(text) {
  const match = String(text ?? "").match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match ? cleanText(match[1]) : null;
}

function paragraphs(text) {
  return String(text ?? "")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/```[\s\S]*?```/g, " ")
    .split(/\r?\n\s*\r?\n|<p\b[^>]*>|<\/p>/i)
    .map(cleanText)
    .filter((value) => value.split(/\s+/).length >= 8)
    .filter((value) => !/^https?:\/\//i.test(value))
    .filter((value) => !/^(?:install|installation|usage|quick start|getting started|configuration|requirements?)\b/i.test(value));
}

function sourceDescriptionCandidates(text, kind) {
  const value = String(text ?? "");
  const candidates = [];
  const meta = htmlMetaDescription(value);
  if (meta) candidates.push({ kind: "meta_description", text: meta });

  for (const tag of ["overview", "description", "short_description", "tagline", "summary"]) {
    const pattern = new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
    const match = value.match(pattern);
    const cleaned = match ? cleanText(match[1]) : null;
    if (cleaned && cleaned.split(/\s+/).length >= 5) candidates.push({ kind: `${kind}_${tag}`, text: cleaned });
  }

  for (const paragraph of paragraphs(value).slice(0, 8)) {
    candidates.push({ kind: `${kind}_paragraph`, text: paragraph });
  }

  const title = titleText(value);
  if (title && title.split(/\s+/).length >= 3) candidates.push({ kind: "html_title", text: title });
  return candidates.slice(0, sourceLimit);
}

function githubRepository(value) {
  try {
    const url = new URL(value);
    const parts = url.pathname.split("/").filter(Boolean);
    if (url.hostname !== "github.com" || parts.length < 2) return null;
    return { owner: parts[0], repo: parts[1].replace(/\.git$/i, "") };
  } catch {
    return null;
  }
}

function sourceReadmeUrls(value) {
  try {
    const url = new URL(value);
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts.length < 2) return [];
    const files = ["README.md", "README.rst", "README", "docs/README.md"];
    if (url.hostname === "github.com") {
      return files.map((file) => `https://raw.githubusercontent.com/${parts[0]}/${parts[1]}/HEAD/${file}`);
    }
    if (url.hostname === "gitlab.com") {
      return files.flatMap((file) => [
        `https://gitlab.com/${parts.join("/")}/-/raw/HEAD/${file}`,
        `https://gitlab.com/${parts.join("/")}/-/raw/main/${file}`,
      ]);
    }
    if (url.hostname === "codeberg.org") {
      return files.flatMap((file) => [
        `https://codeberg.org/${parts.join("/")}/raw/branch/main/${file}`,
        `https://codeberg.org/${parts.join("/")}/raw/branch/master/${file}`,
      ]);
    }
  } catch {
    return [];
  }
  return [];
}

function sourceUrls(app) {
  const existing = unique([
    ...sourceReadmeUrls(app.source_code_url),
    app.website_url,
    app.docs_url,
    app.install_docs_url,
    app.source_code_url,
    ...(app.data_source_urls ?? []),
  ]);
  return existing
    .filter((url) => !/\/issues(?:[/?#]|$)/i.test(url))
    .filter((url) => !/\/topics(?:[/?#]|$)/i.test(url))
    .slice(0, sourceLimit);
}

async function fetchSource(url) {
  try {
    const response = await fetch(url, {
      headers: { Accept: "text/plain,text/html,application/xhtml+xml,application/json,*/*", "User-Agent": userAgent },
      redirect: "follow",
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) return { url, status: response.status, ok: false };
    const body = (await response.text()).slice(0, 240_000);
    const type = response.headers.get("content-type") ?? "";
    return {
      url,
      final_url: response.url,
      status: response.status,
      content_type: type,
      ok: true,
      excerpt: body.slice(0, 8_000),
      candidates: sourceDescriptionCandidates(body, type.includes("html") ? "html" : "text"),
    };
  } catch (error) {
    return { url, ok: false, error: error.message };
  }
}

async function researchApp(app) {
  const urls = sourceUrls(app);
  const sources = [];
  for (const url of urls) {
    const result = await fetchSource(url);
    sources.push(result);
    if (result.ok && result.candidates?.length > 0) break;
  }
  const usable = sources.find((source) => source.ok && source.candidates?.length > 0) ?? null;
  return {
    slug: app.slug,
    name: app.name,
    current_summary: app.summary,
    summary_source: app.summary_source,
    summary_confidence: app.summary_confidence,
    source_code_url: app.source_code_url,
    website_url: app.website_url,
    docs_url: app.docs_url,
    install_docs_url: app.install_docs_url,
    source_urls: urls,
    recommended_source_url: usable?.final_url ?? usable?.url ?? urls[0] ?? null,
    candidates: usable?.candidates ?? [],
    source_results: sources,
  };
}

async function main() {
  const args = parseArgs();
  if (!args.out) throw new Error("Usage: node scripts/self-host-apps/research-summaries.mjs --out <packet.json> [--file candidates.json] [--limit N] [--offset N] [--concurrency N]");
  const offset = Number(args.offset ?? 0);
  const limit = numberArg(args, "limit", Number.MAX_SAFE_INTEGER);
  let selected;
  if (args.file) {
    const input = JSON.parse(await readFile(args.file, "utf8"));
    const records = Array.isArray(input) ? input : input.records ?? input.apps ?? [];
    selected = args["only-flagged"] ? records.filter((row) => summaryNeedsCleanup(row.summary)) : records;
  } else {
    selected = await withClient(async (client) => {
      const result = await client.query(
        "select slug, name, summary, summary_source, summary_confidence, source_code_url, website_url, docs_url, install_docs_url, data_source_urls " +
        "from public.self_host_apps where published = true and self_hosting_status = 'self_hostable' order by slug",
      );
      return args["only-flagged"] ? result.rows.filter((row) => summaryNeedsCleanup(row.summary)) : result.rows;
    }, args["database-url"]);
  }
  const rows = selected.slice(offset, offset + limit);
  const records = await mapConcurrent(rows, numberArg(args, "concurrency", 6), researchApp);
  const report = {
    generated_at: new Date().toISOString(),
    mode: "evidence_only",
    selected: rows.length,
    offset,
    source_successes: records.filter((record) => record.candidates.length > 0).length,
    records,
  };
  await writeFile(args.out, `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify({
    mode: report.mode,
    selected: report.selected,
    offset: report.offset,
    source_successes: report.source_successes,
    output: args.out,
  }, null, 2));
}

main().catch((error) => {
  console.error(error.stack ?? error.message);
  process.exit(1);
});
