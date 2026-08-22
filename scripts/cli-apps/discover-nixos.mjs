#!/usr/bin/env node

// NixOS discovery: the official nixpkgs package overview is one brotli-compressed
// JSON document. The catalogue is not terminal-scoped, so records pass through
// the documented relevance predicate and rejected counts land in the run notes.

import { parseArgs } from "./lib/args.mjs";
import { fetchBuffer } from "./lib/http.mjs";
import { normalizeCandidate } from "./lib/normalize.mjs";
import { storeCandidates, recordFailedRun } from "./lib/store.mjs";
import { withClient } from "./lib/db.mjs";
import { isTerminalRelevant } from "./lib/relevance.mjs";

const source = "nixos";

async function main() {
  const args = parseArgs();
  const dryRun = Boolean(args["dry-run"]);

  let candidates = [];
  let scanned = 0;
  let rejected = 0;

  try {
    // fetch decompresses the brotli transfer encoding transparently.
    const buffer = await fetchBuffer("https://channels.nixos.org/nixpkgs-unstable/packages.json.br", {
      minIntervalMs: 1000,
    });
    const parsed = JSON.parse(buffer.toString("utf8"));

    const packageList = Array.isArray(parsed)
      ? parsed
      : parsed && typeof parsed === "object" && parsed.packages && !Array.isArray(parsed.packages)
        ? Object.values(parsed.packages)
        : [];

    if (packageList.length === 0) {
      throw new Error(`unexpected nixpkgs payload shape: ${typeof parsed}`);
    }

    console.log(`nixpkgs unstable: ${packageList.length} packages`);

    for (const pkg of packageList) {
      scanned += 1;
      const name = pkg.pkgname ?? pkg.pname ?? pkg.name;
      if (!isTerminalRelevant({ name, description: pkg.description })) {
        rejected += 1;
        continue;
      }

      const candidate = normalizeCandidate(
        {
          name,
          summary: pkg.description,
          latest_version: pkg.version ?? null,
          install_methods: ["nix"],
          source_key: `nixpkgs:${pkg.attr_name ?? name}`,
          payload: {
            attr_name: pkg.attr_name,
            pname: pkg.pname,
            license: pkg.license?.fullName ?? pkg.license ?? null,
            platforms: pkg.platforms,
          },
        },
        { source, sourceType: "package_registry", sourceUrl: `https://search.nixos.org/packages?show=${pkg.attr_name ?? name}` },
      );
      if (candidate) candidates.push(candidate);
    }

    console.log(`relevance filter: kept ${candidates.length}, rejected ${rejected} of ${scanned}`);
  } catch (error) {
    console.error(`nixos failed: ${error.message}`);
    if (!dryRun) {
      await withClient((client) => recordFailedRun(client, { source, sourceUrl: "https://channels.nixos.org/nixpkgs-unstable/packages.json.br", error }));
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
      sourceUrl: "https://search.nixos.org/packages",
      notes: `full nixpkgs-unstable overview scanned (${scanned}); relevance filter kept ${candidates.length}, rejected ${rejected}`,
    }));
    console.log(JSON.stringify(result, null, 2));
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
