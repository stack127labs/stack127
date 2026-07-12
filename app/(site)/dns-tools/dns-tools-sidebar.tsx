import Link from "next/link";

type DnsToolsSidebarProps = {
  active: "hub" | "lookup";
  showPageLinks?: boolean;
};

export function DnsToolsSidebar({ active, showPageLinks = false }: DnsToolsSidebarProps) {
  return (
    <div className="directory-filter-panel dns-tools-sidebar-panel">
      <div className="filter-panel-heading">
        <p className="filter-panel-title">DNS tools</p>
      </div>
      <nav className="dns-tools-nav" aria-label="DNS tools">
        <Link aria-current={active === "hub" ? "page" : undefined} href="/dns-tools">
          Overview
        </Link>
        <Link aria-current={active === "lookup" ? "page" : undefined} href="/dns-tools/dns-lookup">
          DNS lookup
        </Link>
      </nav>
      {showPageLinks ? (
        <nav className="dns-tools-page-nav" aria-label="On this page">
          <p>On this page</p>
          <a href="#lookup">Look up records</a>
          <a href="#record-types">Record types</a>
          <a href="#status-meanings">DNS status meanings</a>
          <a href="#limitations">Limitations and privacy</a>
          <a href="#faq">FAQ</a>
        </nav>
      ) : null}
    </div>
  );
}
