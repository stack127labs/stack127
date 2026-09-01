#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { writeFile } from "node:fs/promises";
import { parseArgs } from "./lib/args.mjs";
import { withClient } from "./lib/db.mjs";
import { declaredSpdxFromManifest, detectSpdxLicense } from "./lib/license-detection.mjs";
import { licenseTypeFromSpdx, sourceModelFromSpdx } from "./lib/schema.mjs";

const args = parseArgs();
if (!args.out) throw new Error("Pass --out with the research report path.");

function storedGithubToken() {
  try {
    return execFileSync("env", ["-u", "GITHUB_TOKEN", "-u", "GH_TOKEN", "gh", "auth", "token"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return null;
  }
}

let token = storedGithubToken() ?? process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN ?? null;

function githubHeaders() {
  return {
    accept: "application/vnd.github+json",
    "user-agent": "stack127-license-research",
    ...(token ? { authorization: `Bearer ${token}` } : {}),
  };
}

async function githubJson(url) {
  let response = await fetch(url, { headers: githubHeaders(), signal: AbortSignal.timeout(30_000) });
  if (response.status === 401 && token) {
    token = null;
    response = await fetch(url, { headers: githubHeaders(), signal: AbortSignal.timeout(30_000) });
  }
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return response.json();
}

async function publicGithubText(url) {
  const response = await fetch(url, {
    headers: { "user-agent": "stack127-license-research" },
    redirect: "follow",
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) return null;
  return response.text();
}

async function validateGithubToken() {
  if (!token) return;
  const response = await fetch("https://api.github.com/rate_limit", {
    headers: githubHeaders(),
    signal: AbortSignal.timeout(30_000),
  });
  if (response.status === 401) token = null;
}

function githubRepository(url) {
  const match = String(url ?? "").match(/^https:\/\/github\.com\/([^/]+)\/([^/#?]+?)(?:\.git)?(?:\/(?:tree|blob)\/[^/]+(?:\/.*)?)?\/?$/i);
  return match ? `${match[1]}/${match[2]}` : null;
}

function resolvedLicense(slug, repository, spdx, sourceName, sourceUrl, note = `Detected from ${sourceName}; manual review required before applying.`) {
  return {
    confidence: "high",
    sources: [{ confidence: "high", note, source: "official_repository_license_file", source_url: sourceUrl }],
    license: spdx,
    license_spdx_id: spdx,
    license_type: licenseTypeFromSpdx(spdx),
    repository,
    slug,
    source_model: sourceModelFromSpdx(spdx),
    status: "resolved",
  };
}

async function mapConcurrent(values, concurrency, callback) {
  const results = new Array(values.length);
  let cursor = 0;
  async function worker() {
    while (cursor < values.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await callback(values[index]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, values.length) }, worker));
  return results;
}

async function research(row) {
  const repository = githubRepository(row.source_code_url);
  if (!repository) return { slug: row.slug, status: "unresolved", reason: "Source is not a root GitHub repository", source_code_url: row.source_code_url };
  try {
    if (!token) {
      const repositoryPage = await publicGithubText(`https://github.com/${repository}`);
      const branch = repositoryPage?.match(/defaultBranch&quot;:&quot;([^&]+)&quot;/)?.[1]
        ?? repositoryPage?.match(/"defaultBranch":"([^"]+)"/)?.[1];
      if (!branch) return { slug: row.slug, status: "unresolved", reason: "Could not determine the repository default branch", repository };
      const names = ["LICENSE", "LICENSE.md", "LICENSE.txt", "LICENCE", "LICENCE.md", "LICENCE.txt", "COPYING", "COPYING.md", "COPYING.txt", "COPYRIGHT"];
      for (const name of names) {
        const sourceUrl = `https://raw.githubusercontent.com/${repository}/${encodeURIComponent(branch)}/${name}`;
        const text = await publicGithubText(sourceUrl);
        if (!text) continue;
        const spdx = detectSpdxLicense(text);
        if (!spdx) continue;
        return resolvedLicense(row.slug, repository, spdx, `${name} text`, `https://github.com/${repository}/blob/${encodeURIComponent(branch)}/${name}`);
      }
      for (const name of ["package.json", "composer.json", "Cargo.toml", "pyproject.toml", "setup.cfg"]) {
        const sourceUrl = `https://raw.githubusercontent.com/${repository}/${encodeURIComponent(branch)}/${name}`;
        const text = await publicGithubText(sourceUrl);
        const spdx = text ? declaredSpdxFromManifest(name, text) : null;
        if (spdx) return resolvedLicense(row.slug, repository, spdx, `${name} license field`, `https://github.com/${repository}/blob/${encodeURIComponent(branch)}/${name}`);
      }
      return { slug: row.slug, status: "unresolved", reason: "No recognized root license file published", repository };
    }

    try {
      const detected = await githubJson(`https://api.github.com/repos/${repository}/license`);
      const spdx = detected.license?.spdx_id;
      if (spdx && !["NOASSERTION", "OTHER"].includes(spdx)) {
        return {
          confidence: "high",
          sources: [{
            confidence: "high",
            note: `Detected by GitHub Licensee from ${detected.name}; manual review required before applying.`,
            source: "official_repository_license_file",
            source_url: detected.html_url,
          }],
          license: spdx,
          license_spdx_id: spdx,
          license_type: licenseTypeFromSpdx(spdx),
          repository,
          slug: row.slug,
          source_model: sourceModelFromSpdx(spdx),
          status: "resolved",
        };
      }
    } catch {
      // Some repositories have no root license file. The content pass below records that clearly.
    }

    const contents = await githubJson(`https://api.github.com/repos/${repository}/contents`);
    const licenseFiles = contents
      .filter((item) => item.type === "file" && /^(?:license|licence|copying|copyright)(?:\.|$)/i.test(item.name))
      .sort((left, right) => left.name.localeCompare(right.name));
    for (const file of licenseFiles) {
      const data = await githubJson(file.url);
      const text = data.content ? Buffer.from(data.content, "base64").toString("utf8") : "";
      const spdx = detectSpdxLicense(text);
      if (!spdx) continue;
      return resolvedLicense(row.slug, repository, spdx, `${file.name} text`, file.html_url);
    }
    const manifestFiles = contents.filter((item) => item.type === "file" && /^(?:package\.json|composer\.json|cargo\.toml|pyproject\.toml|setup\.cfg)$/i.test(item.name));
    for (const file of manifestFiles) {
      const data = await githubJson(file.url);
      const text = data.content ? Buffer.from(data.content, "base64").toString("utf8") : "";
      const spdx = declaredSpdxFromManifest(file.name, text);
      if (spdx) return resolvedLicense(row.slug, repository, spdx, `${file.name} license field`, file.html_url);
    }
    return {
      slug: row.slug,
      status: "unresolved",
      reason: licenseFiles.length > 0 ? "License file uses an unrecognized or custom text" : "No root license file published",
      repository,
      license_files: licenseFiles.map((file) => ({ name: file.name, source_url: file.html_url })),
    };
  } catch (error) {
    return { slug: row.slug, status: "unresolved", reason: error.message, repository };
  }
}

const rows = await withClient(async (client) => {
  const result = await client.query(
    `
      select slug, name, source_code_url
      from public.self_host_apps
      where published = true
        and self_hosting_status = 'self_hostable'
        and (source_model = 'unknown' or license is null or lower(license) = 'unknown')
      order by slug
    `,
  );
  return result.rows;
}, args["database-url"]);

await validateGithubToken();
const records = await mapConcurrent(rows, 6, research);
const resolved = records.filter((record) => record.status === "resolved");
const unresolved = records.filter((record) => record.status !== "resolved");
const report = { generated_at: new Date().toISOString(), source_total: rows.length, resolved_total: resolved.length, unresolved_total: unresolved.length, records };
await writeFile(args.out, `${JSON.stringify(report, null, 2)}\n`);
if (args["review-out"]) {
  const apps = resolved.map((record) => ({
    slug: record.slug,
    license: record.license,
    license_spdx_id: record.license_spdx_id,
    license_type: record.license_type,
    source_model: record.source_model,
    sources: record.sources,
  }));
  await writeFile(args["review-out"], `${JSON.stringify({ apps }, null, 2)}\n`);
}
console.log(JSON.stringify({ source_total: rows.length, resolved_total: resolved.length, unresolved_total: unresolved.length, out: args.out, review_out: args["review-out"] ?? null }, null, 2));
