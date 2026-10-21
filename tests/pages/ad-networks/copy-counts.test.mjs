import assert from 'node:assert/strict';
import test from 'node:test';
import { roundedCopyCount, renderCopyCounts, readCopyCountMetrics, refreshCopyCounts } from '../../../scripts/ad-networks/refresh-copy-counts.mjs';

const network = (slug = 'the-moneytizer', name = 'The Moneytizer', count = '1,000+') => ({
  slug: `ad-networks/${slug}`,
  meta_title: `${count} sites using ${name}: requirements, pay, stats`,
  title: `${count} sites running <mark>${name}</mark>, plus its requirements, pay, and traffic stats`,
  meta_description: 'Policy checked in 2026: 50,000 sites required; fees of 10% and Net 30 pay.',
});
const root = {
  slug: 'ad-networks', meta_title: '40+ ad networks compared: requirements, pay, 108,000+ sites',
  title: 'Compare 40+ <mark>ad networks</mark>: what they ask, what they pay, and 108,000+ sites using them',
};
const stats = { slug: 'ad-networks/stats', meta_title: 'Ad network market share (2026): 108,000+ sites checked',
  title: 'Which <mark>ad networks</mark> do 108,000+ sites actually run?' };
const hub = { slug: 'ad-networks/niches', meta_title: 'Ad networks by niche: what 87,000+ sites in 20 niches run',
  title: 'The <mark>ad networks</mark> 87,000+ sites run, sorted into 20 niches' };
const niche = (slug, noun, shortened = false) => ({ slug: `ad-networks/niches/${slug}`,
  meta_title: `Ad networks for ${noun}: what 8,300+ ${shortened ? 'use' : 'real sites use'}`,
  title: `The <mark>ad networks</mark> 8,300+ ${noun} run, and how to join them` });
const metrics = { network_count: 44, listed: 108399, classified: 87399,
  networks: { 'the-moneytizer': 1015 }, niches: { food: 8399, 'personal-finance': 3478 } };
const render = (page, counts = metrics) => renderCopyCounts([page], counts).pages[0];

test('rounding uses approved tiers on increases and decreases, with catalog tens', () => {
  for (const [count, expected] of [[0, ''], [9, ''], [10, '10+'], [14, '10+'], [99, '95+'],
    [100, '100+'], [999, '950+'], [1015, '1,000+'], [9999, '9,900+'], [10000, '10,000+'], [108399, '108,000+']]) {
    assert.equal(roundedCopyCount(count), expected);
  }
  assert.equal(roundedCopyCount(44, { catalog: true }), '40+');
  assert.equal(roundedCopyCount(59, { catalog: true }), '50+');
  for (const count of [-1, NaN, undefined, 1.5, Number.MAX_SAFE_INTEGER + 1]) assert.throws(() => roundedCopyCount(count), /Invalid/);
});

test('only count slots change, including a decrease from 1,015 to 999', () => {
  const page = network();
  const result = render(page, { ...metrics, networks: { 'the-moneytizer': 999 } });
  assert.equal(result.meta_title, page.meta_title.replace('1,000+', '950+'));
  assert.equal(result.title, page.title.replace('1,000+', '950+'));
  assert.equal(result.meta_description, page.meta_description);
  assert.equal(renderCopyCounts([page], metrics).changes.length, 0);
});

