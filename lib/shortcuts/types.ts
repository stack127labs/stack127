/**
 * Keyboard shortcuts reference data contract.
 * One structured source feeds /shortcuts, every /shortcuts/<app-slug> page,
 * and /shortcuts-cheatsheet-generator. Unknown stays unknown: never guess keys.
 */

export type PlatformId = "windows" | "macos" | "linux";

export const platformLabels: Record<PlatformId, string> = {
  windows: "Windows",
  macos: "macOS",
  linux: "Linux",
};

/** One platform's key combination, in press order. */
export type ShortcutKey = {
  platform: PlatformId;
  keys: string[];
  /** Caveat that applies to this platform only. */
  note?: string;
};

export type Shortcut = {
  /** Stable anchor id, unique within its app. */
  id: string;
  action: string;
  keys: ShortcutKey[];
  /** Caveat or clarification shared by every platform. */
  note?: string;
};

export type ShortcutGroup = {
  id: string;
  title: string;
  /** One sentence for behavior a table cannot carry, such as sequences or chords. */
  intro?: string;
  shortcuts: Shortcut[];
};

export type AppShortcuts = {
  slug: string;
  name: string;
  category: string;
  platforms: PlatformId[];
  intro: string;
  /** Version or setup context when it affects accuracy. */
  versionContext: string | null;
  sourceUrl: string;
  sourceLabel: string;
  /** ISO date of the last check against the official source. */
  lastVerified: string;
  groups: ShortcutGroup[];
};

/** Build one ShortcutKey entry per platform for a combination they all share. */
export function sameKeys(platforms: PlatformId[], keys: string[]): ShortcutKey[] {
  return platforms.map((platform) => ({ platform, keys }));
}

export function shortcutCount(app: AppShortcuts): number {
  return app.groups.reduce((total, group) => total + group.shortcuts.length, 0);
}
