/** Only editorial text, never paths, identifiers, dates, or URLs. */
const textFields = new Set([
  'title', 'meta_title', 'meta_description', 'label', 'card_name', 'card_description',
  'description', 'navigationLabel', 'sidebarLabel', 'navigation_label', 'sidebar_label',
]);

/** Resolve at page render time, after persistent data caches. UTC is intentional. */
export function currentText(text, now = new Date()) {
  return text.replace(/\[(year|month)\]/g, (_, token) => token === 'year'
    ? String(now.getUTCFullYear()).padStart(4, '0')
    : new Intl.DateTimeFormat('en-US', { month: 'long', timeZone: 'UTC' }).format(now));
}

/** Copy a page snapshot without changing the raw cached/database value. */
export function resolvePageText(value, now = new Date()) {
  if (Array.isArray(value)) return value.map(item => resolvePageText(item, now));
  if (!value || typeof value !== 'object' || value instanceof Date) return value;
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [key,
    textFields.has(key) && typeof item === 'string' ? currentText(item, now) : resolvePageText(item, now),
  ]));
}
