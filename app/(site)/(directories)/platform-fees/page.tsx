import { getRequiredDirectoryPage } from '@/lib/directory-pages';
import { getFeeDirectory } from '@/lib/platform-fees/queries';
import { feeGroups, groupPath } from '@/lib/platform-fees/groups';
import { FeeFilters, FeeHubResults } from './filters';
import { CategoryTile, FeeShell } from './components';
import styles from './page.module.css';
import { RegistryStructuredData } from '@/lib/registry-layout';
import Article from './content/article.mdx';
import Intro from './content/intro.mdx';

export default async function PlatformFeesPage() {
  const directoryPage = await getRequiredDirectoryPage('platform-fees');
  // A failed load must surface as an error, never as a cacheable page.
  const directory = await getFeeDirectory();
  const sectionsById = new Map(directory.sections.map(section => [section.id, section]));
  const items = directory.entries.map(entry => {
    const section = sectionsById.get(entry.section_id);
    return {
      id: entry.id,
      text: `${entry.name} ${entry.card.tag} ${entry.summary}`.toLocaleLowerCase('en-US'),
      name: entry.name,
      section: section ? `${section.group_name} · ${section.name}` : '',
      href: section ? `${groupPath(section.group_name)}#${entry.id}` : '/platform-fees',
    };
  });

  return <>
    <RegistryStructuredData path="/platform-fees" />
    <FeeShell directoryPage={directoryPage} intro={<Intro />} article={<Article />} overview>
    <FeeFilters />
    <FeeHubResults items={items}>
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
