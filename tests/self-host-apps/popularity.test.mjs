import assert from 'node:assert/strict';
import test from 'node:test';
import { starScore, popularityPatch, releasePatch, storedFacts, derivedPatch } from '../../scripts/self-host-apps/lib/popularity.mjs';
import { changedPatch, writePatches } from '../../scripts/self-host-apps/lib/app-refresh.mjs';
import { databaseOptions } from '../../scripts/self-host-apps/lib/environment.mjs';
import { refreshPopularity, validateArgs } from '../../scripts/self-host-apps/refresh-popularity.mjs';
const at = '2026-11-03T00:00:00.000Z';

test('original star tiers include both sides of every boundary', () => {
  for (const [stars, score] of [[null,0],[0,0],[1,50],[249,50],[250,60],[999,60],[1000,70],[4999,70],[5000,80],[9999,80],[10000,85],[19999,85],[20000,90],[49999,90],[50000,95],[99999,95],[100000,100]]) assert.equal(starScore(stars),score);
});
test('star scores follow gains and losses; catalog floors survive both', () => {
  const row = {popularity_score:61,popularity_basis:['unraid_apps','catalog_or_repository_presence']};
  const low = {...row, ...popularityPatch(row, 1, at)};
  assert.equal(low.popularity_score,61);
  const high = {...low,...popularityPatch(low,20000,at)};
  assert.equal(high.popularity_score,90);
  assert.equal(popularityPatch(high,1,at).popularity_score,61);
  assert.equal(popularityPatch({popularity_score:95,popularity_basis:['source_stars']},1,at).popularity_score,50);
  assert.equal(popularityPatch({popularity_score:0,popularity_basis:['unraid_apps']},5000,at).popularity_score,80);
  assert.deepEqual(popularityPatch({popularity_score:0,popularity_basis:[]},0,at),{});
  assert.deepEqual(popularityPatch(row,null,at),{});
});
test('identical scores and facts do not change check dates or write', async () => {
  const row = {popularity_score:80,popularity_basis:['source_stars']};
  assert.deepEqual(popularityPatch(row,6000,at),{});
  assert.deepEqual(changedPatch({a:new Date(at),b:{x:1,y:2}}, {a:at,b:{y:2,x:1}}),{});
  assert.equal(await writePatches({query(){throw Error('unexpected write');}}, []),0);
});
test('release fill preserves hand-verified values, including their dates', () => {
  assert.deepEqual(releasePatch({release_version:'5.2.2 LTS'},'v6',at,at),{});
  assert.deepEqual(releasePatch({},null,at,at),{});
  assert.equal(releasePatch({},'v6',at,at).release_version,'v6');
  assert.equal(storedFacts({source_code_host:'github',project_stars:0,source_stars:100}).stars,0);
});
test('preview is read-only and reports changes without any write query', async () => {
  const queries=[];
  const client={async query(sql){queries.push(sql);return {rows:sql.includes('select app.*')?[{id:'one',slug:'test',star_recipient:true,source_stars:6000,popularity_score:0,popularity_basis:[],source_latest_release:'v1'}]:[]};}};
  const report=await refreshPopularity(client,{all:true},at);
  assert.equal(queries[0],'begin read only');
  assert.equal(report.changed,1);
  assert.equal(report.written,0);
  assert.equal(report.changes[0].new.popularity_score,80);
  assert.ok(!queries.some(sql=>/\b(update|insert|delete)\b/i.test(sql)));
});
test('selection and apply flags must be explicit', () => {
  for(const args of [{},{all:true,slug:'app'},{all:true,apply:'false'},{all:true,apply:true,'dry-run':true}]) assert.throws(()=>validateArgs(args));
});

test('production previews and writes require the shared confirmation gate', () => {
  assert.throws(() => databaseOptions({environment:'production',all:true}), /Production requires --confirm stack127-production/);
  assert.throws(() => databaseOptions({environment:'production',all:true,apply:true}), /Production requires --confirm stack127-production/);
});

test('ineligible repository rows preserve scores and still fill releases', () => {
  for (const score of [0,24,70,100]) {
    const row = {star_recipient:false,popularity_score:score,popularity_basis:['source_stars']};
    const patch = derivedPatch(row,{stars:200000,version:'v1',publishedAt:at},at);
    assert.deepEqual(patch,{release_version:'v1',release_published_at:at,release_checked_at:at});
  }
  assert.equal(derivedPatch({star_recipient:true,popularity_score:0,popularity_basis:[]},{stars:200000},at).popularity_score,100);
});
