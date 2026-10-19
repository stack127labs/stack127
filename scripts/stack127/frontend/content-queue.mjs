import { inspectIndexingHtml, inspectSitemap } from '../publishing/verify.mjs';
import { targetsForEvents } from "../cache/targets.mjs";
import { refreshTargets, cacheBodyDigest } from "../cache/refresh.mjs";
import { LAUNCH_DIRECTORY_REVISION_SQL, launchDirectoryRevisionMatches } from "../../../lib/launch-directories-data.ts";
import { plannerSearchPattern } from "../../../lib/planner-search.ts";
import { SELF_HOST_INDEX_TAG, PAGE_REGISTRY_TAG } from "../../../lib/cache-tags.ts";

export const frontendWorkflow = "stack127-frontend-refresh.yml";
export const frontendLatencyMinutes = 30;
const activeStatuses = ["queued", "in_progress", "waiting", "requested", "pending"];
const eventKey = event => `${event.entity_type}:${event.slug}`;
const shaPattern = /^[a-f0-9]{40}$/;
const pathPattern = /^\/[a-z0-9/_-]*(?:\.(?:xml|txt|json))?$/;

async function githubRequest(repo, token, pathname, init = {}, fetchImplementation = fetch) {
  if (!/^[a-z0-9_.-]+\/[a-z0-9_.-]+$/i.test(repo) || !token) throw new Error("A repository and a scoped GitHub token are required.");
  const response = await fetchImplementation(`https://api.github.com/repos/${repo}${pathname}`, {
    ...init, redirect: "error", signal: AbortSignal.timeout(20_000),
    headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json", "Content-Type": "application/json", "X-GitHub-Api-Version": "2026-03-10" },
  });
  if (!response.ok) throw new Error(`GitHub frontend request failed: HTTP ${response.status}`);
  return response;
}

// The caller holds the database worker lease through dispatch. Keep that lease
// briefly after success because a new run can take time to appear in this API.
export async function dispatchFrontendRefresh({ repo = "stack127labs/stack127", token, dryRun = false, fetchImplementation = fetch } = {}) {
  if (dryRun) return { dispatched: false, dryRun: true };
  const base = `/actions/workflows/${frontendWorkflow}`;
  const pending = await Promise.all(activeStatuses.map(async status => {
    const response = await githubRequest(repo, token, `${base}/runs?branch=main&status=${status}&per_page=1`, {}, fetchImplementation);
    const result = await response.json();
    if (!Number.isSafeInteger(result.total_count) || !Array.isArray(result.workflow_runs)) throw new Error("GitHub returned an invalid workflow run list.");
    return result.total_count > 0;
  }));
  if (pending.some(Boolean)) return { dispatched: false, active: true };
  await githubRequest(repo, token, `${base}/dispatches`, {
    method: "POST", body: JSON.stringify({ ref: "main", inputs: { force: "false", dry_run: "false" } }),
  }, fetchImplementation);
  return { dispatched: true, active: false };
}

async function siteRequest(site, pathname, init = {}, fetchImplementation = fetch) {
  return await fetchImplementation(`${site}${pathname}`, {
    ...init, redirect: "manual", cache: "no-store", signal: AbortSignal.timeout(30_000),
  });
}

export async function checkCurrentMain({ sha, repo = "stack127labs/stack127", token, fetchImplementation = fetch }) {
  if (!shaPattern.test(sha ?? "")) throw new Error("An exact main SHA is required.");
  const main = await (await githubRequest(repo, token, "/git/ref/heads/main", {}, fetchImplementation)).json();
  if (main.object?.sha !== sha) throw new Error("The frontend checkout is no longer current main.");
}

export async function checkCurrentRelease({ sha, site = "https://stack127.com", repo = "stack127labs/stack127", token, fetchImplementation = fetch }) {
  await checkCurrentMain({ sha, repo, token, fetchImplementation });
  const response = await siteRequest(site, "/api/health?scope=deploy", {}, fetchImplementation);
  if (response.status !== 200) throw new Error(`Backend health failed: HTTP ${response.status}`);
  const health = await response.json();
  if (health.ok !== true || health.build?.sha !== sha) throw new Error("The live backend SHA does not match current main.");
}

