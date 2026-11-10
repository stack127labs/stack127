export type CategoryAppRow = { name: string; summary: string; href: string | null; facts: string };

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[character]!);

/** All fields are untrusted dataset text. Accept only absolute HTTP(S) outbound URLs. */
export function categoryListHtml(apps: readonly CategoryAppRow[]) {
  return apps.map(app => {
    let href = null;
    try {
      const url = new URL(app.href ?? '');
      if (url.protocol === 'https:' || url.protocol === 'http:') href = url.href;
    } catch { /* Missing or malformed links keep the app name as text. */ }
    const name = escapeHtml(app.name);
    return `<li>${href ? `<a href="${escapeHtml(href)}" rel=noreferrer target=_blank>${name}</a>` : `<strong>${name}</strong>`}<p>${escapeHtml(app.summary)}</p><small>${escapeHtml(app.facts)}</small></li>`;
  }).join('');
}
