#!/usr/bin/env node

import { parseArgs, readJson, writeText } from "./lib.mjs";

const datasetColumns = [
  ["slug", "Stable Stack127 app slug."],
  ["name", "App name."],
  ["summary", "Plain-language description of what the app does."],
  ["category_names", "Pipe-separated category names."],
  ["website_url", "Official website when available."],
  ["source_code_url", "Source-code repository when available."],
  ["source_code_host", "Source-code host such as GitHub, GitLab, or Codeberg."],
  ["docs_url", "General documentation link when available."],
  ["license", "Project license label when available."],
  ["license_type", "License family: permissive, copyleft, public domain, mixed, custom, or unknown."],
  ["source_model", "Whether the reviewed license is open source, source available, or unknown."],
  ["docker_support", "Docker support: official, community, none, or unknown."],
  ["compose_support", "Whether a clear Compose path is known."],
  ["requires_database", "Whether a separate database service is required."],
  ["database_types", "Pipe-separated database engines when known."],
  ["surfaces", "Pipe-separated usable surfaces such as web, CLI, desktop, or mobile."],
  ["github_primary_language", "Primary GitHub language when available."],
  ["github_topics", "Pipe-separated raw GitHub topics when available."],
];

function table(rows) {
  return [
    "| Column | Meaning |",
    "| --- | --- |",
    ...rows.map(([name, description]) => `| \`${name}\` | ${description} |`),
  ].join("\n");
}

export function renderDatasetRootReadme({ generatedAt, datasets }) {
  const datasetRows = datasets
    .map(
      (dataset) =>
        `| [${dataset.title}](${dataset.path}/) | \`${dataset.path}/apps.csv\` | ${dataset.description} | ${dataset.rowCount.toLocaleString("en-US")} | ${dataset.updatedAt} |`,
    )
    .join("\n");

  return `# Stack127 Datasets

Open CSV datasets for self-hosting, open-source tools, home automation, and practical technical research.

Stack127 turns technical directories into clean, downloadable datasets. The website gives you search, filters, sorting, and readable pages; this repository gives you the CSV files for analysis, reuse, citation, and automation.

Start with the self-host apps dataset if you want a structured list of apps you can run on your own server, including project links, categories, Docker support, licenses, database needs, and usable surfaces.

| Dataset | CSV | Description | Rows | Updated |
| --- | --- | --- | ---: | --- |
${datasetRows}

## What You Can Do With These Datasets

- Browse the CSV directly in GitHub's table preview.
- Download the data for spreadsheets, scripts, dashboards, and research.
- Compare self-host apps by category, Docker support, license, database needs, and surface.
- Link to Stack127 when you cite or reuse the dataset.

## Browse Online

The most comfortable way to explore the data is the Stack127 website:

https://stack127.com/self-host-apps

Use GitHub when you want the raw CSV. Use Stack127 when you want fast search, filters, and a cleaner reading experience.

## Corrections

If something looks wrong, open an issue with the dataset name, row slug, current value, suggested correction, and a source link. Clear corrections help keep both the website and CSV useful.

## License

Unless otherwise noted, Stack127 dataset exports are available under CC BY 4.0. Attribution should link to https://stack127.com and this repository.

Last refreshed: ${generatedAt}
`;
}

export function renderSelfHostAppsReadme({ generatedAt, rowCount, updatedAt }) {
  return `# Stack127 Self-Host Apps Dataset

Structured CSV dataset for self-host apps, homelab software, open-source server tools, and apps you can run on your own infrastructure.

The Stack127 website is the easiest way to search, filter, sort, and compare these apps:

https://stack127.com/self-host-apps

## Files

- \`apps.csv\`: self-host app records with public project links, categories, Docker notes, database needs, licenses, and surfaces.

## Dataset Size And Freshness

Project links point to the upstream websites, docs, and repositories. Check those links when you need the absolute latest upstream status.

Rows: ${rowCount.toLocaleString("en-US")}

Last data update: ${updatedAt}

CSV refreshed: ${generatedAt}

## Columns

${table(datasetColumns)}

## What's Included

- Self-host app names, slugs, summaries, and Stack127 categories.
- Official websites, source repositories, and docs when available.
- License, Docker, Compose, database, surface, language, and GitHub topic fields.

## What Is Not Included

- Long reviews or install guides. Use Stack127 and the linked project docs for context.
- Every upstream project field. The CSV focuses on practical comparison fields.
- Unpublished or duplicate entries.

## Corrections

Open an issue in this repo with the app slug, the current value, the requested value, and a source link. Good source links include official docs, project websites, GitHub repositories, release pages, and container/package pages.

## License

Unless otherwise noted, this dataset is available under CC BY 4.0. Attribution should link to https://stack127.com/self-host-apps and this repository.
`;
}

export function renderContributing() {
  return `# Contributing

Thanks for helping improve Stack127 datasets.

## Dataset Corrections

Open an issue with:

- dataset name
- row slug or identifier
- field that should change
- current value
- requested value
- source link proving the correction

Stack127 reviews corrections before publishing the next CSV update.

## Pull Requests

Documentation fixes for README files are welcome. For CSV data corrections, issues are usually easier because they let us verify the source and update the next dataset refresh cleanly.
`;
}

export function renderDatasetLicense() {
  return `Creative Commons Attribution 4.0 International

Stack127 dataset exports are made available under CC BY 4.0 unless a dataset README says otherwise.

You are free to share and adapt the dataset exports with attribution to Stack127.

Human-readable license summary:
https://creativecommons.org/licenses/by/4.0/

Full license text:
https://creativecommons.org/licenses/by/4.0/legalcode
`;
}

function main() {
  const args = parseArgs();
  if (!args.meta || !args.out) return;

  const meta = readJson(args.meta);
  if (args.type === "root") {
    writeText(args.out, renderDatasetRootReadme(meta));
    return;
  }
  if (args.type === "self-host-apps") {
    writeText(args.out, renderSelfHostAppsReadme(meta));
    return;
  }

  throw new Error("Use --type root or --type self-host-apps.");
}

main();
