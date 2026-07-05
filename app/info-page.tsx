import Link from "next/link";
import type { ReactNode } from "react";
import { AppShell } from "./app-shell";

type InfoPageProps = {
  children: ReactNode;
  title: string;
};

const links = [
  { href: "/about", label: "about" },
  { href: "/privacy", label: "privacy" },
  { href: "/terms", label: "terms" },
  { href: "/self-host-apps", label: "self-host apps" },
];

function InfoSidebar({ title }: { title: string }) {
  return (
    <div className="directory-filter-panel info-sidebar-panel">
      <div className="filter-panel-heading">
        <h1>{title}</h1>
      </div>
      <nav className="info-sidebar-links" aria-label="Info pages">
        {links.map((link) => (
          <Link href={link.href} key={link.href}>
            {link.label}
          </Link>
        ))}
      </nav>
      <p className="info-contact">
        <a href="mailto:version127@proton.me">version127@proton.me</a>
      </p>
    </div>
  );
}

export function InfoPage({ children, title }: InfoPageProps) {
  return (
    <AppShell
      mainLabel={title}
      menuLabel="Pages"
      sidebar={<InfoSidebar title={title} />}
      sidebarLabel={`${title} sidebar`}
    >
      <article className="info-page prose">
        {children}
      </article>
    </AppShell>
  );
}
