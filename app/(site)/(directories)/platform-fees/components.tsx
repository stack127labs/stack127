import Link from 'next/link';
import type { ReactNode } from 'react';
import {
  ReceiptText, CreditCard, ShoppingCart, Files, Cpu, ExternalLink, Smartphone,
  Monitor, Watch, Gamepad2, Headset, Puzzle, Cloud, Database, Download,
  Palette, Type, LayoutTemplate, Code, Box, Camera, Video, Music, BookOpen,
  GraduationCap, Calendar, Users, Heart, Mail, Mic, Coffee, Briefcase, Shirt,
} from 'lucide-react';
import { AppShell, SidebarLabel } from '@/app/ui/site/app-shell';
import { PageCanvas } from '@/app/ui/site/page-canvas';
import { EntryHero } from '@/app/ui/site/entry-hero';
import { PageHeader } from '@/app/ui/site/page-header';
import { PageTitleIcon } from '@/app/ui/site/page-title-icon';
import { StatePanel } from '@/app/ui/state-panel';
import { sidebarPanelClassName, sidebarPanelHeadingClassName } from '@/app/ui/site/sidebar-panel';
import { sectionGroups, sectionFeeRange, type FeeEntry, type FeeSection } from '@/lib/platform-fees/model';
import { sectionPath } from '@/lib/platform-fees/section-routes';
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

export function SectionIcon({ section }: { section: FeeSection }) {
  const Icon = icons[section.icon];
  return <Icon aria-hidden="true" size={22} />;
}

export function FeeShell({ sections, selected, title, children, overview = false }: {
  sections: FeeSection[];
  selected?: string;
  title: string;
  children: ReactNode;
  overview?: boolean;
}) {
  const current = sections.find(section => section.id === selected);
  const sidebar = <div className={sidebarPanelClassName}>
    <div className={sidebarPanelHeadingClassName}><SidebarLabel>Platform fees</SidebarLabel></div>
    <nav aria-label="Fee sections" className={styles.sectionLinks}>
      <Link href="/platform-fees" aria-current={overview ? 'page' : undefined}>All sections</Link>
      {sectionGroups.map(group => <details key={group} open={current?.group_name === group}>
        <summary>{group}</summary>
        <div>{sections.filter(section => section.group_name === group).map(section =>
          <Link key={section.id} href={sectionPath(section.id)} aria-current={selected === section.id ? 'page' : undefined}>
            {section.name}
          </Link>,
        )}</div>
      </details>)}
    </nav>
  </div>;

  return <AppShell mainLabel={title} sidebar={sidebar} sidebarLabel="Fee sections" menuLabel="Sections">
    <EntryHero art={null}>
      <PageHeader>
        {!overview && <Link href="/platform-fees" className={styles.back}>Platform fees</Link>}
        <h1><PageTitleIcon>{current ? <SectionIcon section={current} /> : <ReceiptText />}</PageTitleIcon>{' '}{title}</h1>
        {overview ? <p>Choose what you sell, then compare fees and start costs. Open a card for other rates and official sources. Ranges use headline percentages before fixed charges and other deductions.</p> : current && <p>{current.intro}</p>}
      </PageHeader>
    </EntryHero>
    <PageCanvas flow className={styles.content}>{children}</PageCanvas>
  </AppShell>;
}

export function SectionTile({ section, entries }: { section: FeeSection; entries: FeeEntry[] }) {
  const range = sectionFeeRange(entries);
  return <Link className={styles.tile} href={sectionPath(section.id)}>
    <SectionIcon section={section} />
    <h3>{section.name}</h3>
    <span>{entries.length} platforms</span>
    {range && <span>Headline fees: {range.min === range.max ? `${range.min}%` : `${range.min}% to ${range.max}%`}
      {range.count < entries.length && <> ({range.count} percentage rate{range.count === 1 ? '' : 's'})</>}
    </span>}
    <span className={styles.arrow} aria-hidden="true">→</span>
  </Link>;
}

export function FeeUnavailable() {
  return <AppShell mainLabel="Platform fees"><PageCanvas flow>
    <StatePanel state="error" title="Platform fees are temporarily unavailable" action={<Link href="/platform-fees">Try again</Link>}>
      <p>Please try again in a moment.</p>
    </StatePanel>
  </PageCanvas></AppShell>;
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