test('special approved phrases preserve product names, fees, years, and mark wrappers', () => {
  const cases = [
    ['journey-by-mediavine', 'Journey by Mediavine', 'Journey by Mediavine: 200+ sites, requirements, and pay'],
    ['publisher-collective', 'Publisher Collective', '200+ Publisher Collective sites: requirements, pay, stats'],
    ['amazon-publisher-services', 'Amazon Publisher Services', 'Amazon Publisher Services: 200+ sites, fees, and pay terms'],
    ['google-adsense', 'Google AdSense', '200+ sites using AdSense: requirements, pay, and stats'],
    ['pubgalaxy', 'PubGalaxy', '200+ sites using PubGalaxy, now part of Improve Digital'],
  ];
  for (const [slug, name, meta_title] of cases) {
    const page = { ...network(slug, name, '200+'), meta_title };
    if (slug === 'pubgalaxy') page.title = '200+ sites still running <mark>PubGalaxy</mark>, now part of Improve Digital';
    const result = render(page, { networks: { [slug]: 299 } });
    assert.equal(result.meta_title, page.meta_title.replace('200+', '250+'));
    assert.equal(result.title, page.title.replace('200+', '250+'));
    const empty = render(page, { networks: { [slug]: 0 } });
    assert.ok(!empty.meta_title.includes('200+'));
    assert.equal(render(empty, { networks: { [slug]: 299 } }).meta_title, result.meta_title);
  }
  const marked = { ...network(), title: network().title.replace('1,000+', '<mark>1,000+</mark>') };
  assert.match(render(marked, { networks: { 'the-moneytizer': 999 } }).title, /^<mark>950\+<\/mark> sites/);
  const noCount = render(marked, { networks: { 'the-moneytizer': 2 } });
  assert.ok(!noCount.title.includes('<mark></mark>'));
  assert.match(render(noCount, { networks: { 'the-moneytizer': 10 } }).title, /^10\+ sites/);
});

test('root, stats, classified hub, and niche children use separate metrics', () => {
  const counts = { ...metrics, network_count: 59, listed: 1015, classified: 999, niches: { food: 78, 'personal-finance': 105 } };
  const result = renderCopyCounts([root, stats, hub, niche('food', 'food blogs'), niche('personal-finance', 'personal finance sites', true)], counts);
  assert.match(result.pages[0].meta_title, /^50\+ ad networks.*1,000\+ sites$/);
  assert.match(result.pages[1].meta_title, /\(2026\): 1,000\+ sites/);
  assert.match(result.pages[2].title, /950\+ sites run, sorted into 20 niches/);
  assert.match(result.pages[3].meta_title, /75\+ real sites use/);
  assert.match(result.pages[3].title, /75\+ food blogs run/);
  assert.match(result.pages[4].meta_title, /100\+ use$/);
  const empty = renderCopyCounts([root, stats, hub, niche('food', 'food blogs')], { network_count: 4, listed: 3, classified: 0, niches: {} });
  assert.ok(empty.pages.every(page => !/\d[\d,]*\+/.test(page.title + page.meta_title)));
  const recovered = renderCopyCounts(empty.pages, counts);
  assert.deepEqual(recovered.pages, result.pages.slice(0, 4));
});

test('old unadopted copy skips explicitly; partial adoption or ambiguous phrases fails', () => {
  const old = { slug: 'ad-networks', title: 'Find an ad network for your site', meta_title: 'Ad networks: requirements and pay' };
  assert.deepEqual(renderCopyCounts([old], {}).skipped, [{ slug: old.slug, reason: 'unadopted_copy' }]);
  assert.throws(() => render({ ...network(), meta_title: 'Old title' }), /the-moneytizer.meta_title/);
  assert.throws(() => render({ ...network(), meta_title: network().meta_title.replace('1,000+', '1000') }), /missing or ambiguous/);
  assert.throws(() => render({ ...root, meta_title: `${root.meta_title}; pay, 200+ sites` }), /ambiguous/);
  for (const slug of ['publir', 'ethicalads', 'concert', 'sovrn', 'media-net']) {
    const page = { slug: `ad-networks/${slug}`, title: 'Approved count-free title', meta_title: 'Requirements and pay (2026)' };
    assert.deepEqual(render(page, { networks: { [slug]: 99999 } }), page);
  }
});

