import type { PlatformId, Shortcut, ShortcutKey } from "./types.ts";

const modifiers = new Set(["ctrl", "control", "cmd", "command", "⌘", "shift", "⇧", "alt", "option", "opt", "⌥", "win", "windows", "super", "meta", "fn", "hyper"]);

/** The records list keys in press order. A non-modifier completes a chord. */
export function keycapParts(keys: string[]) {
  return keys.map((key, index) => {
    const connector = /^(then|or)$/i.test(key);
    const previous = keys[index - 1];
    const separator = index === 0 || connector || /^(then|or)$/i.test(previous)
      ? ""
      : modifiers.has(previous.toLowerCase()) ? " + " : " then ";
    return { key, connector, separator };
  });
}

/** Merge only identical bindings, including their alternatives and caveats. */
export function groupedBindings(shortcut: Shortcut, platforms: PlatformId[]) {
  const groups: { platforms: PlatformId[]; entry: ShortcutKey | undefined }[] = [];
  for (const platform of platforms) {
    const entry = shortcut.keys.find((binding) => binding.platform === platform);
    const signature = (value: ShortcutKey | undefined) => JSON.stringify(value ? [value.keys, value.alternatives ?? [], value.note ?? null] : null);
    const group = groups.find((candidate) => signature(candidate.entry) === signature(entry));
    if (group) group.platforms.push(platform);
    else groups.push({ platforms: [platform], entry });
  }
  return groups;
}
