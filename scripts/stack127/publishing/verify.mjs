import { setTimeout as sleep } from 'node:timers/promises';
import { desiredStates } from './model.mjs';

export function htmlText(value) {
  return String(value).replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' ').replace(/&#(x[0-9a-f]+|[0-9]+);/gi, (_, code) => {
    const number = code[0].toLowerCase() === 'x' ? parseInt(code.slice(1), 16) : Number(code);
    return number <= 0x10ffff ? String.fromCodePoint(number) : '';
  }).replace(/&(amp|lt|gt|quot|apos|nbsp);/g, (_, code) => ({ amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' }[code])).replace(/\s+/g, ' ').trim();
}

function attributes(tag) {
  return Object.fromEntries([...tag.matchAll(/([a-z-]+)\s*=\s*(["'])(.*?)\2/gi)].map(match => [match[1].toLowerCase(), htmlText(match[3])]));
}
export function inspectIndexingHtml(html, { slug, is_indexable = true }, site) {
  const meta = [...html.matchAll(/<meta\b[^>]*>/gi)].map(match => attributes(match[0]));
  const robotsTag = meta.filter(item => item.name?.toLowerCase() === 'robots')
    .flatMap(item => (item.content ?? '').toLowerCase().split(',').map(token => token.trim()));
  const robots = meta.filter(item => ['robots', 'googlebot'].includes(item.name?.toLowerCase()))
    .flatMap(item => (item.content ?? '').toLowerCase().split(',').map(token => token.trim()));
  const canonical = [...html.matchAll(/<link\b[^>]*>/gi)].map(match => attributes(match[0])).find(item => item.rel === 'canonical')?.href;
  const expectedCanonical = new URL(slug ? `/${slug}` : '/', site).href;
  const indexingCorrect = is_indexable
    ? robots.includes('index') && !robots.includes('noindex') && !robots.includes('none')
    : robotsTag.includes('noindex') && !robots.includes('index');
  // URL parsing treats https://stack127.com and https://stack127.com/ as the same root.
  let canonicalHref = null;
  try { canonicalHref = canonical ? new URL(canonical).href : null; } catch { canonicalHref = null; }
  if (canonicalHref !== expectedCanonical || !indexingCorrect) throw new Error(`Public indexing metadata is incorrect: ${slug}`);
  const structuredData = [...html.matchAll(/<script\b[^>]*>/gi)]
    .some(match => attributes(match[0]).type?.toLowerCase() === 'application/ld+json');
  if (!is_indexable && structuredData) throw new Error(`Noindex page sends structured data: ${slug}`);
}

export function inspectSitemap(sitemap, pages, site) {
  const urls = new Set([...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => htmlText(match[1])));
  for (const page of pages) {
    const expected = page.is_published && page.is_indexable !== false;
    if (urls.has(new URL(page.slug ? `/${page.slug}` : '/', site).href) !== expected) {
      throw new Error(`Public sitemap inclusion is incorrect: ${page.slug}`);
    }
  }
}

export function inspectPublishedHtml(html, state, revision, site) {
  const meta = [...html.matchAll(/<meta\b[^>]*>/gi)].map(match => attributes(match[0]));
  const value = name => meta.find(item => item.name === name)?.content;
  const title = htmlText(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? '');
  const heading = htmlText(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? '');
  const expectedHeading = state.family === 'course' ? state.lesson.title : state.content.title;
  if (![state.registry.meta_title, `${state.registry.meta_title} | stack127`].includes(title) || value('description') !== state.registry.meta_description || heading !== htmlText(expectedHeading)) throw new Error(`Public title, heading, or description is stale: ${state.slug}`);
  inspectIndexingHtml(html, { slug: state.slug, ...state.registry }, site);
  if (state.family === 'tool' && state.content.stack127_repo_url) {
    const links = [...html.matchAll(/<a\b[^>]*>/gi)].map(match => attributes(match[0]).href);
    if (!links.includes(state.content.stack127_repo_url)) throw new Error(`Public repository link is stale: ${state.slug}`);
  }
  if (value('stack127-content-revision') !== revision) throw new Error(`Public cache has an older revision: ${state.slug}`);
}

export async function checkLiveRelease(site, sha, { fetchImplementation = fetch, waitSeconds = 0, sleepImplementation = sleep } = {}) {
  if (!/^[a-f0-9]{40}$/.test(sha ?? '')) throw new Error('Production requires a full --release-sha');
  const deadline = Date.now() + waitSeconds * 1000;
  let lastError;
  do {
    try {
      const response = await fetchImplementation(`${site}/api/health?scope=deploy`, { cache: 'no-store', signal: AbortSignal.timeout(20000) });
      const body = await response.json();
      if (!response.ok || body.ok !== true || body.build?.sha !== sha) throw new Error(`Live site has not reached ${sha}`);
      return;
    } catch (error) { lastError = error; }
    if (Date.now() >= deadline) break;
    await sleepImplementation(5000);
  } while (Date.now() <= deadline);
  throw lastError;
}

export async function verifyPublicPages(pool, entries, { site, canonicalOrigin = 'https://stack127.com', waitSeconds = 180, restore = false, fetchImplementation = fetch, sleepImplementation = sleep } = {}) {
  const targets = desiredStates(entries, { restore });
  const wanted = entries.map((entry, index) => ({ ...entry, wanted: targets[index] }));
  const result = await pool.query('select slug, row_updated_at from public.stack127_pages where slug = any($1::text[])', [entries.map(entry => entry.slug)]);
  const revisions = new Map(result.rows.map(row => [row.slug, new Date(row.row_updated_at).toISOString()]));
  const deadline = Date.now() + waitSeconds * 1000;
  let lastError;
  do {
    try {
      const sitemapResponse = await fetchImplementation(`${site}/sitemap.xml`, { cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(20000) });
      if (!sitemapResponse.ok) throw new Error(`Sitemap returned ${sitemapResponse.status}`);
      const sitemap = await sitemapResponse.text();
      inspectSitemap(sitemap, wanted.map(entry => ({ slug: entry.slug, ...entry.wanted.registry })), canonicalOrigin);
      for (const entry of wanted) {
        const state = entry.wanted;
        const response = await fetchImplementation(`${site}/${entry.slug}`, { cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(20000) });
        if (!state.registry.is_published) {
          if (response.status !== 404) throw new Error(`Unpublished page is still public: ${entry.slug}`);
          continue;
        }
        if (response.status !== 200) throw new Error(`Published page missing: ${entry.slug}`);
        inspectPublishedHtml(await response.text(), state, revisions.get(entry.slug), canonicalOrigin);
        for (const check of restore ? [] : entry.requirements.smoke) {
          const smoke = await fetchImplementation(`${site}${check.path}`, { cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(20000) });
          if (!smoke.ok || !htmlText(await smoke.text()).includes(check.text)) throw new Error(`Public smoke check failed: ${check.path}`);
        }
      }
      return { verified: true, pages: wanted.map(entry => entry.slug) };
    } catch (error) { lastError = error; }
    if (Date.now() >= deadline) break;
    await sleepImplementation(5000);
  } while (Date.now() <= deadline);
  throw new Error(`Database changes may already be saved; public verification is incomplete. Retry verify after checking the cache worker. ${lastError.message}`);
}
