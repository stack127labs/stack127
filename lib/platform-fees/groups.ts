import type { FeeSection } from './model.ts';

export type FeeGroup = {
  slug: string;
  name: FeeSection['group_name'];
  // Visible h1. Without it the page uses the group name.
  title?: string;
  icon: FeeSection['icon'];
  intro: string;
  meta_title: string;
  meta_description: string;
};

export const feeGroups: FeeGroup[] = [
  {
    slug: 'apps-and-software', name: 'Apps and software', icon: 'Monitor',
    intro: 'Compare fees for selling apps, games, software, code and datasets. Choose a section to compare platforms that sell the same kind of product.',
    meta_title: 'App and software platform fees compared',
    meta_description: 'Compare app store commissions, game marketplace fees, software selling costs and developer account charges. Check rates and official sources.',
  },
  {
    slug: 'digital-products-and-stores', name: 'Digital products and stores', icon: 'ShoppingCart',
    title: '<mark>Digital product</mark> selling fees: Gumroad, Etsy, Shopify and more',
    intro: 'Compare what it costs to sell downloads, run an online store, sell video, charge for AI tools, or sell merch. Each card shows the platform\'s cut, what you pay to start, and card fees, with links to official sources. Pick a section below, or search for a platform by name.',
    meta_title: 'Digital product selling fees: Gumroad, Etsy, Shopify and more',
    meta_description: 'Compare what Gumroad, Payhip, Etsy, Shopify, and Printful charge to sell downloads, video, AI tools, and merch, with card fees, tax handling, and sources.',
  },
  {
    slug: 'creative-assets', name: 'Creative assets', icon: 'Palette',
    intro: 'Compare marketplaces for design assets, fonts, templates, 3D files, photos and video. Each section keeps commissions, royalties and other charges in their stated units.',
    meta_title: 'Creative asset marketplace fees compared',
    meta_description: 'Compare fees and royalties for selling design assets, fonts, templates, 3D files, stock photos and video. Check conditions and official sources.',
  },
  {
    slug: 'music-and-audio', name: 'Music and audio', icon: 'Music',
    intro: 'Compare platforms for stock audio, beats, music distribution and podcasts. Check whether a rate is a commission, a royalty share or a distribution charge.',
    meta_title: 'Music and audio platform fees compared',
    meta_description: 'Compare stock audio marketplace fees, beat selling costs, music distribution charges and podcast monetization rates. Check official sources.',
  },
  {
    slug: 'writing-and-books', name: 'Writing and books', icon: 'BookOpen',
    intro: 'Compare platforms for books, audiobooks, fiction and paid newsletters. Check royalties, distribution costs and subscription charges within each section.',
    meta_title: 'Book publishing and paid writing fees compared',
    meta_description: 'Compare ebook and print publishing costs, audiobook royalties, fiction platform fees and paid newsletter charges. Check official sources.',
  },
  {
    slug: 'teaching-and-courses', name: 'Teaching and courses', icon: 'GraduationCap',
    intro: 'Compare course platforms, tutoring marketplaces, teaching resources, event tickets and coaching services. Check commissions, plan costs and payment charges.',
    meta_title: 'Course and teaching platform fees compared',
    meta_description: 'Compare course marketplace commissions, teaching platform costs, tutoring fees, workshop ticket charges and coaching services. Check official sources.',
  },
  {
    slug: 'creators-and-communities', name: 'Creators and communities', icon: 'Users',
    intro: 'Compare platforms for memberships, fan subscriptions, video, tips, freelance work and crowdfunding. Choose a section to check the fees for your source of income.',
    meta_title: 'Creator and community platform fees compared',
    meta_description: 'Compare membership fees, creator revenue shares, tipping charges, freelance commissions and crowdfunding costs. Check conditions and official sources.',
  },
  {
    slug: 'payments', name: 'Payments', icon: 'CreditCard',
    intro: 'Compare software checkout services and payment processors. Keep platform charges, processing fees and merchant of record services separate when choosing how to accept payments.',
    meta_title: 'Payment processing and software checkout fees compared',
    meta_description: 'Compare payment processor fees, payment link charges and software checkout services. Check fixed charges, regional rates and official sources.',
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
