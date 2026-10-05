export async function cloudflare(path, { method = "GET", body, environment = process.env, fetchImplementation = fetch } = {}) {
  if (!environment.CLOUDFLARE_API_TOKEN) throw new Error("Cloudflare API token is required.");
  const response = await fetchImplementation(`https://api.cloudflare.com/client/v4${path}`, {
    method, headers: { Authorization: `Bearer ${environment.CLOUDFLARE_API_TOKEN}`, "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body), signal: AbortSignal.timeout(20000),
  });
  const result = await response.json();
  if (!response.ok || result.success !== true) throw new Error(`Cloudflare ${method} failed for ${path.replace(/[a-f0-9]{32}/g, "<id>")}: HTTP ${response.status}`);
  return result.result;
}

export const frontendService = "stack127-frontend";

export function frontendRoutes() {
  return [
    { pattern: "stack127.com/api/*", script: null },
    { pattern: "stack127.com/vitals/*", script: null },
    { pattern: "stack127.com/*", script: frontendService },
  ];
}

export async function activateFrontend({ environment = process.env, api = cloudflare } = {}) {
  const zone = environment.CLOUDFLARE_ZONE_ID;
  if (!zone) throw new Error("Cloudflare zone is required.");
  const base = `/zones/${zone}`;
  const current = await api(`${base}/workers/routes`, { environment });
  // Never replace another application's route.
  for (const desired of frontendRoutes()) {
    const existing = current.find(route => route.pattern === desired.pattern);
    if (existing && existing.script !== null && existing.script !== frontendService) throw new Error(`Another Worker owns ${desired.pattern}.`);
  }
  // Keep canonical query behavior from proxy.ts without a request-time Worker.
  const sets = await api(`${base}/rulesets`, { environment });
  const headers = sets.find(set => set.phase === "http_response_headers_transform" && set.kind === "zone");
  const definition = {
    action: "rewrite", description: "Stack127 query pages: noindex",
    expression: '(http.host eq "stack127.com" and http.request.uri.query ne "" and not starts_with(http.request.uri.path, "/api/") and not starts_with(http.request.uri.path, "/_next/") and not starts_with(http.request.uri.path, "/vitals/"))',
    action_parameters: { headers: { "X-Robots-Tag": { operation: "set", value: "noindex, follow" } } },
  };
  if (headers) {
    const rules = (await api(`${base}/rulesets/${headers.id}`, { environment })).rules;
    const rule = rules.find(rule => rule.description === definition.description);
    await api(`${base}/rulesets/${headers.id}/rules${rule ? `/${rule.id}` : ""}`, { environment, method: rule ? "PATCH" : "POST", body: definition });
  } else {
    await api(`${base}/rulesets`, { environment, method: "POST", body: { name: "Stack127 response headers", kind: "zone", phase: "http_response_headers_transform", rules: [definition] } });
  }
  // API exclusions must exist before the catch-all route changes traffic.
  for (const desired of frontendRoutes()) {
    const existing = current.find(route => route.pattern === desired.pattern);
    if (existing?.script === desired.script) continue;
    await api(`${base}/workers/routes${existing ? `/${existing.id}` : ""}`, { environment, method: existing ? "PUT" : "POST", body: desired });
  }
}

export async function deactivateFrontend({ environment = process.env, api = cloudflare } = {}) {
  const base = `/zones/${environment.CLOUDFLARE_ZONE_ID}/workers/routes`;
  const routes = await api(base, { environment });
  const route = routes.find(route => route.pattern === "stack127.com/*" && route.script === frontendService);
  if (route) await api(`${base}/${route.id}`, { environment, method: "DELETE" });
}
