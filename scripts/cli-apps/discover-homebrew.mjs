#!/usr/bin/env node

// Homebrew discovery: the full formula API is one document, so every formula
// is ingested (Homebrew distributes command-line software by definition).
// Casks are GUI-first; only terminal-relevant casks are ingested, and the
// filter rule is recorded in the run notes.

import { parseArgs } from "./lib/args.mjs";
import { fetchJson } from "./lib/http.mjs";
import { normalizeCandidate } from "./lib/normalize.mjs";
import { storeCandidates, recordFailedRun } from "./lib/store.mjs";
import { withClient } from "./lib/db.mjs";

const source = "homebrew";

const terminalCaskPattern = /(terminal|tui|cli|command.?line|shell|console|multiplexer|emulator)/i;

async function main() {
  const args = parseArgs();
  const dryRun = Boolean(args["dry-run"]);
  const includeCasks = args["no-casks"] !== true;

  let candidates = [];
  let caskScanned = 0;
  let caskMatched = 0;

  try {
    const formulae = await fetchJson("https://formulae.brew.sh/api/formula.json", { minIntervalMs: 1000 });
    console.log(`homebrew formulae: ${formulae.length}`);

    for (const formula of formulae) {
      const candidate = normalizeCandidate(
        {
          name: formula.name,
          summary: formula.desc,
          website_url: formula.homepage,
          latest_version: formula.versions?.stable ?? null,
          install_methods: ["brew"],
          source_key: `formula:${formula.name}`,
          payload: {
            tap: formula.tap,
            full_name: formula.full_name,
            deprecated: formula.deprecated,
            disabled: formula.disabled,
            bottle_stable: formula.bottle?.stable?.files ? Object.keys(formula.bottle.stable.files) : [],
          },
        },
        { source, sourceType: "package_registry", sourceUrl: `https://formulae.brew.sh/formula/${formula.name}` },
      );
      if (candidate) candidates.push(candidate);
    }

    if (includeCasks) {
      const casks = await fetchJson("https://formulae.brew.sh/api/cask.json", { minIntervalMs: 1000 });
      caskScanned = casks.length;

      for (const cask of casks) {
        const haystack = `${cask.name?.join(" ") ?? ""} ${cask.desc ?? ""} ${cask.token}`;
        if (!terminalCaskPattern.test(haystack)) continue;

        caskMatched += 1;
        const candidate = normalizeCandidate(
          {
            name: cask.name?.[0] ?? cask.token,
            summary: cask.desc,
            website_url: cask.homepage,
            latest_version: cask.version ?? null,
            install_methods: ["brew-cask"],
            categories: ["terminal-emulator-or-terminal-tool"],
            source_key: `cask:${cask.token}`,
            payload: {
              cask_token: cask.token,
              names: cask.name,
              filter: "terminal-relevance keyword match on token/name/description",
            },
          },
          { source, sourceType: "package_registry", sourceUrl: `https://formulae.brew.sh/cask/${cask.token}` },
        );
        if (candidate) candidates.push(candidate);
      }
      console.log(`homebrew casks: scanned ${caskScanned}, terminal-relevant ${caskMatched}`);
    }
  } catch (error) {
    console.error(`homebrew failed: ${error.message}`);
    if (!dryRun) {
      await withClient((client) => recordFailedRun(client, { source, sourceUrl: "https://formulae.brew.sh/api/formula.json", error }));
    }
    process.exit(1);
  }

  console.log(`collected ${candidates.length} homebrew candidates`);

  if (args.out) {
    const { writeFile, mkdir } = await import("node:fs/promises");
    await mkdir((await import("node:path")).dirname(args.out), { recursive: true });
    await writeFile(args.out, `${JSON.stringify({ source, candidates }, null, 2)}\n`);
  }

  if (args.write && !dryRun) {
    const result = await withClient((client) => storeCandidates(client, candidates, {
      source,
      sourceUrl: "https://formulae.brew.sh/",
      notes: includeCasks
        ? `all formulae + terminal-relevant casks (${caskMatched}/${caskScanned} matched keyword filter)`
        : "all formulae only",
    }));
    console.log(JSON.stringify(result, null, 2));
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
