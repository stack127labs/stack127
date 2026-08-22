#!/usr/bin/env node

// WinGet discovery: walk the microsoft/winget-pkgs manifests tree. GitHub
// truncates very large tree responses, so this collector records exactly how
// many entries it saw and whether the response was truncated.

import { parseArgs } from "./lib/args.mjs";
import { fetchJson } from "./lib/http.mjs";
import { normalizeCandidate } from "./lib/normalize.mjs";
import { storeCandidates, recordFailedRun } from "./lib/store.mjs";
import { withClient } from "./lib/db.mjs";

const source = "winget";

async function main() {
  const args = parseArgs();
  const dryRun = Boolean(args["dry-run"]);

  let candidates = [];
  let truncated = false;

  try {
    const treeUrl = "https://api.github.com/repos/microsoft/winget-pkgs/git/trees/master?recursive=1";
    const tree = await fetchJson(treeUrl, { minIntervalMs: 1500 });
    truncated = Boolean(tree.truncated);

    const entries = (tree.tree ?? []).filter(
      (entry) => entry.type === "blob" && entry.path.startsWith("manifests/"),
    );

    // Package identity is manifests/<letter>/<publisher>/<package>/... so
    // unique package ids can be read straight off the paths.
    const packages = new Map();
    for (const entry of entries) {
      const parts = entry.path.split("/");
      if (parts.length < 4) continue;
      const packageId = parts.slice(2, 4).join(".");
      if (!packages.has(packageId)) {
        packages.set(packageId, entry.path);
      }
    }

    console.log(`winget manifests tree: ${entries.length} entries, ${packages.size} distinct packages, truncated=${truncated}`);

    for (const [packageId, path] of packages) {
      const candidate = normalizeCandidate(
        {
          name: packageId.split(".").pop(),
          install_methods: ["winget"],
          source_key: `pkg:${packageId}`,
          payload: {
            winget_package_id: packageId,
            manifest_path: path,
            tree_truncated: truncated,
          },
        },
        { source, sourceType: "package_registry", sourceUrl: `https://github.com/microsoft/winget-pkgs/tree/master/${path}` },
      );
      if (candidate) candidates.push(candidate);
    }
  } catch (error) {
    console.error(`winget failed: ${error.message}`);
    if (!dryRun) {
      await withClient((client) => recordFailedRun(client, { source, sourceUrl: "https://github.com/microsoft/winget-pkgs", error }));
    }
    process.exit(1);
  }

  console.log(`collected ${candidates.length} winget candidates`);

  if (args.out) {
    const { writeFile, mkdir } = await import("node:fs/promises");
    await mkdir((await import("node:path")).dirname(args.out), { recursive: true });
    await writeFile(args.out, `${JSON.stringify({ source, candidates, truncated }, null, 2)}\n`);
  }

  if (args.write && !dryRun) {
    const result = await withClient((client) => storeCandidates(client, candidates, {
      source,
      sourceUrl: "https://github.com/microsoft/winget-pkgs",
      notes: truncated
        ? `git trees API truncated the manifests listing; covered the first ${candidates.length} package ids in tree order`
        : "full manifests tree",
    }));
    console.log(JSON.stringify(result, null, 2));
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