// Dispatch checks are observations, not successful content deployments. The
// legacy two-minute reliability and TTL gates do not apply to static builds.
export async function frontendStatus(client) {
  const { rows } = await client.query(`select state.last_run_at, state.last_success_at,
      coalesce(state.last_error, (select last_error from public.stack127_revalidation_events
        where last_error is not null order by first_queued_at, id limit 1)) as last_error,
      (select count(*)::int from public.stack127_revalidation_events) as pending,
      (select min(first_queued_at) from public.stack127_revalidation_events) as oldest,
      exists(select 1 from public.stack127_revalidation_events
        where first_queued_at <= now() - $1::int * interval '1 minute') as delayed
    from public.stack127_cache_worker_state state where id`, [frontendLatencyMinutes]);
  if (!rows[0]) throw new Error("The cache worker state is missing.");
  return { ...rows[0], hosting: "cloudflare", latency_target_minutes: frontendLatencyMinutes,
    legacy_reliability_applicable: false, github_schedule_can_retire: false, longer_ttl_ready: false };
}

export async function snapshotQueue(client, { sha, force = false, now = () => new Date() }) {
  if (!shaPattern.test(sha ?? "")) throw new Error("An exact main SHA is required.");
  // One database snapshot ties source fingerprints to the captured event times.
  // Queue timestamps are text so their microseconds survive the Node driver.
  await client.query("begin isolation level repeatable read read only");
  try {
    // Once any edit has settled, capture all due edits for the full export.
    // This also includes edits made shortly before the workflow starts.
    const { rows: events } = await client.query(`select id::text, entity_type, slug, created_at::text
      from public.stack127_revalidation_events
      where $1::boolean or (next_attempt_at <= now() and exists (
        select 1 from public.stack127_revalidation_events ready where ready.next_attempt_at <= now() and
          (ready.created_at <= now() - interval '60 seconds' or ready.first_queued_at <= now() - interval '5 minutes')))
      order by first_queued_at, id`, [force]);
    const { rows: sources } = events.length ? await client.query(
      "select * from public.stack127_cache_source_revisions($1::text[], $2::text[])",
      [[...new Set(events.map(event => event.entity_type))], events.map(event => event.slug)],
    ) : { rows: [] };
    const fingerprints = new Map(sources.map(row => [eventKey(row), row.fingerprint]));
    const { rows: pages } = await client.query(`select slug, is_published, is_indexable, page_family, row_updated_at,
      case page_family
        when 'tool' then exists(select 1 from public.stack127_tool_pages content where content.page_id=page.id)
        when 'directory' then exists(select 1 from public.stack127_directory_pages content where content.page_id=page.id)
        when 'catalog' then exists(select 1 from public.stack127_catalog_pages content where content.page_id=page.id)
        else true end as has_content
      from public.stack127_pages page order by slug`);
    const { rows: launch } = await client.query(LAUNCH_DIRECTORY_REVISION_SQL);
    const apps = events.filter(event => event.entity_type === "self_host_app");
    const targetEvents = apps.length > 20
      ? [...events.filter(event => event.entity_type !== "self_host_app"), { entity_type: "self_host_catalog", slug: "all" }]
      : events;
    const catalogs = pages.filter(page => page.page_family === "catalog");
    const catalogNames = new Set(catalogs.map(page => page.slug));
    const tools = events.some(event => event.entity_type === "page" && catalogNames.has(event.slug))
      ? pages.filter(page => page.page_family === "tool" && page.is_published).map(page => page.slug) : [];
    const snapshot = {
      schema_version: 1, sha, captured_at: now().toISOString(), force,
      events: events.map(event => ({ ...event, fingerprint: fingerprints.get(eventKey(event)) ?? "deleted" })),
      targets: targetsForEvents(targetEvents, catalogs.filter(page => page.is_published && page.has_content).map(page => page.slug), tools),
      pages: pages.map(page => ({ ...page, revision: new Date(page.row_updated_at).toISOString(), row_updated_at: undefined })),
      launch_revision: launch[0]?.fingerprint,
      build_required: force || events.length > 0,
    };
    await client.query("commit");
    return snapshot;
  } catch (error) {
    await client.query("rollback");
    throw error;
  }
}

