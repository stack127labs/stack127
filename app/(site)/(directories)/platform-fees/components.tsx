import type { Stack127DirectoryPage } from "@/lib/directory-pages";
import { directoryTitleParts } from "@/lib/directory-page-content";
import { DirectoryPageTitle } from "@/app/ui/directories/directory-page-content";
import { PageMeta } from "@/app/ui/site/page-meta";
import Link from 'next/link';
import type { ReactNode } from 'react';
import {
  CreditCard, ShoppingCart, Files, Cpu, Smartphone,
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
import { getBreadcrumbs } from '@/lib/breadcrumbs';
import type { FeeSection } from '@/lib/platform-fees/model';
import { FeeSearch, FeeSidebarAnchors, type FeeAnchor } from './filters';
import styles from './page.module.css';

const icons = {
  Smartphone, Monitor, Watch, Gamepad2, Headset, Puzzle, Cloud, CreditCard,
  Database, Download, ShoppingCart, Palette, Type, LayoutTemplate, Code, Box,
  Camera, Video, Music, BookOpen, GraduationCap, Calendar, Files, Users,
  Heart, Mail, Mic, Coffee, Briefcase, Cpu, Shirt,
};

export function SectionIcon({ icon, size = 22 }: { icon: FeeSection['icon']; size?: number }) {
  const Icon = icons[icon];
  return <Icon aria-hidden="true" size={size} />;
}

/** `intro` and `article` are the page's own MDX content. */
export async function FeeShell({ directoryPage, intro, lead, article, children, group, anchors = [] }: {
  directoryPage: Stack127DirectoryPage;
  intro: ReactNode;
  /** Content shown above the listing. */
  lead?: ReactNode;
  article?: ReactNode;
  children: ReactNode;
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

  const breadcrumbs = await getBreadcrumbs(group ? groupPath(group.name).slice(1) : 'platform-fees');
  return <FeeSearch>
    <AppShell mainLabel={directoryTitleParts(directoryPage.title).map(part => part.text).join('')} sidebar={sidebar} sidebarLabel="Fee categories" menuLabel="Categories">
      <EntryHero art={null}>
        <PageHeader breadcrumbs={breadcrumbs}>
          <h1>{group ? <PageTitleIcon><SectionIcon icon={group.icon} /></PageTitleIcon> : <DirectoryTitleIcon iconKey={directoryPage.card_icon_key} />}{' '}<DirectoryPageTitle title={directoryPage.title} /></h1>
          <PageMeta updatedAt={directoryPage.updated_at} />
          {intro}
        </PageHeader>
      </EntryHero>
      <PageCanvas flow className={styles.content}>
        {lead ? <div className={`${proseClassName} ${proseFlowClassName} ${styles.prose}`}>{lead}</div> : null}
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
