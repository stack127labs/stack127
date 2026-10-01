import Link from 'next/link';
import { notFound } from 'next/navigation';
import { StatePanel } from '@/app/ui/state-panel';
import { getRequiredPublishedPage } from '@/lib/page-registry';
import { getFeeDirectory } from '@/lib/platform-fees/queries';
import { filterDirectory, sectionCheckedAt } from '@/lib/platform-fees/model';
import { sectionPath, sectionSlug } from '@/lib/platform-fees/section-routes';
import { FeeFilters } from '../filters';
import { FeeShell, FeeSourceList, SectionTile } from '../components';
import { FeeSources } from '../sources';
import { FeeCard } from '../fee-card';
import styles from '../page.module.css';

const dateFormat = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
});

export default async function FeeSectionPage({ params, searchParams }: {
  params: Promise<{ section: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { section: slug } = await params;
  await getRequiredPublishedPage(`platform-fees/${slug}`);
  // A failed load must surface as an error, never as a cacheable page.
  const directory = await getFeeDirectory();
  const section = directory.sections.find(section => sectionSlug(section.id) === slug);
  if (!section) notFound();
  const parameters = await searchParams;
  const query = typeof parameters.q === 'string' ? parameters.q.trim().slice(0, 160) : '';
  const sectionEntries = directory.entries.filter(entry => entry.section_id === section.id);
  const entries = filterDirectory(directory, query, section.id).entries;
  const checkedAt = sectionCheckedAt(sectionEntries);
  const related = section.related_sections.map(id => directory.sections.find(section => section.id === id)!).filter(Boolean);
  const path = sectionPath(section.id);

  return <FeeShell sections={directory.sections} selected={section.id} title={section.meta_title}>
    <FeeFilters key={query} action={path} query={query} />
    <div className={styles.overview}>
      <p>{entries.length} platforms</p>
      <div className={styles.overviewActions}>
        <p>US / USD unless labelled</p>
        {checkedAt && <p>Last checked <time dateTime={checkedAt}>{dateFormat.format(new Date(checkedAt))}</time></p>}
        <FeeSources><FeeSourceList entries={sectionEntries} section={section} /></FeeSources>
      </div>
    </div>
    {!entries.length && <StatePanel title="No platforms match" action={<Link href={path}>Show all platforms</Link>} />}
    <div className={styles.grid}>{entries.map(entry => <FeeCard key={entry.id} entry={entry} />)}</div>
    {related.length > 0 && <section className={styles.sectionGroup} aria-labelledby="related-sections">
      <h2 id="related-sections">Related sections</h2>
      <div className={styles.tiles}>{related.map(section =>
        <SectionTile key={section.id} section={section} entries={directory.entries.filter(entry => entry.section_id === section.id)} />,
      )}</div>
    </section>}
  </FeeShell>;
}
