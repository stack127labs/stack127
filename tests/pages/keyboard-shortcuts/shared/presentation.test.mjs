import assert from 'node:assert/strict';
import test from 'node:test';
import { keycapParts, groupedBindings } from '../../../../lib/shortcuts/presentation.ts';

test('key separators distinguish modifiers, literal plus keys, and sequential chords', () => {
  const text = keys => keycapParts(keys).map(p => p.separator + (p.connector ? ` ${p.key} ` : p.key)).join('');
  assert.equal(text(['Shift', 'F']), 'Shift + F');
  assert.equal(text(['Ctrl', '+']), 'Ctrl + +');
  assert.equal(text(['Ctrl', 'K', 'Ctrl', 'C']), 'Ctrl + K then Ctrl + C');
  assert.equal(text(['Ctrl', 'K', 'F12']), 'Ctrl + K then F12');
  assert.equal(text(['G', 'N']), 'G then N');
  assert.equal(text(['Ctrl', 'B', 'then', '%']), 'Ctrl + B then %');
  assert.equal(keycapParts(['then'])[0].connector, true);
});

test('platform grouping preserves alternatives, notes, and unknown bindings', () => {
  const shortcut = { id: 'copy', action: 'Copy', keys: [
    { platform: 'windows', keys: ['Ctrl', 'C'] },
    { platform: 'linux', keys: ['Ctrl', 'C'] },
    { platform: 'macos', keys: ['Cmd', 'C'], note: 'Editor only.' },
  ] };
  const groups = groupedBindings(shortcut, ['windows', 'macos', 'linux']);
  assert.deepEqual(groups.map(g => g.platforms), [['windows', 'linux'], ['macos']]);
  shortcut.keys[1].note = 'Terminal only.';
  assert.equal(groupedBindings(shortcut, ['windows', 'macos', 'linux']).length, 3);
  shortcut.keys.pop();
  assert.equal(groupedBindings(shortcut, ['macos'])[0].entry, undefined);
});
