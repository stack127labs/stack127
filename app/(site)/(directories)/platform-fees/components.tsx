import type { Stack127DirectoryPage } from "@/lib/directory-pages";
import { directoryTitleParts } from "@/lib/directory-page-content";
import { DirectoryPageTitle } from "@/app/ui/directories/directory-page-content";
import { PageMeta } from "@/app/ui/site/page-meta";
import Link from 'next/link';
import type { ReactNode } from 'react';
import {
  CreditCard, ShoppingCart, Files, Cpu, ExternalLink, Smartphone,
  Monitor, Watch, Gamepad2, Headset, Puzzle, Cloud, Database, Download,
  Palette, Type, LayoutTemplate, Code, Box, Camera, Video, Music, BookOpen,
  GraduationCap, Calendar, Users, Heart, Mail, Mic, Coffee, Briefcase, Shirt,
} from 'lucide-react';
import { AppShell, SidebarLabel } from '@/app/ui/site/app-shell';
import { PageCanvas } from '@/app/ui/site/page-canvas';
import { proseClassName, proseFlowClassName } from '@/app/ui/site/prose';
import { EntryHero } from '@/app/ui/site/entry-hero';
import { PageHeader } from '@/app/ui/site/page-header';
import { PageTitleIcon } from '@/app/ui/site/page-title-icon';
import { DirectoryTitleIcon } from '@/app/ui/directories/directory-title-icon';
import { SidebarList } from '@/app/ui/site/sidebar-list';
import { sidebarPanelClassName, sidebarPanelHeadingClassName } from '@/app/ui/site/sidebar-panel';
import { feeGroups, groupPath, type FeeGroup } from '@/lib/platform-fees/groups';
import type { FeeEntry, FeeSection } from '@/lib/platform-fees/model';
import { FeeSearch, FeeSidebarAnchors, type FeeAnchor } from './filters';
import styles from './page.module.css';

const icons = {
  Smartphone, Monitor, Watch, Gamepad2, Headset, Puzzle, Cloud, CreditCard,
  Database, Download, ShoppingCart, Palette, Type, LayoutTemplate, Code, Box,
  Camera, Video, Music, BookOpen, GraduationCap, Calendar, Files, Users,
  Heart, Mail, Mic, Coffee, Briefcase, Cpu, Shirt,
};
const dateFormat = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
});

export function SectionIcon({ icon, size = 22 }: { icon: FeeSection['icon']; size?: number }) {
  const Icon = icons[icon];
  return <Icon aria-hidden="true" size={size} />;
}

/** `intro` and `article` are the page's own MDX content. */
export function FeeShell({ directoryPage, intro, article, children, overview = false, group, anchors = [] }: {
  directoryPage: Stack127DirectoryPage;
  intro: ReactNode;
  article?: ReactNode;
  children: ReactNode;
  overview?: boolean;
  group?: FeeGroup;
  anchors?: FeeAnchor[];
}) {
  const sidebar = <div className={sidebarPanelClassName}>
    <div className={sidebarPanelHeadingClassName}><SidebarLabel>Platform fees</SidebarLabel></div>
    <nav aria-label="Fee categories">
      <SidebarList items={feeGroups.map(item => ({
        href: groupPath(item.name),
        label: item.name,
        active: group?.slug === item.slug,
        icon: <SectionIcon icon={item.icon} size={15} />,
      }))} />
    </nav>
    {anchors.length > 0 && <FeeSidebarAnchors anchors={anchors} />}
  </div>;

  return <FeeSearch>
    <AppShell mainLabel={directoryTitleParts(directoryPage.title).map(part => part.text).join('')} sidebar={sidebar} sidebarLabel="Fee categories" menuLabel="Categories">
      <EntryHero art={null}>
        <PageHeader>
          {!overview && <Link href="/platform-fees" className={styles.back}>Platform fees</Link>}
          <h1>{group ? <PageTitleIcon><SectionIcon icon={group.icon} /></PageTitleIcon> : <DirectoryTitleIcon iconKey={directoryPage.card_icon_key} />}{' '}<DirectoryPageTitle title={directoryPage.title} /></h1>
          <PageMeta updatedAt={directoryPage.updated_at} />
          {intro}
        </PageHeader>
      </EntryHero>
      <PageCanvas flow className={styles.content}>
        {children}
        {article ? <div className={`${proseClassName} ${proseFlowClassName} ${styles.prose}`}>{article}</div> : null}
      </PageCanvas>
    </AppShell>
  </FeeSearch>;
}

export function CategoryTile({ group, sections, listings }: { group: FeeGroup; sections: number; listings: number }) {
  return <Link className={styles.tile} href={groupPath(group.name)}>
    <SectionIcon icon={group.icon} />
    <h2>{group.name}</h2>
    <span>{sections} {sections === 1 ? 'section' : 'sections'}</span>
    <span>{listings} {listings === 1 ? 'listing' : 'listings'}</span>
    <span className={styles.arrow} aria-hidden="true">→</span>
  </Link>;
}

export function FeeSourceList({ entries, section }: { entries: FeeEntry[]; section: FeeSection }) {
  return <div className={styles.sourceList}>{entries.map(entry => {
    const sources = entry.sources.length
      ? entry.sources.filter((source, index, all) => all.findIndex(item => item.url === source.url) === index)
      : [{ url: entry.website_url, label: 'Official website' }];
    return <section key={entry.id} className={styles.sourceEntry}>
      <h3>{entry.name}</h3>
      <p>{entry.checked_at ? <>Checked <time dateTime={entry.checked_at}>{dateFormat.format(new Date(entry.checked_at))}</time></> : 'Not checked'}</p>
      <dl className={styles.fullFacts}>{entry.facts.map(fact => <div key={fact.key}>
        <dt>{section.fields.find(field => field.key === fact.key)?.label}</dt>
        <dd>{fact.value}{fact.source_url && <> <a href={fact.source_url} target="_blank" rel="noopener noreferrer">Source<ExternalLink size={12} aria-hidden="true" /></a></>}</dd>
      </div>)}</dl>
      <ul>{sources.map(source => <li key={source.url}>
        <a href={source.url} target="_blank" rel="noopener noreferrer">{source.label}<ExternalLink size={14} aria-hidden="true" /></a>
        <span>{new URL(source.url).hostname.replace(/^www\./, '')}</span>
      </li>)}</ul>
    </section>;
  })}</div>;
}