export function validateSnapshot(snapshot) {
  if (snapshot?.schema_version !== 1 || !shaPattern.test(snapshot.sha ?? "") || !Array.isArray(snapshot.events) ||
      !Array.isArray(snapshot.pages) || typeof snapshot.build_required !== "boolean" || !snapshot.targets) throw new Error("Invalid frontend queue snapshot.");
  const ids = new Set();
  const keys = new Set();
  for (const event of snapshot.events) {
    if (!/^\d+$/.test(event.id) || typeof event.entity_type !== "string" || typeof event.slug !== "string" ||
        typeof event.created_at !== "string" || !Number.isFinite(Date.parse(event.created_at)) ||
        typeof event.fingerprint !== "string" || ids.has(event.id) || keys.has(eventKey(event))) throw new Error("Invalid captured queue event.");
    ids.add(event.id); keys.add(eventKey(event));
  }
  for (const key of ["paths", "verifyPaths", "nextTags", "edgeTags"]) {
    if (!Array.isArray(snapshot.targets[key]) || snapshot.targets[key].some(value => typeof value !== "string" ||
        (key.endsWith("Tags") ? !/^[a-z0-9:/_-]{1,128}$/.test(value) : !pathPattern.test(value)))) throw new Error("Invalid captured refresh targets.");
  }
  return snapshot;
}

async function bytesDigest(bytes) {
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, "0")).join("");
}

export async function exportProofs(snapshot, directory, {canonicalOrigin='https://stack127.com'} = {}) {
  validateSnapshot(snapshot);
  const { readFile } = await import("node:fs/promises");
  const path = await import("node:path");
  const pages = new Map(snapshot.pages.map(page => [page.slug, page]));
  const removedPages = new Set(snapshot.events.filter(event => event.entity_type === "page" && !pages.get(event.slug)?.is_published).map(event => event.slug));
  const paths = [...new Set(["/", "/robots.txt", "/sitemap.xml", "/frontend-release.json", ...snapshot.targets.verifyPaths.filter(value => !value.startsWith("/api/"))])];
  const proofs = [];
  for (const pathname of paths) {
    const relative = pathname.slice(1);
    const files = pathname === "/" ? ["index.html"] : /\.(xml|txt|json)$/.test(pathname)
      ? [relative] : [`${relative}.html`, `${relative}/index.html`];
    let bytes;
    for (const file of files) {
      try { bytes = await readFile(path.resolve(directory, file)); break; }
      catch (error) { if (error.code !== "ENOENT") throw error; }
    }
    const page = pages.get(relative);
    const published = page?.is_published && page.has_content;
    if (!bytes) {
      if (published || pathname === "/" || /\.(xml|txt|json)$/.test(pathname)) throw new Error(`Static export is missing ${pathname}.`);
      proofs.push({ path: pathname, status: 404, digest: await bytesDigest(await readFile(path.resolve(directory, "404.html"))) });
      continue;
    }
    if ((page && !published) || removedPages.has(relative)) throw new Error(`Static export still serves unpublished ${pathname}.`);
    const body = bytes.toString("utf8");
    if (published) inspectIndexingHtml(body,page,canonicalOrigin);
    if (pathname === '/sitemap.xml') inspectSitemap(body,snapshot.pages.map(page=>({...page,is_published:page.is_published && page.has_content})),canonicalOrigin);
    if (published && !body.includes(`name="stack127-content-revision" content="${page.revision}"`)) throw new Error(`Exported content revision differs from the snapshot: ${pathname}`);
    if (pathname === "/frontend-release.json" && JSON.parse(body).sha !== snapshot.sha) throw new Error("Exported frontend release SHA differs from main.");
    if (pathname === "/" || pathname === "/launch-directories") {
      const launchPublished = pages.get("launch-directories")?.is_published;
      if (!launchDirectoryRevisionMatches(body, launchPublished ? snapshot.launch_revision : "unpublished")) throw new Error(`Exported launch directory data differs from the snapshot: ${pathname}`);
    }
    proofs.push({ path: pathname, status: 200, digest: await bytesDigest(bytes) });
  }
  return proofs;
}

