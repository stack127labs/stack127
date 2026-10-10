import { notFound } from 'next/navigation';
import { getRequiredDirectoryPage } from '@/lib/directory-pages';
import { getFeeDirectory } from '@/lib/platform-fees/queries';
import { sectionCheckedAt } from '@/lib/platform-fees/model';
import { feeGroups, getFeeGroup, groupPath } from '@/lib/platform-fees/groups';
import { sectionPath, sectionSlug } from '@/lib/platform-fees/section-routes';
import { FeeCategoryBody, FeeFilters, FeeMatchCount } from '../filters';
import { FeeShell, FeeSourceList, SectionIcon } from '../components';
import { FeeSources } from '../sources';
import { FeeCard } from '../fee-card';
import styles from '../page.module.css';
import { feeCategoryContent } from './content';

const dateFormat = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
});

// Build every category during the release. Unpublished categories still return 404.
export function generateStaticParams() {
  return feeGroups.map(group => ({ section: group.slug }));
}

export default async function FeeCategoryPage({ params }: { params: Promise<{ section: string }> }) {
  const { section: slug } = await params;
  const group = getFeeGroup(slug);
  if (!group) notFound();
  const directoryPage = await getRequiredDirectoryPage(`platform-fees/${slug}`);
  const content = feeCategoryContent[slug];
  if (!content) throw new Error(`Published fee category has no content: ${slug}`);
  // A failed load must surface as an error, never as a cacheable page.
  const directory = await getFeeDirectory();
  const sections = directory.sections.filter(section => section.group_name === group.name);
  if (!sections.length) notFound();
  const path = groupPath(group.name);
  const blocks = sections.map(section => {
    const sectionEntries = directory.entries.filter(entry => entry.section_id === section.id);
    const checkedAt = sectionCheckedAt(sectionEntries);
    const items = sectionEntries.map(entry => ({
      id: entry.id,
      text: `${entry.name} ${entry.card.tag} ${entry.summary}`.toLocaleLowerCase('en-US'),
      card: <FeeCard key={entry.id} entry={entry} />,
    }));
    return {
      anchor: sectionSlug(section.id),
      href: sectionPath(section),
      name: section.name,
      intro: section.intro,
      icon: section.icon,
      checkedLabel: checkedAt ? <p key={`${section.id}-checked`} className={styles.checked}>Last checked <time dateTime={checkedAt}>{dateFormat.format(new Date(checkedAt))}</time></p> : null,
      sources: <FeeSources key={`${section.id}-sources`}><FeeSourceList entries={sectionEntries} section={section} /></FeeSources>,
      items,
    };
  });

  const { Intro, Article } = content;
  return <FeeShell
    directoryPage={directoryPage}
    intro={<Intro />}
    article={Article ? <Article /> : undefined}
    group={group}
    anchors={blocks.map(block => ({
      href: block.href,
      label: block.name,
      icon: <SectionIcon key={block.anchor} icon={block.icon} size={15} />,
      text: block.items.map(item => item.text).join('\n'),
    }))}
  >
    <FeeFilters action={path} />
    <div className={styles.overview}>
      <p aria-live="polite"><FeeMatchCount items={blocks.flatMap(block => block.items)} label="platforms" /></p>
      <p>US / USD unless labelled</p>
    </div>
    <FeeCategoryBody path={path} sections={blocks} />
  </FeeShell>;
}
