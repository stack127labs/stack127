import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell, SidebarLabel, type SidebarPosition } from "@/app/ui/site/app-shell";
import { PageCanvas } from "@/app/ui/site/page-canvas";
import { PageHeader } from "@/app/ui/site/page-header";
import { proseClassName, proseFlowClassName } from "@/app/ui/site/prose";
import { SidebarList } from "@/app/ui/site/sidebar-list";
import { sidebarPanelClassName, sidebarPanelHeadingClassName } from "@/app/ui/site/sidebar-panel";

const views = [
  { slug: "directory", label: "Directory" },
  { slug: "niches", label: "Niches" },
  { slug: "stats", label: "Stats" },
  { slug: "checker", label: "Checker" },
];
const positions: SidebarPosition[] = ["left", "right", "none"];
const previewPath = (position: SidebarPosition, view: string) => `/components-ui/section-bar/${position}/${view}`;

// Outside the gallery shell so each preview renders exactly one AppShell. Never public.
export default async function SectionBarPreview({ params }: { params: Promise<{ position: string; view: string }> }) {
  if (process.env.NODE_ENV !== "development") notFound();
  const { position: requestedPosition, view } = await params;
  const position = positions.find((item) => item === requestedPosition);
  const currentView = views.find((item) => item.slug === view);
  if (!position || !currentView) notFound();

  return (
    <AppShell
      mainLabel="Section bar preview"
      menuLabel="Preview options"
      sectionNav={{
        label: "ad networks",
        href: previewPath(position, "directory"),
        current: previewPath(position, view),
        items: views.map((item) => ({ label: item.label, href: previewPath(position, item.slug) })),
      }}
      sidebar={(
        <div className={sidebarPanelClassName}>
          <div className={sidebarPanelHeadingClassName}><SidebarLabel>Preview options</SidebarLabel></div>
          <nav aria-label="Preview sidebar position">
            <SidebarList items={positions.map((item) => ({
              label: `${item} sidebar`,
              href: previewPath(item, view),
              active: item === position,
            }))} />
          </nav>
        </div>
      )}
      sidebarLabel="Preview options"
      sidebarPosition={position}
    >
      <PageCanvas>
        <PageHeader bordered>
          <h1>Section bar: <mark>{currentView.label}</mark></h1>
          <p>Try the four section links with a {position} sidebar. These are development previews with no ad network data.</p>
        </PageHeader>
      </PageCanvas>
      <PageCanvas reading>
        <div className={`${proseClassName} ${proseFlowClassName}`}>
          <h2>One section, four pages</h2>
          <p>The section name links to Directory. The active page has an accent underline. On a phone, swipe the links sideways.</p>
          <h2>Try each sidebar position</h2>
          <ul>
            {positions.map((item) => <li key={item}><Link href={previewPath(item, view)}>{item} sidebar</Link></li>)}
          </ul>
          <h2>Scroll down</h2>
          <p>The section bar leaves the screen. The main navigation stays at the top. A desktop sidebar sits just below it.</p>
          <h2>Try the phone drawer</h2>
          <p>With a left sidebar, Preview options opens the drawer. The right sidebar follows the content. With none, the content fills the page.</p>
          <h2>Check both themes</h2>
          <p>Use the theme button in the main navigation. The current link keeps its accent underline and readable text in either theme.</p>
          <h2>Keep each navigation useful</h2>
          <p>The section bar holds the few main pages. Filters and longer lists belong in a sidebar. Give each a different job.</p>
          <p><Link href="/components-ui/page-layout">Back to page layout</Link></p>
        </div>
      </PageCanvas>
    </AppShell>
  );
}
