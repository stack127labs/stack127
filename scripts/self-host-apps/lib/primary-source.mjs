import { request } from './request.mjs';

let nextDockerRequest = 0;

export async function readPrimarySource(value) {
  let url = value;
  const parsed = new URL(value);
  const docker = ['hub.docker.com', 'registry.hub.docker.com'].includes(parsed.hostname)
    && parsed.pathname.match(/^\/r\/([^/]+)\/([^/]+)\/?$/);
  if (docker) {
    // The HTML frontend can block automation. This is the same publisher's README,
    // supplied by Docker Hub's public repository API; no registry search inference.
    url = `https://hub.docker.com/v2/repositories/${docker[1]}/${docker[2]}/`;
  } else if (parsed.hostname === 'github.com') {
    const parts = parsed.pathname.split('/').filter(Boolean);
    if (parts[2] === 'blob' && parts.length >= 5) {
      url = `https://raw.githubusercontent.com/${parts[0]}/${parts[1]}/${parts.slice(3).join('/')}`;
    }
  }
  if (docker) {
    // Docker Hub advertises 180 requests/minute. Leave headroom for retries and
    // other jobs on this VPS instead of bursting all 16 evidence workers at it.
    const slot = Math.max(Date.now(), nextDockerRequest);
    nextDockerRequest = slot + 500;
    await new Promise(resolve => setTimeout(resolve, slot - Date.now()));
  }
  return request(url, {
    headers: { 'User-Agent': 'stack127-self-host-primary-facts/1.0' },
    redirect: 'follow',
  }, async response => {
    if (docker) {
      const repository = await response.json();
      const text = repository.full_description || repository.description;
      if (typeof text !== 'string' || !text.trim()) throw Object.assign(new Error(`Docker Hub README is empty: ${url}`), { retryable: false });
      return { text: text.slice(0, 500_000), url };
    }
    return { text: (await response.text()).slice(0, 500_000), url: response.url };
  });
}
