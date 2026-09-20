#!/usr/bin/env node

const HELP = `Usage:
  node skills/stack127/tools/stack127-tool-research/scripts/searxng-search.mjs [options] <query>

Options:
  --url <url>             SearXNG base URL or /search URL
  --engines <list>        Comma-separated engines (default: bing,duckduckgo)
  --language <code>       Search language (default: en)
  --categories <list>     SearXNG categories (default: general)
  --limit <number>        Limit returned results after the response (default: 20)
  --timeout-ms <number>   Request timeout (default: 15000)
  --help                  Show this help

Environment:
  STACK127_SEARXNG_URL or SEARXNG_URL
`;

function parseArgs(argv) {
  const options = { engines: "bing,duckduckgo", language: "en", categories: "general", limit: 20, timeoutMs: 15000 };
  const query = [];

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--help" || argument === "-h") {
      console.log(HELP);
      process.exit(0);
    }

    if (argument.startsWith("--")) {
      const name = argument.slice(2);
      const value = argv[index + 1];
      if (!value || value.startsWith("--")) throw new Error(`Missing value for --${name}`);
      index += 1;
      if (name === "url") options.url = value;
      else if (name === "engines" || name === "language" || name === "categories") options[name] = value;
      else if (name === "limit" || name === "timeout-ms") {
        const key = name === "timeout-ms" ? "timeoutMs" : name;
        const number = Number(value);
        if (!Number.isInteger(number) || number < 1) throw new Error(`Invalid --${name}: ${value}`);
        options[key] = number;
      } else throw new Error(`Unknown option: --${name}`);
      continue;
    }

    query.push(argument);
  }

  if (query.length === 0) throw new Error("A search query is required");
  return { options, query: query.join(" ") };
}

function searchUrl(base, params) {
  const url = new URL(base);
  if (!url.pathname.endsWith("/search")) {
    url.pathname = `${url.pathname.replace(/\/$/, "")}/search`;
  }
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, String(value));
  return url;
}

const { options, query } = parseArgs(process.argv.slice(2));
const endpoint = options.url ?? process.env.STACK127_SEARXNG_URL ?? process.env.SEARXNG_URL ?? "http://127.0.0.1:8080";
const engines = options.engines.split(",").map((engine) => engine.trim()).filter(Boolean);
if (engines.length === 0) throw new Error("At least one SearXNG engine is required");

const url = searchUrl(endpoint, {
  q: query,
  format: "json",
  engines: engines.join(","),
  categories: options.categories,
  language: options.language,
});
const endpointLabel = `${url.origin}${url.pathname}`;

let payload;
try {
  const response = await fetch(url, { signal: AbortSignal.timeout(options.timeoutMs), headers: { accept: "application/json" } });
  if (!response.ok) throw new Error(`SearXNG returned HTTP ${response.status}`);
  payload = await response.json();
} catch (error) {
  console.error(`SearXNG request failed for ${endpointLabel}: ${error.message}`);
  process.exitCode = 1;
  process.exit();
}

if (!Array.isArray(payload.results)) {
  console.error("SearXNG returned no JSON results array; check the endpoint and JSON format setting.");
  process.exitCode = 1;
  process.exit();
}

const results = payload.results.slice(0, options.limit).map((result) => ({
  title: result.title ?? null,
  url: result.url ?? result.href ?? null,
  content: result.content ?? result.snippet ?? null,
  engine: result.engine ?? null,
  engines: Array.isArray(result.engines) ? result.engines : null,
  category: result.category ?? null,
  publishedDate: result.publishedDate ?? null,
}));

console.log(JSON.stringify({
  query,
  endpoint: endpointLabel,
  engines,
  resultCount: results.length,
  results,
}, null, 2));
