#!/usr/bin/env node

// TerminalApps (terminal-apps.dev) discovery: the whole catalogue renders on
// the home page as project cards with GitHub links and star counts.

import { parseArgs } from "./lib/args.mjs";
import { fetchText } from "./lib/http.mjs";
import { decodeEntities } from "./lib/html.mjs";
import { normalizeCandidate } from "./lib/normalize.mjs";
import { storeCandidates, recordFailedRun } from "./lib/store.mjs";
import { withClient } from "./lib/db.mjs";

const source = "terminal_apps_dev";
const baseUrl = "https://terminal-apps.dev/";

function parseEntries(html) {
  const entries = [];
  const cardPattern = /<h2[^>]*>\s*<span>([^<]+)<\/span>\s*(?:<span>\[?([0-9.]+[KM]?)\s*Stars\]?<\/span>)?[\s\S]*?data-s:event="Visit Project"[^>]*href="(https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+)"/g;

  for (const match of html.matchAll(cardPattern)) {
    const [, rawName, rawStars, repoUrl] = match;
    const stars = rawStars
      ? Number(rawStars.endsWith("K") ? Number.parseFloat(rawStars) * 1000 : rawStars)
      : null;
    entries.push({
      name: decodeEntities(rawName).trim(),
      repository_url: repoUrl,
      stars: Number.isFinite(stars) ? Math.round(stars) : null,
    });
  }

  return entries;
}

async function main() {
  const args = parseArgs();
  const dryRun = Boolean(args["dry-run"]);

  let candidates;
  try {
    const html = await fetchText(baseUrl, { minIntervalMs: 500 });
    const entries = parseEntries(html);

    candidates = entries
      .map((entry) =>
        normalizeCandidate(
          {
            ...entry,
            source_key: `${entry.repository_url}`,
            payload: { terminal_apps_dev: true },
          },
          { source, sourceType: "directory", sourceUrl: baseUrl },
        ),
      )
      .filter(Boolean);

    console.log(`terminal-apps.dev: parsed ${candidates.length} entries`);
  } catch (error) {
    console.error(`terminal-apps.dev failed: ${error.message}`);
    if (!dryRun) {
      await withClient((client) => recordFailedRun(client, { source, sourceUrl: baseUrl, error }));
    }
    process.exit(1);
  }

  if (args.out) {
    const { writeFile, mkdir } = await import("node:fs/promises");
    await mkdir((await import("node:path")).dirname(args.out), { recursive: true });
    await writeFile(args.out, `${JSON.stringify({ source, candidates }, null, 2)}\n`);
  }

  if (args.write && !dryRun) {
    const result = await withClient((client) => storeCandidates(client, candidates, {
      source,
      sourceUrl: baseUrl,
      notes: "TerminalApps home page catalogue",
    }));
    console.log(JSON.stringify(result, null, 2));
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
