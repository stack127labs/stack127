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

      <Example components={["AppShell", "PageCanvas"]} note="Every page uses the shared shell with a sidebar, and PageCanvas for each content section. This gallery uses both. See full layouts on their live pages." source="app/ui/site/app-shell.tsx, app/ui/site/page-canvas.tsx" title="Full page layouts">
        <ul className={styles.layoutLinks}>
          {fullLayouts.map((layout) => (
            <li key={layout.href}><Link href={layout.href}>{layout.label}</Link><span>{layout.detail}</span></li>
          ))}
        </ul>
      </Example>
    </>
  );
}
