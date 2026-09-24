import Link from "next/link";
import { BrandWordmark } from "./brand-wordmark";
import { LinkPending } from "./link-pending";
import { ThemeToggle } from "./theme-toggle";
import styles from "./site-nav.module.css";

export function SiteNav() {
  return (
    <header className={styles.header}>
      <nav className={styles.nav} aria-label="Main navigation">
        <Link className={styles.brand} href="/" aria-label="stack127 home">
          <BrandWordmark />
        </Link>
        <div className={styles.links}>
          <Link href="/">explore<LinkPending /></Link>
          <span aria-hidden="true" className={`${styles.dot} ${styles.secondaryLink}`}>
            ·
          </span>
          <Link className={styles.secondaryLink} href="/dns-tools">dns tools<LinkPending /></Link>
          <span aria-hidden="true" className={`${styles.dot} ${styles.secondaryLink}`}>
            ·
          </span>
          <Link className={styles.secondaryLink} href="/domain-tools">
            domain tools<LinkPending />
          </Link>
          <span aria-hidden="true" className={`${styles.dot} ${styles.secondaryLink}`}>
            ·
          </span>
          <Link className={styles.secondaryLink} href="/storage-tools">
            storage tools<LinkPending />
          </Link>
          <span aria-hidden="true" className={`${styles.dot} ${styles.secondaryLink}`}>
            ·
          </span>
          <Link className={styles.secondaryLink} href="/labs">
            labs<LinkPending />
          </Link>
        </div>
        <div className={styles.actions}>
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
