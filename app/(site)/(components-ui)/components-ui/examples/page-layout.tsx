import Link from "next/link";
import { HardDrive } from "lucide-react";
import { siteHeroStack127Art } from "@/app/(site)/art/site--hero-stack127";
import { BrandWordmark } from "@/app/ui/site/brand-wordmark";
import { CategoryIcon } from "@/app/ui/site/category-icon";
import { EntryHero } from "@/app/ui/site/entry-hero";
import { PageHeader } from "@/app/ui/site/page-header";
import { PageMeta } from "@/app/ui/site/page-meta";
import { PageTitleIcon } from "@/app/ui/site/page-title-icon";
import { ThemeToggle } from "@/app/ui/site/theme-toggle";
import { UiButton, UiTextField } from "@/app/ui/controls";
import { UiActionRow, UiPrimaryResult } from "@/app/ui/display";
import { ToolFieldRow, ToolResult, ToolWorkbench } from "@/app/ui/tools/tool-workbench";
import { Example } from "../gallery";
import styles from "../components-ui.module.css";

const categoryKeys = ["home", "images", "tv", "folder-sync", "key-round", "network", "mail", "database", "shield", "bot"];

const fullLayouts = [
  { href: "/dns-lookup", label: "Tool page", detail: "ToolPageShell with the tool family sidebar" },
  { href: "/storage-tools", label: "Catalog page", detail: "EntryHero, card grid, and catalog sidebar" },
  { href: "/self-host-apps", label: "Directory with filters", detail: "Filters in the sidebar, record cards, and the detail drawer" },
  { href: "/keyboard-shortcuts", label: "Reference sidebar", detail: "A long list of related pages in the sidebar" },
  { href: "/self-hosting-for-beginners", label: "Course lesson", detail: "CourseLessonPage with numbered lessons" },
  { href: "/about", label: "Site page", detail: "InfoPage with a reading-width article" },
];

const sidebarModes = [
  { href: "/components-ui/sidebar-modes/left", label: "Left", detail: "sidebarPosition=\"left\", the default. Filters and lessons. A drawer on small screens." },
  { href: "/components-ui/sidebar-modes/right", label: "Right", detail: "sidebarPosition=\"right\". Related pages and section links. Below the content on small screens." },
  { href: "/components-ui/sidebar-modes/none", label: "None", detail: "sidebarPosition=\"none\". Content only. Reading sections center." },
];

