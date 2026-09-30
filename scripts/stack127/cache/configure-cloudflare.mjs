import pg from "pg";
const longer = process.argv.includes("--long-ttl");
if (longer) {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_POOLER_URL || process.env.DATABASE_URL, connectionTimeoutMillis: 15000 });
  try {
    const { rows } = await pool.query(`select healthy_since, last_check_at, last_reconcile_at,
      healthy_since <= now() - interval '7 days' and last_check_at >= now() - interval '2 minutes'
      and last_reconcile_at >= now() - interval '16 minutes'
      and last_error is null and exists (select 1 from public.stack127_cache_worker_wake where function_url is not null)
      and not exists (select 1 from public.stack127_revalidation_events where first_queued_at < now() - interval '2 minutes') as ready
      from public.stack127_cache_observation where id`);
    if (!rows[0]?.ready) throw new Error("Long cache times require seven consecutive reliable days; the gate is not ready.");
    console.log(JSON.stringify({ gate: "passed", healthySince: rows[0].healthy_since }));
  } finally { await pool.end(); }
}
const apply = process.argv.includes("--apply");
const zone = process.env.CLOUDFLARE_ZONE_ID;
const token = process.env.CLOUDFLARE_API_TOKEN;
if (!zone || !token) throw new Error("Cloudflare zone and token are required.");
const base = `https://api.cloudflare.com/client/v4/zones/${zone}/rulesets`;