export async function verifyPublicAssets(snapshot, directory, { site = "https://stack127.com", fetchImplementation = fetch,
  attempts = 1, delayMs = 5000, waitImplementation = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds)) } = {}) {
  if (!Number.isInteger(attempts) || attempts < 1) throw new Error("Public asset verification needs at least one attempt.");
  const proofs = await exportProofs(snapshot, directory,{canonicalOrigin:site});
  for (let index = 0; index < proofs.length; index += 8) {
    await Promise.all(proofs.slice(index, index + 8).map(async proof => {
      for (let attempt = 1; ; attempt++) {
        try {
          const response = await siteRequest(site, proof.path, {}, fetchImplementation);
          const observedSha = response.headers.get("x-stack127-frontend-sha");
          const contentMatches = await bytesDigest(await response.arrayBuffer()) === proof.digest;
          if (response.status !== proof.status || observedSha !== snapshot.sha || !contentMatches) {
            throw new Error(`Public frontend differs from the deployed export: ${proof.path}, status ${response.status}, SHA ${observedSha ?? "missing"}, content matches ${contentMatches}.`);
          }
          return;
        } catch (error) {
          if (attempt >= attempts) throw error;
          console.log(`Waiting for Cloudflare content propagation, attempt ${attempt}/${attempts}: ${error.message}`);
          await waitImplementation(delayMs);
        }
      }
    }));
  }
  return proofs;
}

// These API routes remain on OVH. Their source checks run inside the backend,
// then the public responses must match before any queue event is removed.
export async function refreshApiRecords(snapshot, signingKey, { site = "https://stack127.com", zone, cloudflareToken, fetchImplementation = fetch } = {}) {
  const targets = { ...snapshot.targets,
    paths: snapshot.targets.paths.filter(path => path.startsWith("/api/")),
    verifyPaths: snapshot.targets.verifyPaths.filter(path => path.startsWith("/api/")),
  };
  if (needsPlannerProof(snapshot)) {
    targets.paths = [...new Set([...targets.paths, "/api/resource-planner-index"])];
    targets.nextTags = [...new Set([...targets.nextTags, SELF_HOST_INDEX_TAG, `${PAGE_REGISTRY_TAG}:self-hosted-app-resource-planner`])];
    targets.edgeTags = [...new Set([...targets.edgeTags, "self-host-catalog"])];
  }
  if (!signingKey) throw new Error("The backend cache signing key is missing.");
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(signingKey), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode("stack127-cache-revalidation-v1"));
  const token = [...new Uint8Array(signature)].map(byte => byte.toString(16).padStart(2, "0")).join("");
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  const signed = async (pathname, body) => {
    const init = { method: "POST", headers, body: JSON.stringify(body) };
    let response = await siteRequest(site, pathname, init, fetchImplementation);
    if (pathname === "/api/cache/refresh" && response.status === 503) {
      // Cold API loads can outlast the backend's first verification attempt.
      await response.body?.cancel();
      response = await siteRequest(site, pathname, init, fetchImplementation);
    }
    if (response.status !== 200) throw new Error(`Backend cache refresh failed: HTTP ${response.status} ${pathname}`);
    return await response.json();
  };
  return await refreshTargets(targets, {
    invalidate: async () => {
      for (let index = 0; index < Math.max(targets.paths.length, targets.nextTags.length, 1); index += 200) {
        const result = await signed("/api/cache/revalidate", {
          paths: targets.paths.slice(index, index + 200), tags: targets.nextTags.slice(index, index + 200),
        });
        if (result.ok !== true) throw new Error("Backend invalidation was not confirmed.");
      }
    },
    rebuild: async paths => {
      const result = await signed("/api/cache/refresh", { paths });
      if (!Array.isArray(result.verified) || result.verified.length !== paths.length ||
          paths.some(path => !result.verified.some(proof => proof.path === path && [200, 404].includes(proof.status) &&
            (proof.status === 404 || /^[a-f0-9]{64}$/.test(proof.digest ?? ""))))) throw new Error("Backend did not verify every API path.");
      return result.verified;
    },
    purge: async tags => {
      if (!tags.length) return;
      if (!zone || !cloudflareToken) throw new Error("Cloudflare purge credentials are required.");
      for (let index = 0; index < tags.length; index += 100) {
        const response = await fetchImplementation(`https://api.cloudflare.com/client/v4/zones/${zone}/purge_cache`, {
          method: "POST", redirect: "error", signal: AbortSignal.timeout(30_000),
          headers: { Authorization: `Bearer ${cloudflareToken}`, "Content-Type": "application/json" },
          body: JSON.stringify({ tags: tags.slice(index, index + 100) }),
        });
        if (!response.ok || (await response.json()).success !== true) throw new Error("Cloudflare API cache purge failed.");
      }
    },
    warm: async proofs => {
      await Promise.all(proofs.map(async proof => {
        const response = await siteRequest(site, proof.requestPath ?? proof.path, {}, fetchImplementation);
        const body = await response.text();
        if (response.status !== proof.status || (proof.digest && await cacheBodyDigest(body) !== proof.digest)) throw new Error(`Public API content is stale: ${proof.path}`);
      }));
    },
  });
}

