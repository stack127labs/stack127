import Link from 'next/link';
import { redirect } from 'next/navigation';
import { StatePanel } from '@/app/ui/state-panel';
import { getRequiredPublishedPage } from '@/lib/page-registry';
import { getFeeDirectory } from '@/lib/platform-fees/queries';
import { filterDirectory, sectionGroups, type FeeDirectory } from '@/lib/platform-fees/model';
import { sectionPath, sectionSlug } from '@/lib/platform-fees/section-routes';
import { FeeFilters } from './filters';
import { FeeShell, FeeUnavailable, SectionTile } from './components';
import styles from './page.module.css';

export default async function PlatformFeesPage({ searchParams }: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await getRequiredPublishedPage('platform-fees');
  const params = await searchParams;
  const query = typeof params.q === 'string' ? params.q.trim().slice(0, 160) : '';
  let directory: FeeDirectory;
  try {
    directory = await getFeeDirectory();
  } catch {
    return <FeeUnavailable />;
  }
  const selected = directory.sections.find(section => section.id === params.section || sectionSlug(section.id) === params.section);
  if (selected) redirect(`${sectionPath(selected.id)}${query ? `?q=${encodeURIComponent(query)}` : ''}`);
  const matches = query ? filterDirectory(directory, query, '') : null;

  return <FeeShell sections={directory.sections} title={`Platform fees compared: ${directory.entries.length} platforms across ${directory.sections.length} categories`} overview>
    <FeeFilters key={query} query={query} />
    {matches ? <>
      <p className={styles.count}>{matches.entries.length} results</p>
      {!matches.entries.length && <StatePanel title="No platforms match" action={<Link href="/platform-fees">All sections</Link>} />}
      <div className={styles.results}>{matches.entries.map(entry =>
        <Link className={styles.result} key={entry.id} href={`${sectionPath(entry.section_id)}#${entry.id}`}>
          <strong>{entry.name}</strong>
          <span>{directory.sections.find(section => section.id === entry.section_id)?.name}</span>
          <span aria-hidden="true">→</span>
        </Link>,
      )}</div>
    </> : <>
      <p className={styles.count}>{directory.sections.length} sections · {directory.entries.length} listings</p>
      {sectionGroups.map(group => <section key={group} className={styles.sectionGroup}>
        <h2>{group}</h2>
        <div className={styles.tiles}>{directory.sections.filter(section => section.group_name === group).map(section =>
          <SectionTile key={section.id} section={section} entries={directory.entries.filter(entry => entry.section_id === section.id)} />,
        )}</div>
      </section>)}
    </>}
  </FeeShell>;
}
