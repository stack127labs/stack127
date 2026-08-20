import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";
import styles from "./site-nav.module.css";

export function SiteNav() {
  return (
    <header className={styles.header}>
      <nav className={styles.nav} aria-label="Main navigation">
        <Link className={styles.brand} href="/" aria-label="stack127 home">
          <span className={styles.wordmark}>stack127</span>
        </Link>
        <div className={styles.links}>
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
