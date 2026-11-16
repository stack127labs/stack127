import Link from "next/link";
import { Suspense } from "react";
import { BrandWordmark } from "./brand-wordmark";
import { intentPrefetch } from "./intent-prefetch";
import { IntentPrefetch } from "./intent-prefetch-listener";
import { NavigationFeedback } from "./navigation-feedback";
import { SiteMenus } from "./site-menus";
import { SiteSearch } from "./site-search";
import { ThemeToggle } from "./theme-toggle";
import styles from "./site-nav.module.css";

export function SiteNav() {
  return (
    <header className={styles.header}>
      <nav className={styles.nav} aria-label="Main navigation">
        <Link {...intentPrefetch} className={styles.brand} href="/" aria-label="stack127 home">
          <BrandWordmark />
        </Link>
        <SiteMenus />
        <div className={styles.actions}>
          <SiteSearch />
          <ThemeToggle />
        </div>
      </nav>
      <Suspense fallback={null}><NavigationFeedback /></Suspense>
      <IntentPrefetch />
    </header>
  );
}
