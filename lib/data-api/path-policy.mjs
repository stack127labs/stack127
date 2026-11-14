// Inspect the target available to the proxy. Framework normalization may have
// already removed dot segments or redirected repeated slashes.
// Match at any depth to cover locale/basePath prefixes and Next data paths too.
function rawPath(target) {
  return target.split('?', 1)[0].replace(/^[a-z][a-z\d+.-]*:\/\/[^/\\]*/i, '');
}

function containsPrivateNamespace(path) {
  const parts = path.toLowerCase().replaceAll('\\', '/').split('/').filter(Boolean);
  const nearPrivate = segments => segments.some((part, i) =>
    part === 'api' && /^(?:mcp|v1)/.test(segments[i + 1] ?? ''));
  if (nearPrivate(parts)) return true;
  const resolved = [];
  for (const part of parts) {
    if (part === '..') resolved.pop();
    else if (part !== '.') {
      if (resolved.at(-1) === 'api' && /^(?:mcp|v1)/.test(part)) return true;
      resolved.push(part);
    }
  }
  return nearPrivate(resolved);
}

/** @param {string} target Raw Node request URL, or a proxy URL. */
export function isPrivateApiPath(target) {
  let path = rawPath(target);
  for (;;) {
    if (containsPrivateNamespace(path)) return true;
    // Decode individual bytes so an unrelated malformed escape cannot hide a
    // separator. Repeated encoding is bounded by the original target length.
    const decoded = path.replace(/%([\da-f]{2})/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
    if (decoded === path) return false;
    path = decoded;
  }
}

/** Only these exact spellings may pass the private proxy. Unknown routes get a 404. */
export function isCanonicalPrivateApiPath(target) {
  return /^\/api\/(?:mcp(?:\/[a-zA-Z0-9_-]+)?|v1(?:\/[a-z0-9_-]+)*)$/.test(rawPath(target));
}
