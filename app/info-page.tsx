import Link from "next/link";
import type { ReactNode } from "react";
import { getRequiredPublishedPage } from "@/lib/page-registry";
import { AppShell, SidebarLabel } from "./app-shell";

type InfoPageProps = {
  children: ReactNode;
  slug: string;
  title: string;
};

const links = [
  { href: "/about", label: "about" },
  { href: "/privacy", label: "privacy" },
  { href: "/terms", label: "terms" },
  { href: "/self-host-apps", label: "self-host apps" },
  { href: "/software-licenses-for-self-hosting", label: "software licenses" },
];

function InfoSidebar({ label }: { label: string }) {
  return (
    <div className="directory-filter-panel info-sidebar-panel">
      <div className="filter-panel-heading">
        <SidebarLabel>{label}</SidebarLabel>
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

export async function InfoPage({ children, slug, title }: InfoPageProps) {
  const registryPage = await getRequiredPublishedPage(slug);

  return (
    <AppShell
      mainLabel={title}
      menuLabel="Pages"
      sidebar={<InfoSidebar label={registryPage.label} />}
      sidebarLabel={`${title} sidebar`}
    >
      <article className="info-page prose">
        <h1>{title}</h1>
        {children}
      </article>
    </AppShell>
  );
}
