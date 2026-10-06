import { inspectIndexingHtml, inspectSitemap } from '../publishing/verify.mjs';

// Use inside the signed origin refresh endpoint, with the origin response body.
export function inspectOriginIndexing(html, {path, page, published, sitemapPages, canonicalOrigin}) {
  if (path.endsWith('.xml')) {
    if (!Array.isArray(sitemapPages)) throw new Error('Origin sitemap verification needs registry pages');
    inspectSitemap(html,sitemapPages,canonicalOrigin);
  } else if (!path.startsWith('/api/') && published) {
    if (!page || typeof page.is_indexable !== 'boolean') throw new Error('Origin page verification needs its indexing flag');
    inspectIndexingHtml(html,{slug:path.replace(/^\//,''),is_indexable:page.is_indexable},canonicalOrigin);
  }
}
