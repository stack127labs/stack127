import { sameKeys, type PlatformId, type ShortcutKey } from "./types.ts";

/**
 * Build one ShortcutKey entry per platform for a combination they all share.
 * Pass macKeys when macOS differs (Cmd instead of Ctrl and so on).
 */
export function combo(
  platforms: readonly PlatformId[],
  keys: string[],
  macKeys?: string[],
): ShortcutKey[] {
  const shared = sameKeys([...platforms], keys);
  if (!macKeys) return shared;
  return shared.map((entry) => (entry.platform === "macos" ? { ...entry, keys: macKeys } : entry));
}

/** Build key entries where every platform gets its own combination. */
export function perPlatform(
  platforms: readonly PlatformId[],
  keysByPlatform: Partial<Record<PlatformId, string[]>>,
): ShortcutKey[] {
  return platforms.flatMap((platform) => {
    const keys = keysByPlatform[platform];
    return keys ? [{ platform, keys }] : [];
  });
}
