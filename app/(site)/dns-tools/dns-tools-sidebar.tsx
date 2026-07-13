import Link from "next/link";
import { SidebarLabel } from "../../app-shell";
import {
  sidebarPanelClassName,
  sidebarPanelHeadingClassName,
} from "../../sidebar-panel";

type DnsToolsSidebarProps = {
  active: "hub" | "lookup" | "trace" | "change" | "nameserver" | "dnssec" | "soa" | "caa";
};

const availableDnsTools = [
  { href: "/dns-tools/dns-lookup", id: "lookup", label: "DNS lookup" },
  { href: "/dns-tools/dns-trace", id: "trace", label: "DNS Trace Explorer" },
  { href: "/dns-tools/dns-change-checker", id: "change", label: "DNS Change Checker" },
  { href: "/dns-tools/nameserver-checker", id: "nameserver", label: "Nameserver Delegation Checker" },
  { href: "/dns-tools/dnssec-checker", id: "dnssec", label: "DNSSEC Chain Checker" },
  { href: "/dns-tools/soa-checker", id: "soa", label: "SOA Consistency Checker" },
  { href: "/dns-tools/caa-checker", id: "caa", label: "CAA Policy Checker" },
] as const;

export function DnsToolsSidebar({ active }: DnsToolsSidebarProps) {
  return (
    <div className={`${sidebarPanelClassName} dns-tools-sidebar-panel`}>
      <div className={sidebarPanelHeadingClassName}>
        <SidebarLabel>DNS tools</SidebarLabel>
      </div>
      <nav className="dns-tools-nav" aria-label="DNS tools">
        <ul>
          {availableDnsTools.map((tool) => (
            <li key={tool.href}>
              <Link aria-current={active === tool.id ? "page" : undefined} href={tool.href}>
                {tool.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