function database({ pages = [network()], counts = metrics, failUpdate = false } = {}) {
  const calls = [], committed = [], pending = [];
  return { calls, committed, async query(sql, values) {
    const text = sql.replace(/\s+/g, ' ').trim(); calls.push({ text, values });
    if (text.startsWith('select id, slug')) return { rows: pages.map((page, index) => ({ ...page, id: index + 1, page_family: 'directory' })) };
    if (text.startsWith('select page_id')) return { rows: pages.map((page, index) => ({ page_id: index + 1, title: page.title })) };
    if (text.startsWith('with listed as materialized')) return { rows: [counts] };
    if (text.startsWith('update')) {
      pending.push({ text, values });
      if (failUpdate && pending.length === 2) throw Error('write failed');
    }
    if (text === 'commit') committed.push(...pending.splice(0));
    if (text === 'rollback') pending.length = 0;
    return { rows: [] };
  } };
}

test('metrics are obtained in one statement with distinct listed publishers and all catalog networks', async () => {
  const client = database();
  assert.deepEqual(await readCopyCountMetrics(client), metrics);
  assert.equal(client.calls.length, 1);
  // Protect the population boundaries: stale stays listed, multi-network sites
  // count once, and the catalog keeps its zero-site networks.
  const sql = client.calls[0].text;
  assert.match(sql, /status in \('confirmed', 'stale'\)/);
  assert.match(sql, /select distinct publisher_id from listed/);
  assert.match(sql, /from public.ad_networks n left join listed/);
});

test('refresh defaults to read-only preview; apply locks in publisher order and same-bucket runs never update', async () => {
  const counts = { ...metrics, networks: { 'the-moneytizer': 999 } };
  const preview = database({ counts });
  const plan = await refreshCopyCounts(preview);
  assert.equal(plan.applied, false); assert.equal(plan.changes.length, 2);
  assert.equal(preview.calls[0].text, 'begin read only');
  assert.ok(!preview.calls.some(call => /for update|^update/.test(call.text)));
  const client = database({ counts });
  await refreshCopyCounts(client, { apply: true });
  assert.match(client.calls[1].text, /pg_advisory_xact_lock\(hashtextextended\(\$1, 0\)\)/);
  assert.deepEqual(client.calls[1].values, ['stack127-page-publishing']);
  assert.match(client.calls[2].text, /stack127_pages.*order by slug for update/);
  assert.match(client.calls[3].text, /stack127_directory_pages.*order by page_id for update/);
  assert.equal(client.committed.length, 2);
  assert.ok(client.committed.every(call => !/description|updated_at|published_at/.test(call.text)));
  const sameBucket = database();
  assert.equal((await refreshCopyCounts(sameBucket, { apply: true })).changes.length, 0);
  assert.equal(sameBucket.committed.length, 0);
});

test('partial adoption and write failures roll back the entire refresh', async () => {
  const partial = database({ pages: [network(), { ...network('mediavine', 'Mediavine'), meta_title: 'Old title' }] });
  await assert.rejects(refreshCopyCounts(partial, { apply: true }), /missing or ambiguous/);
  assert.equal(partial.calls.at(-1).text, 'rollback');
  assert.equal(partial.committed.length, 0);
  const failed = database({ counts: { networks: { 'the-moneytizer': 999 } }, failUpdate: true });
  await assert.rejects(refreshCopyCounts(failed, { apply: true }), /write failed/);
  assert.equal(failed.calls.at(-1).text, 'rollback');
  assert.equal(failed.committed.length, 0);
});

test('the publisher lock must be acquired before reading or changing managed copy', async () => {
  const client = database({ counts: { ...metrics, networks: { 'the-moneytizer': 999 } } });
  const query = client.query.bind(client);
  let unlock, reached;
  const blocked = new Promise(resolve => { unlock = resolve; });
  const lockReached = new Promise(resolve => { reached = resolve; });
  client.query = async (sql, values) => {
    if (sql.includes('pg_advisory_xact_lock')) { reached(); await blocked; }
    return query(sql, values);
  };
  const work = refreshCopyCounts(client, { apply: true });
  await lockReached;
  assert.deepEqual(client.calls.map(call => call.text), ['begin']);
  assert.equal(client.committed.length, 0);
  unlock();
  await work;
  assert.equal(client.committed.length, 2);
});
