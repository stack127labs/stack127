#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseArgs, numberArg } from "./lib/args.mjs";
import { canonicalSourceCodeUrl, normalizeCandidate, storeCandidates } from "./lib/candidates.mjs";
import { withClient } from "./lib/db.mjs";

const catalogs = {
  truenas: {
    source: "truenas_apps",
    sourceUrl: "https://github.com/truenas/apps",
    dataUrl: "https://raw.githubusercontent.com/truenas/apps/master/catalog.json",
  },
  umbrel: {
    source: "umbrel_apps",
    sourceUrl: "https://github.com/getumbrel/umbrel-apps",
    contentsUrl: "https://api.github.com/repos/getumbrel/umbrel-apps/contents",
  },
};

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json, application/json",
      "User-Agent": "stack127-self-host-app-catalog-discovery/1.0",
      ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
    },
  });
  if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.status}`);
  return response.json();
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: { "User-Agent": "stack127-self-host-app-catalog-discovery/1.0" },
  });
  if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.status}`);
  return response.text();
}

function firstUrl(values, predicate) {
  return values.find((value) => typeof value === "string" && predicate(value)) ?? null;
}

function sourceCodeUrlForApp(values, key, title) {
  const candidates = values.filter(
    (value) => typeof value === "string" && /github\.com|gitlab\.com|codeberg\.org/i.test(value),
  );
  const names = [key, title]
    .filter(Boolean)
    .flatMap((value) => String(value).toLowerCase().split(/[^a-z0-9]+/))
    .filter((value) => value.length > 2);

  return candidates
    .map((url, index) => {
      const normalized = url.toLowerCase();
      const matchScore = names.reduce((score, name) => score + (normalized.includes(name) ? 4 : 0), 0);
      const packagingPenalty = /(?:^|[\/_-])(helm|chart|charts|deploy|deployment|docker)(?:$|[\/_-])/i.test(url) ? 6 : 0;
      return { url, score: matchScore - packagingPenalty - index / 100 };
    })
    .sort((left, right) => right.score - left.score)[0]?.url ?? null;
}

function truenasCandidates(catalog) {
  const candidates = [];
  for (const [train, entries] of Object.entries(catalog ?? {})) {
    for (const [key, entry] of Object.entries(entries ?? {})) {
      if (!entry || typeof entry !== "object") continue;
      const sources = Array.isArray(entry.sources) ? entry.sources : [];
      const sourceCodeUrl = sourceCodeUrlForApp(sources, key, entry.title ?? entry.name);
      const dockerUrl = firstUrl(sources, (url) => /hub\.docker\.com|ghcr\.io|quay\.io/i.test(url));
      const itemUrl = `https://apps.truenas.com/catalog/${key}_${train}/`;
      candidates.push({
        name: entry.title ?? entry.name ?? key,
        slug: key,
        summary: entry.description ?? null,
        website_url: entry.home ?? firstUrl(sources, (url) => !/github\.com|apps\.truenas\.com|hub\.docker\.com/i.test(url)),
        source_code_url: canonicalSourceCodeUrl(sourceCodeUrl),
        docker_url: dockerUrl,
        source_url: itemUrl,
        categories: [...(entry.categories ?? []), ...(entry.tags ?? [])],
        payload: {
          catalog: "truenas/apps",
          train,
          key,
          icon_source_url: entry.icon_url ?? null,
          release_version: entry.latest_app_version ?? null,
          release_published_at: entry.last_update ?? null,
          raw: entry,
        },
      });
    }
  }
  return candidates;
}

function yamlScalar(text, key) {
  const match = text.match(new RegExp(`^${key}:\\s*["']?([^\\n"']+)["']?\\s*$`, "m"));
  return match?.[1]?.trim() ?? null;
}

function dockerImageUrl(image) {
  if (!image) return null;
  const clean = image.replace(/@sha256:.+$/, "").replace(/:[^/:]+$/, "");
  if (clean.startsWith("ghcr.io/")) return `https://${clean}`;
  if (clean.startsWith("quay.io/")) return `https://${clean}`;
  const dockerPath = clean.includes("/") ? clean : `library/${clean}`;
  return `https://hub.docker.com/r/${dockerPath}`;
}

