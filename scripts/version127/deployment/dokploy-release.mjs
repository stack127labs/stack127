#!/usr/bin/env node

import { setTimeout as sleep } from "node:timers/promises";

const defaultDeployTimeoutSeconds = 15 * 60;
const defaultDeployPollSeconds = 10;
const defaultSiteTimeoutMs = 20_000;

const successStates = new Set([
  "done",
  "completed",
  "complete",
  "success",
  "succeeded",
  "healthy",
  "ready",
]);

const failureStates = new Set([
  "cancelled",
  "canceled",
  "error",
  "failed",
  "failure",
  "killed",
  "terminated",
]);

function requiredEnvironment(name) {
  const value = String(process.env[name] ?? "").trim();
  if (!value) throw new Error(`${name} is required.`);
  return value;
}

function optionalEnvironment(name, fallback = "") {
  return String(process.env[name] ?? fallback).trim();
}

function numberEnvironment(name, fallback) {
  const value = Number(optionalEnvironment(name, String(fallback)));
  if (!Number.isFinite(value) || value < 0) return fallback;
  return value;
}

function configFromEnvironment() {
  const config = {
    apiUrl: requiredEnvironment("DOKPLOY_API_URL").replace(/\/$/u, ""),
    apiKey: requiredEnvironment("DOKPLOY_API_KEY"),
    applicationId: requiredEnvironment("DOKPLOY_APPLICATION_ID"),
    dockerImage: requiredEnvironment("DOKPLOY_DOCKER_IMAGE"),
    ghcrUsername: requiredEnvironment("GHCR_DOKPLOY_USERNAME"),
    ghcrToken: requiredEnvironment("GHCR_DOKPLOY_TOKEN"),
    siteUrl: optionalEnvironment("VERSION127_SITE_URL", "https://version127.com").replace(/\/$/u, ""),
    releaseSha: requiredEnvironment("VERSION127_RELEASE_SHA"),
    accessClientId: optionalEnvironment("CF_ACCESS_CLIENT_ID"),
    accessClientSecret: optionalEnvironment("CF_ACCESS_CLIENT_SECRET"),
    deployTimeoutSeconds: numberEnvironment("DOKPLOY_DEPLOY_TIMEOUT_SECONDS", defaultDeployTimeoutSeconds),
    deployPollSeconds: numberEnvironment("DOKPLOY_DEPLOY_POLL_SECONDS", defaultDeployPollSeconds),
  };

  if ((config.accessClientId && !config.accessClientSecret) || (!config.accessClientId && config.accessClientSecret)) {
    throw new Error("CF_ACCESS_CLIENT_ID and CF_ACCESS_CLIENT_SECRET must be provided together.");
  }

  return config;
}

function apiHeaders(config) {
  const headers = {
    accept: "application/json",
    "content-type": "application/json",
    "x-api-key": config.apiKey,
  };
  if (config.accessClientId) {
    headers["CF-Access-Client-Id"] = config.accessClientId;
    headers["CF-Access-Client-Secret"] = config.accessClientSecret;
  }
  return headers;
}

async function readResponse(response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text.slice(0, 4_000);
  }
}

function printableBody(body, secrets = []) {
  if (body === null || body === undefined) return "(empty response)";
  let rendered = typeof body === "string" ? body : JSON.stringify(body);
  for (const secret of secrets) {
    if (secret) rendered = rendered.replaceAll(secret, "[redacted]");
  }
  return rendered;
}

async function dokployRequest(config, method, endpoint, body) {
  let response;
  try {
    response = await fetch(`${config.apiUrl}${endpoint}`, {
      method,
      headers: apiHeaders(config),
      body: body === undefined ? undefined : JSON.stringify(body),
      redirect: "manual",
      signal: AbortSignal.timeout(defaultSiteTimeoutMs),
    });
  } catch (error) {
    throw new Error(`Dokploy API request failed: ${error instanceof Error ? error.message : String(error)}`);
  }

  const responseBody = await readResponse(response);
  if (response.status >= 300 && response.status < 400) {
    throw new Error(
      `Dokploy API returned HTTP ${response.status} for ${method} ${endpoint}. ` +
        "The Cloudflare Access service token may be missing or the API URL may be wrong.",
    );
  }
  if (!response.ok) {
    throw new Error(
      `Dokploy API returned HTTP ${response.status} for ${method} ${endpoint}: ${printableBody(responseBody, [
        config.apiKey,
        config.ghcrToken,
        config.accessClientSecret,
      ])}`,
    );
  }
  return responseBody;
}

