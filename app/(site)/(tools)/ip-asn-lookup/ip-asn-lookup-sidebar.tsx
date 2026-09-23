import { FileSearch, Globe2, Network } from "lucide-react";
import { SidebarLabel } from "@/app/ui/site/app-shell";
import { SidebarList } from "@/app/ui/site/sidebar-list";
import { sidebarPanelClassName, sidebarPanelHeadingClassName } from "@/app/ui/site/sidebar-panel";

const iconProps = { size: 15, strokeWidth: 2.2 } as const;

export function IpAsnLookupSidebar() {
  return (
    <div className={sidebarPanelClassName}>
      <div className={sidebarPanelHeadingClassName}>
        <SidebarLabel>Related lookups</SidebarLabel>
      </div>
      <nav aria-label="Related lookups">
        <SidebarList
          items={[
            { href: "/ip-asn-lookup", icon: <Network {...iconProps} />, label: "IP and ASN lookup", active: true },
            { href: "/dns-lookup", icon: <Globe2 {...iconProps} />, label: "DNS Lookup" },
            { href: "/domain-lookup", icon: <FileSearch {...iconProps} />, label: "Domain Registration Lookup" },
          ]}
        />
      </nav>
    </div>
  );
}
