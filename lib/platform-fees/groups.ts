import type { FeeSection } from './model.ts';

export type FeeGroup = {
  slug: string;
  name: FeeSection['group_name'];
  icon: FeeSection['icon'];
};

export const feeGroups: FeeGroup[] = [
  {
    slug: 'apps-and-software', name: 'Apps and software', icon: 'Monitor',
  },
  {
    slug: 'digital-products-and-stores', name: 'Digital products and stores', icon: 'ShoppingCart',
  },
  {
    slug: 'creative-assets', name: 'Creative assets', icon: 'Palette',
  },
  {
    slug: 'music-and-audio', name: 'Music and audio', icon: 'Music',
  },
  {
    slug: 'writing-and-books', name: 'Writing and books', icon: 'BookOpen',
  },
  {
    slug: 'teaching-and-courses', name: 'Teaching and courses', icon: 'GraduationCap',
  },
  {
    slug: 'creators-and-communities', name: 'Creators and communities', icon: 'Users',
  },
  {
    slug: 'payments', name: 'Payments', icon: 'CreditCard',
  },
];

export function getFeeGroup(slug: string): FeeGroup | undefined {
  return feeGroups.find(group => group.slug === slug);
}

export function groupPath(name: string): string {
  const group = feeGroups.find(group => group.name === name);
  if (!group) throw new Error(`Unknown platform fee group: ${name}`);
  return `/platform-fees/${group.slug}`;
}
