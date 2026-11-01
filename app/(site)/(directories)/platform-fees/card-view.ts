import { hiddenRateCount, type FeeEntry, type FeeSource, type ReceiptRate } from '@/lib/platform-fees/model';

// What a fee card and its "Sources and dates" entry render, and nothing else.
// The category page sends this compact data to the browser once. Sending the
// rendered card tree instead made each category page megabytes larger.
export type FeeDate = { iso: string; label: string };
export type FeeRateView = Pick<ReceiptRate, 'value' | 'extra' | 'percent' | 'label' | 'note'>;
export type FeeCardView = {
  id: string;
  name: string;
  /** Searched with the name and tag; not shown on the card. */
  summary: string;
  url: string;
  icon: string | null;
  tag: string;
  note?: string;
  take: FeeRateView;
  second?: FeeRateView;
  lines: { label: string; value: string }[];
  groups: { label: string; rates: FeeRateView[] }[];
  /** Label of the link that opens all rates and sources. */
  more: string;
  checked: FeeDate | null;
  sources: FeeSource[];
  /** In the order of the section's field labels. `source` indexes `sources`. */
  facts: { value: string; source?: number }[];
};

// Formatted on the server so the browser's date data cannot change the text during hydration.
const dateFormat = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
export function feeDate(iso: string | null): FeeDate | null {
  return iso ? { iso, label: dateFormat.format(new Date(iso)) } : null;
}

function rate({ value, extra, percent, label, note }: ReceiptRate): FeeRateView {
  return { value, percent, label, ...(extra ? { extra } : {}), ...(note ? { note } : {}) };
}

export function feeCardView(entry: FeeEntry): FeeCardView {
  const receipt = entry.card;
  const hidden = hiddenRateCount(receipt);
  const sources = entry.sources.length
    ? entry.sources.filter((source, index, all) => all.findIndex(item => item.url === source.url) === index).map(({ url, label }) => ({ url, label }))
    : [{ url: entry.website_url, label: 'Official website' }];
  return {
    id: entry.id,
    name: entry.name,
    summary: entry.summary,
    url: entry.website_url,
    icon: entry.icon_path,
    tag: receipt.tag,
    ...(receipt.note ? { note: receipt.note } : {}),
    take: rate(receipt.take),
    ...(receipt.second ? { second: rate(receipt.second) } : {}),
    lines: receipt.lines.map(({ label, value }) => ({ label, value })),
    groups: receipt.groups.map(group => ({ label: group.label, rates: group.rates.map(rate) })),
    more: hidden > 0 ? `+ ${hidden} more rate${hidden > 1 ? 's' : ''}` : receipt.groups.length ? 'All rates and sources' : 'Sources',
    checked: feeDate(entry.checked_at),
    sources,
    facts: entry.facts.map(fact => {
      // Validation guarantees every fact source is one of the entry's sources.
      const source = fact.source_url ? sources.findIndex(item => item.url === fact.source_url) : -1;
      return source >= 0 ? { value: fact.value, source } : { value: fact.value };
    }),
  };
}

export function feeSearchText(card: Pick<FeeCardView, 'name' | 'tag' | 'summary'>): string {
  return `${card.name} ${card.tag} ${card.summary}`.toLocaleLowerCase('en-US');
}
