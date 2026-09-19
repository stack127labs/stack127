import { cephArt } from "./(site)/(catalogs)/_components/art/ceph";
import { raidArt } from "./(site)/(catalogs)/_components/art/raid";
import { zfsCapacityArt } from "./(site)/(catalogs)/_components/art/zfs-capacity";
import registry from "./marker-art-registry.json";

const markerArtAssets = {
  ceph: cephArt,
  raid: raidArt,
  "zfs-capacity": zfsCapacityArt,
} as const;

/** Database Markdown may reference only IDs declared in the metadata registry. */
export const markerArtRegistry = Object.fromEntries(
  Object.entries(registry).map(([id, definition]) => [
    id,
    markerArtAssets[definition.asset as keyof typeof markerArtAssets],
  ]),
) as Record<keyof typeof registry, string>;

export function resolveMarkerArtReference(reference: string) {
  const match = /^marker-art:\/\/([a-z0-9]+(?:\/[a-z0-9-]+)?)$/.exec(reference);
  if (!match) return null;
  const svg = markerArtRegistry[match[1] as keyof typeof registry];
  if (!svg) throw new Error(`Unknown marker art reference: ${reference}`);
  return svg;
}
