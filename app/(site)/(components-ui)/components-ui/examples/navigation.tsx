import { Globe, HardDrive, Keyboard } from "lucide-react";
import { Pagination } from "@/app/ui/pagination";
import { Breadcrumbs } from "@/app/ui/site/breadcrumbs";
import { SidebarList } from "@/app/ui/site/sidebar-list";
import { UiTabs } from "@/app/ui/tabs";
import { Example } from "../gallery";
import { TabRowDemo } from "./tab-row-demo";
import styles from "../components-ui.module.css";

const here = "/components-ui/navigation";

export function NavigationExamples() {
  return (
    <>
      <Example
        components={["Breadcrumbs", "getBreadcrumbs", "getToolBreadcrumbs"]}
        note="Above every page title but home's. Sections show lowercase, like the main menu; the page keeps its own name. A tool sits under its primary catalog. Pass the trail to PageHeader."
        source="app/ui/site/breadcrumbs.tsx, lib/breadcrumbs.ts"
        title="Breadcrumbs"
        usage={{ label: "TSX", code: `<PageHeader breadcrumbs={await getBreadcrumbs("keyboard-shortcuts/claude-code", app.name)}>
  <h1>…</h1>
</PageHeader>` }}
      >
        <div className={styles.stack}>
          <Breadcrumbs items={[{ name: "stack127", href: "/", section: true }, { name: "domain tools", href: "/domain-tools", section: true }, { name: "Domain age checker", href: "/domain-age", section: false }]} />
          <Breadcrumbs items={[{ name: "stack127", href: "/", section: true }, { name: "Keyboard shortcuts", href: "/keyboard-shortcuts", section: true }, { name: "Claude Code", href: "/keyboard-shortcuts/claude-code", section: false }]} />
          <Breadcrumbs items={[{ name: "stack127", href: "/", section: true }, { name: "self-host apps", href: "/self-host-apps", section: true }]} />
        </div>
      </Example>

      <Example components={["Pagination"]} note="The page builds each link, so filters and sorting stay in the URL. Page one uses the clean URL." source="app/ui/pagination.tsx" title="Pagination">
        <Pagination ariaLabel="Example pages" currentPage={4} hrefForPage={(page) => page === 1 ? here : `${here}?page=${page}`} totalPages={12} />
      </Example>

      <Example components={["SidebarList"]} note="Every sidebar link list. Ordered lists lead with numbers, unordered lists with an icon. Rows can show a count or a tag for pages that aren't out yet." source="app/ui/site/sidebar-list.tsx" title="Sidebar list">
        <div className={styles.sidebarExamples}>
          <nav aria-label="Example ordered list">
            <SidebarList items={[
              { href: here, label: "Pick your hardware", number: "01", active: true },
              { href: "#install", label: "Install the system", number: "02" },
              { href: "#apps", label: "Run your first app", number: "03" },
              { href: "", label: "Back up everything", number: "04", tag: "soon" },
            ]} ordered />
          </nav>
          <nav aria-label="Example list with icons">
            <SidebarList items={[
              { href: here, label: "Self-host apps", icon: <HardDrive size={15} strokeWidth={2.2} />, count: "1,240", active: true },
              { href: "#shortcuts", label: "Keyboard shortcuts", icon: <Keyboard size={15} strokeWidth={2.2} />, count: "86" },
              { href: "#tlds", label: "TLD directory", icon: <Globe size={15} strokeWidth={2.2} /> },
            ]} />
          </nav>
          <nav aria-label="Example plain list">
            <SidebarList items={[
              { href: "#verdicts", label: "Compare licenses" },
              { href: "#families", label: "License families" },
              { href: "#faq", label: "Questions that come up" },
            ]} />
          </nav>
        </div>
      </Example>
      <Example
        components={["UiTabs"]}
        note="Every panel is in the server HTML under its own heading, so search engines read all of them and the page works without scripts. With scripts, inactive panels get hidden=&quot;until-found&quot;: find-in-page still reaches them and opens their tab. Arrow keys, Home, and End move between tabs."
        source="app/ui/tabs.tsx"
        title="Tabs"
        usage={{ label: "TSX", code: `<UiTabs label="Mediavine details" tabs={[
  { id: "joining", title: "Joining", content: <Joining /> },
  { id: "pay", title: "Pay", content: <Pay /> },
]} />` }}
      >
        <UiTabs label="Example details" tabs={[
          { id: "joining", title: "Joining", content: <p>Who can apply, the traffic rule, and how to apply.</p> },
          { id: "pay", title: "Pay", content: <p>Your share, when you get paid, and the payment minimum.</p> },
          { id: "rules", title: "Rules", content: <p>Ad placement, other ad partners, and the contract.</p> },
        ]} />
      </Example>
      <Example
        components={["UiTabRow", "uiTabPanelProps"]}
        note="A tab row over one panel you render, for a tool with a few ways to calculate. You hold the active tab, so a shared link can open any of them. Same look and keys as Tabs."
        source="app/ui/tabs.tsx"
        title="Tab row"
        usage={{ label: "TSX", code: `<UiTabRow label="What to calculate" onChange={setTab} panelId={panelId} tabs={tabs} value={tab} />
<form {...uiTabPanelProps(panelId, tab)}>…</form>` }}
      >
        <TabRowDemo />
      </Example>
    </>
  );
}
