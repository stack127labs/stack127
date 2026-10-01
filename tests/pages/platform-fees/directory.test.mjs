import assert from 'node:assert/strict';
import { test } from 'node:test';
import { validateDirectory, filterDirectory, hiddenRateCount, sectionFeeRange, sectionCheckedAt } from '../../../lib/platform-fees/model.ts';
const fields = ['Plan cost', 'Platform fee', 'Processing', 'Availability'].map((label, i) => ({ key: `f${i}`, label, icon: 'ReceiptText' }));
const presentation = { icon: 'Download', group_name: 'Digital products and stores', intro: 'Compare download fees.', meta_title: 'Download fees compared', meta_description: 'Compare download fees and start costs.', related_sections: [] };
const rate = (value, percent, label, fact_key = 'f1') => ({ value, percent, label, fact_key });
function card() {
  return {
    owner: 'Example', tag: 'Digital downloads',
    take: rate('Not public', null, 'Platform fee'),
    lines: [{ label: 'Start', value: 'Free', fact_key: 'f0' }, { label: 'Processing', value: 'Extra', fact_key: 'f2' }, { label: 'Region', value: 'US', fact_key: 'f3' }],
    groups: [],
  };
}
function fixture() {
  return { sections: [{ ...presentation, id: 'downloads', name: 'Downloads', sort_order: 0, fields }, { ...presentation, id: 'apps', name: 'Apps', sort_order: 1, fields }], entries: [{ id: 'shop', section_id: 'downloads', name: 'Example Shop', summary: 'Sell digital files.', website_url: 'https://example.com', icon_path: null, facts: fields.map(field => ({ key: field.key, value: 'Unverified', state: 'unverified' })), sources: [], checked_at: null, comparison_basis: 'US USD', fee_percent: null, fee_basis: null, sort_order: 0, card: card() }] };
}
// A researched entry whose platform fee fact is verified.
function pricedFixture() {
  const data = fixture(), entry = data.entries[0];
  entry.sources = [{ url: 'https://example.com/pricing', label: 'Pricing' }];
  entry.checked_at = '2026-09-27';
  entry.facts[1] = { key: 'f1', value: '30% standard; 15% small business; 0% eligible', state: 'verified', source_url: entry.sources[0].url, checked_at: '2026-09-27' };
  Object.assign(entry.card, {
    take: rate('30%', 30, 'Standard'),
    second: rate('15%', 15, 'Small business'),
    groups: [{ label: 'Standard', rates: [rate('30%', 30, 'Standard'), rate('15%', 15, 'Small business'), rate('0%', 0, 'Eligible')] }],
  });
  return data;
}
test('unknown fees remain unknown and cannot acquire a zero-percent chart', () => {
  const data = fixture();
  validateDirectory(data);
  data.entries[0].fee_percent = 0;
  data.entries[0].fee_basis = 'Platform fee';
  assert.throws(() => validateDirectory(data), /fee visualization/);
});
test('a researched zero fee is allowed with a source and basis', () => {
  const data = fixture(), entry = data.entries[0];
  entry.sources = [{ url: 'https://example.com/pricing', label: 'Pricing' }];
  entry.checked_at = '2026-09-26';
  entry.facts[1] = { key: 'f1', value: '0% platform fee', state: 'verified' };
  entry.fee_percent = 0; entry.fee_basis = 'Before processing';
  validateDirectory(data);
  entry.fee_percent = '0';
  assert.throws(() => validateDirectory(data), /fee visualization/);
  entry.fee_percent = 101;
  assert.throws(() => validateDirectory(data), /fee visualization/);
});
test('inconsistent fact orders and unsourced earnings are rejected', () => {
  const data = fixture();
  data.entries[0].facts.reverse();
  assert.throws(() => validateDirectory(data), /Inconsistent facts/);
  data.entries[0].facts.reverse();
  data.entries[0].facts[0].state = 'verified';
  assert.throws(() => validateDirectory(data), /Missing research source/);
});
test('search matches name, tag, and description with section filtering', () => {
  const data = fixture();
  assert.equal(filterDirectory(data, '  DIGITAL  ', '').entries.length, 1);
  assert.equal(filterDirectory(data, 'downloads', '').entries.length, 1);
  assert.equal(filterDirectory(data, 'EXAMPLE', 'downloads').entries.length, 1);
  assert.equal(filterDirectory(data, 'EXAMPLE', 'apps').entries.length, 0);
  assert.equal(filterDirectory(data, 'missing', '').sections.length, 0);
});
test('invalid dates and unsafe source links are rejected', () => {
  const data = fixture(), entry = data.entries[0];
  entry.checked_at = '2026-02-30';
  assert.throws(() => validateDirectory(data), /checked date/);
  entry.checked_at = null; entry.website_url = 'javascript:alert(1)';
  assert.throws(() => validateDirectory(data), /source URL/);
});
test('every entry needs a card', () => {
  const data = fixture();
  delete data.entries[0].card;
  assert.throws(() => validateDirectory(data), /Missing card/);
});
test('cards count only rates not already shown as the big numbers', () => {
  const data = pricedFixture(), receipt = data.entries[0].card;
  validateDirectory(data);
  assert.equal(hiddenRateCount(receipt), 1);
  receipt.take = rate('10–30%', null, 'By tier');
  assert.equal(hiddenRateCount(receipt), 2);
});
test('bars need a verified fact and must match the written rate', () => {
  const data = pricedFixture(), receipt = data.entries[0].card;
  receipt.take.fact_key = 'f2';
  assert.throws(() => validateDirectory(data), /Invalid receipt bar/);
  receipt.take.percent = null;
  validateDirectory(data);
  receipt.take = rate('30%', 25, 'Standard');
  assert.throws(() => validateDirectory(data), /Invalid receipt bar/);
  receipt.take = rate('30% + 50¢', 30, 'Standard');
  assert.throws(() => validateDirectory(data), /Invalid receipt bar/);
  receipt.take = { ...rate('30%', 30, 'Standard'), extra: '+ 50¢' };
  validateDirectory(data);
});
test('fact sources must belong to the entry and dates must be valid and current', () => {
  const data = pricedFixture(), fact = data.entries[0].facts[1];
  fact.source_url = 'https://example.com/unsupported';
  assert.throws(() => validateDirectory(data), /Invalid fact source/);
  fact.source_url = data.entries[0].sources[0].url; fact.checked_at = '2026-09-28';
  assert.throws(() => validateDirectory(data), /Invalid fact source/);
  fact.checked_at = '2026-02-30';
  assert.throws(() => validateDirectory(data), /Invalid fact source/);
});

test('a headline range excludes unknown fees and reports partial coverage', () => {
  const data = pricedFixture();
  data.entries.push({ ...fixture().entries[0], id: 'unknown' });
  assert.deepEqual(sectionFeeRange(data.entries), { min: 30, max: 30, count: 1 });
  data.entries[0].facts[1].state = 'variable';
  assert.equal(sectionFeeRange(data.entries), null);
});

test('a section date uses all entries and leaves missing dates unknown', () => {
  assert.equal(sectionCheckedAt(fixture().entries), null);
  const data = pricedFixture();
  data.entries.push({ ...data.entries[0], id: 'newer', checked_at: '2026-09-30' });
  assert.equal(sectionCheckedAt(data.entries), '2026-09-30');
});

test('rate counting consumes each shown row once and respects fixed fees', () => {
  const receipt = pricedFixture().entries[0].card;
  receipt.second = { ...receipt.take };
  assert.equal(hiddenRateCount(receipt), 2);
  receipt.groups[0].rates[0].extra = '+ 50¢';
  assert.equal(hiddenRateCount(receipt), 3);
});
