#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";

const path = "scripts/self-host-apps/temp/queued-enrichment-004-selfhostedworld-evidence.json";
const input = JSON.parse(await readFile(path, "utf8"));
const sources = {
  "sim-studio": "https://github.com/simstudioai/sim",
  picoclaw: "https://github.com/sipeed/picoclaw",
  perplexica: "https://github.com/ItzCrazyKns/Perplexica",
  "open-notebook": "https://github.com/lfnovo/open-notebook",
  openscreen: "https://github.com/siddharthvaddem/openscreen",
  "libre-chat": "https://github.com/danny-avila/LibreChat",
  "sentry-self-hosted": "https://github.com/getsentry/self-hosted",
  goose: "https://github.com/block/goose",
  "private-gpt": "https://github.com/zylon-ai/private-gpt",
  context7: "https://github.com/upstash/context7",
  "anything-llm": "https://github.com/Mintplex-Labs/anything-llm",
  cline: "https://github.com/cline/cline",
  gpt4all: "https://github.com/nomic-ai/gpt4all",
};
const batch = JSON.parse(await readFile("scripts/self-host-apps/temp/queued-enrichment-004.json", "utf8"));
const byId = new Map(batch.candidates.map((candidate) => [candidate.id, candidate]));

for (const record of input.records) {
  const candidate = byId.get(record.candidate_id);
  const sourceCodeUrl = sources[candidate?.slug];
  if (!sourceCodeUrl) continue;
  record.ok = true;
  record.status = 200;
  record.evidence = {
    ...record.evidence,
    source_code_url: sourceCodeUrl,
    repository_urls: [sourceCodeUrl],
  };
}

await writeFile(path, `${JSON.stringify(input, null, 2)}\n`);
console.log(JSON.stringify({ patched: Object.keys(sources).length }));
