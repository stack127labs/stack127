import type { AppShortcuts, PlatformId, Shortcut, ShortcutGroup } from "./types.ts";

export type CheatSheetAppSelection = {
  slug: string;
  /** Platform columns to print. Must be a non-empty subset of the app's platforms. */
  platforms: PlatformId[];
  /** Groups to include, in the app's own order. Null means every group. */
  groupIds: string[] | null;
};

export type CheatSheetSection = {
  group: ShortcutGroup;
  shortcuts: Shortcut[];
};

export type CheatSheetAppSection = {
  app: AppShortcuts;
  platforms: PlatformId[];
  sections: CheatSheetSection[];
  shortcutCount: number;
};

export type CheatSheetDoc = {
  apps: CheatSheetAppSection[];
  shortcutCount: number;
};

export type CheatSheetResult =
  | { ok: true; doc: CheatSheetDoc }
  | { ok: false; reason: string };

function selectApp(app: AppShortcuts, selection: CheatSheetAppSelection): CheatSheetAppSection | null {
  const wanted = new Set(selection.groupIds);
  const sections: CheatSheetSection[] = [];

  for (const group of app.groups) {
    if (selection.groupIds !== null && !wanted.has(group.id)) continue;
    const shortcuts = group.shortcuts.flatMap((shortcut) => {
      const keys = shortcut.keys.filter((key) => selection.platforms.includes(key.platform));
      return keys.length > 0 ? [{ ...shortcut, keys }] : [];
    });
    if (shortcuts.length === 0) continue;
    sections.push({ group, shortcuts });
  }

  if (sections.length === 0) return null;

  const shortcutCount = sections.reduce((total, section) => total + section.shortcuts.length, 0);
  return { app, platforms: [...selection.platforms], sections, shortcutCount };
}

/**
 * Turn selections into a printable document. Invalid input returns a reason
 * instead of a plausible-looking sheet.
 */
export function buildCheatSheet(
  apps: AppShortcuts[],
  selections: CheatSheetAppSelection[],
): CheatSheetResult {
  if (selections.length === 0) {
    return { ok: false, reason: "Choose at least one app to print." };
  }

  const appsBySlug = new Map(apps.map((app) => [app.slug, app]));
  const seenSlugs = new Set<string>();
  const sections: CheatSheetAppSection[] = [];
  let shortcutCount = 0;

  for (const selection of selections) {
    const app = appsBySlug.get(selection.slug);
    if (!app) {
      return { ok: false, reason: `Unknown app: ${selection.slug}` };
    }
    if (seenSlugs.has(selection.slug)) {
      return { ok: false, reason: `Selected ${app.name} more than once.` };
    }
    seenSlugs.add(selection.slug);

    const validPlatforms = selection.platforms.filter((platform) =>
      app.platforms.includes(platform),
    );
    if (validPlatforms.length === 0) {
      return { ok: false, reason: `${app.name} has no keys for the chosen platform.` };
    }

    const knownGroupIds = new Set(app.groups.map((group) => group.id));
    const unknownGroups = selection.groupIds?.filter((id) => !knownGroupIds.has(id)) ?? [];
    if (unknownGroups.length > 0) {
      return { ok: false, reason: `${app.name} has no group named ${unknownGroups[0]}.` };
    }

    const section = selectApp(app, { ...selection, platforms: validPlatforms });
    if (!section) {
      return { ok: false, reason: `Nothing to print for ${app.name} with that choice.` };
    }

    sections.push(section);
    shortcutCount += section.shortcutCount;
  }

  if (shortcutCount === 0) {
    return { ok: false, reason: "The current choice prints no shortcuts." };
  }

  return { ok: true, doc: { apps: sections, shortcutCount } };
}
