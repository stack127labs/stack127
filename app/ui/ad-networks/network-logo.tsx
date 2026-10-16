import type { NetworkLogoFile } from "./network-logo-src";
import styles from "./network-logo.module.css";

/**
 * A network's square icon on a white tile, so any logo reads in both themes. `card` is the 32px
 * tile used in cards and table rows. `title` sizes it to sit in an h1 in place of the title icon.
 * Decorative: the network's name is always next to it. Pass `logo` from `networkLogo(slug)`;
 * without one the tile shows the name's first letter.
 */
export function NetworkLogo({ logo, name, size = "card" }: { logo: NetworkLogoFile | null; name: string; size?: "card" | "title" }) {
  return (
    // The letter is drawn by CSS, so it never becomes part of a heading's text.
    <span
      aria-hidden="true"
      className={styles.tile}
      data-letter={logo ? undefined : name.trim().charAt(0).toUpperCase()}
      data-size={size}
    >
      {logo ? <img alt="" decoding="async" src={logo.src} /> : null}
    </span>
  );
}
