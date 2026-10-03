import { getRequiredDirectoryPage } from '@/lib/directory-pages';
import { getFeeDirectory } from '@/lib/platform-fees/queries';
import { sectionGroups } from '@/lib/platform-fees/model';
import { sectionPath } from '@/lib/platform-fees/section-routes';
import { FeeFilters, FeeHubResults, FeeSearch } from './filters';
import { FeeShell, SectionTile } from './components';
import styles from './page.module.css';

export default async function PlatformFeesPage() {
  const directoryPage = await getRequiredDirectoryPage('platform-fees');
  // A failed load must surface as an error, never as a cacheable page.
  const directory = await getFeeDirectory();
  const sectionNames = new Map(directory.sections.map(section => [section.id, section.name]));
  const items = directory.entries.map(entry => ({
    id: entry.id,
    text: `${entry.name} ${entry.card.tag} ${entry.summary}`.toLocaleLowerCase('en-US'),
    name: entry.name,
    section: sectionNames.get(entry.section_id) ?? '',
    href: `${sectionPath(entry.section_id)}#${entry.id}`,
  }));
  const sectionRedirects = Object.fromEntries(directory.sections.map(section => [section.id, sectionPath(section.id)]));

  return <FeeShell sections={directory.sections} directoryPage={directoryPage} overview>
    <FeeSearch sectionRedirects={sectionRedirects}>
      <FeeFilters />
      <FeeHubResults items={items}>
        <p className={styles.count}>{directory.sections.length} sections · {directory.entries.length} listings</p>
        {sectionGroups.map(group => <section key={group} className={styles.sectionGroup}>
          <h2>{group}</h2>
          <div className={styles.tiles}>{directory.sections.filter(section => section.group_name === group).map(section =>
            <SectionTile key={section.id} section={section} entries={directory.entries.filter(entry => entry.section_id === section.id)} />,
          )}</div>
        </section>)}
      </FeeHubResults>
    </FeeSearch>
  </FeeShell>;
}
