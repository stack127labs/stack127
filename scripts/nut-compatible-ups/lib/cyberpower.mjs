import path from "node:path";

function normalized(value) {
  return String(value ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "");
}

export function cyberPowerModelToken(model) {
  const value = String(model ?? "").trim();
  if (!value || /[()/]/.test(value)) return null;
  const token = normalized(value);
  return token.length >= 4 ? token : null;
}

export function exactCyberPowerProductLinks(html, model, pageUrl = "https://www.cyberpowersystems.com/") {
  const token = cyberPowerModelToken(model);
  if (!token) return [];
  const links = [];
  for (const match of String(html ?? "").matchAll(/href=["']([^"']+)["']/gi)) {
    try {
      const url = new URL(match[1].replaceAll("&amp;", "&"), pageUrl);
      if (!url.pathname.includes("/product/")) continue;
      const slug = url.pathname.split("/").filter(Boolean).at(-1);
      if (normalized(slug) === token) links.push(url.href);
    } catch {
      continue;
    }
  }
  return [...new Set(links)];
}

export function exactCyberPowerImageLinks(html, model, pageUrl = "https://www.cyberpowersystems.com/") {
  const token = cyberPowerModelToken(model);
  if (!token) return [];
  const links = [];
  for (const match of String(html ?? "").matchAll(/(?:src|href)=["']([^"']+\.(?:avif|webp|png|jpe?g)(?:\?[^"']*)?)["']/gi)) {
    try {
      const url = new URL(match[1].replaceAll("&amp;", "&"), pageUrl);
      url.pathname = url.pathname.replace(/-\d+x\d+(?=\.[a-z]{2,5}$)/i, "");
      const base = normalized(path.basename(url.pathname).replace(/\.[^.]+$/, ""));
      if (!base.startsWith(token)) continue;
      const suffix = base.slice(token.length);
      if (!suffix || /^(?:f|front|r|rear|l|left|right|side|photo|hero|main|\d)/.test(suffix)) links.push(url.href);
    } catch {
      continue;
    }
  }
  return [...new Set(links)];
}
