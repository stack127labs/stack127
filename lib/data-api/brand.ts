import { brandAssets } from './brand-assets.generated.ts';

export const brandKit = {
  name: 'stack127',
  credit: 'Ad network data from stack127',
  source_line: 'Source: stack127.com/ad-networks · data as of <as_of date>',
  url: 'https://stack127.com/ad-networks',
  default_theme: 'dark',
  ...brandAssets,
  chart_rules: [
    'Highlight the main series with the accent; use neutral steps for other series.',
    'Use the lightest neutral step for unknown or missing values.',
    'Use no gradients, shadows or 3D.',
    'Label units and the data answer\'s as_of date. Use its more specific page URL in the source line when available.',
    'Place a small logo in a corner. Never stretch or recolor it; keep the #bafc3c dot.',
  ],
  tone: 'Plain, direct, no hype.',
};
