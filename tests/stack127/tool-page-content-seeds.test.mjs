import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { readToolPageSeed } from "../helpers/tool-page-content.mjs";

const coverage = {
  "ceph-capacity-calculator": ["Replicated", "Erasure coding", "CRUSH", "ceph df", "/zfs-capacity-calculator"],
  "dockerignore-tester": ["Docker patterns are ordered", "last matching line", "official Docker documentation", "Moby", "v0.6.1"],
  "domain-age": ["What is a domain age checker?", "What does domain age actually mean?", "contradiction detector", "not proof"],
  "drive-reliability": ["Choose a period that matches the question", "AFR uses drive days", "SMART", "/storage-tools"],
  "home-assistant-energy-entity-checker": ["Choose the Energy field", "Energy and statistics answer different questions", "recorder inclusion", "/privacy"],
  "nfs-firewall-rules": ["What changes between NFSv3 and NFSv4", "rpcinfo -p", "What the planner cannot verify", "/privacy"],
  "nginx-proxy-pass-calculator": ["Use the location NGINX actually matched", "Common static cases", "one replacement chain", "nginx.org"],
  "raid-calculator": ["Compare RAID levels", "smallest drive", "Common RAID capacity questions", "calculated in your browser"],
  "raidz-expansion-planner": ["zpool list -vp -o name,alloc", "Why immediate capacity can be lower", "raidz_expansion", "/zfs-padding-calculator"],
  "rebuild-calculator": ["total degraded window", "source media read", "read-error exposure", "/raid-calculator"],
  "shortcuts-cheatsheet-generator": ["build a sheet for the work you actually do", "choose the platform", "live preview", "/keyboard-shortcuts"],
  "shr-calculator": ["Read the capacity bands", "fresh-pool estimate", "SHR-2", "/raid-calculator"],
  "snapraid-mergerfs-planner": ["Keep parity outside the pool", "findmnt", "lsblk", "does not save or send"],
  "storage-growth-planner": ["Choose inputs that match your homelab", "what this model leaves out", "before buying", "/zfs-capacity-calculator"],
  "storage-layout-advisor": ["inputs that represent", "usable space", "does not inspect", "/raidz-expansion-planner"],
  "unraid-calculator": ["array-level data capacity", "Protection modes", "parity is not a backup", "/zfs-capacity-calculator"],
  "zfs-capacity-calculator": ["Each vdev is its own failure boundary", "Why ashift", "Slop and planning headroom", "openzfs.github.io"],
  "zfs-padding-calculator": ["What each option changes", "Why an 8 KiB block can occupy 24 KiB", "Physical allocation", "/zfs-capacity-calculator"],
};

for (const [slug, phrases] of Object.entries(coverage)) {
  test(`${slug} keeps its approved supporting content in the database seed`, () => {
    const seed = readToolPageSeed(slug);
    for (const phrase of phrases) assert.match(seed.toLowerCase(), new RegExp(phrase.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    assert.doesNotMatch(seed, /## FAQ|Methodology|—|–/);
  });
}

test("the shared server renderer owns Markdown prose and table behavior", () => {
  const renderer = readFileSync("app/tool-page-content.tsx", "utf8");
  assert.match(renderer, /ReactMarkdown/);
  assert.match(renderer, /remarkGfm/);
  assert.match(renderer, /data-tool-page-content/);
  assert.match(renderer, /proseClassName/);
  assert.match(renderer, /proseFlowClassName/);
  assert.match(renderer, /role="region"/);
  assert.match(renderer, /tabIndex=\{0\}/);
  assert.doesNotMatch(renderer, /rehypeRaw|dangerouslySetInnerHTML/);
});