export function extractDeploymentRecords(payload) {
  if (Array.isArray(payload)) return payload.filter((value) => value && typeof value === "object");
  if (!payload || typeof payload !== "object") return [];

  for (const key of ["deployments", "data", "items", "results"]) {
    const value = payload[key];
    if (Array.isArray(value)) return value.filter((entry) => entry && typeof entry === "object");
    if (value && typeof value === "object") {
      const nested = extractDeploymentRecords(value);
      if (nested.length > 0) return nested;
    }
  }

  return [payload];
}

export function deploymentId(record) {
  if (!record || typeof record !== "object") return "";
  for (const key of ["deploymentId", "id", "uuid"]) {
    if (typeof record[key] === "string" && record[key]) return record[key];
  }
  return "";
}

export function deploymentState(record) {
  if (!record || typeof record !== "object") return "";
  for (const key of ["status", "state", "deploymentStatus", "deployStatus"]) {
    if (typeof record[key] === "string" && record[key]) return record[key].toLowerCase().replace(/\s+/gu, "_");
  }
  return "";
}

export function isFailureState(state) {
  return failureStates.has(state);
}

export function isSuccessState(state) {
  return successStates.has(state);
}

function deploymentTimestamp(record) {
  if (!record || typeof record !== "object") return 0;
  for (const key of ["createdAt", "startedAt", "updatedAt", "finishedAt", "date"]) {
    const timestamp = Date.parse(String(record[key] ?? ""));
    if (Number.isFinite(timestamp)) return timestamp;
  }
  return 0;
}

function newestDeployment(records, expectedId = "") {
  const matching = expectedId ? records.filter((record) => deploymentId(record) === expectedId) : records;
  const candidates = matching.length > 0 ? matching : records;
  return [...candidates].sort((left, right) => deploymentTimestamp(right) - deploymentTimestamp(left))[0] ?? null;
}

async function configureImage(config) {
  await dokployRequest(config, "POST", "/api/application.saveDockerProvider", {
    applicationId: config.applicationId,
    dockerImage: config.dockerImage,
    username: config.ghcrUsername,
    password: config.ghcrToken,
    registryUrl: "ghcr.io",
  });
  console.log(`Dokploy application now points to ${config.dockerImage}.`);
}

async function triggerDeployment(config) {
  const payload = await dokployRequest(config, "POST", "/api/application.deploy", {
    applicationId: config.applicationId,
  });
  const records = extractDeploymentRecords(payload);
  const triggerRecord = newestDeployment(records);
  const id = deploymentId(triggerRecord);
  console.log(`Dokploy deployment triggered${id ? ` (${id})` : ""}.`);
  return id;
}

async function waitForDeployment(config, expectedId) {
  const deadline = Date.now() + config.deployTimeoutSeconds * 1_000;
  let sawRecord = false;
  let lastDescription = "no deployment record yet";

  while (Date.now() < deadline) {
    const payload = await dokployRequest(
      config,
      "GET",
      `/api/deployment.all?applicationId=${encodeURIComponent(config.applicationId)}`,
    );
    const record = newestDeployment(extractDeploymentRecords(payload), expectedId);
    if (record) {
      sawRecord = true;
      const state = deploymentState(record);
      const id = deploymentId(record) || "unknown-id";
      lastDescription = `${id}:${state || "unknown-state"}`;
      console.log(`Dokploy deployment status: ${lastDescription}.`);
      if (isFailureState(state)) throw new Error(`Dokploy deployment failed (${lastDescription}).`);
      if (isSuccessState(state)) return record;

      // Dokploy versions have returned records without a stable status field.
      // Once one exists, let the public health endpoint be the final authority.
      if (sawRecord && !state) return record;
    }

    await sleep(config.deployPollSeconds * 1_000);
  }

  throw new Error(`Timed out waiting for Dokploy deployment (${lastDescription}).`);
}

