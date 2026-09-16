import { PageCanvas } from "@/app/page-canvas";
import { notFound } from "next/navigation";
import { Bot, CalendarDays, Code2, GitCommitHorizontal, HardDrive, HousePlug, MemoryStick, Monitor, Package, Scale, Star, Tag, WalletCards, type LucideIcon } from "lucide-react";
import { AppShell, SidebarLabel } from "@/app/app-shell";
import { PageHeader } from "@/app/page-header";
import { SidebarList } from "@/app/sidebar-list";
import { sidebarPanelClassName, sidebarPanelHeadingClassName } from "@/app/sidebar-panel";
import { samples, thirdSample } from "./card-data";
import styles from "./app-card-lab.module.css";

const factIcons: Record<string, LucideIcon> = {
  Source: Code2,
  Pricing: WalletCards,
  RAM: MemoryStick,
  Storage: HardDrive,
  "Last update": CalendarDays,
  Stars: Star,
  License: Scale,
  Platforms: Monitor,
  Version: Package,
  "Last commit": GitCommitHorizontal,
};

const categoryIcons: Record<string, LucideIcon> = {
  "home automation & iot": HousePlug,
  AI: Bot,
  Development: Code2,
};

function CardCategory({ categories }: { categories: string[] }) {
  const primary = categories[0] ?? "Uncategorized";
  const Icon = categoryIcons[primary] ?? Tag;
  const more = categories.slice(1);
  return (
    <span className={styles.cardCategory} data-card-category>
      <Icon size={14} aria-hidden="true" />
      <span>{primary}</span>
      {more.length > 0 ? (
        <span className={styles.categoryMore} title={more.join(", ")} data-category-more>
          +{more.length}
          <span className={styles.srOnly}> more {more.length === 1 ? "category" : "categories"}: {more.join(", ")}</span>
        </span>
      ) : null}
    </span>
  );
}

function FactIcon({ label }: { label: string }) {
  const Icon = factIcons[label];
  return Icon ? <Icon size={14} aria-hidden="true" /> : null;
}

const designs = [
  { id: "design-1", name: "Balanced", style: "balanced" },
  { id: "design-2", name: "Compact facts", style: "compact" },
  { id: "design-3", name: "Fact rows", style: "factRows" },
  { id: "design-4", name: "Split layout", style: "split" },
  { id: "design-5", name: "Side icon", style: "sideIcon" },
  { id: "design-6", name: "Header band", style: "headerBand" },
  { id: "design-7", name: "Footer grid", style: "footerGrid" },
  { id: "design-8", name: "Key stats", style: "keyStats" },
  { id: "design-9", name: "Label columns", style: "labelColumns" },
  { id: "design-10", name: "Open cards", style: "open" },
];

export default function AppCardLabPage() {
  if (process.env.NODE_ENV !== "development") notFound();

  return (
    <AppShell mainLabel="App card designs" menuLabel="Designs" sidebarLabel="Card design navigation"
      sidebar={
        <div className={sidebarPanelClassName}>
          <div className={sidebarPanelHeadingClassName}><SidebarLabel>Card designs</SidebarLabel></div>
          <nav aria-label="Card designs">
            <SidebarList items={designs.map((design, index) => ({ href: `#${design.id}`, label: design.name, number: String(index + 1) }))} />
          </nav>
          <nav aria-label="Original directories" className={styles.directoryLinks}>
            <SidebarList items={[{ href: "/self-host-apps", label: "Self-host apps" }, { href: "/cli-apps", label: "CLI apps" }]} />
          </nav>
        </div>
      }>
      <PageCanvas as="div" flow className={styles.lab}>
        <PageHeader><h1>App <mark>cards</mark></h1></PageHeader>
        {designs.map((design, index) => (
          <section className={styles.design} id={design.id} key={design.id} data-card-design={design.style} aria-labelledby={`${design.id}-title`}>
            <h2 id={`${design.id}-title`} className={styles.designTitle}>
              <a href={`#${design.id}`}>{index + 1}. {design.name}</a>
            </h2>
            <div className={`${styles.grid} ${styles[design.style] ?? ""}`}>
              {(design.style === "factRows" ? [...samples, thirdSample] : samples).map((app) => (
                <a className={styles.card} key={app.name} href={app.href} target="_blank" rel="noopener noreferrer"
                  aria-label={`Visit ${app.name} website, opens in a new tab`} data-sample-card={app.family} data-sample-name={app.name}>
                  <div className={styles.identity}>
                    {app.image ? <img className={styles.icon} src={app.image} width={48} height={48} alt="" /> : <span className={styles.missingImage}>Image unavailable</span>}
                    <div className={styles.title}>
                      <h3>{app.name}</h3>
                      {design.style === "factRows" ? <CardCategory categories={app.categories} /> : <span className={styles.kind}>{app.kind}</span>}
                    </div>
                    {app.maintenance ? <span className={styles.maintenance}>{app.maintenance}</span> : null}
                  </div>
                  <p className={styles.description}>{app.summary}</p>
                  {design.style !== "factRows" ? <ul className={styles.categories} aria-label="Categories">
                    {app.categories.map((category) => <li key={category}>{category}</li>)}
                  </ul> : null}
                  <dl className={styles.facts}>
                    {app.facts.map((fact) => (
                      <div key={fact.label} data-fact={fact.label}>
                        <dt>{design.style === "factRows" ? <FactIcon label={fact.label} /> : null}{fact.label}</dt>
                        <dd>{fact.value}{fact.estimated ? <span className={styles.estimate}>estimated</span> : null}</dd>
                      </div>
                    ))}
                  </dl>
                </a>
              ))}
            </div>
          </section>
        ))}
      </PageCanvas>
    </AppShell>
  );
}
