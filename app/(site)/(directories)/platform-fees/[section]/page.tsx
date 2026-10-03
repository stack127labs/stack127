import { notFound } from 'next/navigation';
import { getRequiredDirectoryPage } from '@/lib/directory-pages';
import { getFeeDirectory } from '@/lib/platform-fees/queries';
import { sectionCheckedAt } from '@/lib/platform-fees/model';
import { sectionPath, sectionSlug } from '@/lib/platform-fees/section-routes';
import { FeeFilters, FeeMatchCount, FeeSearch, FeeSectionGrid } from '../filters';
import { FeeShell, FeeSourceList, SectionTile } from '../components';
import { FeeSources } from '../sources';
import { FeeCard } from '../fee-card';
import styles from '../page.module.css';

const dateFormat = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
});

// Build every section during the release. Unpublished sections still return 404.
export async function generateStaticParams() {
  const directory = await getFeeDirectory();
  return directory.sections.map(section => ({ section: sectionSlug(section.id) }));
}

export default async function FeeSectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section: slug } = await params;
  const directoryPage = await getRequiredDirectoryPage(`platform-fees/${slug}`);
  // A failed load must surface as an error, never as a cacheable page.
  const directory = await getFeeDirectory();
  const section = directory.sections.find(section => sectionSlug(section.id) === slug);
  if (!section) notFound();
  const sectionEntries = directory.entries.filter(entry => entry.section_id === section.id);
  const items = sectionEntries.map(entry => ({
    id: entry.id,
    text: `${entry.name} ${entry.card.tag} ${entry.summary}`.toLocaleLowerCase('en-US'),
  }));
  const checkedAt = sectionCheckedAt(sectionEntries);
  const related = section.related_sections.map(id => directory.sections.find(section => section.id === id)!).filter(Boolean);
  const path = sectionPath(section.id);

  return <FeeShell sections={directory.sections} selected={section.id} directoryPage={directoryPage}>
    <FeeSearch>
      <FeeFilters action={path} />
      <div className={styles.overview}>
        <p><FeeMatchCount items={items} label="platforms" /></p>
        <div className={styles.overviewActions}>
          <p>US / USD unless labelled</p>
          {checkedAt && <p>Last checked <time dateTime={checkedAt}>{dateFormat.format(new Date(checkedAt))}</time></p>}
          <FeeSources><FeeSourceList entries={sectionEntries} section={section} /></FeeSources>
        </div>
      </div>
      <FeeSectionGrid path={path} items={sectionEntries.map((entry, index) => ({ ...items[index], card: <FeeCard entry={entry} /> }))} />
    </FeeSearch>
    {related.length > 0 && <section className={styles.sectionGroup} aria-labelledby="related-sections">
      <h2 id="related-sections">Related sections</h2>
      <div className={styles.tiles}>{related.map(section =>
        <SectionTile key={section.id} section={section} entries={directory.entries.filter(entry => entry.section_id === section.id)} />,
      )}</div>
    </section>}
  </FeeShell>;
}
