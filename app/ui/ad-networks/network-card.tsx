import Link from "next/link";
import type { ReactNode } from "react";
import type { AdNetworkNicheSlug } from "@/lib/ad-network-niches";
import { NetworkLogo } from "./network-logo";
import type { NetworkLogoFile } from "./network-logo-src";
import { NicheIcon } from "./niche-icon";
import { formatCount } from "./site-format";
import { formatPercent } from "./viz/format";
import styles from "./network-card.module.css";

export type NetworkCardProps = {
  name: string;
  href: string;
  logo: NetworkLogoFile | null;
  /** Sites we list for the network. */
  sites: number;
  /** Mean Domain Rating of the rated sites, rounded. Leave out to hide it. */
  averageDr?: number | null;
  /** Up to three niches with the most sites, share in percent of all listed sites. Empty hides the footer. */
  topNiches?: readonly { slug: AdNetworkNicheSlug; name: string; share: number }[];
};

/**
 * One ad network in the directory grid (mockup `.net-card`): logo tile, name, average Domain
 * Rating, the site count on one line, and its top niches. The whole card links to the network's page.
 */
export function NetworkCard({ averageDr, href, logo, name, sites, topNiches = [] }: NetworkCardProps) {
  return (
    <article className={styles.card}>
      <div className={styles.top}>
        <NetworkLogo logo={logo} name={name} />
        <h3><Link href={href} prefetch={false}>{name}</Link></h3>
        {typeof averageDr === "number" ? (
          <div className={styles.dr}>
            <span>Avg DR</span>
            <b>{averageDr}</b>
          </div>
        ) : null}
      </div>
      <div className={styles.number}>
        {formatCount(sites)} <span>{sites === 1 ? "site" : "sites"}</span>
      </div>
      {topNiches.length ? (
        <div className={styles.niches}>
          <dl>
            {topNiches.map((niche) => (
              <div key={niche.slug}>
                <dt><NicheIcon size={14} slug={niche.slug} /><span>{niche.name}</span></dt>
                <dd>{formatPercent(niche.share)}</dd>
              </div>
            ))}
          </dl>
        </div>
      ) : null}
    </article>
  );
}

/** Network cards five across on laptops and wider, down to one on phones (mockup `.net-grid`). */
export function NetworkGrid({ children }: { children: ReactNode }) {
  return <div className={styles.grid}>{children}</div>;
}

/** One mono line under the section heading saying how the cards are sorted (mockup `.sort-note`). */
export function SortNote({ children }: { children: ReactNode }) {
  return <p className={styles.sortNote}>{children}</p>;
}
