import { Globe, HardDrive, Keyboard } from "lucide-react";
import { Pagination } from "@/app/ui/pagination";
import { SidebarList } from "@/app/ui/site/sidebar-list";
import { Example } from "../gallery";
import styles from "../components-ui.module.css";

const here = "/components-ui/navigation";

export function NavigationExamples() {
  return (
    <>
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
    </>
  );
}
