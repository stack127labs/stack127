import { execFileSync } from "node:child_process";

const token = process.env.CLOUDFLARE_API_TOKEN;
const zone = process.env.CLOUDFLARE_ZONE_ID;
if (!token || !zone) throw new Error("Cloudflare cache purge credentials are required.");

const response = await fetch(`https://api.cloudflare.com/client/v4/zones/${zone}/purge_cache`, {
  method: "POST",
  headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  body: JSON.stringify({ tags: ["stack127-public", "stack127-assets"] }),
  signal: AbortSignal.timeout(20000),
});
const result = await response.json();
if (!response.ok || !result.success) {
  throw new Error(`Release cache purge failed: HTTP ${response.status} ${JSON.stringify(result.errors ?? [])}`);
}

// Mutable file URLs need an explicit purge; old asset responses predate tags.
const before = process.env.STACK127_RELEASE_BEFORE;
const after = process.env.STACK127_RELEASE_SHA;
if (before && after && /^[a-f0-9]{40}$/.test(before) && !/^0+$/.test(before) && /^[a-f0-9]{40}$/.test(after)) {
  const files = execFileSync("git", ["diff", "--name-only", "-z", before, after, "--", "public"], { encoding: "utf8" })
    .split("\0").filter(path => path.startsWith("public/")).map(path => `https://stack127.com/${path.slice(7).split("/").map(encodeURIComponent).join("/")}`);
  for (let i = 0; i < files.length; i += 100) {
    const purge = await fetch(`https://api.cloudflare.com/client/v4/zones/${zone}/purge_cache`, {
      method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ files: files.slice(i, i + 100) }), signal: AbortSignal.timeout(20000),
    });
    const result = await purge.json();
    if (!purge.ok || !result.success) throw new Error("Changed asset purge failed");
  }
}

for (const path of ["/", "/dns-tools", "/self-host-apps", "/self-hosted-app-resource-planner"]) {
  const warm = await fetch(`https://stack127.com${path}`, { signal: AbortSignal.timeout(20000) });
  if (!warm.ok) throw new Error(`Release cache warm failed for ${path}: ${warm.status}`);
}
console.log("Release cache purged and primary pages and changed assets refreshed.");
