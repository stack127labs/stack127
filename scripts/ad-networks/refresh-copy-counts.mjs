// Only the count-bearing fields approved in the October 2026 title batch.
// Editorial wording and descriptions stay owned by the page publisher.
const networks = [
  ['google-adsense', 'Google AdSense'], ['mediavine', 'Mediavine'], ['ezoic', 'Ezoic'], ['raptive', 'Raptive'],
  ['journey-by-mediavine', 'Journey by Mediavine'], ['publift', 'Publift'], ['mgid', 'MGID'],
  ['the-moneytizer', 'The Moneytizer'], ['taboola', 'Taboola'], ['monumetric', 'Monumetric'],
  ['playwire', 'Playwire'], ['freestar', 'Freestar'], ['anymind-anymanager', 'AnyMind'],
  ['adpushup', 'AdPushup'], ['infolinks', 'Infolinks'], ['nitropay', 'NitroPay'], ['newor-media', 'Newor Media'],
  ['snack-media', 'Snack Media'], ['refinery89', 'Refinery89'], ['setupad', 'Setupad'], ['venatus', 'Venatus'],
  ['pubpower', 'PubPower'], ['pubgalaxy', 'PubGalaxy'], ['publisher-collective', 'Publisher Collective'],
  ['clickio', 'Clickio'], ['adnimation', 'Adnimation'], ['teads', 'Teads'],
  ['amazon-publisher-services', 'Amazon Publisher Services'], ['adapex', 'Adapex'], ['geniee-ssp', 'Geniee SSP'],
  ['opti-digital', 'Opti Digital'], ['monetizemore-pubguru', 'MonetizeMore'], ['pubfuture', 'PubFuture'],
  ['buysellads-carbon-ads', 'Carbon Ads'], ['pubnation', 'PubNation'], ['revcontent', 'Revcontent'],
  ['aditude', 'Aditude'], ['sparteo', 'Sparteo'], ['she-media', 'SHE Media'],
];
const niches = [
  ['tech', 'tech sites'], ['news', 'news sites'], ['food', 'food blogs'], ['education', 'education sites'],
  ['entertainment', 'entertainment sites'], ['business', 'business sites'], ['lifestyle', 'lifestyle blogs'],
  ['travel', 'travel blogs'], ['gaming', 'gaming sites'], ['personal-finance', 'personal finance sites'],
  ['sports', 'sports sites'], ['health-fitness', 'health and fitness sites'], ['home-diy', 'home and DIY blogs'],
  ['crafts', 'craft blogs'], ['automotive', 'car sites'], ['beauty-fashion', 'beauty and fashion blogs'],
  ['parenting', 'parenting blogs'], ['outdoors', 'outdoor blogs'], ['pets', 'pet blogs'], ['gardening', 'gardening blogs'],
];

export function roundedCopyCount(count, { catalog = false } = {}) {
  if (!Number.isSafeInteger(count) || count < 0) throw new Error(`Invalid ad-network count: ${count}`);
  if (count < 10) return '';
  const step = catalog ? 10 : count < 100 ? 5 : count < 1000 ? 50 : count < 10000 ? 100 : 1000;
  return `${(Math.floor(count / step) * step).toLocaleString('en-US')}+`;
}

const escape = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// A slot owns its following space, so removing a prefix below ten is reversible.
// Count-only mark wrappers are accepted and retained while a count is present.
function phrase(template, metric, catalog = false, anchored = true) {
  const [before, after] = template.split('{} ');
  if (after === undefined) throw new Error('Count phrase needs one slot');
  const number = '(?:[0-9]+(?:,[0-9]{3})*)\\+';
  const pattern = new RegExp(`${anchored ? '^' : ''}${escape(before)}(?<slot>(?:(?:<mark>${number}</mark>|${number}) )?)${escape(after)}`, 'dg');
  return { pattern, metric, catalog };
}
const rules = new Map([
  ['ad-networks', {
    meta_title: [phrase('{} ad networks compared:', 'network_count', true), phrase('pay, {} sites', 'listed', false, false)],
    title: [phrase('Compare {} <mark>ad networks</mark>:', 'network_count', true), phrase('and {} sites using them', 'listed', false, false)],
  }],
  ['ad-networks/stats', {
    meta_title: [phrase('Ad network market share (2026): {} sites checked', 'listed')],
    title: [phrase('Which <mark>ad networks</mark> do {} sites actually run?', 'listed')],
  }],
  ['ad-networks/niches', {
    meta_title: [phrase('Ad networks by niche: what {} sites in 20 niches run', 'classified')],
    title: [phrase('The <mark>ad networks</mark> {} sites run, sorted into 20 niches', 'classified')],
  }],
]);
for (const [slug, name] of networks) {
  const metric = `networks.${slug}`;
  const seo = {
    'google-adsense': '{} sites using AdSense:',
    'journey-by-mediavine': 'Journey by Mediavine: {} sites, requirements, and pay',
    'publisher-collective': '{} Publisher Collective sites:',
    'amazon-publisher-services': 'Amazon Publisher Services: {} sites, fees, and pay terms',
  }[slug] ?? `{} sites using ${name}${slug === 'pubgalaxy' ? ', now part of Improve Digital' : ':'}`;
  const h1 = slug === 'pubgalaxy' ? '{} sites still running <mark>PubGalaxy</mark>, now part of Improve Digital'
    : `{} sites running <mark>${name}</mark>, plus its`;
  rules.set(`ad-networks/${slug}`, { meta_title: [phrase(seo, metric)], title: [phrase(h1, metric)] });
}
for (const [slug, noun] of niches) {
  // The approved SEO titles have two forms, chosen by their original length.
  const short = `Ad networks for ${noun}: what 1,000+ real sites use`.length > 60;
  rules.set(`ad-networks/niches/${slug}`, {
    meta_title: [phrase(`Ad networks for ${noun}: what {} ${short ? 'use' : 'real sites use'}`, `niches.${slug}`)],
    title: [phrase(`The <mark>ad networks</mark> {} ${noun} run, and how to join them`, `niches.${slug}`)],
  });
}

