#!/usr/bin/env node

// Scoop bucket discovery: enumerate every manifest in the Main and Extras
// buckets through the git trees API (one request per bucket).

import { parseArgs } from "./lib/args.mjs";
import { fetchJson } from "./lib/http.mjs";
import { normalizeCandidate } from "./lib/normalize.mjs";
import { storeCandidates, recordFailedRun } from "./lib/store.mjs";
import { withClient } from "./lib/db.mjs";

const source = "scoop";

const buckets = [
  { repo: "ScoopInstaller/Main", branch: "master", dir: "bucket" },
  { repo: "ScoopInstaller/Extras", branch: "master", dir: "bucket" },
];

async function main() {
  const args = parseArgs();
  const dryRun = Boolean(args["dry-run"]);

  let candidates = [];

  try {
    for (const bucket of buckets) {
      const treeUrl = `https://api.github.com/repos/${bucket.repo}/git/trees/${bucket.branch}?recursive=1`;
      const tree = await fetchJson(treeUrl, { minIntervalMs: 1000 });

      if (tree.truncated) {
        console.warn(`${bucket.repo} tree truncated by GitHub`);
      }

      const manifests = (tree.tree ?? []).filter(
        (entry) => entry.type === "blob" && entry.path.startsWith(`${bucket.dir}/`) && entry.path.endsWith(".json"),
      );

      console.log(`${bucket.repo}: ${manifests.length} manifests`);

      for (const manifest of manifests) {
        const token = manifest.path.split("/").pop().replace(/\.json$/, "");
        const candidate = normalizeCandidate(
          {
            name: token,
            install_methods: ["scoop"],
            source_key: `${bucket.repo}:${token}`,
            website_url: null,
            payload: {
              bucket: bucket.repo,
              manifest_path: manifest.path,
              sha: manifest.sha,
            },
          },
          { source, sourceType: "package_registry", sourceUrl: `https://github.com/${bucket.repo}/blob/${bucket.branch}/${manifest.path}` },
        );
        if (candidate) candidates.push(candidate);
      }
    }
  } catch (error) {
    console.error(`scoop failed: ${error.message}`);
    if (!dryRun) {
      await withClient((client) => recordFailedRun(client, { source, sourceUrl: "https://scoop.sh/", error }));
    }
    process.exit(1);
  }

  console.log(`collected ${candidates.length} scoop candidates`);

  if (args.out) {
    const { writeFile, mkdir } = await import("node:fs/promises");
    await mkdir((await import("node:path")).dirname(args.out), { recursive: true });
    await writeFile(args.out, `${JSON.stringify({ source, candidates }, null, 2)}\n`);
  }

  if (args.write && !dryRun) {
    const result = await withClient((client) => storeCandidates(client, candidates, {
      source,
      sourceUrl: "https://scoop.sh/",
      notes: "Main + Extras bucket manifests via git trees API",
    }));
    console.log(JSON.stringify(result, null, 2));
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