function needsPlannerProof(snapshot) {
  return snapshot.targets.paths.includes("/api/resource-planner-index") ||
    (snapshot.force === true && snapshot.pages.some(page => page.slug === "self-hosted-app-resource-planner" && page.is_published));
}

// The planner index requires q, so the backend's path-only verifier cannot
// check it. Compare public queries with fresh SQL using the API's filter,
// literal LIKE pattern, ordering, 50-row limit, and resource flags.
export async function verifyResourcePlannerQueries(client, snapshot, { site = "https://stack127.com", fetchImplementation = fetch } = {}) {
  validateSnapshot(snapshot);
  if (!needsPlannerProof(snapshot)) return [];
  const { rows: pages } = await client.query("select is_published from public.stack127_pages where slug=$1", ["self-hosted-app-resource-planner"]);
  const published = pages[0]?.is_published === true;
  const { rows: candidates } = published ? await client.query(`select slug from public.self_host_apps
    where published and self_hosting_status='self_hostable' and length(slug) >= 2
    order by name, slug limit 1`) : { rows: [] };
  const queries = [...new Set([
    String(candidates[0]?.slug || "app").slice(0, 80).toLowerCase(),
    `__stack127_missing_${snapshot.sha.slice(0, 12)}__`,
    ...snapshot.events.filter(event => event.entity_type === "self_host_app")
      .map(event => event.slug.trim().toLowerCase().slice(0, 80)).filter(query => query.length >= 2),
  ])];
  const proofs = [];
  for (let index = 0; index < queries.length; index += 8) {
    proofs.push(...await Promise.all(queries.slice(index, index + 8).map(async query => {
      const { rows } = published ? await client.query(`select app.slug, app.name,
          resource.ram_estimate_min_mb is not null as has_ram,
          resource.storage_estimate_min_gb is not null as has_storage
        from public.self_host_apps app
        left join public.self_host_app_resource_estimates resource on resource.app_id=app.id
        where app.published and app.self_hosting_status='self_hostable'
          and (lower(app.name) like $1 or lower(app.slug) like $1)
        order by app.name asc, app.slug asc limit 50`, [plannerSearchPattern(query)]) : { rows: [] };
      const pathname = `/api/resource-planner-index?q=${encodeURIComponent(query)}`;
      const response = await siteRequest(site, pathname, {}, fetchImplementation);
      if (!response.headers.get("content-type")?.includes("application/json") || response.status !== (published ? 200 : 404)) {
        throw new Error(`Public resource planner query failed: ${pathname}`);
      }
      const actual = await response.json();
      const expected = rows.map(row => ({ slug: row.slug, name: row.name, hasRam: row.has_ram, hasStorage: row.has_storage }));
      if (published && JSON.stringify(actual) !== JSON.stringify(expected)) throw new Error(`Public resource planner query is stale: ${pathname}`);
      return { path: pathname, status: response.status, query };
    })));
  }
  return proofs;
}

export async function acknowledgeSnapshot(client, snapshot, { dryRun = false } = {}) {
  validateSnapshot(snapshot);
  if (dryRun || !snapshot.events.length) return { acknowledged: 0, captured: snapshot.events.length, dryRun };
  return await commitCapturedSnapshot(client, snapshot, false);
}

