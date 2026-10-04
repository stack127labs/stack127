import type { FeeSection } from './model.ts';
import { groupPath } from './groups.ts';

// Keep section anchors stable when categories combine several sections.
export const sectionSlugs: Record<string, string> = {
  'watch-apps-watch-faces-and-device-themes': 'watch-apps-and-themes',
  'apps-plugins-and-integrations': 'app-marketplaces',
  'software-saas-and-api-marketplaces': 'software-marketplaces',
  'software-and-saas-checkout-services': 'software-checkout',
  'datasets-and-ai-training-data': 'datasets',
  'digital-download-stores-and-marketplaces': 'digital-downloads',
  'online-stores-and-checkout-tools': 'online-stores',
  'graphics-illustrations-and-design-assets': 'design-assets',
  'website-themes-and-templates': 'website-templates',
  'productivity-templates-and-ui-kits': 'templates-and-ui-kits',
  'source-code-scripts-and-developer-components': 'code-marketplaces',
  '3d-models-materials-and-textures': '3d-models',
  'game-mods-worlds-and-virtual-items': 'game-mods-and-items',
  'photos-and-stock-images': 'stock-photos',
  'stock-video-and-motion-templates': 'stock-video',
  'stock-music-sound-effects-and-sample-packs': 'stock-audio',
  'music-sales-and-distribution': 'music-distribution',
  'ebooks-and-print-books': 'books',
  'comics-and-serialized-fiction': 'comics-and-fiction',
  'courses-and-workshops-with-a-marketplace': 'course-marketplaces',
  'tutoring-and-live-teaching': 'tutoring',
  'course-stores-and-teaching-platforms': 'course-platforms',
  'teaching-resources-and-worksheets': 'teaching-resources',
  'online-event-and-workshop-tickets': 'event-tickets',
  'sewing-knitting-and-craft-patterns': 'craft-patterns',
  'paid-communities-and-memberships': 'communities',
  'fan-subscriptions-and-exclusive-content': 'fan-subscriptions',
  'newsletters-and-paid-writing': 'newsletters',
  'video-and-livestream-creators': 'video-creators',
  'selling-video-subscriptions-rentals-and-downloads': 'video-sales',
  'podcast-subscriptions-and-monetization': 'podcasts',
  'tips-and-creator-support': 'tips',
  'coaching-consultations-and-paid-sessions': 'coaching',
  'digital-freelance-services-and-commissions': 'freelance-services',
  'crowdfunding-creative-projects': 'crowdfunding',
  'ai-prompts-and-paid-ai-creations': 'ai-creations',
  'creator-merchandise-and-print-on-demand': 'merch-and-print-on-demand',
  'payment-links-and-processing': 'payments',
};

export function sectionSlug(id: string): string {
  return sectionSlugs[id] ?? id;
}

export function sectionPath(section: Pick<FeeSection, 'id' | 'group_name'>): string {
  return `${groupPath(section.group_name)}#${sectionSlug(section.id)}`;
}
