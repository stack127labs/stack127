import { Globe, Layers3, Network } from "lucide-react";
import { SidebarLabel } from "@/app/ui/site/app-shell";
import { SidebarList } from "@/app/ui/site/sidebar-list";
import { sidebarPanelClassName, sidebarPanelHeadingClassName } from "@/app/ui/site/sidebar-panel";
import { getMainPublishedPages } from "@/lib/page-registry";

const catalogs = [
  { slug: "dns-tools", icon: Network },
  { slug: "domain-tools", icon: Globe },
  { slug: "storage-tools", icon: Layers3 },
] as const;

export async function ToolCatalogSidebar({ active }: { active: typeof catalogs[number]["slug"] }) {
  const published = new Map((await getMainPublishedPages()).map((page) => [page.slug, page]));
  return (
    <div className={sidebarPanelClassName}>
      <div className={sidebarPanelHeadingClassName}><SidebarLabel>Tool catalogs</SidebarLabel></div>
      <nav aria-label="Tool catalogs">
        <SidebarList items={catalogs.flatMap(({ slug, icon: Icon }) => {
          const page = published.get(slug);
          return page ? [{ href: `/${slug}`, label: page.label, active: slug === active, icon: <Icon size={15} strokeWidth={2.2} /> }] : [];
        })} />
      </nav>
    </div>
  );
}