export function PageLayoutExamples() {
  return (
    <>
      <Example components={["PageHeader", "PageTitleIcon", "PageMeta"]} note="The top of every page: an h1 with the page's icon, a metadata line, and a short introduction." source="app/ui/site/page-header.tsx, app/ui/site/page-title-icon.tsx, app/ui/site/page-meta.tsx" title="Page header">
        <div className={styles.frame}>
          <PageHeader bordered>
            <h1><PageTitleIcon><HardDrive strokeWidth={2.2} /></PageTitleIcon> Self-host <mark>apps</mark></h1>
            <PageMeta author={{ name: "stack127" }} githubUrl="https://github.com/stack127labs" updatedAt="2026-10-01" version="1.4" />
            <p>A short introduction helps people decide whether this is the page they need.</p>
          </PageHeader>
        </div>
      </Example>

      <Example components={["EntryHero"]} note="The dot-grid band at the top of catalog, course, and site pages. Its corner art hides below 1100px." source="app/ui/site/entry-hero.tsx" title="Entry hero">
        <div className={styles.frame}>
          <EntryHero art={siteHeroStack127Art}>
            <PageHeader>
              <h1>Tools and directories for people who build alone</h1>
              <p>Pick a tool, look something up, or learn a new skill.</p>
            </PageHeader>
          </EntryHero>
        </div>
      </Example>

      <Example components={["CategoryIcon"]} note="Maps a category icon key to an icon. Unknown keys show a box." source="app/ui/site/category-icon.tsx" title="Category icons">
        <ul className={styles.iconGrid}>
          {categoryKeys.map((key) => <li key={key}><CategoryIcon iconKey={key} /><code>{key}</code></li>)}
          <li><CategoryIcon iconKey="unknown-key" /><code>unknown</code></li>
        </ul>
      </Example>

      <Example components={["BrandWordmark", "ThemeToggle"]} note="The site nav already has both. The toggle switches between dark and light, so you can check every example in both themes." source="app/ui/site/brand-wordmark.tsx, app/ui/site/theme-toggle.tsx" title="Brand and theme">
        <div className={styles.inlineChoices}>
          <span className={styles.brandExample}><BrandWordmark /></span>
          <ThemeToggle />
        </div>
      </Example>

      <Example components={["ToolWorkbench", "ToolFieldRow", "ToolResult"]} note="Every tool sits in this band: the shared working width, inputs in rows that fill it, the action row, and the result below one divider. A result whose inputs changed steps back with stale." source="app/ui/tools/tool-workbench.tsx" title="Tool workbench">
        <ToolWorkbench label="Example tool">
          <ToolFieldRow>
            <UiTextField label="Drives" suffix="drives" value="4" />
            <UiTextField label="Drive size" suffix="TB" value="8" />
          </ToolFieldRow>
          <UiActionRow>
            <UiButton type="button" variant="primary">Calculate capacity</UiButton>
            <UiButton type="button">Reset</UiButton>
          </UiActionRow>
          <ToolResult label="Example result">
            <UiPrimaryResult detail="Example" label="Usable capacity" unit="TB" value="24" />
          </ToolResult>
          <ToolResult label="Stale example result" stale>
            <UiPrimaryResult detail="Inputs changed" label="Usable capacity, stale" unit="TB" value="24" />
          </ToolResult>
        </ToolWorkbench>
      </Example>

      <Example components={["AppShell"]} note="Every page uses the shared shell. Pick where its sidebar goes with sidebarPosition: left for options people use, right for secondary links, or none when the page only needs its content. Each link opens the real shell." source="app/ui/site/app-shell.tsx" title="Sidebar positions" usage={{ label: "TSX", code: '<AppShell sidebar={<RelatedPages />} sidebarPosition="right">\n  <PageCanvas>…</PageCanvas>\n</AppShell>' }}>
        <ul className={styles.layoutLinks}>
          {sidebarModes.map((mode) => (
            <li key={mode.href}><Link href={mode.href}>{mode.label}</Link><span>{mode.detail}</span></li>
          ))}
        </ul>
      </Example>

      <Example components={["SectionBar"]} note="Pass sectionNav to AppShell for a short row of related pages. It scrolls away with the page. On phones, the links scroll sideways and the current page stays visible on load. These previews use four working links with each sidebar position." source="app/ui/site/section-bar.tsx" title="Section bar" usage={{ label: "TSX", code: '<AppShell\n  sidebarPosition="none"\n  sectionNav={{\n    label: "ad networks",\n    href: "/ad-networks",\n    current: "/ad-networks/checker",\n    items: [\n      { label: "Directory", href: "/ad-networks" },\n      { label: "Niches", href: "/ad-networks/niches" },\n      { label: "Stats", href: "/ad-networks/stats" },\n      { label: "Checker", href: "/ad-networks/checker" },\n    ],\n  }}\n>\n  <PageCanvas>…</PageCanvas>\n</AppShell>' }}>
        <ul className={styles.layoutLinks}>
          {(["left", "right", "none"] as const).map((position) => (
            <li key={position}><Link href={`/components-ui/section-bar/${position}/checker`}>{position} sidebar</Link><span>Section bar with sidebarPosition="{position}".</span></li>
          ))}
        </ul>
      </Example>

      <Example components={["AppShell", "PageCanvas"]} note="PageCanvas wraps each content section. This gallery uses both. See full layouts on their live pages." source="app/ui/site/app-shell.tsx, app/ui/site/page-canvas.tsx" title="Full page layouts">
        <ul className={styles.layoutLinks}>
          {fullLayouts.map((layout) => (
            <li key={layout.href}><Link href={layout.href}>{layout.label}</Link><span>{layout.detail}</span></li>
          ))}
        </ul>
      </Example>
    </>
  );
}
