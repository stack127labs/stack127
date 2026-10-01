#!/usr/bin/env node
// Cache icons declared by official sites. Missing icons stay missing.
import { access, readFile, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { parseArgs } from 'node:util';
import sharp from 'sharp';

const { values } = parseArgs({ options: { apply: { type: 'boolean', default: false }, hosts: { type: 'string' } } });
const directoryUrl = new URL('./data/directory.json', import.meta.url);
const sourcesUrl = new URL('./data/icon-sources.json', import.meta.url);
const data = JSON.parse(await readFile(directoryUrl, 'utf8'));
const sources = JSON.parse(await readFile(sourcesUrl, 'utf8').catch(() => '{}'));
const officialSites = {
  'dev.epicgames.com': 'https://store.epicgames.com/',
  'partners.playstation.net': 'https://www.playstation.com/',
  'exchange.adobe.com': 'https://www.adobe.com/',
  'docs.aws.amazon.com': 'https://aws.amazon.com/marketplace/',
  'docs.rapidapi.com': 'https://rapidapi.com/',
  'docs.apify.com': 'https://apify.com/',
  'docs.snowflake.com': 'https://www.snowflake.com/',
  'help.nas.com': 'https://nas.com/',
  'contributor.flaticon.com': 'https://www.flaticon.com/',
  'create.roblox.com': 'https://www.roblox.com/',
  'wiki.gdevelop.io': 'https://gdevelop.io/',
  'docs.mod.io': 'https://mod.io/',
  'contribute.storyblocks.com': 'https://www.storyblocks.com/',
  'artists.soundcloud.com': 'https://soundcloud.com/',
  'creator-support.discord.com': 'https://discord.com/',
  'support.tiktok.com': 'https://www.tiktok.com/',
};

async function exists(path) { try { await access(path); return true; } catch { return false; } }
const selected = values.hosts?.split(',');
const groups = new Map();
for (const entry of data.entries) {
  if (entry.icon_path && await exists(`public${entry.icon_path}`)) continue;
  const host = new URL(entry.website_url).hostname;
  if (selected && !selected.includes(host)) continue;
  const group = groups.get(host) ?? [];
  group.push(entry);
  groups.set(host, group);
}
console.log(JSON.stringify({ missingCards: [...groups.values()].flat().length, sites: groups.size, apply: values.apply }));
if (!values.apply) process.exit(0);

async function request(url, allowErrorPage = false) {
  const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', Accept: '*/*' }, signal: AbortSignal.timeout(12000) });
  if (!response.ok && !allowErrorPage) throw new Error(`HTTP ${response.status}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length > 3000000) throw new Error('Asset too large');
  return { url: response.url, bytes };
}
function attributes(tag) {
  return Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g)].map(m => [m[1].toLowerCase(), (m[2] ?? m[3] ?? m[4]).replaceAll('&amp;', '&')]));
}
async function normalize(bytes) {
  // libvips does not read ICO; Pillow decodes its largest embedded image.
  if (bytes.readUInt32LE(0) === 65536) {
    bytes = await new Promise((resolve, reject) => {
      const child = spawn('python3', ['-c', 'import sys,io; from PIL import Image; im=Image.open(io.BytesIO(sys.stdin.buffer.read())); im.save(sys.stdout.buffer,"PNG")']);
      const chunks = [];
      child.stdout.on('data', chunk => chunks.push(chunk));
      child.stderr.resume();
      child.on('error', reject);
      child.on('close', code => code === 0 ? resolve(Buffer.concat(chunks)) : reject(new Error('Invalid ICO')));
      child.stdin.end(bytes);
    });
  }
  const metadata = await sharp(bytes, { limitInputPixels: 4000000 }).metadata();
  if (!metadata.width || !metadata.height || metadata.width < 16 || metadata.height < 16 || metadata.width / metadata.height > 2 || metadata.height / metadata.width > 2) throw new Error('Not an app icon');
  let image = sharp(bytes, { limitInputPixels: 4000000 }).resize(96, 96, { fit: 'contain', background: '#00000000' });
  const { data: pixels } = await image.clone().ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let alpha = 0, luminance = 0, transparent = 0;
  for (let i = 0; i < pixels.length; i += 4) {
    const opacity = pixels[i + 3] / 255;
    alpha += opacity;
    luminance += opacity * (pixels[i] * 0.2126 + pixels[i + 1] * 0.7152 + pixels[i + 2] * 0.0722);
    if (opacity < 0.5) transparent++;
  }
  // Keep monochrome marks readable in both page themes.
  if (transparent > pixels.length / 40 && alpha > 0) {
    if (luminance / alpha < 90) image = image.flatten({ background: '#f5f5f5' });
    else if (luminance / alpha > 190) image = image.flatten({ background: '#191919' });
  }
  return image.png({ compressionLevel: 9 }).toBuffer();
}
let index = 0, added = 0;
const jobs = [...groups.entries()];
async function worker() {
  while (index < jobs.length) {
    const [host, entries] = jobs[index++];
    const pageUrl = officialSites[host] ?? entries[0].website_url;
    const origin = new URL(pageUrl).origin;
    const candidates = [];
    if (sources[host]?.asset_url) candidates.push(sources[host].asset_url);
    let discoveredAt = sources[host]?.website_url ?? pageUrl;
    const pageHost = new URL(pageUrl).hostname;
    const domain = pageHost.split('.').slice(-(/\.(co\.uk|com\.au|co\.kr)$/.test(pageHost) ? 3 : 2)).join('.');
    const relatedPages = entries.flatMap(entry => entry.sources.map(source => source.url)).filter(url => { const host = new URL(url).hostname; return host === domain || host.endsWith('.' + domain); });
    for (const url of [...new Set([pageUrl, origin + '/', ...relatedPages])].slice(0, 7)) {
      if (candidates.length) break;
      try {
        const page = await request(url, true);
        const icons = [...page.bytes.toString().matchAll(/<link\b[^>]*>/gi)].map(m => attributes(m[0])).filter(a => /^(?:shortcut\s+)?icon$|apple-touch-icon/i.test(a.rel ?? '') && a.href);
        icons.sort((a,b) => (Number(b.sizes?.split('x')[0]) || (/apple/.test(b.rel) ? 180 : 32)) - (Number(a.sizes?.split('x')[0]) || (/apple/.test(a.rel) ? 180 : 32)));
        candidates.push(...icons.map(a => new URL(a.href, page.url).href));
        discoveredAt = page.url;
        if (icons.length) break;
      } catch {}
    }
    candidates.push(origin + '/favicon.ico', origin + '/apple-touch-icon.png', origin + '/favicon.png');
    let saved = false, lastError;
    for (const candidate of [...new Set(candidates)].slice(0, 10)) {
      try {
        const asset = await request(candidate);
        const png = await normalize(asset.bytes);
        const path = `/platform-fees/icons/${host.replaceAll('.', '-')}.png`;
        await writeFile(`public${path}`, png);
        for (const entry of entries) entry.icon_path = path;
        sources[host] = { ...sources[host], website_url: discoveredAt, asset_url: asset.url, icon_path: path };
        added += entries.length;
        saved = true;
        console.log(`Added ${host} (${entries.length})`);
        break;
      } catch (error) { lastError = error.message; }
    }
    if (!saved) console.log(`Missing ${host}: ${entries.map(e => e.name).join(', ')} (${lastError})`);
  }
}
await Promise.all(Array.from({ length: 10 }, worker));
await writeFile(directoryUrl, JSON.stringify(data, null, 2) + '\n');
await writeFile(sourcesUrl, JSON.stringify(sources, null, 2) + '\n');
console.log(JSON.stringify({ added, remaining: data.entries.filter(e => !e.icon_path).length }));
