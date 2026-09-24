import { SidebarLabel } from "@/app/ui/site/app-shell";
import { SidebarList } from "@/app/ui/site/sidebar-list";
import { sidebarPanelClassName, sidebarPanelHeadingClassName } from "@/app/ui/site/sidebar-panel";
import { getPublishedToolCatalogs } from "@/lib/tool-catalogs";
import { toolCatalogIcon } from "@/lib/tool-catalog-icons";

export async function ToolCatalogSidebar({ active }: { active: string }) {
  const catalogs = await getPublishedToolCatalogs();
  return (
    <div className={sidebarPanelClassName}>
      <div className={sidebarPanelHeadingClassName}><SidebarLabel>Tool catalogs</SidebarLabel></div>
      <nav aria-label="Tool catalogs">
        <SidebarList items={catalogs.filter((catalog) => catalog.tool_count > 0).map((catalog) => {
          const Icon = toolCatalogIcon(catalog.icon_key);
          return {
            href: `/${catalog.page.slug}`,
            label: catalog.page.label,
            active: catalog.page.slug === active,
            icon: <Icon size={15} strokeWidth={2.2} />,
          };
        })} />
      </nav>
    </div>
  );
}
