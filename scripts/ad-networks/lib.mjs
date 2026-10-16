import { isIP } from "node:net";
import dns from "node:dns";
import { domainToASCII } from "node:url";
import { createInterface } from "node:readline";
import { Readable } from "node:stream";
import { assertPublicUrl, readLimitedText, safeFetch } from "./fetch-policy.mjs";

const userAgent = "stack127bot/1.0 (+https://stack127.com/ad-networks)";
dns.setDefaultResultOrder("ipv4first");

export function normalizeDomain(value, options = {}) {
  if (typeof value !== "string") return null;
  const input = value.trim();
  if (!input || /[\s@*]/.test(input)) return null;
  let host;
  try {
    const url = new URL(/^https?:\/\//i.test(input) ? input : `https://${input}`);
    if (!/^https?:$/.test(url.protocol) || url.username || url.password) return null;
    host = domainToASCII(url.hostname.replace(/\.$/, "").toLowerCase());
  } catch {
    return null;
  }
  if (options.stripWww !== false && host.startsWith("www.")) host = host.slice(4);
  if (!host || host.length > 253 || isIP(host)) return null;
  const labels = host.split(".");
  if (labels.length < 2 || labels.some((label) => !label || label.length > 63 || !/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(label))) return null;
  if (!/^(?:[a-z]{2,}|xn--[a-z0-9-]+)$/.test(labels.at(-1))) return null;
  return host;
}

export function sellerDomains(payload) {
  if (!payload || !Array.isArray(payload.sellers)) throw new Error("Seller feed has no sellers array");
  const candidates = [];
  for (const seller of payload.sellers) {
    if (!seller || typeof seller !== "object" || seller.seller_type === "INTERMEDIARY") continue;
    const supplied = seller.domain;
    const domain = normalizeDomain(supplied);
    if (domain) candidates.push({ domain, supplied });
  }
  if (payload.sellers.length && candidates.length === 0) throw new Error("Seller feed produced no valid domains");
  return candidates;
}

function sellerDomain(seller) {
  if (!seller || typeof seller !== "object" || seller.seller_type === "INTERMEDIARY") return null;
  const supplied = seller.domain;
  const domain = normalizeDomain(supplied);
  return domain ? { domain, supplied } : null;
}

export async function* sellerDomainsStream(body, mapSeller = sellerDomain) {
  if (!body) throw new Error("Seller feed has no response body");
  const input = typeof body.getReader === "function" ? Readable.fromWeb(body) : body;
  const decoder = new TextDecoder();
  let search = "";
  let foundArray = false;
  let endedArray = false;
  let objectText = "";
  let depth = 0;
  let inString = false;
  let escaped = false;
  let sellerCount = 0;

  const consume = (text) => {
    const candidates = [];
    if (!foundArray) {
      search += text;
      const match = /"sellers"\s*:\s*\[/.exec(search);
      if (!match) {
        search = search.slice(-64);
        return candidates;
      }
      foundArray = true;
      text = search.slice(match.index + match[0].length);
      search = "";
    }

    for (const character of text) {
      if (endedArray) break;
      if (depth === 0) {
        if (character === "{") {
          objectText = character;
          depth = 1;
          inString = false;
          escaped = false;
        } else if (character === "]") endedArray = true;
        continue;
      }

      objectText += character;
      if (objectText.length > 1_000_000) throw new Error("Seller record exceeds the size limit");
      if (inString) {
        if (escaped) escaped = false;
        else if (character === "\\") escaped = true;
        else if (character === '"') inString = false;
        continue;
      }
      if (character === '"') inString = true;
      else if (character === "{" || character === "[") depth += 1;
      else if (character === "}" || character === "]") depth -= 1;

      if (depth === 0) {
        let seller;
        try { seller = JSON.parse(objectText); }
        catch (error) { throw new Error(`Seller feed has invalid seller JSON: ${error.message}`); }
        sellerCount += 1;
        const candidate = mapSeller(seller);
        if (candidate) candidates.push(candidate);
        objectText = "";
      }
    }
    return candidates;
  };

  for await (const chunk of input) {
    const text = typeof chunk === "string" ? chunk : decoder.decode(chunk, { stream: true });
    for (const candidate of consume(text)) yield candidate;
    if (endedArray) break;
  }
  for (const candidate of consume(decoder.decode())) yield candidate;
  if (!foundArray) throw new Error("Seller feed has no sellers array");
  if (!endedArray || depth !== 0) throw new Error("Seller feed ended before the sellers array was complete");
  if (sellerCount > 0) return;
  throw new Error("Seller feed has an empty sellers array");
}

export function csvFields(line) {
  const fields = [];
  let field = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (character === '"') {
      if (quoted && line[index + 1] === '"') { field += '"'; index += 1; }
      else quoted = !quoted;
    } else if (character === "," && !quoted) {
      fields.push(field);
      field = "";
    } else field += character;
  }
  fields.push(field);
  return fields;
}

export async function* majesticDomains(body) {
  if (!body) throw new Error("Majestic response has no body");
  const input = typeof body.getReader === "function" ? Readable.fromWeb(body) : body;
  const lines = createInterface({ input, crlfDelay: Infinity });
  let domainIndex = -1;
  let rowCount = 0;
  for await (const line of lines) {
    const cells = csvFields(line.replace(/^\uFEFF/, ""));
    if (domainIndex < 0) {
      domainIndex = cells.findIndex((cell) => cell.trim().toLowerCase() === "domain");
      if (domainIndex < 0) throw new Error("Majestic CSV has no Domain column");
      continue;
    }
    if (!line.trim()) continue;
    rowCount += 1;
    const supplied = cells[domainIndex]?.trim();
    const domain = normalizeDomain(supplied);
    if (domain) yield { domain, supplied };
  }
  if (rowCount < 100_000) throw new Error(`Majestic CSV has only ${rowCount} rows`);
}

export function publisherLinkDomains(html, sourceUrl) {
  if (typeof html !== "string" || !html.trim()) throw new Error("Publisher list has no HTML");
  const sourceDomain = normalizeDomain(sourceUrl);
  const candidates = new Map();
  for (const match of html.matchAll(/\bhref\s*=\s*(["'])(.*?)\1/gi)) {
    const supplied = match[2]
      .replaceAll("&amp;", "&")
      .replaceAll("&#x2F;", "/")
      .replaceAll("&#47;", "/");
    let resolved;
    try { resolved = new URL(supplied, sourceUrl); }
    catch { continue; }
    if (!new Set(["http:", "https:"]).has(resolved.protocol)) continue;
    const domain = normalizeDomain(resolved.hostname);
    if (!domain || domain === sourceDomain || domain.endsWith(`.${sourceDomain}`)) continue;
    candidates.set(domain, { domain, supplied: resolved.href });
  }
  if (!candidates.size) throw new Error("Publisher list produced no external domains");
  return [...candidates.values()];
}

function robotGroups(text) {
  const groups = [];
  let agents = [];
  let rules = [];
  const flush = () => {
    if (agents.length) groups.push({ agents, rules });
    agents = [];
    rules = [];
  };
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.split("#", 1)[0].trim();
    const match = line.match(/^([a-z-]+)\s*:\s*(.*?)\s*$/i);
    if (!match) continue;
    const key = match[1].toLowerCase();
    const value = match[2];
    if (key === "user-agent") {
      if (rules.length) flush();
      agents.push(value.toLowerCase());
    } else if ((key === "allow" || key === "disallow" || key === "crawl-delay") && agents.length) {
      rules.push({ key, value });
    }
  }
  flush();
  return groups;
}

function matchingRobotsRules(text, agent) {
  const groups = robotGroups(text);
  const matching = groups.map((group) => ({
    ...group,
    score: Math.max(...group.agents.map((name) => name === "*" ? 0 : agent.toLowerCase().includes(name) ? name.length : -1)),
  })).filter((group) => group.score >= 0);
  if (!matching.length) return [];
  const best = Math.max(...matching.map((group) => group.score));
  return matching.filter((group) => group.score === best).flatMap((group) => group.rules);
}

export function robotsAllows(text, path, agent = "stack127bot") {
  const rules = matchingRobotsRules(text, agent).filter((rule) => rule.key !== "crawl-delay");
  let decision = { specificity: -1, allowed: true };
  for (const rule of rules) {
    if (!rule.value) continue;
    const pattern = rule.value.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replaceAll("*", ".*").replace(/\\\$$/, "$");
    if (!new RegExp(`^${pattern}`).test(path)) continue;
    const specificity = rule.value.replaceAll("*", "").length;
    if (specificity > decision.specificity || (specificity === decision.specificity && rule.key === "allow")) {
      decision = { specificity, allowed: rule.key === "allow" };
    }
  }
  return decision.allowed;
}

export function robotsCrawlDelay(text, agent = "stack127bot") {
  return Math.max(0, ...matchingRobotsRules(text, agent)
    .filter((rule) => rule.key === "crawl-delay")
    .map((rule) => Number(rule.value))
    .filter((value) => Number.isFinite(value) && value > 0));
}

async function sleep(milliseconds) {
  await new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export async function fetchWithRetry(url, options = {}) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    let response;
    try {
      response = await fetch(url, {
        ...options,
        headers: { "User-Agent": userAgent, ...options.headers },
        signal: AbortSignal.timeout(options.timeoutMs ?? 45_000),
      });
    } catch (error) {
      if (attempt === 2) throw new Error(`${url}: ${error.cause?.code ?? error.message}`, { cause: error });
      await sleep(1000 * (2 ** attempt));
      continue;
    }
    if (response.ok || response.status === 304 || response.status === 404) return response;
    if (![408, 425, 429, 500, 502, 503, 504].includes(response.status) || attempt === 2) {
      throw new Error(`${url} returned HTTP ${response.status}`);
    }
    const retryAfter = Number(response.headers.get("retry-after"));
    await sleep(Number.isFinite(retryAfter) && retryAfter > 0 ? Math.min(retryAfter * 1000, 30_000) : 1000 * (2 ** attempt));
  }
  throw new Error(`${url} failed after retries`);
}

export async function checkRobots(url, dependencies = {}) {
  const target = await assertPublicUrl(url, dependencies.lookup);
  const robotsUrl = `${target.origin}/robots.txt`;
  const { response } = await safeFetch(robotsUrl, { timeoutMs: 20_000, headers: { Accept: "text/plain" } }, dependencies);
  if (response.status === 404) { await response.body?.cancel(); return; }
  if (!response.ok) {
    await response.body?.cancel();
    throw new Error(`Could not check robots rules at ${robotsUrl}: HTTP ${response.status}`);
  }
  const text = await readLimitedText(response, 512 * 1024);
  if (!robotsAllows(text, `${target.pathname}${target.search}`)) {
    throw new Error(`Robots rules do not allow ${url}`);
  }
  const delaySeconds = robotsCrawlDelay(text);
  if (delaySeconds) await sleep(Math.min(delaySeconds * 1000, 30_000));
}
