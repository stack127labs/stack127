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
          <Link href="/cli-apps">cli apps</Link>
          <span aria-hidden="true" className={`${styles.dot} ${styles.secondaryLink}`}>
            ·
          </span>
          <Link href="/self-host-apps">self-host apps</Link>
          <span aria-hidden="true" className={`${styles.dot} ${styles.secondaryLink}`}>
            ·
          </span>
          <Link className={styles.secondaryLink} href="/labs">
            labs
          </Link>
          <span aria-hidden="true" className={`${styles.dot} ${styles.secondaryLink}`}>
            ·
          </span>
          <Link className={styles.secondaryLink} href="/dns-tools">
            dns tools
          </Link>
          <span aria-hidden="true" className={`${styles.dot} ${styles.secondaryLink}`}>
            ·
          </span>
          <Link className={styles.secondaryLink} href="/domain-tools">
            domain tools
          </Link>
        </div>
        <div className={styles.actions}>
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
