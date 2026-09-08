import Link from "next/link";
import type { ReactNode } from "react";
import { getRequiredPublishedPage } from "@/lib/page-registry";
import { AppShell, SidebarLabel } from "./app-shell";
import { proseClassName, proseSectionFlowClassName } from "./prose";
import { EntryHero } from "./entry-hero";
import { PageHeader } from "./page-header";
import styles from "./info-page.module.css";
import {
  sidebarPanelClassName,
  sidebarPanelHeadingClassName,
} from "./sidebar-panel";

type InfoPageProps = {
  children: ReactNode;
  slug: string;
  /** Short name used for accessible labels. */
  title: string;
  /** Full h1, name plus the point, with its mark phrase. Defaults to title. */
  heading?: ReactNode;
  /** One short paragraph that defines the page inside the dotted hero. */
  intro: ReactNode;
  /** Generated marker art that explains the page's subject at a glance. */
  heroArt: string;
  /** Lets a data-heavy info page use the full reading canvas. */
  wide?: boolean;
};

const links = [
  { href: "/about", label: "about" },
  { href: "/labs", label: "labs" },
  { href: "/privacy", label: "privacy" },
  { href: "/terms", label: "terms" },
  { href: "/self-host-apps", label: "self-host apps" },
  { href: "/software-licenses-for-self-hosting", label: "software licenses" },
];

function InfoSidebar({ label }: { label: string }) {
  return (
    <div className={`${sidebarPanelClassName} ${styles.sidebarPanel}`}>
      <div className={sidebarPanelHeadingClassName}>
        <SidebarLabel>{label}</SidebarLabel>
      </div>
      <nav className={styles.sidebarLinks} aria-label="Info pages">
        {links.map((link) => (
          <Link href={link.href} key={link.href}>
            {link.label}
          </Link>
        ))}
      </nav>
      <p className={styles.contact}>
        <a href="mailto:stack127@proton.me">stack127@proton.me</a>
      </p>
    </div>
  );
}

export async function InfoPage({ children, slug, title, heading, intro, heroArt, wide = false }: InfoPageProps) {
  const registryPage = await getRequiredPublishedPage(slug);

  return (
    <AppShell
      mainLabel={title}
      menuLabel="Pages"
      sidebar={<InfoSidebar label={registryPage.label} />}
      sidebarLabel={`${title} sidebar`}
    >
      <EntryHero art={heroArt} wide={wide}>
        <PageHeader>
          <h1>{heading ?? title}</h1>
          {intro}
        </PageHeader>
      </EntryHero>
      <article
        className={`${styles.page} ${wide ? styles.widePage : ""} ${proseClassName} ${proseSectionFlowClassName}`}
      >
        {children}
      </article>
    </AppShell>
  );
}

export const infoUpdatedClassName = styles.updated;
