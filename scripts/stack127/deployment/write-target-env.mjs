#!/usr/bin/env node

import { readFileSync, writeFileSync } from "node:fs";

const output = process.argv[2];
if (!output) throw new Error("Output path is required.");

const manifest = JSON.parse(
  readFileSync(new URL("./targets.json", import.meta.url), "utf8"),
);
const target = manifest.production;
const values = {
  STACK127_PRODUCTION_TARGET: target.id,
  STACK127_PRODUCTION_PROVIDER: target.provider,
  STACK127_PRODUCTION_HOST: target.origin.ipv4,
  STACK127_PRODUCTION_IPV6: target.origin.ipv6,
  STACK127_PRODUCTION_SSH_USER: target.ssh.user,
  STACK127_PRODUCTION_DOKPLOY_URL: target.dokploy.url,
  STACK127_PRODUCTION_DOKPLOY_APP_ID: target.dokploy.applicationId,
  STACK127_PRODUCTION_DOKPLOY_APP_NAME: target.dokploy.appName,
  STACK127_PRODUCTION_REPOSITORY: target.repository.fullName,
  STACK127_PRODUCTION_BRANCH: target.repository.branch,
};

writeFileSync(
  output,
  `${Object.entries(values).map(([key, value]) => `${key}=${value}`).join("\n")}\n`,
  { mode: 0o600 },
);
