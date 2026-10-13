import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LayoutGrid, PanelLeft, PanelRight, Square } from "lucide-react";
import { AppShell, SidebarLabel, type SidebarPosition } from "@/app/ui/site/app-shell";
import { PageCanvas } from "@/app/ui/site/page-canvas";
import { PageHeader } from "@/app/ui/site/page-header";
import { PageTitleIcon } from "@/app/ui/site/page-title-icon";
import { proseClassName } from "@/app/ui/site/prose";
import { PathnameSidebarList } from "@/app/ui/site/pathname-sidebar-list";
import { sidebarPanelClassName, sidebarPanelHeadingClassName } from "@/app/ui/site/sidebar-panel";

const modes: Record<SidebarPosition, { title: ReactNode; lede: string; icon: typeof PanelLeft }> = {
  left: {
    title: <>Sidebar on the <mark>left</mark></>,
    lede: "For options people use to work the page, such as directory filters or course lessons. On small screens it opens from the drawer.",
    icon: PanelLeft,
  },
  right: {
    title: <>Sidebar on the <mark>right</mark></>,
    lede: "For secondary help, such as related pages or links to this page's sections. On small screens it sits below the content.",
    icon: PanelRight,
  },
  none: {
    title: <>No <mark>sidebar</mark></>,
    lede: "For pages that only need their content. Wide sections fill the page. Reading sections center at the reading width.",
    icon: Square,
  },
};

const sidebarItems = [
  { href: "/components-ui/sidebar-modes/left", label: "Sidebar on the left", icon: <PanelLeft size={15} strokeWidth={2.2} /> },
  { href: "/components-ui/sidebar-modes/right", label: "Sidebar on the right", icon: <PanelRight size={15} strokeWidth={2.2} /> },
  { href: "/components-ui/sidebar-modes/none", label: "No sidebar", icon: <Square size={15} strokeWidth={2.2} /> },
  { href: "/components-ui/page-layout", label: "Back to page layout", icon: <LayoutGrid size={15} strokeWidth={2.2} /> },
];

function isSidebarPosition(value: string): value is SidebarPosition {
  return value === "left" || value === "right" || value === "none";
}

// Development only: shows each AppShell sidebar position with the real shell, outside the gallery's own shell.
export default async function SidebarModePage({ params }: { params: Promise<{ position: string }> }) {
  if (process.env.NODE_ENV !== "development") notFound();
  const { position } = await params;
  if (!isSidebarPosition(position)) notFound();
  const mode = modes[position];

  return (
    <AppShell
      mainLabel="Sidebar modes"
      menuLabel="Modes"
      sidebar={(
        <div className={sidebarPanelClassName}>
          <div className={sidebarPanelHeadingClassName}><SidebarLabel>Sidebar modes</SidebarLabel></div>
          <nav aria-label="Sidebar modes"><PathnameSidebarList items={sidebarItems} /></nav>
        </div>
      )}
      sidebarLabel="Sidebar modes sidebar"
      sidebarPosition={position}
    >
      <PageCanvas>
        <PageHeader bordered>
          <h1>
            <PageTitleIcon><mode.icon strokeWidth={2.2} /></PageTitleIcon> {mode.title}
          </h1>
          <p>{mode.lede}</p>
        </PageHeader>
        <p>
          This section uses the wide <code>PageCanvas</code>. It fills the main column, so a table or card grid has room.
        </p>
      </PageCanvas>
      <PageCanvas reading>
        <div className={proseClassName}>
          <h2>A reading section</h2>
          <p>
            This section uses <code>PageCanvas reading</code>. Lines stop at the reading width, so long paragraphs stay easy to follow.
            With a sidebar, the section starts at the left edge of the main column. With no sidebar, it centers in the page.
          </p>
          <ul>
            {sidebarItems.map((item) => <li key={item.href}><Link href={item.href}>{item.label}</Link></li>)}
          </ul>
        </div>
      </PageCanvas>
    </AppShell>
  );
}
