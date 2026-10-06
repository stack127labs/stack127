import assert from 'node:assert/strict';
import test from 'node:test';
import { directoryContentSection, directoryTitleParts } from '../../lib/directory-page-content.ts';
import { keyboardShortcutPageCopy, adNetworkPageCopy, platformFeeSectionCopy } from '../../scripts/stack127/directory-pages/lib.mjs';
import { remapDevelopmentPageIds } from '../../scripts/stack127/database/rebuild-development.mjs';

test('named prose sections cannot include the neighboring record explanation', () => {
  const content = '<!-- section:first -->\nBefore the table\n\n<!-- section:second -->\nAfter the table';
  assert.equal(directoryContentSection(content, 'first'), 'Before the table');
  assert.equal(directoryContentSection(content, 'second'), 'After the table');
  assert.throws(() => directoryContentSection(content, 'missing'), /section is missing/);
  assert.equal(directoryContentSection(null, 'missing'), '');
});

test('titles preserve their marked phrase and treat other HTML as text', () => {
  assert.deepEqual(directoryTitleParts('Check <mark>apps</mark> today'), [
    { text: 'Check ', marked: false }, { text: 'apps', marked: true }, { text: ' today', marked: false },
  ]);
  assert.deepEqual(directoryTitleParts('<script>alert(1)</script>'), [{ text: '<script>alert(1)</script>', marked: false }]);
});

test('generated child copy uses the record identity and current intro', () => {
  const shortcut = keyboardShortcutPageCopy({ slug: 'demo', name: 'Demo', intro: 'Current record intro.' });
  assert.equal(shortcut.slug, 'keyboard-shortcuts/demo');
  assert.equal(shortcut.intro_markdown, 'Current record intro.');
  assert.match(shortcut.content_markdown, /apps=demo/);
  const network = adNetworkPageCopy({ slug: 'demo', name: 'Demo', summary: null });
  assert.equal(network.slug, 'ad-networks/demo');
  assert.match(network.intro_markdown, /verified Demo relationship/);
  assert.ok(adNetworkPageCopy({ slug: 'demo', name: 'Demo', summary: 'Updated summary.' }).intro_markdown.startsWith('Updated summary.'));
  const fees = platformFeeSectionCopy({ slug: 'demo', name: 'Demo', intro: 'Current section intro.', meta_description: 'Demo fees.' }, 'platform-fees/demo');
  assert.equal(fees.title, 'Demo');
  assert.equal(fees.intro_markdown, 'Current section intro.');
  assert.equal(fees.content_markdown, null);
  assert.equal(platformFeeSectionCopy({ slug: 'demo', name: 'Demo', title: 'Demo <mark>fees</mark>' }, 'platform-fees/demo').title, 'Demo <mark>fees</mark>');
});

test('development rebuild keeps child copy and memberships when page IDs change', () => {
  const before = [{ id: 1, slug: 'preview' }, { id: 2, slug: 'catalog' }];
  const after = [{ id: 4, slug: 'preview' }, { id: 9, slug: 'catalog' }];
  assert.deepEqual(remapDevelopmentPageIds([{ page_id: '1', title: 'Saved copy' }], ['page_id'], before, after), [{ page_id: 4, title: 'Saved copy' }]);
  assert.deepEqual(remapDevelopmentPageIds([{ catalog_page_id: 2, tool_page_id: 1 }], ['catalog_page_id', 'tool_page_id'], before, after), [{ catalog_page_id: 9, tool_page_id: 4 }]);
  assert.throws(() => remapDevelopmentPageIds([{ page_id: 3 }], ['page_id'], before, after), /registry page is missing/);
});
