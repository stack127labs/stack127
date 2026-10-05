import Link from "next/link";
import type { ReactNode } from "react";
import { getGoogleAnalyticsConfig } from "@/lib/google-analytics";
import { AnalyticsSettingsButton } from "./google-analytics-consent";
import { AppSidebar } from "./app-sidebar";
import { BrandWordmark } from "./brand-wordmark";
import { intentPrefetch } from "./intent-prefetch";
import styles from "./app-shell.module.css";
import { sidebarPanelTitleClassName } from "./sidebar-panel";

type AppShellProps = {
  children?: ReactNode;
  mainLabel?: string;
  sidebar?: ReactNode;
  sidebarLabel?: string;
  /** Label shown next to the mobile hamburger, e.g. "Lessons" or "Filters". */
  menuLabel?: string;
};

export function SidebarLabel({ children }: { children: ReactNode }) {
  return <p className={sidebarPanelTitleClassName}>{children}</p>;
}

export function AppShell({
  children,
  mainLabel = "Page content",
  sidebar,
  sidebarLabel = "Page sidebar",
  menuLabel = "Menu",
}: AppShellProps) {
  const googleAnalytics = getGoogleAnalyticsConfig();

  return (
    <main className={styles.shell}>
      <section className={styles.page}>
        {sidebar ? (
          <AppSidebar label={sidebarLabel} menuLabel={menuLabel}>
            {sidebar}
          </AppSidebar>
        ) : (
          <aside className={styles.sidebar} aria-label={sidebarLabel} data-app-sidebar />
        )}
        <section className={styles.main} aria-label={mainLabel} data-app-main>
          <div className={styles.content}>{children}</div>
          <footer className={styles.footer} aria-label="Site footer">
            <div className={styles.footerTop}>
              <Link {...intentPrefetch} className={styles.footerBrand} href="/" aria-label="stack127 home">
                <BrandWordmark />
              </Link>
              <nav className={styles.footerLinks} aria-label="Legal pages">
                <Link {...intentPrefetch} href="/privacy">privacy</Link>
                {googleAnalytics ? <AnalyticsSettingsButton /> : null}
                <Link {...intentPrefetch} href="/terms">terms</Link>
                <Link {...intentPrefetch} href="/about">about</Link>
                <Link {...intentPrefetch} href="/labs">labs</Link>
              </nav>
              <p>2026 stack127. all rights reserved.</p>
            </div>
          </footer>
        </section>
      </section>
    </main>
  );
}
