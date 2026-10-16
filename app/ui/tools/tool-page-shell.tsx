import type { ReactNode } from "react";
import { AppShell, SidebarLabel } from "@/app/ui/site/app-shell";
import type { SectionNav } from "@/app/ui/site/section-bar";
import { SidebarList } from "@/app/ui/site/sidebar-list";
import { sidebarPanelClassName, sidebarPanelHeadingClassName } from "@/app/ui/site/sidebar-panel";
import { getPrimaryToolCatalog, type PublishedToolCatalog } from "@/lib/tool-catalogs";
import { cardIcon } from "@/lib/card-icons";
import type { Stack127ToolPage } from "@/lib/tool-pages";
import { ToolCatalogSidebar } from "@/app/ui/catalogs/tool-catalog-sidebar";

function ToolPageSidebar({ catalog, toolSlug }: { catalog: PublishedToolCatalog; toolSlug: string }) {
  return (
    <div className={sidebarPanelClassName}>
      <div className={sidebarPanelHeadingClassName}><SidebarLabel>{catalog.page.label}</SidebarLabel></div>
      <nav aria-label={catalog.page.label}>
        <SidebarList items={catalog.tools.map((tool) => {
          const Icon = cardIcon(tool.card_icon_key);
          return {
            href: `/${tool.slug}`,
            label: tool.card_name,
            active: tool.slug === toolSlug,
            icon: <Icon size={15} strokeWidth={2.2} />,
          };
        })} />
      </nav>
    </div>
  );
}

export async function ToolPageShell({
  children,
  sectionNav,
  toolPage,
}: {
  children: ReactNode;
  sectionNav?: SectionNav;
  toolPage: Stack127ToolPage;
}) {
  const catalog = await getPrimaryToolCatalog(toolPage.page_id);
  return (
    <AppShell
      mainLabel={toolPage.title}
      menuLabel={catalog?.page.label ?? "Tool catalogs"}
      sectionNav={sectionNav}
      sidebar={catalog
        ? <ToolPageSidebar catalog={catalog} toolSlug={toolPage.slug} />
        : <ToolCatalogSidebar active="" />}
      sidebarLabel={catalog ? `${catalog.page.label} sidebar` : "Tool catalogs sidebar"}
    >
      {children}
    </AppShell>
  );
}
