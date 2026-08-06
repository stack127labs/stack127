import {
  FileClock,
  FileKey,
  RefreshCw,
  Route,
  Search,
  Server,
  ShieldCheck,
} from "lucide-react";
import { SidebarLabel } from "../../app-shell";
import { SidebarList } from "../../sidebar-list";
import {
  sidebarPanelClassName,
  sidebarPanelHeadingClassName,
} from "../../sidebar-panel";

type DnsToolsSidebarProps = {
  active: "hub" | "lookup" | "trace" | "change" | "nameserver" | "dnssec" | "soa" | "caa";
};

const iconProps = { size: 15, strokeWidth: 2.2 } as const;

const availableDnsTools = [
  { href: "/dns-lookup", icon: <Search {...iconProps} />, id: "lookup", label: "DNS lookup" },
  { href: "/dns-trace", icon: <Route {...iconProps} />, id: "trace", label: "DNS Trace Explorer" },
  { href: "/dns-change-checker", icon: <RefreshCw {...iconProps} />, id: "change", label: "DNS Change Checker" },
  { href: "/nameserver-checker", icon: <Server {...iconProps} />, id: "nameserver", label: "Nameserver Delegation Checker" },
  { href: "/dnssec-checker", icon: <ShieldCheck {...iconProps} />, id: "dnssec", label: "DNSSEC Chain Checker" },
  { href: "/soa-checker", icon: <FileClock {...iconProps} />, id: "soa", label: "SOA Consistency Checker" },
  { href: "/caa-checker", icon: <FileKey {...iconProps} />, id: "caa", label: "CAA Policy Checker" },
] as const;

/** How many DNS tools exist now; the home page card shows this count. */
export const dnsToolCount = availableDnsTools.length;

export function DnsToolsSidebar({ active }: DnsToolsSidebarProps) {
  return (
    <div className={`${sidebarPanelClassName} dns-tools-sidebar-panel`}>
      <div className={sidebarPanelHeadingClassName}>
        <SidebarLabel>DNS tools</SidebarLabel>
      </div>
      <nav aria-label="DNS tools">
        <SidebarList
          items={availableDnsTools.map((tool) => ({
            active: active === tool.id,
            href: tool.href,
            icon: tool.icon,
            label: tool.label,
          }))}
        />
      </nav>
    </div>
  );
}
