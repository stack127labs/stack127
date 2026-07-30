import Link from "next/link";
import type { ReactNode } from "react";
import { AppSidebar } from "./app-sidebar";
import styles from "./app-shell.module.css";
import { sidebarPanelTitleClassName } from "./sidebar-panel";

type AppShellProps = {
  children?: ReactNode;
  mainLabel?: string;
  sidebar?: ReactNode;
  sidebarLabel?: string;
  /** Label shown next to the mobile hamburger, e.g. "Lessons" or "Filters". */
  menuLabel?: string;
  /** Skip the sidebar rail entirely so wide content uses the full page width. */
  fullWidth?: boolean;
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
  fullWidth = false,
}: AppShellProps) {
  return (
    <main className={styles.shell}>
      <section className={fullWidth ? `${styles.page} ${styles.pageFull}` : styles.page}>
        {fullWidth ? null : sidebar ? (
          <AppSidebar label={sidebarLabel} menuLabel={menuLabel}>
            {sidebar}
          </AppSidebar>
        ) : (
          <aside className={styles.sidebar} aria-label={sidebarLabel} data-app-sidebar />
        )}
        <section className={styles.main} aria-label={mainLabel} data-app-main>
          <div className={styles.content}>{children}</div>
          <footer className={styles.footer} aria-label="Site footer">
            <Link className={styles.footerBrand} href="/" aria-label="version127 home">
              <img
                alt="version127 logo"
                className={`${styles.footerLogo} ${styles.footerLogoLight}`}
                height={219}
                src="/logos/version127-logo-black.png"
                width={1173}
              />
              <img
                alt="version127 logo"
                className={`${styles.footerLogo} ${styles.footerLogoDark}`}
                height={219}
                src="/logos/version127-logo-white.png"
                width={1175}
              />
            </Link>
            <nav className={styles.footerLinks} aria-label="Legal pages">
              <Link href="/privacy">privacy</Link>
              <Link href="/terms">terms</Link>
              <Link href="/about">about</Link>
            </nav>
            <p>2026 version127. all rights reserved.</p>
          </footer>
        </section>
      </section>
    </main>
  );
}
