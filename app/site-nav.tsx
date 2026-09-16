import Link from "next/link";
import { BrandWordmark } from "./brand-wordmark";
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
          <Link href="/">explore</Link>
          <span aria-hidden="true" className={`${styles.dot} ${styles.secondaryLink}`}>
            ·
          </span>
          <Link className={styles.secondaryLink} href="/dns-tools">dns tools</Link>
          <span aria-hidden="true" className={`${styles.dot} ${styles.secondaryLink}`}>
            ·
          </span>
          <Link className={styles.secondaryLink} href="/domain-tools">
            domain tools
          </Link>
          <span aria-hidden="true" className={`${styles.dot} ${styles.secondaryLink}`}>
            ·
          </span>
          <Link className={styles.secondaryLink} href="/storage-tools">
            storage tools
          </Link>
          <span aria-hidden="true" className={`${styles.dot} ${styles.secondaryLink}`}>
            ·
          </span>
          <Link className={styles.secondaryLink} href="/labs">
            labs
          </Link>
        </div>
        <div className={styles.actions}>
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