async function siteRequest(url) {
  let response;
  try {
    response = await fetch(url, {
      redirect: "follow",
      signal: AbortSignal.timeout(defaultSiteTimeoutMs),
      headers: { accept: "text/html,application/json,text/plain,application/xml" },
    });
  } catch (error) {
    throw new Error(`Live site request failed for ${url}: ${error instanceof Error ? error.message : String(error)}`);
  }
  const body = await response.text();
  return { response, body };
}

function assertSha(actual, expected) {
  if (!actual || actual !== expected) {
    throw new Error(`Live build SHA mismatch: expected ${expected}, received ${actual || "missing"}.`);
  }
}

async function verifyLiveSite(config) {
  const deadline = Date.now() + config.deployTimeoutSeconds * 1_000;
  let lastHealthError = "live health has not responded";
  let payload = null;

  while (Date.now() < deadline) {
    try {
      const health = await siteRequest(`${config.siteUrl}/api/health?scope=deploy`);
      if (health.response.status !== 200) {
        lastHealthError = `HTTP ${health.response.status}`;
      } else {
        try {
          payload = JSON.parse(health.body);
        } catch {
          lastHealthError = "response was not JSON";
          payload = null;
        }
        if (payload?.ok !== true) lastHealthError = "ok=false";
        else if (payload?.build?.sha !== config.releaseSha) {
          lastHealthError = `build SHA ${payload?.build?.sha || "missing"}`;
        } else {
          assertSha(payload.build.sha, config.releaseSha);
          console.log(`Live health passed with build ${payload.build.sha}.`);
          break;
        }
      }
    } catch (error) {
      lastHealthError = error instanceof Error ? error.message : String(error);
    }
    await sleep(config.deployPollSeconds * 1_000);
  }

  if (!payload || payload.ok !== true || payload.build?.sha !== config.releaseSha) {
    throw new Error(`Live health did not reach ${config.releaseSha} before timeout (${lastHealthError}).`);
  }

  const smokeChecks = [
    ["/", "<title", "<main"],
    ["/robots.txt", "Sitemap:"],
    ["/sitemap.xml", "<sitemap"],
  ];
  for (const [pathname, ...needles] of smokeChecks) {
    const result = await siteRequest(`${config.siteUrl}${pathname}?__version127_release=${config.releaseSha.slice(0, 12)}`);
    if (result.response.status !== 200) throw new Error(`${pathname} returned HTTP ${result.response.status}.`);
    const lowerBody = result.body.toLowerCase();
    for (const needle of needles) {
      if (!lowerBody.includes(needle.toLowerCase())) throw new Error(`${pathname} is missing expected marker ${needle}.`);
    }
    console.log(`Live smoke passed: ${pathname}.`);
  }
}

async function main() {
  const command = process.argv[2] ?? "release";
  const config = configFromEnvironment();

  if (command === "configure-image") {
    await configureImage(config);
    return;
  }
  if (command === "trigger") {
    await triggerDeployment(config);
    return;
  }
  if (command === "wait") {
    await waitForDeployment(config, optionalEnvironment("DOKPLOY_DEPLOYMENT_ID"));
    return;
  }
  if (command === "health") {
    await verifyLiveSite(config);
    return;
  }
  if (command === "release") {
    await configureImage(config);
    const deploymentIdValue = await triggerDeployment(config);
    await waitForDeployment(config, deploymentIdValue);
    await verifyLiveSite(config);
    return;
  }

  throw new Error(`Unknown command: ${command}. Use release, configure-image, trigger, wait, or health.`);
}

if (process.argv[1] && new URL(`file://${process.argv[1]}`).pathname === new URL(import.meta.url).pathname) {
  await main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