async function api(path, method = "GET", body) {
  const response = await fetch(`${base}${path}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(20000),
  });
  const json = await response.json();
  if (!response.ok || !json.success) throw new Error(`Cloudflare rules request failed: ${JSON.stringify(json.errors ?? []).slice(0, 500)}`);
  return json.result;
}

const all = await api("");
const requestSet = all.find((set) => set.phase === "http_request_cache_settings" && set.kind === "zone");
const responseSet = all.find((set) => set.phase === "http_response_cache_settings" && set.kind === "zone");
if (!requestSet || !responseSet) throw new Error("Stack127 cache rulesets were not found.");
let requestRules = (await api(`/${requestSet.id}`)).rules;
let responseRules = (await api(`/${responseSet.id}`)).rules;
const htmlResponse = responseRules.find((rule) => rule.description?.startsWith("Public successful document HTML:"));
const detailRequest = requestRules.find((rule) => rule.description?.startsWith("Public detail APIs:"));
if (!htmlResponse || !detailRequest) throw new Error("Expected existing Stack127 rules were not found.");

async function save(setId, rules, definition, key) {
  const current = rules.find((rule) => rule.description === key || rule.description?.startsWith(`${key}:`));
  if (!apply) {
    console.log(JSON.stringify({ action: current ? "update" : "create", rule: definition.description }));
    return;
  }
  const result = await api(`/${setId}/rules${current ? `/${current.id}` : ""}`, current ? "PATCH" : "POST", definition);
  rules = result.rules;
  console.log(JSON.stringify({ action: current ? "updated" : "created", rule: definition.description }));
  return rules;
}

const htmlParameters = structuredClone(htmlResponse.action_parameters);
htmlParameters["max-age"].value = 0;
htmlParameters["must-revalidate"].operation = "set";
htmlParameters["stale-while-revalidate"] = { operation: "remove" };
htmlParameters["stale-if-error"] = { operation: "remove" };
htmlParameters["s-maxage"].value = longer ? 604800 : 86400;
responseRules = await save(responseSet.id, responseRules, {
  action: htmlResponse.action,
  expression: htmlResponse.expression,
  description: `Public successful document HTML: browser revalidates, edge ${longer ? "7 days" : "1 day"}`,
  action_parameters: htmlParameters,
}, "Public successful document HTML") ?? responseRules;

const detailExpression = detailRequest.expression.includes('"/api/resource-planner-index"') ? detailRequest.expression : detailRequest.expression.replace(
  'starts_with(http.request.uri.path, "/api/self-host-apps/")',
  'starts_with(http.request.uri.path, "/api/self-host-apps/") or http.request.uri.path eq "/api/resource-planner-index"',
);
requestRules = await save(requestSet.id, requestRules, {
  action: detailRequest.action,
  expression: detailExpression,
  description: "Public detail APIs: origin TTL, no errors",
  action_parameters: detailRequest.action_parameters,
}, "Public detail APIs") ?? requestRules;

const sharedRequest = '(http.host eq "stack127.com" and http.request.method eq "GET" and http.cookie eq "" and not any(http.request.headers["authorization"][*] ne ""))';
const rscRequest = `${sharedRequest.slice(0, -1)} and http.request.uri.path.extension eq "" and not starts_with(http.request.uri.path, "/api/") and not starts_with(http.request.uri.path, "/_next/") and any(http.request.headers["rsc"][*] eq "1") and http.request.uri.query contains "_rsc=")`;
requestRules = await save(requestSet.id, requestRules, {
  action: "set_cache_settings",
  expression: rscRequest,
  description: "Public RSC navigation: cache distinct query variants",
  action_parameters: { cache: true, edge_ttl: { mode: "bypass_by_default" }, browser_ttl: { mode: "respect_origin" } },
}, "Public RSC navigation") ?? requestRules;

const rscResponse = `${rscRequest.slice(0, -1)} and http.response.code eq 200 and any(http.response.headers["content-type"][*] contains "text/x-component") and not any(http.response.headers.names[*] eq "set-cookie"))`;
responseRules = await save(responseSet.id, responseRules, {
  action: "set_cache_control",
  expression: rscResponse,
  description: `Public successful RSC navigation: browser revalidates, edge ${longer ? "7 days" : "1 day"}`,
  action_parameters: htmlParameters,
}, "Public successful RSC navigation") ?? responseRules;

const sitemapRequest = `${sharedRequest.slice(0, -1)} and http.request.uri.path eq "/sitemap.xml")`;
requestRules = await save(requestSet.id, requestRules, {
  action: "set_cache_settings",
  expression: sitemapRequest,
  description: "Public sitemap: origin cache control",
  action_parameters: { cache: true, edge_ttl: { mode: "bypass_by_default" }, browser_ttl: { mode: "respect_origin" } },
}, "Public sitemap") ?? requestRules;
responseRules = await save(responseSet.id, responseRules, {
  action: "set_cache_control",
  expression: `${sitemapRequest.slice(0, -1)} and http.response.code eq 200 and any(http.response.headers["content-type"][*] contains "xml"))`,
  description: "Public successful sitemap: browser revalidates, edge 1 hour",
  action_parameters: { ...htmlParameters, "s-maxage": { ...htmlParameters["s-maxage"], value: 3600 } },
}, "Public successful sitemap") ?? responseRules;

const robotsRequest = `${sharedRequest.slice(0, -1)} and http.request.uri.path eq "/robots.txt")`;
requestRules = await save(requestSet.id, requestRules, {
  action: "set_cache_settings", expression: robotsRequest,
  description: "Public robots: origin cache control",
  action_parameters: { cache: true, edge_ttl: { mode: "bypass_by_default" }, browser_ttl: { mode: "respect_origin" } },
}, "Public robots") ?? requestRules;
responseRules = await save(responseSet.id, responseRules, {
  action: "set_cache_control",
  expression: `${robotsRequest.slice(0, -1)} and http.response.code eq 200 and any(http.response.headers["content-type"][*] contains "text/plain"))`,
  description: "Public successful robots: browser revalidates, edge 1 hour",
  action_parameters: { ...htmlParameters, "s-maxage": { ...htmlParameters["s-maxage"], value: 3600 } },
}, "Public successful robots") ?? responseRules;

// Later response rules override the content default with the actual route class.
for (const [name, expression, ttl] of [
  ["Public directory responses", 'any(http.response.headers["x-stack127-cache-class"][*] eq "directory")', 86400],
  ["Public filtered responses", 'any(http.response.headers["x-stack127-cache-class"][*] eq "filters")', 900],
]) {
  responseRules = await save(responseSet.id, responseRules, {
    action: "set_cache_control", expression: `(${sharedRequest.slice(1, -1)} and http.response.code eq 200 and not any(http.response.headers.names[*] eq "set-cookie") and not starts_with(http.request.uri.path, "/api/") and not starts_with(http.request.uri.path, "/_next/") and (any(http.response.headers["content-type"][*] contains "text/html") or any(http.response.headers["content-type"][*] contains "text/x-component")) and ${expression})`,
    description: `${name}: browser revalidates, edge ${ttl} seconds`,
    action_parameters: { ...htmlParameters, "s-maxage": { ...htmlParameters["s-maxage"], value: ttl } },
  }, name) ?? responseRules;
}
const assets = requestRules.find(rule => rule.description?.startsWith("Mutable site icons:"));
if (assets) {
  const parameters = structuredClone(assets.action_parameters);
  parameters.browser_ttl = { mode: "respect_origin" };
  await save(requestSet.id, requestRules, { action: assets.action, expression: assets.expression,
    description: "Mutable site icons: edge 30 days, browser revalidates", action_parameters: parameters,
  }, "Mutable site icons");
}
// ISR can give generated 404s a content TTL. Errors must override that policy.
const errorParameters = Object.fromEntries(Object.keys(htmlParameters).map(key => [key, { operation: key === "no-store" ? "set" : "remove" }]));
errorParameters["no-store"] = { operation: "set" };
await save(responseSet.id, responseRules, {
  action: "set_cache_control",
  expression: '(http.host eq "stack127.com" and http.response.code ge 400)',
  description: "Public errors: no store",
  action_parameters: errorParameters,
}, "Public errors");
if (longer && apply) {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_POOLER_URL || process.env.DATABASE_URL });
  try { await pool.query("update public.stack127_cache_observation set long_ttl_enabled_at = now() where id"); }
  finally { await pool.end(); }
}
