import { SidebarLabel } from "@/app/ui/site/app-shell";
import { SidebarList } from "@/app/ui/site/sidebar-list";
import { sidebarPanelClassName, sidebarPanelHeadingClassName } from "@/app/ui/site/sidebar-panel";
import type { AdNetwork } from "@/lib/ad-networks";

export function AdNetworksSidebar({ networks, current }: { networks: AdNetwork[]; current?: string }) {
  return <div className={sidebarPanelClassName}>
    <div className={sidebarPanelHeadingClassName}><SidebarLabel>Ad networks</SidebarLabel></div>
    <nav aria-label="Ad networks">
      <SidebarList items={[
        { href: "/ad-networks", label: "All ad networks", active: !current },
        ...networks.map(network => ({
          href: `/ad-networks/${network.slug}`,
          label: network.name,
          count: network.verified_count.toLocaleString("en-US"),
          active: network.slug === current,
        })),
      ]} />
    </nav>
  </div>;
}
