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
          {children}
        </section>
      </section>
    </main>
  );
}
