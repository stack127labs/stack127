export const factIcons = ['AppWindow', 'WalletCards', 'ReceiptText', 'CreditCard', 'CircleDollarSign', 'BanknoteArrowDown', 'Store', 'ShoppingCart', 'MonitorSmartphone', 'Globe', 'UserCheck', 'LockKeyhole', 'FileKey', 'Gauge', 'Network', 'Files', 'SlidersHorizontal', 'Package', 'Cpu', 'Info'] as const;
export type FactIcon = typeof factIcons[number];
export type FeeField = { key: string; label: string; icon: FactIcon };
export type FeeFact = { key: string; value: string; state: 'verified' | 'unverified' | 'not_public' | 'variable' | 'not_applicable'; source_url?: string; checked_at?: string };
export type FeeSource = { url: string; label: string };
// Percentage fees show the platform take. Fixed pay, pool shares and base
// costs are explicitly labelled and do not imply a seller percentage payout.
// extra holds a fixed amount shown beside the percentage, such as "+ 50¢".
export type ReceiptRate = { value: string; extra?: string; percent: number | null; label: string; note?: string; fact_key: string };
export type ReceiptLine = { label: string; value: string; fact_key: string };
export type ReceiptCard = {
  owner: string;
  tag: string;
  note?: string;
  take: ReceiptRate;
  second?: ReceiptRate;
  lines: ReceiptLine[];
  groups: { label: string; rates: ReceiptRate[] }[];
};
export const sectionIcons = ['Smartphone', 'Monitor', 'Watch', 'Gamepad2', 'Headset', 'Puzzle', 'Cloud', 'CreditCard', 'Database', 'Download', 'ShoppingCart', 'Palette', 'Type', 'LayoutTemplate', 'Code', 'Box', 'Camera', 'Video', 'Music', 'BookOpen', 'GraduationCap', 'Calendar', 'Files', 'Users', 'Heart', 'Mail', 'Mic', 'Coffee', 'Briefcase', 'Cpu', 'Shirt'] as const;
export const sectionGroups = ['Apps and software', 'Digital products and stores', 'Creative assets', 'Music and audio', 'Writing and books', 'Teaching and courses', 'Creators and communities', 'Payments'] as const;
export type FeeSection = {
  id: string;
  name: string;
  sort_order: number;
  fields: FeeField[];
  icon: typeof sectionIcons[number];
  group_name: typeof sectionGroups[number];
  intro: string;
  meta_title: string;
  meta_description: string;
  related_sections: string[];
};
export type FeeEntry = {
  id: string; section_id: string; name: string; summary: string;
  website_url: string; icon_path: string | null; facts: FeeFact[];
  sources: FeeSource[]; checked_at: string | null; comparison_basis: string;
  fee_percent: number | null; fee_basis: string | null; sort_order: number;
  card: ReceiptCard;
};
export type FeeDirectory = { sections: FeeSection[]; entries: FeeEntry[] };

const states = new Set(['verified', 'unverified', 'not_public', 'variable', 'not_applicable']);

// Rates not already shown as the big number or the second rate.
export function hiddenRateCount(receipt: ReceiptCard): number {
  const remaining = receipt.groups.flatMap(group => group.rates).slice();
  for (const shown of [receipt.take, receipt.second]) {
    if (!shown) continue;
    const index = remaining.findIndex(row => row.value === shown.value && row.fact_key === shown.fact_key && row.extra === shown.extra);
    if (index >= 0) remaining.splice(index, 1);
  }
  return remaining.length;
}

// Only the verified headline platform percentage is comparable here. This is
// not a total-cost range: fixed charges, other rates and unknown fees stay out.
export function sectionFeeRange(entries: FeeEntry[]): { min: number; max: number; count: number } | null {
  const rates = entries.flatMap(entry => {
    const rate = entry.card.take;
    return rate.percent !== null && entry.facts.find(fact => fact.key === rate.fact_key)?.state === 'verified' ? [rate.percent] : [];
  });
  return rates.length ? { min: Math.min(...rates), max: Math.max(...rates), count: rates.length } : null;
}

export function sectionCheckedAt(entries: FeeEntry[]): string | null {
  return entries.reduce<string | null>((latest, entry) => entry.checked_at && (!latest || entry.checked_at > latest) ? entry.checked_at : latest, null);
}

// A rate gets a bar only when its fact is verified and the bar matches the written value.
function validateReceiptRate(rate: ReceiptRate, entry: FeeEntry, where: string) {
  const fact = entry.facts.find(item => item.key === rate.fact_key);
  if (!fact || !rate.value.trim() || rate.value.length > (rate.percent === null ? 24 : 16) || !rate.label.trim() || rate.label.length > 48 || (rate.note?.length ?? 0) > 48 || (rate.extra?.length ?? 0) > 12) throw new Error(`Invalid receipt rate: ${entry.id}/${where}`);
  if (rate.percent === null) return;
  if (fact.state !== 'verified' || !Number.isFinite(rate.percent) || rate.percent < 0 || rate.percent > 100 || Number(rate.value.match(/^(\d+(?:\.\d+)?)%$/)?.[1]) !== rate.percent) throw new Error(`Invalid receipt bar: ${entry.id}/${where}`);
}

