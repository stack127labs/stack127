#!/usr/bin/env node

// Awesome-list markdown discovery for one repo at a time. Handles the common
// "- [Name](url): description" and "- [Name](url) - description" shapes and
// keeps the section heading as category evidence.

import { parseArgs } from "./lib/args.mjs";
import { fetchText } from "./lib/http.mjs";
import { normalizeCandidate, slugify } from "./lib/normalize.mjs";
import { storeCandidates, recordFailedRun } from "./lib/store.mjs";
import { withClient } from "./lib/db.mjs";

const lists = {
  "awesome-cli-apps": {
    url: "https://raw.githubusercontent.com/agarrharr/awesome-cli-apps/master/readme.md",
    sourceUrl: "https://github.com/agarrharr/awesome-cli-apps",
  },
  "awesome-tuis": {
    url: "https://raw.githubusercontent.com/rothgar/awesome-tuis/master/README.md",
    sourceUrl: "https://github.com/rothgar/awesome-tuis",
  },
  "awesome-modern-cli": {
    url: "https://raw.githubusercontent.com/thegdsks/awesome-modern-cli/main/README.md",
    sourceUrl: "https://github.com/thegdsks/awesome-modern-cli",
  },
};

function cleanMarkdown(value) {
  return String(value ?? "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/[_*]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function parseList(markdown) {
  const entries = [];
  let category = null;

  for (const line of markdown.split(/\r?\n/)) {
    const heading = line.match(/^#{2,4}\s+(.+)$/);
    if (heading) {
      category = cleanMarkdown(heading[1]);
      continue;
    }

    const entry = line.match(/^[-*]\s+\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)\s*(?:[-:\u2013\u2014]\s*)?(.*)$/);
    if (!entry) continue;

    const [, rawName, url, rest] = entry;
    entries.push({
      name: cleanMarkdown(rawName),
      url,
      description: cleanMarkdown(rest.replace(/\s*[-:\u2013\u2014]\s*.*$/, (m) => (m.length < 3 ? "" : m))) || null,
      category,
      raw: line,
    });
  }

  return entries;
}

async function main() {
  const args = parseArgs();
  const listName = args.list;
  const dryRun = Boolean(args["dry-run"]);

  if (!listName || !lists[listName]) {
    console.error(`Pass --list <${Object.keys(lists).join("|")}>`);
    process.exit(1);
  }

  const list = lists[listName];
  let candidates;
  try {
    const markdown = await fetchText(list.url, { minIntervalMs: 500 });
    const entries = parseList(markdown);

    candidates = [];
    for (const entry of entries) {
      const candidate = normalizeCandidate(
        {
          name: entry.name,
          summary: entry.description,
          website_url: entry.url,
          categories: entry.category ? [entry.category] : [],
          source_key: `md:${slugify(entry.name)}:${slugify(entry.category ?? "")}:${entry.url}`,
          payload: { markdown_category: entry.category, line: entry.raw.slice(0, 400) },
        },
        { source: listName, sourceType: "awesome_list", sourceUrl: list.sourceUrl },
      );
      if (candidate) candidates.push(candidate);
    }

    console.log(`${listName}: ${entries.length} entries, parsed ${candidates.length}`);
  } catch (error) {
    console.error(`${listName} failed: ${error.message}`);
    if (!dryRun) {
      await withClient((client) => recordFailedRun(client, { source: listName, sourceUrl: list.url, error }));
    }
    process.exit(1);
  }

  if (args.out) {
    const { writeFile, mkdir } = await import("node:fs/promises");
    await mkdir((await import("node:path")).dirname(args.out), { recursive: true });
    await writeFile(args.out, `${JSON.stringify({ source: listName, candidates }, null, 2)}\n`);
  }

  if (args.write && !dryRun) {
    const result = await withClient((client) => storeCandidates(client, candidates, {
      source: listName,
      sourceUrl: list.sourceUrl,
      notes: "Awesome list markdown crawl",
    }));
    console.log(JSON.stringify(result, null, 2));
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
