import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

export function parseArgs(argv = process.argv) {
  const args = {};

  for (let index = 2; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) continue;

    const [key, inlineValue] = token.slice(2).split("=", 2);
    if (inlineValue !== undefined) {
      args[key] = inlineValue;
      continue;
    }

    const next = argv[index + 1];
    if (!next || next.startsWith("--")) {
      args[key] = true;
      continue;
    }

    args[key] = next;
    index += 1;
  }

  return args;
}

export function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return;

  const values = readEnvValues(filePath);
  for (const [key, value] of Object.entries(values)) {
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

export function readEnvValues(filePath) {
  if (!existsSync(filePath)) return {};

  const content = readFileSync(filePath, "utf8");
  const values = {};
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const equalsIndex = trimmed.indexOf("=");
    if (equalsIndex === -1) continue;

    const key = trimmed.slice(0, equalsIndex).trim();
    const value = trimmed.slice(equalsIndex + 1).trim().replace(/^['"]|['"]$/g, "");
    if (key) values[key] = value;
  }

  return values;
}

export function loadRepoEnv() {
  loadEnvFile(".env.repos");
}

export function ensureDir(dir) {
  mkdirSync(dir, { recursive: true });
}

export function writeText(filePath, content) {
  ensureDir(path.dirname(filePath));
  writeFileSync(filePath, content.endsWith("\n") ? content : `${content}\n`);
}

export function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, "utf8"));
}

export function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd ?? process.cwd(),
    env: options.env ?? process.env,
    encoding: "utf8",
    stdio: options.capture ? ["ignore", "pipe", "pipe"] : "inherit",
  });

  if (result.status !== 0) {
    const details = options.capture
      ? `\n${result.stdout ?? ""}${result.stderr ?? ""}`.trimEnd()
      : "";
    throw new Error(`Command failed: ${command} ${args.join(" ")}${details ? `\n${details}` : ""}`);
  }

  return result;
}

export function copyFileTree(sourceDir, targetDir) {
  ensureDir(targetDir);

  for (const entry of readdirSync(sourceDir)) {
    const sourcePath = path.join(sourceDir, entry);
    const targetPath = path.join(targetDir, entry);
    const stat = statSync(sourcePath);

    if (stat.isDirectory()) {
      copyFileTree(sourcePath, targetPath);
    } else if (stat.isFile()) {
      writeText(targetPath, readFileSync(sourcePath, "utf8"));
    }
  }
}

export function csvEscape(value) {
  if (value === null || value === undefined) return "";
  const text = String(value);
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function toCsv(rows, columns) {
  const header = columns.map((column) => csvEscape(column)).join(",");
  const body = rows.map((row) => columns.map((column) => csvEscape(row[column])).join(","));
  return [header, ...body].join("\n");
}

export function isoDate(value) {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}

export function requireArg(args, key) {
  const value = args[key];
  if (!value || value === true) throw new Error(`Missing required --${key}`);
  return value;
}