async function commitCapturedSnapshot(client, snapshot, verifiedCompletion) {
  await client.query("begin");
  try {
    const result = snapshot.events.length ? await client.query(`with captured as materialized (
        select * from jsonb_to_recordset($1::jsonb)
          as input(id text, entity_type text, slug text, created_at text, fingerprint text)
      ), sources as materialized (
        select * from public.stack127_cache_source_revisions($2::text[], $3::text[])
      ), removed as (
        delete from public.stack127_revalidation_events event using captured
        where event.id = captured.id::bigint and event.created_at = captured.created_at::timestamptz
          and event.entity_type = captured.entity_type and event.slug = captured.slug
          and captured.fingerprint = coalesce((select fingerprint from sources
            where sources.entity_type = captured.entity_type and sources.slug = captured.slug), 'deleted')
        returning event.entity_type, event.slug
      )
      insert into public.stack127_cache_processed (entity_type, slug, fingerprint)
        select captured.entity_type, captured.slug, captured.fingerprint
        from captured join removed using (entity_type, slug)
      on conflict (entity_type, slug) do update set fingerprint = excluded.fingerprint, processed_at = now()
      returning entity_type, slug`, [JSON.stringify(snapshot.events), [...new Set(snapshot.events.map(event => event.entity_type))], snapshot.events.map(event => event.slug)]) : { rowCount: 0 };
    if (verifiedCompletion) {
      await client.query("update public.stack127_cache_worker_state set last_success_at=now(), last_error=null where id");
      await client.query("update public.stack127_cache_observation set healthy_since=null, last_check_at=now(), last_error=null where id");
    }
    await client.query("commit");
    return { acknowledged: result.rowCount, captured: snapshot.events.length };
  } catch (error) {
    await client.query("rollback");
    throw error;
  }
}

export async function retrySnapshot(client, snapshot, error, { dryRun = false } = {}) {
  validateSnapshot(snapshot);
  if (dryRun || !snapshot.events.length) return;
  await client.query(`update public.stack127_revalidation_events event set
      attempts = event.attempts + 1, last_error = $2,
      next_attempt_at = now() + case event.attempts when 0 then interval '15 seconds'
        when 1 then interval '1 minute' else interval '5 minutes' end
    from jsonb_to_recordset($1::jsonb) as captured(id text, created_at text)
    where event.id = captured.id::bigint and event.created_at = captured.created_at::timestamptz`,
  [JSON.stringify(snapshot.events), String(error).slice(0, 500)]);
}

export async function completeRefresh(client, snapshot, directory, options = {}) {
  validateSnapshot(snapshot);
  if (options.dryRun) return { acknowledged: 0, captured: snapshot.events.length, dryRun: true };
  await checkCurrentRelease({ ...options, sha: snapshot.sha });
  await verifyPublicAssets(snapshot, directory, { ...options, attempts: options.assetVerificationAttempts ?? 12 });
  const { rows } = await client.query("select signing_key from public.stack127_cache_credentials where id");
  await refreshApiRecords(snapshot, rows[0]?.signing_key, options);
  await verifyResourcePlannerQueries(client, snapshot, options);
  // Main can advance while assets upload or the APIs refresh. Such a run leaves
  // its captured events queued for the next build of the new release.
  await checkCurrentRelease({ ...options, sha: snapshot.sha });
  return await commitCapturedSnapshot(client, snapshot, true);
}

// Pass this callback to the publisher after its SQL commit and before its
// public checks. The coordinator supplies the build and deploy operations so
// everything runs in the existing production concurrency job.
export async function refreshCommittedContent(client, { sha, directory, buildDeploy, hosting = globalThis.process?.env.STACK127_FRONTEND_HOSTING, ...options } = {}) {
  if (hosting !== "cloudflare") return { skipped: true, hosting: "legacy" };
  await checkCurrentRelease({ ...options, sha });
  const snapshot = await snapshotQueue(client, { sha, force: true });
  if (options.dryRun) return { dryRun: true, captured: snapshot.events.length, acknowledged: 0 };
  if (typeof buildDeploy !== "function" || !directory) throw new Error("A build/deploy callback and export directory are required.");
  try {
    await buildDeploy(snapshot);
    return await completeRefresh(client, snapshot, directory, options);
  } catch (error) {
    await retrySnapshot(client, snapshot, error);
    throw error;
  }
}

