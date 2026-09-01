import { canonicalSourceCodeUrl } from "./candidates.mjs";
import { slugify } from "./summary-rules.mjs";

function text(value) {
  const result = String(value ?? "").trim();
  return result || null;
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function titleFromIdentifier(value) {
  const raw = String(value ?? "")
    .split("/")
    .filter(Boolean)
    .at(-1)
    ?.replace(/:[^:]+$/, "")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[._-]+/g, " ")
    .trim();
  if (!raw) return null;
  return raw.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function imageWithoutTag(image) {
  return String(image ?? "").trim().replace(/@sha256:.+$/, "").replace(/:[^/:]+$/, "");
}

export function dockerImageUrl(image) {
  const clean = imageWithoutTag(image);
  if (!clean || /[\s$`{}]/.test(clean)) return null;
  if (clean.startsWith("ghcr.io/") || clean.startsWith("quay.io/")) return `https://${clean}`;
  if (clean.startsWith("library/")) return `https://hub.docker.com/_/${clean.slice("library/".length)}`;
  const dockerPath = clean.includes("/") ? clean : `library/${clean}`;
  if (dockerPath.startsWith("library/")) return `https://hub.docker.com/_/${dockerPath.slice("library/".length)}`;
  return `https://hub.docker.com/r/${dockerPath}`;
}

function dockerImageFromRepository(repository) {
  return text(repository);
}

export function parseDockerHubSearch(payload, { query = "", sourceUrl = null } = {}) {
  const results = Array.isArray(payload?.results) ? payload.results : [];
  return results.flatMap((result) => {
    const repository = text(result.repo_name ?? result.repository ?? result.name);
    if (!repository) return [];
    const image = dockerImageFromRepository(repository);
    const registryUrl = dockerImageUrl(image);
    return [{
      source_key: `repository:${repository.toLowerCase()}`,
      source_url: registryUrl ?? sourceUrl,
      name: titleFromIdentifier(repository),
      summary: text(result.short_description ?? result.description),
      website_url: null,
      source_code_url: null,
      docs_url: null,
      docker_url: registryUrl,
      categories: [],
      surfaces: ["docker"],
      self_hosting_status: "unknown",
      payload: {
        catalog: "docker_hub",
        query,
        image,
        repository,
        search_result: result,
      },
    }];
  });
}

function lowerSet(value) {
  if (Array.isArray(value)) return new Set(value.map((item) => String(item).toLowerCase()));
  if (value && typeof value === "object") return new Set(Object.keys(value).map((item) => item.toLowerCase()));
  return new Set();
}

function isUrl(value) {
  return /^https?:\/\//i.test(String(value ?? "").trim());
}

function firstUrl(values) {
  return values.find((value) => isUrl(value)) ?? null;
}

function sourceCodeFromValues(values) {
  for (const value of values) {
    const result = canonicalSourceCodeUrl(value);
    if (result) return result;
  }
  return null;
}

export function parseUnraidFeed(feed, {
  sourceUrl = "https://ca.unraid.net/",
  limit = Number.MAX_SAFE_INTEGER,
  includeDeprecated = false,
} = {}) {
  const blacklisted = lowerSet(feed?.blacklisted);
  const deprecated = lowerSet(feed?.deprecated);
  const entries = Array.isArray(feed?.applist) ? feed.applist : [];

  return entries
    .filter((entry) => entry && text(entry.Repository) && text(entry.TemplateURL))
    .filter((entry) => includeDeprecated || (!entry.Deprecated && !deprecated.has(String(entry.Repository).toLowerCase())))
    .filter((entry) => !entry.Blacklist && !entry.CABlacklist && !blacklisted.has(String(entry.Repository).toLowerCase()))
    .slice(0, limit)
    .map((entry) => {
      const repository = text(entry.Repository);
      const registryUrl = firstUrl([entry.Registry]) ?? dockerImageUrl(repository);
      const sourceCodeUrl = sourceCodeFromValues([entry.GitHub, entry.Project, entry.RepoURL, entry.WebPage]);
      const websiteUrl = firstUrl([
        entry.WebPage,
        sourceCodeUrl ? null : entry.Project,
        sourceCodeUrl ? null : entry.Support,
      ]);
      const docsUrl = firstUrl([entry.ReadMeURL, entry.ReadmeURL, entry.ReadMe, entry.Readme, entry.Support]);
      const templateUrl = text(entry.TemplateURL);
      const sourceKey = `template:${templateUrl}`;

      return {
        source_key: sourceKey,
        source_url: templateUrl,
        name: text(entry.Name) ?? titleFromIdentifier(repository),
        summary: text(entry.Overview ?? entry.Description),
        website_url: websiteUrl,
        source_code_url: sourceCodeUrl,
        docs_url: docsUrl,
        docker_url: registryUrl,
        categories: Array.isArray(entry.CategoryList) ? entry.CategoryList.filter(Boolean).map(String) : [],
        surfaces: ["unraid", "docker"],
        self_hosting_status: "unknown",
        payload: {
          catalog: "unraid_community_applications",
          catalog_url: sourceUrl,
          app: entry,
          image: repository,
          registry_url: registryUrl,
          template_url: templateUrl,
          deprecated: Boolean(entry.Deprecated || deprecated.has(String(repository).toLowerCase())),
        },
      };
    });
}

function composeSection(textValue, sectionName) {
  const lines = String(textValue ?? "").split(/\r?\n/);
  const start = lines.findIndex((line) => new RegExp(`^${sectionName}:\\s*$`).test(line.trimEnd()));
  if (start < 0) return [];
  const result = [lines[start]];
  for (let index = start + 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (/^\S/.test(line) && line.trim() && !line.trimStart().startsWith("#")) break;
    result.push(line);
  }
  return result;
}

function yamlValue(lines, key) {
  const matcher = new RegExp(`^(\\s*)${key}:\\s*(.*?)\\s*$`);
  for (let index = 0; index < lines.length; index += 1) {
    const match = lines[index].match(matcher);
    if (!match) continue;
    const indent = match[1].length;
    const inline = match[2].replace(/^['"]|['"]$/g, "").trim();
    if (inline && inline !== "|" && inline !== ">") return inline;
    for (let next = index + 1; next < lines.length; next += 1) {
      const child = lines[next].match(/^\s*(?:en_US|en_GB|en|default):\s*(.*?)\s*$/i);
      if (child) return child[1].replace(/^['"]|['"]$/g, "").trim() || null;
      if (lines[next].trim() && lines[next].match(/^\s*/)[0].length <= indent) break;
    }
  }
  return null;
}

function yamlDescription(lines) {
  const matcher = /^(\s*)description:\s*(.*?)\s*$/;
  for (let index = 0; index < lines.length; index += 1) {
    const match = lines[index].match(matcher);
    if (!match) continue;
    const indent = match[1].length;
    const inline = match[2].replace(/^['"]|['"]$/g, "").trim();
    if (inline && inline !== "|" && inline !== ">") return inline;
    const values = [];
    for (let next = index + 1; next < lines.length; next += 1) {
      const line = lines[next];
      if (line.trim() && line.match(/^\s*/)[0].length <= indent) break;
      const value = line.replace(/^\s+/, "").trim();
      if (value && !/^(?:en_US|en_GB|en|default):/i.test(value)) values.push(value);
    }
    return values.join(" ").replace(/\s+/g, " ").trim() || null;
  }
  return null;
}

function composeImages(textValue) {
  return unique([...String(textValue ?? "").matchAll(/^\s+image:\s*["']?([^\s"'#]+)["']?/gim)]
    .map((match) => match[1])
    .filter((value) => value && !value.includes("${")));
}

export function parseCasaOSCompose(textValue, {
  appId = null,
  composeUrl = null,
  sourceUrl = "https://github.com/IceWhaleTech/CasaOS-AppStore",
  branch = "main",
} = {}) {
  const lines = composeSection(textValue, "x-casaos");
  const images = composeImages(textValue);
  const metadata = {
    id: yamlValue(lines, "id") ?? appId,
    title: yamlValue(lines, "title") ?? titleFromIdentifier(appId),
    tagline: yamlValue(lines, "tagline"),
    description: yamlDescription(lines),
    category: yamlValue(lines, "category"),
    website: yamlValue(lines, "website"),
    repo: yamlValue(lines, "repo"),
    support: yamlValue(lines, "support"),
    docs: yamlValue(lines, "docs"),
    author: yamlValue(lines, "author"),
    developer: yamlValue(lines, "developer"),
    version: yamlValue(lines, "version"),
    icon: yamlValue(lines, "icon"),
  };
  const sourceCodeUrl = canonicalSourceCodeUrl(metadata.repo);
  const itemSourceUrl = appId
    ? `https://github.com/IceWhaleTech/CasaOS-AppStore/tree/${branch}/Apps/${appId}`
    : sourceUrl;
  const image = images[0] ?? null;

  return {
    source_key: `app:${metadata.id ?? appId ?? slugify(metadata.title)}`,
    source_url: itemSourceUrl,
    name: metadata.title ?? appId,
    summary: metadata.tagline ?? metadata.description,
    website_url: isUrl(metadata.website) ? metadata.website : null,
    source_code_url: sourceCodeUrl,
    docs_url: isUrl(metadata.docs) ? metadata.docs : null,
    docker_url: dockerImageUrl(image),
    categories: metadata.category ? [metadata.category] : [],
    surfaces: ["casaos", "docker", "compose"],
    self_hosting_status: "unknown",
    payload: {
      catalog: "casaos_appstore",
      catalog_url: sourceUrl,
      app_id: appId,
      compose_url: composeUrl,
      image,
      images,
      metadata,
      compose: String(textValue ?? "").slice(0, 120000),
    },
  };
}

function tomlValue(value) {
  const raw = String(value ?? "").replace(/\s+#.*$/, "").trim();
  if (!raw) return null;
  if (raw.startsWith("[") && raw.endsWith("]")) {
    return [...raw.matchAll(/"([^"\\]*(?:\\.[^"\\]*)*)"|'([^'\\]*(?:\\.[^'\\]*)*)'/g)].map((match) => match[1] ?? match[2]);
  }
  const quoted = raw.match(/^(?:"([^"]*)"|'([^']*)')/);
  if (quoted) return quoted[1] ?? quoted[2] ?? null;
  if (/^(?:true|false)$/i.test(raw)) return raw.toLowerCase() === "true";
  if (/^-?\d+$/.test(raw)) return Number(raw);
  return raw.replace(/\s+#.*$/, "").trim();
}

export function parseYunoHostAppsToml(textValue, {
  sourceUrl = "https://github.com/YunoHost/apps",
  catalogUrl = "https://apps.yunohost.org/",
  docsUrl = "https://yunohost.org/en/apps",
  limit = Number.MAX_SAFE_INTEGER,
} = {}) {
  const records = [];
  let current = null;
  const flush = () => {
    if (current?.slug) records.push(current);
    current = null;
  };

  for (const rawLine of String(textValue ?? "").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const table = line.match(/^\[([^\]]+)\]$/);
    if (table) {
      flush();
      current = { slug: table[1].trim() };
      continue;
    }
    const field = line.match(/^([A-Za-z0-9_-]+)\s*=\s*(.+)$/);
    if (field && current) current[field[1]] = tomlValue(field[2]);
  }
  flush();

  return records.slice(0, limit).map((record) => {
    const id = record.slug;
    const appUrl = `${catalogUrl.replace(/\/$/, "")}/app/${encodeURIComponent(id)}`;
    const sourceCodeUrl = canonicalSourceCodeUrl(record.url);
    return {
      source_key: `app:${id}`,
      source_url: appUrl,
      name: titleFromIdentifier(id) ?? id,
      summary: null,
      website_url: appUrl,
      source_code_url: sourceCodeUrl,
      docs_url: docsUrl,
      docker_url: null,
      categories: record.category ? [String(record.category)] : [],
      surfaces: ["yunohost"],
      self_hosting_status: "unknown",
      payload: {
        catalog: "yunohost_apps",
        catalog_url: catalogUrl,
        source_url: sourceUrl,
        app: record,
      },
    };
  });
}
