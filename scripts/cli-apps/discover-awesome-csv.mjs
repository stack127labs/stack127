#!/usr/bin/env node

// awesome-cli-apps-in-a-csv discovery: exhaust data/apps.csv and
// data/abandoned-apps.csv, preserving category and abandonment evidence.

import { parseArgs } from "./lib/args.mjs";
import { fetchText } from "./lib/http.mjs";
import { normalizeCandidate } from "./lib/normalize.mjs";
import { storeCandidates, recordFailedRun } from "./lib/store.mjs";
import { withClient } from "./lib/db.mjs";

const source = "awesome_cli_apps_csv";
const rawBase = "https://raw.githubusercontent.com/toolleeo/awesome-cli-apps-in-a-csv/master/data";

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];

    if (inQuotes) {
      if (char === '"') {
        if (text[index + 1] === '"') {
          field += '"';
          index += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field.replace(/\r$/, ""));
      field = "";
      if (row.some((value) => value.trim() !== "")) rows.push(row);
      row = [];
    } else {
      field += char;
    }
  }

  if (field || row.length > 0) {
    row.push(field);
    if (row.some((value) => value.trim() !== "")) rows.push(row);
  }

  return rows;
}

async function main() {
  const args = parseArgs();
  const dryRun = Boolean(args["dry-run"]);

  let candidates;
  try {
    const [appsCsv, abandonedCsv] = await Promise.all([
      fetchText(`${rawBase}/apps.csv`, { minIntervalMs: 500 }),
      fetchText(`${rawBase}/abandoned-apps.csv`, { minIntervalMs: 500 }).catch(() => ""),
    ]);

    const abandonedNames = new Set(
      parseCsv(abandonedCsv)
        .slice(1)
        .map((row) => (row[1] ?? "").trim().toLowerCase())
        .filter(Boolean),
    );

    const rows = parseCsv(appsCsv);
    const header = rows[0].map((h) => h.trim().toLowerCase());
    const nameIndex = header.indexOf("name");
    const homepageIndex = header.indexOf("homepage");
    const gitIndex = header.indexOf("git");
    const descIndex = header.indexOf("description");
    const categoryIndex = header.indexOf("category");

    candidates = [];
    for (const row of rows.slice(1)) {
      const name = (row[nameIndex] ?? "").trim();
      if (!name) continue;

      const candidate = normalizeCandidate(
        {
          name,
          summary: (row[descIndex] ?? "").trim() || null,
          website_url: (row[homepageIndex] ?? "").trim() || null,
          repository_url: (row[gitIndex] ?? "").trim() || null,
          categories: [(row[categoryIndex] ?? "").trim()].filter(Boolean),
          source_key: `csv:${(row[gitIndex] || row[homepageIndex] || name).trim()}`,
          payload: {
            csv_category: (row[categoryIndex] ?? "").trim(),
            abandoned: abandonedNames.has(name.toLowerCase()),
          },
        },
        { source, sourceType: "awesome_list", sourceUrl: `${rawBase}/apps.csv` },
      );
      if (candidate) candidates.push(candidate);
    }

    console.log(`awesome-cli-apps-in-a-csv: ${rows.length - 1} app rows, parsed ${candidates.length}`);
  } catch (error) {
    console.error(`awesome-cli-apps-in-a-csv failed: ${error.message}`);
    if (!dryRun) {
      await withClient((client) => recordFailedRun(client, { source, sourceUrl: `${rawBase}/apps.csv`, error }));
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
      sourceUrl: "https://github.com/toolleeo/awesome-cli-apps-in-a-csv",
      notes: "CSV catalogue incl. abandoned-apps cross-check",
    }));
    console.log(JSON.stringify(result, null, 2));
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
