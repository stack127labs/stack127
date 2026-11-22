import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, readdirSync} from 'node:fs';
import {createRequire} from 'node:module';
import vm from 'node:vm';
import ts from 'typescript';
import * as pathPolicy from '../../lib/data-api/path-policy.mjs';
import * as privateResponse from '../../lib/data-api/private-response.mjs';
import * as queryIndexing from '../../lib/seo/query-indexing.mjs';

const require = createRequire(import.meta.url);
const {NextRequest} = require('next/server');
const exports = {};
const forbidden = () => assert.fail('public API attempted a publication lookup');
const modules = {
  './lib/data-api/path-policy.mjs': pathPolicy,
  './lib/data-api/private-response.mjs': privateResponse,
  '@/lib/page-registry': {getExactPublishedPage: forbidden, slugFromPathname: forbidden},
  '@/lib/tool-catalogs': {getPublishedToolCatalog: forbidden},
  '@/lib/tool-pages': {getPublishedToolPage: forbidden},
  '@/lib/directory-pages': {getPublishedDirectoryPage: forbidden},
  '@/lib/page-source': {sitePageAvailable: forbidden},
  '@/lib/seo': {absoluteUrl: path => new URL(path, 'https://stack127.com').href},
  '@/lib/seo/query-indexing.mjs': queryIndexing,
};
vm.runInNewContext(ts.transpileModule(readFileSync(new URL('../../proxy.ts', import.meta.url), 'utf8'), {
  compilerOptions: {target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS},
}).outputText, {exports, Headers, URLSearchParams, process, require: name => modules[name] ?? require(name)});

function apiRoutes(directory, prefix = '/api') {
  return readdirSync(directory, {withFileTypes: true}).flatMap(entry => {
    if (!entry.isDirectory() || ['mcp', 'v1', '[...path]'].includes(entry.name)) return [];
    const nested = new URL(entry.name + '/', directory);
    const path = prefix + '/' + entry.name.replace('[slug]', 'example-app');
    return [
      ...(readdirSync(nested).includes('route.ts') ? [path] : []),
      ...apiRoutes(nested, path),
    ];
  });
}

// Header expectations taken from origin/main:proxy.ts before this private API
// work. Keep a small independent baseline, not a copy of the proxy file.
function mainHeaders(path, query) {
  const tags = ['stack127-public', 'page:' + path.slice(1).replaceAll('/', ':')];
  if (['/api/self-host-apps/search', '/api/resource-planner-index'].includes(path)) tags.push('self-host-catalog');
  if ((path.startsWith('/api/self-host-apps/') && path !== '/api/self-host-apps/search') || path.startsWith('/api/resource-planner-app/')) tags.push('self-host-detail');
  if (path === '/api/cli-apps/index') tags.push('cli-apps-catalog');
  if (path.startsWith('/api/ad-networks/')) tags.push('ad-networks-catalog');
  const filters = new URLSearchParams(query);
  filters.delete('_rsc'); filters.delete('page');
  const headers = new Headers({
    'Cache-Tag': tags.join(','),
    'X-Stack127-Cache-Class': filters.size ? 'filters' : 'content',
    'x-middleware-next': '1',
    'x-middleware-override-headers': 'x-stack127-pathname',
    'x-middleware-request-x-stack127-pathname': path,
  });
  if (query) {
    headers.set('Link', `<https://stack127.com${path}>; rel="canonical"`);
    if (queryIndexing.queryNeedsNoindex(query)) headers.set('X-Robots-Tag', 'noindex, follow');
  }
  return [...headers];
}

test('every public API keeps all origin/main proxy headers, with and without queries', async t => {
  const paths = [...apiRoutes(new URL('../../app/api/', import.meta.url)), '/api/self-host-apps/apps/example-app'];
  assert.ok(paths.length >= 24);
  t.diagnostic(`${paths.length} public API path shapes; ${paths.length * 6 * 7} full-header comparisons`);
  for (const path of paths) {
    for (const query of ['', '?q=word&page=2', '?page=2', '?_rsc=internal', '?utm_source=email', '?utm_source=email&q=word']) {
      for (const method of ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD']) {
        const response = await exports.proxy(new NextRequest('https://stack127.com' + path + query, {method}));
        assert.equal(response.status, 200, method + ' ' + path + query);
        assert.deepEqual([...response.headers], mainHeaders(path, query), method + ' ' + path + query);
      }
    }
  }
});
