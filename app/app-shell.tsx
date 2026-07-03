import Link from "next/link";
import type { ReactNode } from "react";

type AppShellProps = {
  children?: ReactNode;
  mainLabel?: string;
  sidebar?: ReactNode;
  sidebarLabel?: string;
};

export function AppShell({
  children,
  mainLabel = "Page content",
  sidebar,
  sidebarLabel = "Page sidebar",
}: AppShellProps) {
  return (
    <main className="app-shell">
      <section className="app-page">
        <aside className="app-sidebar" aria-label={sidebarLabel}>
          {sidebar}
        </aside>
        <section className="app-main" aria-label={mainLabel}>
          <div className="app-main-content">{children}</div>
          <footer className="app-footer" aria-label="Site footer">
            <Link className="app-footer-brand" href="/" aria-label="version127 home">
              <img
                alt="version127 logo"
                className="app-footer-logo app-footer-logo-light"
                height={219}
                src="/logos/version127-logo-black.png"
                width={1173}
              />
              <img
                alt="version127 logo"
                className="app-footer-logo app-footer-logo-dark"
                height={219}
                src="/logos/version127-logo-white.png"
                width={1175}
              />
            </Link>
            <nav className="app-footer-links" aria-label="Legal pages">
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
