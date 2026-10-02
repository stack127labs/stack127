#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const defaultManifestPath = path.join(repositoryRoot, "scripts/stack127/deployment/targets.json");
const defaultEnvironmentPath = path.join(repositoryRoot, ".env.deploy");

const forbiddenLegacyKeys = [
  "VPS_HOST",
  "VPS_ROOT_USER",
  "VPS_ROOT_PASSWORD",
  "VPS_ADMIN_USER",
  "VPS_ADMIN_PASSWORD",
  "DOKPLOY_PUBLIC_URL",
];

export function parseEnvText(text) {
  const environment = {};

  for (const rawLine of text.split(/\r?\n/u)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const separator = line.indexOf("=");
    if (separator < 1) continue;

    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();

    if (
      value.length >= 2 &&
      ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'")))
    ) {
      value = value.slice(1, -1);
    }

    environment[key] = value;
  }

  return environment;
}

export function validateDeploymentEnvironment(environment, manifest) {
  const production = manifest.production;
  const expected = {
    STACK127_PRODUCTION_TARGET: production.id,
    STACK127_PRODUCTION_PROVIDER: production.provider,
    STACK127_PRODUCTION_HOST: production.origin.ipv4,
    STACK127_PRODUCTION_IPV6: production.origin.ipv6,
    STACK127_PRODUCTION_SSH_USER: production.ssh.user,
    STACK127_PRODUCTION_DOKPLOY_URL: production.dokploy.url,
    STACK127_PRODUCTION_DOKPLOY_APP_ID: production.dokploy.applicationId,
    STACK127_PRODUCTION_DOKPLOY_APP_NAME: production.dokploy.appName,
    STACK127_PRODUCTION_REPOSITORY: production.repository.fullName,
    STACK127_PRODUCTION_BRANCH: production.repository.branch,
  };
  const errors = [];

  for (const key of forbiddenLegacyKeys) {
    if (key in environment) {
      errors.push(`${key} is a legacy or ambiguous deployment key and must not be present.`);
    }
  }

  for (const [key, expectedValue] of Object.entries(expected)) {
    if (!environment[key]) {
      errors.push(`${key} is required.`);
    } else if (environment[key] !== expectedValue) {
      errors.push(`${key} does not match the production target manifest.`);
    }
  }

  if (environment.STACK127_PRODUCTION_DOKPLOY_URL === manifest.legacy.dokploy.url) {
    errors.push("The selected Dokploy URL belongs to the legacy Hostinger target.");
  }

  return errors;
}

export async function verifyCloudflare(environment, manifest, fetchImplementation = fetch) {
  const token = environment.CLOUDFLARE_API_TOKEN;
  const zoneId = environment.CLOUDFLARE_ZONE_ID;
  if (!token || !zoneId) {
    return ["CLOUDFLARE_API_TOKEN and CLOUDFLARE_ZONE_ID are required for --check-cloudflare."];
  }

  let response;
  try {
    response = await fetchImplementation(
      `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records?name=stack127.com`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
  } catch (error) {
    return [
      `Cloudflare DNS check failed: ${error instanceof Error ? error.message : String(error)}`,
    ];
  }
  if (!response.ok) return [`Cloudflare DNS check failed with HTTP ${response.status}.`];

  const payload = await response.json();
  if (!payload.success) return ["Cloudflare DNS check did not return a successful response."];

  const address = payload.result.find((record) => record.type === "A")?.content;
  const ipv6 = payload.result.find((record) => record.type === "AAAA")?.content;
  const errors = [];

  if (address !== manifest.production.origin.ipv4) {
    errors.push("Cloudflare A record does not match the OVH production manifest.");
  }
  if (ipv6 !== manifest.production.origin.ipv6) {
    errors.push("Cloudflare AAAA record does not match the OVH production manifest.");
  }

  return errors;
}

function verifyGit(manifest) {
  try {
    const head = execFileSync("git", ["rev-parse", "HEAD"], {
      cwd: repositoryRoot,
      encoding: "utf8",
    }).trim();
    const productionHead = execFileSync("git", ["rev-parse", "origin/main"], {
      cwd: repositoryRoot,
      encoding: "utf8",
    }).trim();
    const remote = execFileSync("git", ["remote", "get-url", "origin"], {
      cwd: repositoryRoot,
      encoding: "utf8",
    }).trim();
    const errors = [];

    if (head !== productionHead) errors.push("HEAD does not match origin/main.");
    if (!remote.toLowerCase().includes(manifest.production.repository.fullName.toLowerCase())) {
      errors.push("The origin remote does not match the production repository.");
    }

    return errors;
  } catch (error) {
    return [`Git preflight failed: ${error instanceof Error ? error.message : String(error)}`];
  }
}

function argumentValue(argumentsList, name, fallback) {
  const index = argumentsList.indexOf(name);
  return index >= 0 ? argumentsList[index + 1] : fallback;
}

export function verifyStaticRoutes({ sourceOnly = false, environment = process.env } = {}) {
  try {
    const output = execFileSync(process.execPath, [
      path.join(repositoryRoot, "scripts/stack127/check-static-routes.mjs"), "--strict",
      ...(sourceOnly ? ["--source-only"] : []),
    ], { cwd: repositoryRoot, env: environment, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
    console.log(output.trim());
    return [];
  } catch (error) {
    return [`Static route check failed. ${String(error.stdout || error.message).trim()}`];
  }
}

async function main() {
  const argumentsList = process.argv.slice(2);
  const manifestPath = path.resolve(
    repositoryRoot,
    argumentValue(argumentsList, "--manifest", defaultManifestPath),
  );
  const environmentPath = path.resolve(
    repositoryRoot,
    argumentValue(argumentsList, "--env-file", defaultEnvironmentPath),
  );
  const [manifestText, environmentText] = await Promise.all([
    readFile(manifestPath, "utf8"),
    readFile(environmentPath, "utf8"),
  ]);
  const manifest = JSON.parse(manifestText);
  const environment = parseEnvText(environmentText);
  const errors = validateDeploymentEnvironment(environment, manifest);

  errors.push(...verifyStaticRoutes({ sourceOnly: argumentsList.includes("--static-source-only") }));

  if (argumentsList.includes("--check-git")) errors.push(...verifyGit(manifest));
  if (argumentsList.includes("--check-cloudflare")) {
    errors.push(...(await verifyCloudflare(environment, manifest)));
  }

  if (errors.length > 0) {
    console.error("Production deployment preflight failed:");
    for (const error of errors) console.error(`- ${error}`);
    process.exitCode = 1;
    return;
  }

  console.log(`Production target verified: ${manifest.production.id}`);
  console.log(`Dokploy: ${manifest.production.dokploy.url}`);
  console.log(`Application: ${manifest.production.dokploy.appName}`);
  console.log(`Repository: ${manifest.production.repository.fullName}@${manifest.production.repository.branch}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main();
}
