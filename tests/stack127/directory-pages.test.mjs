import assert from 'node:assert/strict';
import test from 'node:test';
import { directoryTitleParts } from '../../lib/directory-page-content.ts';
import { keyboardShortcutPageCopy } from '../../scripts/stack127/directory-pages/lib.mjs';
import { remapDevelopmentPageIds } from '../../scripts/stack127/database/rebuild-development.mjs';

test('titles preserve their marked phrase and treat other HTML as text', () => {
  assert.deepEqual(directoryTitleParts('Check <mark>apps</mark> today'), [
    { text: 'Check ', marked: false }, { text: 'apps', marked: true }, { text: ' today', marked: false },
  ]);
  assert.deepEqual(directoryTitleParts('<script>alert(1)</script>'), [{ text: '<script>alert(1)</script>', marked: false }]);
});

test('new keyboard child rows use record identity and leave words in MDX', () => {
  assert.deepEqual(keyboardShortcutPageCopy({ slug: 'demo', name: 'Demo' }), {
    slug: 'keyboard-shortcuts/demo', title: '<mark>Demo</mark> keyboard shortcuts',
  });
});

test('development rebuild keeps child copy and memberships when page IDs change', () => {
  const before = [{ id: 1, slug: 'preview' }, { id: 2, slug: 'catalog' }];
  const after = [{ id: 4, slug: 'preview' }, { id: 9, slug: 'catalog' }];
  assert.deepEqual(remapDevelopmentPageIds([{ page_id: '1', title: 'Saved copy' }], ['page_id'], before, after), [{ page_id: 4, title: 'Saved copy' }]);
  assert.deepEqual(remapDevelopmentPageIds([{ catalog_page_id: 2, tool_page_id: 1 }], ['catalog_page_id', 'tool_page_id'], before, after), [{ catalog_page_id: 9, tool_page_id: 4 }]);
  assert.throws(() => remapDevelopmentPageIds([{ page_id: 3 }], ['page_id'], before, after), /registry page is missing/);
});
