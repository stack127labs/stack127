// Shared by the proxy and route handlers. No database imports.
export const privateHeaders = {
  'Cache-Control': 'no-store',
  'CDN-Cache-Control': 'no-store',
  'Cloudflare-CDN-Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
};

export function notFoundResponse() {
  return Response.json({error: {code: 'not_found', message: 'Not found.'}}, {
    status: 404, headers: privateHeaders,
  });
}
