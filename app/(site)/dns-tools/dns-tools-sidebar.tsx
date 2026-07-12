import Link from "next/link";
import {
  sidebarPanelClassName,
  sidebarPanelHeadingClassName,
  sidebarPanelTitleClassName,
} from "../../sidebar-panel";

type DnsToolsSidebarProps = {
  active: "hub" | "lookup";
  showPageLinks?: boolean;
};

export function DnsToolsSidebar({ active, showPageLinks = false }: DnsToolsSidebarProps) {
  return (
    <div className={`${sidebarPanelClassName} dns-tools-sidebar-panel`}>
      <div className={sidebarPanelHeadingClassName}>
        <p className={sidebarPanelTitleClassName}>DNS tools</p>
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
          <a href="#how-to-check">How to check</a>
          <a href="#read-results">Read the results</a>
          <a href="#record-types">Record types</a>
          <a href="#use-cases">When it helps</a>
          <a href="#status-meanings">When it looks wrong</a>
        </nav>
      ) : null}
    </div>
  );
}
