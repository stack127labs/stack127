const token = process.env.CLOUDFLARE_API_TOKEN;
const zone = process.env.CLOUDFLARE_ZONE_ID;
if (!token || !zone) throw new Error("Cloudflare cache purge credentials are required.");

const response = await fetch(`https://api.cloudflare.com/client/v4/zones/${zone}/purge_cache`, {
  method: "POST",
  headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  body: JSON.stringify({ tags: ["stack127-public"] }),
  signal: AbortSignal.timeout(20000),
});
const result = await response.json();
if (!response.ok || !result.success) throw new Error("Release cache purge failed.");

for (const path of ["/", "/dns-tools", "/self-host-apps", "/self-hosted-app-resource-planner"]) {
  const warm = await fetch(`https://stack127.com${path}`, { signal: AbortSignal.timeout(20000) });
  if (!warm.ok) throw new Error(`Release cache warm failed for ${path}: ${warm.status}`);
}
console.log("Release cache purged and primary pages warmed.");
