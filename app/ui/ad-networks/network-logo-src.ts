import { existsSync } from "node:fs";
import path from "node:path";

export type NetworkLogoFile = { src: string };

/**
 * The network's square icon in `public/ad-networks/logos/<slug>.png`, checked on the server at
 * build time. Null when there is none yet, so NetworkLogo shows the name's first letter.
 */
export function networkLogo(slug: string): NetworkLogoFile | null {
  const file = path.join(process.cwd(), "public", "ad-networks", "logos", `${slug}.png`);
  return existsSync(file) ? { src: `/ad-networks/logos/${slug}.png` } : null;
}

/** Just the logo's path. */
export const networkLogoSrc = (slug: string) => networkLogo(slug)?.src ?? null;