function validateReceipt(receipt: ReceiptCard, entry: FeeEntry) {
  if (!receipt.owner.trim() || receipt.owner.length > 20) throw new Error(`Invalid receipt owner: ${entry.id}`);
  if (!receipt.tag.trim() || receipt.tag.length > 36 || (receipt.note?.length ?? 0) > 160) throw new Error(`Invalid receipt text: ${entry.id}`);
  if (entry.sources.some(source => source.label.length > 40)) throw new Error(`Source name too long: ${entry.id}`);
  validateReceiptRate(receipt.take, entry, 'take');
  if (receipt.second) validateReceiptRate(receipt.second, entry, 'second');
  if (receipt.lines.length !== 3 || receipt.lines.some(line => !line.label.trim() || line.label.length > 16 || !line.value.trim() || line.value.length > 28 || !entry.facts.some(fact => fact.key === line.fact_key))) throw new Error(`Invalid receipt lines: ${entry.id}`);
  if (receipt.groups.length > 5 || receipt.groups.some(group => !group.label.trim() || group.label.length > 48 || !group.rates.length)) throw new Error(`Invalid receipt groups: ${entry.id}`);
  receipt.groups.forEach((group, i) => group.rates.forEach((rate, j) => validateReceiptRate(rate, entry, `${i}.${j}`)));
  if (receipt.groups.flatMap(group => group.rates).length > 12) throw new Error(`Too many receipt rates: ${entry.id}`);
}
function secureUrl(value: string) {
  try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password; } catch { return false; }
}
export function validateDirectory(data: FeeDirectory): void {
  const sections = new Map(data.sections.map(section => [section.id, section]));
  if (sections.size !== data.sections.length) throw new Error('Duplicate section');
  const ids = new Set<string>();
  for (const section of data.sections) {
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(section.id) || !section.name.trim()) throw new Error('Invalid section');
    if (!sectionIcons.includes(section.icon) || !sectionGroups.includes(section.group_name) || !section.intro?.trim() || !section.meta_title?.trim() || !section.meta_description?.trim()) throw new Error(`Missing section presentation: ${section.id}`);
    if (!Array.isArray(section.related_sections) || new Set(section.related_sections).size !== section.related_sections.length || section.related_sections.some(id => id === section.id || !sections.has(id))) throw new Error(`Invalid related sections: ${section.id}`);
    if (section.fields.length < 4 || section.fields.length > 5 || new Set(section.fields.map(field => field.key)).size !== section.fields.length) throw new Error(`Invalid fields: ${section.id}`);
    if (section.fields.some(field => !field.label.trim() || !factIcons.includes(field.icon))) throw new Error(`Invalid fact icon: ${section.id}`);
  }
  for (const entry of data.entries) {
    const section = sections.get(entry.section_id);
    if (!section || ids.has(entry.id) || !entry.name.trim()) throw new Error(`Invalid entry: ${entry.id}`);
    ids.add(entry.id);
    if (!secureUrl(entry.website_url) || entry.sources.some(source => !secureUrl(source.url) || !source.label.trim())) throw new Error(`Invalid source URL: ${entry.id}`);
    if (entry.icon_path !== null && !/^\/platform-fees\/icons\/[a-z0-9-]+\.(png|jpg|webp|ico|svg)$/.test(entry.icon_path)) throw new Error(`Invalid icon path: ${entry.id}`);
    if (entry.facts.length !== section.fields.length || entry.facts.some((fact, i) => fact.key !== section.fields[i].key || !fact.value.trim() || !states.has(fact.state))) throw new Error(`Inconsistent facts: ${entry.id}`);
    if (entry.checked_at !== null && (!/^\d{4}-\d{2}-\d{2}$/.test(entry.checked_at) || Number.isNaN(Date.parse(entry.checked_at)) || new Date(entry.checked_at).toISOString().slice(0, 10) !== entry.checked_at)) throw new Error(`Invalid checked date: ${entry.id}`);
    if (entry.facts.some(fact => fact.state !== 'unverified') && (!entry.checked_at || !entry.sources.length)) throw new Error(`Missing research source: ${entry.id}`);
    for (const fact of entry.facts) {
      if (fact.source_url !== undefined || fact.checked_at !== undefined) {
        if (!fact.source_url || !secureUrl(fact.source_url) || !entry.sources.some(source => source.url === fact.source_url) || !fact.checked_at || !/^\d{4}-\d{2}-\d{2}$/.test(fact.checked_at) || Number.isNaN(Date.parse(fact.checked_at)) || new Date(fact.checked_at).toISOString().slice(0, 10) !== fact.checked_at || !entry.checked_at || fact.checked_at > entry.checked_at) throw new Error(`Invalid fact source: ${entry.id}/${fact.key}`);
      }
    }
    if (entry.fee_percent !== null && (!Number.isFinite(entry.fee_percent) || entry.fee_percent < 0 || entry.fee_percent > 100 || !entry.fee_basis?.trim() || !entry.checked_at || !entry.sources.length || !entry.facts.some(fact => fact.state === 'verified'))) throw new Error(`Invalid fee visualization: ${entry.id}`);
    if (entry.fee_percent === null && entry.fee_basis !== null) throw new Error(`Fee basis without percentage: ${entry.id}`);
    if (!entry.card) throw new Error(`Missing card: ${entry.id}`);
    validateReceipt(entry.card, entry);
  }
}
export function filterDirectory(data: FeeDirectory, query: string, sectionId: string): FeeDirectory {
  const needle = query.trim().toLocaleLowerCase('en-US').slice(0, 160);
  const entries = data.entries.filter(entry => (!sectionId || entry.section_id === sectionId) && (!needle || `${entry.name} ${entry.card.tag} ${entry.summary}`.toLocaleLowerCase('en-US').includes(needle)));
  const present = new Set(entries.map(entry => entry.section_id));
  return { sections: data.sections.filter(section => present.has(section.id)), entries };
}