export const copyCountSlugs = Object.freeze([...rules.keys()].sort());

function matches(value, rule) {
  return typeof value === 'string' ? [...value.matchAll(rule.pattern)] : [];
}
function metricValue(metrics, key) {
  const [group, slug] = key.split('.');
  const value = slug ? metrics[group]?.[slug] : metrics[group];
  // A niche with no listed publishers has no GROUP BY row.
  return slug && group === 'niches' && value === undefined ? 0 : value;
}

// Pure: pass flat approved/current {slug, title, meta_title, ...} snapshots.
// Use metrics read separately from EACH target database when preparing a batch.
export function renderCopyCounts(pages, metrics) {
  const changes = [], skipped = [];
  const rendered = pages.map(page => {
    const fields = rules.get(page.slug);
    if (!fields) { skipped.push({ slug: page.slug, reason: 'not_allowlisted' }); return { ...page }; }
    const found = Object.entries(fields).map(([field, phrases]) => ({ field, phrases,
      hits: phrases.map(rule => matches(page[field], rule)) }));
    if (found.every(({ hits }) => hits.every(list => list.length === 0))) {
      skipped.push({ slug: page.slug, reason: 'unadopted_copy' }); return { ...page };
    }
    const result = { ...page };
    for (const { field, phrases, hits } of found) {
      if (hits.some(list => list.length !== 1)) throw new Error(`Ad-network count phrase missing or ambiguous: ${page.slug}.${field}`);
      // Work from the end so the original offsets remain valid for two slots.
      const replacements = phrases.map((rule, index) => {
        const hit = hits[index][0];
        const count = roundedCopyCount(metricValue(metrics, rule.metric), { catalog: rule.catalog });
        const slot = hit.groups.slot;
        const replacement = count ? `${slot.startsWith('<mark>') ? `<mark>${count}</mark>` : count} ` : '';
        const [start, end] = hit.indices.groups.slot;
        return { start, end, replacement };
      });
      let value = page[field];
      for (const { start, end, replacement } of replacements.sort((a, b) => b.start - a.start)) {
        value = value.slice(0, start) + replacement + value.slice(end);
      }
      if (value !== page[field]) changes.push({ slug: page.slug, field, before: page[field], after: value });
      result[field] = value;
    }
    return result;
  });
  return { pages: rendered, changes, skipped };
}

// All populations share one statement snapshot. Networks include zero-site rows;
// the root/stats and classified populations count publishers once, across networks.
export async function readCopyCountMetrics(client) {
  const { rows } = await client.query(`with listed as materialized (
      select ad_network_id, publisher_id from public.ad_network_publisher_relationships
      where status in ('confirmed', 'stale')
    ), population as materialized (
      select p.id, p.niche from public.ad_network_publishers p
      join (select distinct publisher_id from listed) l on l.publisher_id = p.id
    ), network_counts as (
      select n.slug, count(l.publisher_id)::int as count from public.ad_networks n
      left join listed l on l.ad_network_id = n.id group by n.id, n.slug
    ), niche_counts as (
      select niche, count(*)::int as count from population where niche is not null group by niche
    ) select (select count(*)::int from network_counts) as network_count,
      (select count(*)::int from population) as listed,
      (select count(*)::int from population where niche is not null) as classified,
      coalesce((select jsonb_object_agg(slug, count) from network_counts), '{}'::jsonb) as networks,
      coalesce((select jsonb_object_agg(niche, count) from niche_counts), '{}'::jsonb) as niches`);
  if (!rows[0]) throw new Error('Ad-network copy metrics missing');
  return rows[0];
}

export async function refreshCopyCounts(client, { apply = false } = {}) {
  await client.query(apply ? 'begin' : 'begin read only');
  try {
    await client.query('select pg_advisory_xact_lock(hashtextextended($1, 0))', ['stack127-page-publishing']);
    const { rows: pages } = await client.query(`select id, slug, page_family, meta_title
      from public.stack127_pages where slug = any($1::text[])
      order by slug ${apply ? 'for update' : ''}`, [copyCountSlugs]);
    const { rows: directories } = await client.query(`select page_id, title from public.stack127_directory_pages
      where page_id = any($1::bigint[]) order by page_id ${apply ? 'for update' : ''}`, [pages.map(page => page.id)]);
    const byId = new Map(directories.map(row => [String(row.page_id), row]));
    const metrics = await readCopyCountMetrics(client);
    const result = renderCopyCounts(pages.map(page => ({ ...page, title: byId.get(String(page.id))?.title })), metrics);
    for (const change of result.changes) {
      const page = pages.find(row => row.slug === change.slug);
      if (page.page_family !== 'directory') throw new Error(`Wrong page family for count refresh: ${page.slug}`);
      if (!apply) continue;
      if (change.field === 'meta_title') await client.query('update public.stack127_pages set meta_title = $2 where id = $1', [page.id, change.after]);
      else await client.query('update public.stack127_directory_pages set title = $2 where page_id = $1', [page.id, change.after]);
    }
    await client.query('commit');
    return { ...result, metrics, applied: apply };
  } catch (error) {
    await client.query('rollback');
    throw error;
  }
}
