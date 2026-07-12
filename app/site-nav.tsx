import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";
import styles from "./site-nav.module.css";

export function SiteNav() {
  return (
    <header className={styles.header}>
      <nav className={styles.nav} aria-label="Main navigation">
        <Link className={styles.brand} href="/" aria-label="version127 home">
          <img
            alt="version127 logo"
            className={`${styles.logo} ${styles.logoLight}`}
            height={219}
            src="/logos/version127-logo-black.png"
            width={1173}
          />
          <img
            alt="version127 logo"
            className={`${styles.logo} ${styles.logoDark}`}
            height={219}
            src="/logos/version127-logo-white.png"
            width={1175}
          />
        </Link>
        <div className={styles.links}>
          <Link href="/self-host-apps">self-host apps</Link>
        </div>
        <div className={styles.actions}>
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
