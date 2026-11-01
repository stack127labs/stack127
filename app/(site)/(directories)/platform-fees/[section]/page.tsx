import { notFound } from 'next/navigation';
import { getRequiredDirectoryPage } from '@/lib/directory-pages';
import { getFeeDirectory } from '@/lib/platform-fees/queries';
import { sectionCheckedAt, type FeeSection } from '@/lib/platform-fees/model';
import { feeGroups, getFeeGroup, groupPath } from '@/lib/platform-fees/groups';
import { sectionPath, sectionSlug } from '@/lib/platform-fees/section-routes';
import { FeeCategoryBody, FeeFilters, type FeeCategorySection } from '../filters';
import { FeeShell, SectionIcon } from '../components';
import { feeCardView, feeDate, feeSearchText } from '../card-view';
import { feeCategoryContent } from './content';

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
  const blocks: Array<FeeCategorySection & { icon: FeeSection['icon'] }> = sections.map(section => {
    const sectionEntries = directory.entries.filter(entry => entry.section_id === section.id);
    return {
      anchor: sectionSlug(section.id),
      href: sectionPath(section),
      name: section.name,
      intro: section.intro,
      icon: section.icon,
      checked: feeDate(sectionCheckedAt(sectionEntries)),
      fields: section.fields.map(field => field.label),
      cards: sectionEntries.map(feeCardView),
    };
  });

  const { Intro, Lead, Article } = content;
  return <FeeShell
    directoryPage={directoryPage}
    intro={<Intro />}
    lead={Lead ? <Lead /> : undefined}
    article={Article ? <Article /> : undefined}
    group={group}
    anchors={blocks.map(block => ({
      href: block.href,
      label: block.name,
      icon: <SectionIcon key={block.anchor} icon={block.icon} size={15} />,
      text: block.cards.map(feeSearchText).join('\n'),
    }))}
  >
    <FeeFilters action={path} />
    <FeeCategoryBody path={path} sections={blocks} />
  </FeeShell>;
}
