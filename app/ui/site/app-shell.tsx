import Link from "next/link";
import type { ReactNode } from "react";
import { getGoogleAnalyticsConfig } from "@/lib/google-analytics";
import { AnalyticsSettingsButton } from "./google-analytics-consent";
import { AppSidebar } from "./app-sidebar";
import { BrandWordmark } from "./brand-wordmark";
import { intentPrefetch } from "./intent-prefetch";
import styles from "./app-shell.module.css";
import { sidebarPanelTitleClassName } from "./sidebar-panel";
import { SectionBar, type SectionNav } from "./section-bar";

/**
 * Where the page puts its sidebar. Pick it per page, for what the sidebar does:
 * - "left", preferred: navigation and options, such as sibling tools, filters, or course lessons.
 * - "right": secondary help, such as related pages or links to the page's sections.
 * - "none": the page only needs its content.
 */
export type SidebarPosition = "left" | "right" | "none";

type AppShellProps = {
  children?: ReactNode;
  mainLabel?: string;
  sidebar?: ReactNode;
  sidebarLabel?: string;
  /** Label shown next to the mobile hamburger, e.g. "Lessons" or "Filters". Left sidebars only. */
  menuLabel?: string;
  sidebarPosition?: SidebarPosition;
  /** Optional short navigation between a section's main pages. Scrolls away with the page. */
  sectionNav?: SectionNav;
};

export function SidebarLabel({ children }: { children: ReactNode }) {
  return <p className={sidebarPanelTitleClassName}>{children}</p>;
}

function SiteFooter() {
  const googleAnalytics = getGoogleAnalyticsConfig();

  return (
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
  );
}

export function AppShell({
  children,
  mainLabel = "Page content",
  sidebar,
  sidebarLabel = "Page sidebar",
  menuLabel = "Menu",
  sidebarPosition = "left",
  sectionNav,
}: AppShellProps) {
  // A right sidebar is secondary, so it follows the content in reading order. On small
  // screens it stacks below the content, above the footer, instead of hiding in a drawer.
  if (sidebarPosition === "right") {
    return (
      <main className={`${styles.shell}${sectionNav ? ` ${styles.shellWithSectionNav}` : ""}`}>
        {sectionNav ? <SectionBar {...sectionNav} /> : null}
        <section className={`${styles.page} ${styles.pageRight}`} data-sidebar-position="right">
          <section className={styles.main} aria-label={mainLabel} data-app-main>
            <div className={styles.content}>{children}</div>
          </section>
          <aside className={styles.asideRight} aria-label={sidebarLabel} data-app-sidebar>
            {sidebar}
          </aside>
          <SiteFooter />
        </section>
      </main>
    );
  }

  return (
    <main className={`${styles.shell}${sectionNav ? ` ${styles.shellWithSectionNav}` : ""}`}>
      {sectionNav ? <SectionBar {...sectionNav} /> : null}
      <section
        className={`${styles.page}${sidebarPosition === "none" ? ` ${styles.pageNone}` : ""}`}
        data-sidebar-position={sidebarPosition}
      >
        {sidebarPosition === "none" ? null : sidebar ? (
          <AppSidebar label={sidebarLabel} menuLabel={menuLabel}>
            {sidebar}
          </AppSidebar>
        ) : (
          <aside className={styles.sidebar} aria-label={sidebarLabel} data-app-sidebar />
        )}
        <section className={styles.main} aria-label={mainLabel} data-app-main>
          <div className={styles.content}>{children}</div>
          <SiteFooter />
        </section>
      </section>
    </main>
  );
}
