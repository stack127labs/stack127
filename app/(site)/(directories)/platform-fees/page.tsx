import { getRequiredDirectoryPage } from '@/lib/directory-pages';
import { getFeeDirectory } from '@/lib/platform-fees/queries';
import { feeGroups, groupPath } from '@/lib/platform-fees/groups';
import { FeeFilters, FeeHubResults, type FeeHubItem } from './filters';
import { CategoryTile, FeeShell } from './components';
import styles from './page.module.css';
import { RegistryStructuredData } from '@/lib/registry-layout';
import Article from './content/article.mdx';
import Intro from './content/intro.mdx';

export default async function PlatformFeesPage() {
  const directoryPage = await getRequiredDirectoryPage('platform-fees');
  // A failed load must surface as an error, never as a cacheable page.
  const directory = await getFeeDirectory();
  const hubSections = directory.sections.map(section => ({ label: `${section.group_name} · ${section.name}`, path: groupPath(section.group_name) }));
  const sectionIndex = new Map(directory.sections.map((section, index) => [section.id, index]));
  const items: FeeHubItem[] = directory.entries.map(entry => ({
    id: entry.id,
    name: entry.name,
    tag: entry.card.tag,
    summary: entry.summary,
    section: sectionIndex.get(entry.section_id) ?? -1,
  }));

  return <>
    <RegistryStructuredData path="/platform-fees" />
    <FeeShell directoryPage={directoryPage} intro={<Intro />} article={<Article />}>
    <FeeFilters />
    <FeeHubResults sections={hubSections} items={items}>
      <p className={styles.count}>{feeGroups.length} categories · {directory.sections.length} sections · {directory.entries.length} listings</p>
      <div className={styles.tiles}>{feeGroups.map(group => {
        const sections = directory.sections.filter(section => section.group_name === group.name);
        const sectionIds = new Set(sections.map(section => section.id));
        const listings = directory.entries.filter(entry => sectionIds.has(entry.section_id)).length;
        return <CategoryTile key={group.slug} group={group} sections={sections.length} listings={listings} />;
      })}</div>
    </FeeHubResults>
    </FeeShell>
  </>;
}
