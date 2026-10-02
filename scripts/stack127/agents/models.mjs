#!/usr/bin/env node
// Picks the newest Sol and Luna models from Codex's model list, and keeps the
// project Codex default on the newest Sol.
//
//   node scripts/stack127/agents/models.mjs          print the current picks
//   node scripts/stack127/agents/models.mjs sync     update .codex/config.toml

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const codexHome = process.env.CODEX_HOME || path.join(os.homedir(), ".codex");
const projectConfig = path.join(repoRoot, ".codex", "config.toml");

function versionOf(slug, family) {
  const match = slug.match(new RegExp(`^gpt-(\\d+(?:\\.\\d+)*)-${family}$`));
  return match ? match[1].split(".").map(Number) : null;
}

function compareVersions(a, b) {
  for (let i = 0; i < Math.max(a.length, b.length); i += 1) {
    const diff = (a[i] ?? 0) - (b[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

export function newestModel(family, { cachePath = path.join(codexHome, "models_cache.json") } = {}) {
  if (!["sol", "luna"].includes(family)) return null;
  let models = [];
  try {
    const cache = JSON.parse(fs.readFileSync(cachePath, "utf8"));
    models = Array.isArray(cache) ? cache : cache.models ?? cache.data ?? [];
  } catch {
    return null;
  }
  if (!Array.isArray(models)) return null;
  let best = null;
  for (const model of models) {
    if (!model || typeof model !== "object" || typeof model.slug !== "string") continue;
    if (model.visibility && model.visibility !== "list") continue;
    const version = versionOf(model.slug ?? "", family);
    if (version && (!best || compareVersions(version, best.version) > 0)) best = { slug: model.slug, version };
  }
  return best?.slug ?? null;
}

export function syncProjectConfig({ configPath = projectConfig, cachePath } = {}) {
  const sol = newestModel("sol", { cachePath });
  if (!sol) return { changed: false, model: null };
  const current = fs.existsSync(configPath) ? fs.readFileSync(configPath, "utf8") : "";
  const sectionStart = current.search(/^\s*\[/m);
  let root = sectionStart < 0 ? current : current.slice(0, sectionStart);
  const sections = sectionStart < 0 ? "" : current.slice(sectionStart);
  for (const [key, value] of [["model", sol], ["model_reasoning_effort", "high"]]) {
    const pattern = new RegExp(`^[ \\t]*${key}\\s*=.*$`, "m");
    const line = `${key} = "${value}"`;
    root = pattern.test(root) ? root.replace(pattern, line) : `${line}\n${root}`;
  }
  const next = root + sections;
  if (next === current) return { changed: false, model: sol };
  fs.mkdirSync(path.dirname(configPath), { recursive: true });
  fs.writeFileSync(configPath, next);
  return { changed: true, model: sol };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv[2] === "sync") {
    const { changed, model } = syncProjectConfig();
    if (process.argv[3] !== "--quiet") console.log(model ? `Codex default: ${model}${changed ? " (updated)" : ""}` : "Codex model list not found.");
  } else {
    console.log(`sol: ${newestModel("sol") ?? "unknown"}`);
    console.log(`luna: ${newestModel("luna") ?? "unknown"}`);
    console.log("opus: opus (Claude Code alias for the newest Opus)");
  }
}
