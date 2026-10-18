import Link from "next/link";
import type { ReactNode } from "react";
import { ConfirmedRing } from "./confirmed-ring";
import { NetworkLogo } from "./network-logo";
import type { NetworkLogoFile } from "./network-logo-src";
import { formatCount } from "./site-format";
import styles from "./network-card.module.css";

export type NetworkCardProps = {
  name: string;
  href: string;
  logo: NetworkLogoFile | null;
  /** Sites we list for the network. */
  sites: number;
  /** Of those, sites confirmed live from their own ads.txt files or ad code. */
  confirmed: number;
  /** The joining rule in words, such as `50,000 sessions a month`. Leave out to hide the footer. */
  join?: ReactNode;
};

/**
 * One ad network in the directory grid (mockup `.net-card`): logo tile, name, the confirmed-share
 * ring, the site count, and what it takes to join. The whole card links to the network's page.
 */
export function NetworkCard({ confirmed, href, join, logo, name, sites }: NetworkCardProps) {
  return (
    <article className={styles.card}>
      <div className={styles.top}>
        <NetworkLogo logo={logo} name={name} />
        <h3><Link href={href} prefetch={false}>{name}</Link></h3>
        {sites > 0 ? <ConfirmedRing share={confirmed / sites} /> : null}
      </div>
      <div>
        <div className={styles.number}>{formatCount(sites)}</div>
        <div className={styles.unit}>{sites === 1 ? "site" : "sites"}, <b>{formatCount(confirmed)}</b> confirmed</div>
      </div>
      {join ? (
        <div className={styles.join}>
          <span className={styles.joinLabel}>To join</span>
          <span className={styles.joinValue}>{join}</span>
        </div>
      ) : null}
    </article>
  );
}

/** Network cards four across on wide screens, down to one on phones (mockup `.net-grid`). */
export function NetworkGrid({ children }: { children: ReactNode }) {
  return <div className={styles.grid}>{children}</div>;
}

/** One mono line under the section heading saying how the cards are sorted (mockup `.sort-note`). */
export function SortNote({ children }: { children: ReactNode }) {
  return <p className={styles.sortNote}>{children}</p>;
}
