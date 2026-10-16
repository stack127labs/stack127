import { normalizeDomain } from './lib.mjs';
import { parseAdsTxt } from './ads-txt.mjs';
import { buildAdsTxtPreview } from './site-facts.mjs';

export function summarizeAdsTxt(text) {
  const parsed = parseAdsTxt(text, { deduplicate: false });
  const sourceLines = text.replace(/\r\n|\r/g, '\n').split('\n');
  if (sourceLines.at(-1) === '') sourceLines.pop();
  const sellers = new Map();
  for (const seller of parsed.sellers) sellers.set(seller.adSystem, (sellers.get(seller.adSystem) ?? 0) + 1);
  return { summary_version: 1, lines: sourceLines.length, companies: sellers.size,
    direct: parsed.sellers.filter(s => s.relationship === 'DIRECT').length,
    reseller: parsed.sellers.filter(s => s.relationship === 'RESELLER').length,
    invalid: parsed.errors.length, seller_domains: [...sellers.keys()].sort(),
    top_sellers: [...sellers].map(([name, lines]) => ({ name, lines })).sort((a,b) => b.lines-a.lines || a.name.localeCompare(b.name)).slice(0,20),
    preview: text.includes('\0') ? null : buildAdsTxtPreview(text) };
}

export function businessName(value) {
  if (typeof value !== 'string') return null;
  const name = value.replace(/\s+/g, ' ').trim();
  return name.length <= 200 && !/[<>\x00-\x1f]/.test(name)
    && / (?:LLC|Ltd\.?|Inc\.?|Limited|GmbH|Corporation|Corp\.?)$/i.test(name) ? name : null;
}

export function registrationDate(body, now = Date.now(), expectedDomain = null) {
  if (body?.objectClassName !== 'domain') return null;
  if (expectedDomain && ![body.ldhName,body.unicodeName].some(name=>normalizeDomain(name)===expectedDomain)) return null;
  const dates = (Array.isArray(body.events) ? body.events : []).filter(e => e.eventAction === 'registration')
    .map(e => e.eventDate).filter(d => typeof d === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(d) && Number.isFinite(Date.parse(d)) && Date.parse(d) <= now && new Date(`${d.slice(0,10)}T00:00:00Z`).toISOString().slice(0,10) === d.slice(0,10));
  if (!dates.length) return null;
  return new Date(Math.min(...dates.map(Date.parse))).toISOString().slice(0,10);
}

// Input is a CrUX rank magnitude, never a row position or a measured visit count.
export function cruxBucket(rank) {
  const value = Number(rank);
  if (![1000,5000,10000,50000,100000,500000,1000000].includes(value)) return null;
  return value <= 10000 ? 'top-10k' : value <= 100000 ? 'top-100k' : 'top-1m';
}

function attributes(tag) {
  return Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g)]
    .map(m => [m[1].toLowerCase(), m[2] ?? m[3] ?? m[4]]));
}
function text(value, limit) {
  return value?.replace(/<[^>]*>/g,' ').replace(/&(?:amp|lt|gt|quot|apos|#39|nbsp);/g, e => ({'&amp;':'&','&lt;':'<','&gt;':'>','&quot;':'"','&apos;':"'",'&#39;':"'",'&nbsp;':' '}[e]))
    .replace(/&#(x[\da-f]+|\d+);/gi, (whole,n) => { const point = n[0].toLowerCase() === 'x' ? parseInt(n.slice(1),16) : Number(n); return point > 0 && point <= 0x10ffff ? String.fromCodePoint(point) : whole; })
    .replace(/\s+/g,' ').trim().slice(0,limit) || null;
}

export function homepageFacts(html, finalUrl) {
  // Never classify a bot challenge or generic error document as the publisher's page.
  if (/just a moment\.\.\.|cf-chl-|verify you are human|access denied|<title>attention required/i.test(html.slice(0,20000))) return null;
  const meta = [...html.matchAll(/<meta\b[^>]*>/gi)].map(m => attributes(m[0]));
  const generator = meta.find(m => m.name?.toLowerCase() === 'generator')?.content ?? '';
  const signatures = [
    ['WordPress', /(?:src|href)\s*=\s*["'][^"']*\/wp-(?:content|includes)\//i, /wordpress/i],
    ['Shopify', /cdn\.shopify\.com\/|Shopify\.shop\s*=/i, /shopify/i],
    ['Squarespace', /static\d?\.squarespace\.com\/|squarespace-cdn\.com\//i, /squarespace/i],
    ['Wix', /static\.wixstatic\.com\/|wix-bolt|wixsite\.com/i, /wix/i],
    ['Ghost', /ghost\.io\/(?:ghost|public)\//i, /^ghost(?:\s|$)/i],
    ['Webflow', /\bdata-wf-(?:site|page)\s*=/i, /webflow/i],
    ['Next.js', /(?:src|href)\s*=\s*["'][^"']*\/_next\/|id=["']__NEXT_DATA__["']/i, /next\.js/i],
    ['Astro', /<astro-island\b|\bdata-astro-cid-|(?:src|href)\s*=\s*["'][^"']*\/_astro\//i, /astro/i],
    ['Blogger', /(?:www\.)?blogger\.com\/static\/|\bblogger\.widgets\b/i, /blogger/i],
    ['Drupal', /\bdata-drupal-selector=|Drupal\.settings|drupalSettings/i, /drupal/i],
    ['Joomla', /\/media\/system\/js\/core\.min\.js/i, /joomla/i],
  ];
  const platform = signatures.find(([,signature, gen]) => gen.test(generator) || signature.test(html))?.[0] ?? null;
  const links = [...html.matchAll(/<link\b[^>]*>/gi)].map(m => attributes(m[0]));
  const icon = links.find(l => /(?:^|\s)(?:icon|apple-touch-icon)(?:\s|$)/i.test(l.rel ?? '') && l.href)?.href;
  let favicon = null;
  try { const url = new URL(icon, finalUrl); if (icon && ['http:','https:'].includes(url.protocol) && !url.username && !url.password) favicon = url.href; } catch {}
  const lang = attributes(/<html\b[^>]*>/i.exec(html)?.[0] ?? '').lang;
  return { title: text(/<title\b[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1],500),
    description: text(meta.find(m => m.name?.toLowerCase() === 'description')?.content,2000),
    h1: text(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i.exec(html)?.[1],500),
    language: lang && /^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$/i.test(lang) ? lang.toLowerCase() : null,
    platform, favicon };
}
// RDAP bootstrap keys are root-zone TLDs, not multi-label public suffixes.
export const registrationTld=domain=>domain.toLowerCase().split('.').at(-1);
