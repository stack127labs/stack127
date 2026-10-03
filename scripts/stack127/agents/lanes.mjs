// Which lane usually owns which files. The lane note hook and AGENTS.md both follow this.
// Opus: writing, design, frontend, site content, and planning.
// Codex (Sol and Luna): backend, data, infra, and tests.

import path from "node:path";

// Exceptions must precede the broad lib/ rule.
const opusExceptions = [/^lib\/tool-catalog-art\.ts$/];

const opusPatterns = [
  /^app\/(?!api\/).*/,
  /^public\/(?:brand|course-images|logos)\//,
  /^public\/(?:favicon[^/]*|apple-touch-icon\.png|android-chrome-[^/]+\.png)$/,
  /^content_docs\/[^/]+\/(tool-spec|brief|writing-and-seo|interface-contract)\.md$/,
  /^stack127_docs\/(writing-style|shared-ui|design-system|css-architecture|tool-interface|page-families)\.md$/,
];

const codexPatterns = [
  /^app\/api\//,
  /^app\/(.+\/)?route\.(ts|tsx|js|mjs)$/,
  /^app\/(sitemap|robots|manifest)\.[a-z]+$/,
  /^lib\//,
  /^scripts\//,
  /^supabase\//,
  /^migrations\//,
  /^tests\//,
  /^\.github\//,
  /^\.(?:codex|claude)\/(?:config\.toml|hooks\.json|settings(?:\.local)?\.json)$/,
  /^\.env/,
  /^(?:proxy|middleware)\.[cm]?[jt]sx?$/,
  /^(package|package-lock)\.json$/,
  /^(next\.config|tsconfig)[^/]*$/,
  /^(Dockerfile|docker-compose)[^/]*$/,
  /^content_docs\/[^/]+\/(?:research(?:\/|\.md$)|competitive-report\.md$)/,
  /^content_docs\/.*\.(?:json|csv|tsv|sql)$/,
  /^stack127_docs\/(production-deployment|homelab-development|caching|tool-pages|quality-workflow|seo)\.md$/,
];

// Codex rules win over the broad app/ rule, so route handlers and SEO runtime files stay with Codex.
export function ownerOf(relativePath) {
  const normalized = path.posix.normalize(relativePath.replaceAll("\\", "/"));
  // Starter repositories follow the same ownership as their eventual files.
  if (normalized.startsWith("templates/stack127-tool-repo/")) return ownerOf(normalized.slice("templates/stack127-tool-repo/".length));
  if (opusExceptions.some((pattern) => pattern.test(normalized))) return "opus";
  if (codexPatterns.some((pattern) => pattern.test(normalized))) return "codex";
  if (opusPatterns.some((pattern) => pattern.test(normalized))) return "opus";
  return "shared";
}

export const laneNames = {
  opus: "Opus (writing, design, frontend, site content, planning)",
  codex: "Sol or Luna (backend, data, infra, tests)",
};