async function umbrelCandidates(config, limit) {
  const contents = await fetchJson(config.contentsUrl);
  const directories = contents.filter((item) => item.type === "dir" && !item.name.startsWith(".")).slice(0, limit);
  const candidates = [];

  for (let offset = 0; offset < directories.length; offset += 12) {
    const batch = directories.slice(offset, offset + 12);
    const results = await Promise.all(
      batch.map(async (directory) => {
        const manifestUrl = `https://raw.githubusercontent.com/getumbrel/umbrel-apps/master/${directory.name}/umbrel-app.yml`;
        const composeUrl = `https://raw.githubusercontent.com/getumbrel/umbrel-apps/master/${directory.name}/docker-compose.yml`;
        try {
          const [manifest, compose] = await Promise.all([fetchText(manifestUrl), fetchText(composeUrl)]);
          const images = [...compose.matchAll(/^\s*image:\s*["']?([^\s"']+)/gm)].map((match) => match[1]);
          const appImage = images.find((image) => !/umbrel-app-proxy/i.test(image)) ?? null;
          const sourceCodeUrl = canonicalSourceCodeUrl(
            yamlScalar(manifest, "repo") ?? yamlScalar(manifest, "repository") ?? yamlScalar(manifest, "source"),
          );
          return {
            name: yamlScalar(manifest, "name") ?? directory.name,
            slug: directory.name,
            summary: yamlScalar(manifest, "tagline") ?? yamlScalar(manifest, "description"),
            website_url: yamlScalar(manifest, "website"),
            source_code_url: sourceCodeUrl,
            docker_url: dockerImageUrl(appImage),
            source_url: `https://github.com/getumbrel/umbrel-apps/tree/master/${directory.name}`,
            payload: {
              catalog: "getumbrel/umbrel-apps",
              app_id: directory.name,
              manifest_url: manifestUrl,
              compose_url: composeUrl,
              icon_source_url: `https://raw.githubusercontent.com/getumbrel/umbrel-apps/master/${directory.name}/icon.svg`,
              docker_image: appImage,
              version: yamlScalar(manifest, "version"),
              manifest,
            },
          };
        } catch (error) {
          console.warn(`warning ${directory.name}: ${error.message}`);
          return null;
        }
      }),
    );
    candidates.push(...results.filter(Boolean));
  }

  return candidates;
}

async function discover(catalog, limit) {
  const config = catalogs[catalog];
  if (catalog === "truenas") return truenasCandidates(await fetchJson(config.dataUrl)).slice(0, limit);
  return umbrelCandidates(config, limit);
}

async function main() {
  const args = parseArgs();
  const selected = args.catalog ?? "all";
  const names = selected === "all" ? Object.keys(catalogs) : [selected];
  if (names.some((name) => !catalogs[name])) {
    throw new Error("Usage: npm run self-host-apps:discover-app-catalogs -- --catalog truenas|umbrel|all [--write]");
  }

  const limit = numberArg(args, "limit", 5000);
  const report = { fetched_at: new Date().toISOString(), catalogs: {} };
  for (const name of names) {
    const config = catalogs[name];
    const candidates = (await discover(name, limit))
      .map((candidate) => normalizeCandidate(candidate, { source: config.source, sourceUrl: config.sourceUrl, baseUrl: config.sourceUrl }))
      .filter(Boolean);
    const result = args.write
      ? await withClient(
          (client) => storeCandidates(client, candidates, {
            source: config.source,
            sourceUrl: config.sourceUrl,
            notes: `Official ${name} app catalog discovery`,
          }),
          args["database-url"],
        )
      : { discovered: candidates.length };
    report.catalogs[name] = { ...result, candidates: args.write ? undefined : candidates.slice(0, 20) };
  }

  if (args.out) {
    await mkdir(path.dirname(args.out), { recursive: true });
    await writeFile(args.out, `${JSON.stringify(report, null, 2)}\n`);
  }
  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error(error.stack ?? error.message);
  process.exit(1);
});