export async function contentQueueMain(args = process.argv.slice(2), environment = process.env) {
  const { readFile, writeFile, appendFile } = await import("node:fs/promises");
  const value = flag => { const index = args.indexOf(flag); return index < 0 ? undefined : args[index + 1]; };
  const command = args[0];
  const dryRun = args.includes("--dry-run");
  const site = environment.STACK127_SITE_URL || "https://stack127.com";
  if (site !== "https://stack127.com") throw new Error("Frontend content refresh requires the production site.");
  const options = {
    site, token: environment.GITHUB_TOKEN || environment.GH_TOKEN, repo: environment.GITHUB_REPOSITORY || "stack127labs/stack127",
    zone: environment.CLOUDFLARE_ZONE_ID, cloudflareToken: environment.CLOUDFLARE_API_TOKEN, dryRun,
  };
  if (!["snapshot", "check", "verify", "complete", "fail", "status"].includes(command)) throw new Error("Use snapshot, check, verify, complete, fail, or status.");
  if (command === "status" && environment.STACK127_FRONTEND_HOSTING !== "cloudflare") throw new Error("Frontend status requires STACK127_FRONTEND_HOSTING=cloudflare; legacy uses cache/status.mjs.");
  if (command === "check") { await checkCurrentRelease({ ...options, sha: value("--sha") }); return; }
  const snapshotFile = value("--snapshot");
  const snapshot = snapshotFile ? validateSnapshot(JSON.parse(await readFile(snapshotFile, "utf8"))) : null;
  if (command === "verify") {
    if (!snapshot || !value("--directory")) throw new Error("verify requires --snapshot and --directory.");
    await checkCurrentRelease({ ...options, sha: snapshot.sha });
    console.log(JSON.stringify({ verified: (await verifyPublicAssets(snapshot, value("--directory"), options)).length }));
    return;
  }
  if ((command === "complete" || command === "fail") && !snapshot) throw new Error(`${command} requires --snapshot.`);
  if ((command === "complete" || command === "fail") && !dryRun && environment.STACK127_FRONTEND_HOSTING !== "cloudflare") {
    throw new Error("Frontend queue writes require STACK127_FRONTEND_HOSTING=cloudflare.");
  }
  if (command === "complete" && !value("--directory")) throw new Error("complete requires --directory.");
  if (command === "snapshot") {
    if (!dryRun && !value("--output")) throw new Error("snapshot requires --output.");
    // Releases build before updating OVH. Completion always checks both SHAs.
    if (args.includes("--before-backend-deploy")) await checkCurrentMain({ ...options, sha: value("--sha") });
    else await checkCurrentRelease({ ...options, sha: value("--sha") });
  }
  if (dryRun && ["complete", "fail"].includes(command)) {
    console.log(JSON.stringify({ dryRun: true, captured: snapshot.events.length, acknowledged: 0 }));
    return;
  }
  const connectionString = environment.DATABASE_POOLER_URL || environment.DATABASE_URL;
  if (!connectionString) throw new Error("The production database connection is required.");
  // Keep this Node-only dependency outside the Supabase module graph.
  const pgPackage = "pg";
  const { default: pg } = await import(pgPackage);
  const client = new pg.Client({ connectionString, connectionTimeoutMillis: 15_000, statement_timeout: 120_000 });
  await client.connect();
  try {
    if (command === "status") {
      console.log(JSON.stringify(await frontendStatus(client), null, 2));
      if (!dryRun && environment.GITHUB_OUTPUT) await appendFile(environment.GITHUB_OUTPUT,
        "legacy_reliability_applicable=false\nbackup_needed=false\nlong_ttl_ready=false\nlong_ttl_enabled=false\n");
    } else if (command === "snapshot") {
      const captured = await snapshotQueue(client, { sha: value("--sha"), force: args.includes("--force") });
      if (!dryRun) {
        await writeFile(value("--output"), `${JSON.stringify(captured, null, 2)}\n`, { mode: 0o600, flag: "wx" });
        if (environment.GITHUB_OUTPUT) await appendFile(environment.GITHUB_OUTPUT, `build_required=${captured.build_required}\n`);
      }
      console.log(JSON.stringify({ dryRun, build_required: captured.build_required, captured: captured.events.length }));
    } else if (command === "fail") {
      await retrySnapshot(client, snapshot, value("--error") || "Frontend refresh failed. Check the GitHub workflow run.");
    } else {
      console.log(JSON.stringify(await completeRefresh(client, snapshot, value("--directory"), options)));
    }
  } finally { await client.end(); }
}

// Supabase imports only the dispatch helper. Node filesystem and pg imports
// above run only in the GitHub CLI, which also makes local imports read-only.
if (typeof Deno === "undefined" && typeof process !== "undefined" && process.argv[1]) {
  const { pathToFileURL } = await import("node:url");
  if (import.meta.url === pathToFileURL(process.argv[1]).href) {
    contentQueueMain().catch(error => { console.error(error.message); process.exitCode = 1; });
  }
}
