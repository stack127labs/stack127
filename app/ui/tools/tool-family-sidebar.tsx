import { Globe, ListChecks } from "lucide-react";
import { SidebarLabel } from "@/app/ui/site/app-shell";
import { PathnameSidebarList } from "@/app/ui/site/pathname-sidebar-list";
import { sidebarPanelClassName, sidebarPanelHeadingClassName } from "@/app/ui/site/sidebar-panel";
import { getPublishedToolCatalog } from "@/lib/tool-catalogs";
import { cardIcon } from "@/lib/card-icons";

export async function ToolFamilySidebar({
  catalogSlug,
  label,
  className = "",
}: {
  catalogSlug: string;
  label: string;
  className?: string;
}) {
  const catalog = await getPublishedToolCatalog(catalogSlug);
  const items = catalog?.tools.map((tool) => {
    const Icon = cardIcon(tool.card_icon_key);
    return {
      href: `/${tool.slug}`,
      label: tool.card_name,
      icon: <Icon size={15} strokeWidth={2.2} />,
    };
  }) ?? [];
  if (catalogSlug === "domain-tools") {
    items.push(
      { href: "/epp-status-codes", label: "Domain status codes", icon: <ListChecks size={15} strokeWidth={2.2} /> },
      { href: "/tld-directory", label: "TLD directory", icon: <Globe size={15} strokeWidth={2.2} /> },
    );
  }
  return (
    <div className={`${sidebarPanelClassName} ${className}`.trim()}>
      <div className={sidebarPanelHeadingClassName}><SidebarLabel>{label}</SidebarLabel></div>
      <nav aria-label={label}><PathnameSidebarList items={items} /></nav>
    </div>
  );
}
