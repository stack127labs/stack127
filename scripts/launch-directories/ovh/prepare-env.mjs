#!/usr/bin/env node
// Run on homelab only. Never emits credentials to stdout.
import { readFileSync, writeFileSync } from "node:fs";
import { hostname } from "node:os";
import { parseArgs, parseEnv } from "node:util";

if (hostname().split(".")[0] !== "teja-homelab" || process.cwd() !== "/srv/data/projects/stack127") throw new Error("Run from the homelab source checkout");
const { values } = parseArgs({ options: { out: { type: "string", default: ".env.launch-directory-metrics" } } });
const database = parseEnv(readFileSync(".env.database", "utf8"));
const analytics = parseEnv(readFileSync(".env.analytics", "utf8"));
if (!analytics.AHREFS_API_KEY?.trim()) throw new Error("AHREFS_API_KEY is missing from homelab .env.analytics");
let url;
try { url = new URL(database.DATABASE_POOLER_URL || database.DATABASE_URL); }
catch { throw new Error("Invalid production database URL"); }
if (url.hostname !== "database.stack127.com" || url.username !== "stack127_app" || url.pathname !== "/postgres" || (url.port || "5432") !== "5432") throw new Error("Unexpected production database identity");
url.hostname = "127.0.0.1";
url.searchParams.set("sslmode", "disable");
writeFileSync(values.out, Object.entries({ DATABASE_URL: url.href, AHREFS_API_KEY: analytics.AHREFS_API_KEY })
  .map(([key, value]) => `${key}=${JSON.stringify(value)}`).join("\n") + "\n", { mode: 0o600, flag: "wx" });
console.log("Wrote the two-key metrics env file. Copy it privately to OVH with mode 600.");
