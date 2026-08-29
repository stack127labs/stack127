const databasePatterns = [
  ["postgres", /(?:^|[^a-z0-9])(?:postgres|postgresql)(?:$|[^a-z0-9])/i],
  ["mysql", /(?:^|[^a-z0-9])mysql(?:$|[^a-z0-9])/i],
  ["mariadb", /(?:^|[^a-z0-9])mariadb(?:$|[^a-z0-9])/i],
  ["mongodb", /(?:^|[^a-z0-9])(?:mongo|mongodb)(?:$|[^a-z0-9])/i],
  ["redis", /(?:^|[^a-z0-9])(?:redis|valkey)(?:$|[^a-z0-9])/i],
  ["sqlite", /(?:^|[^a-z0-9])sqlite(?:3)?(?:$|[^a-z0-9])/i],
  ["couchdb", /(?:^|[^a-z0-9])couchdb(?:$|[^a-z0-9])/i],
  ["clickhouse", /(?:^|[^a-z0-9])clickhouse(?:$|[^a-z0-9])/i],
  ["elasticsearch", /(?:^|[^a-z0-9])elasticsearch(?:$|[^a-z0-9])/i],
  ["cassandra", /(?:^|[^a-z0-9])cassandra(?:$|[^a-z0-9])/i],
  ["influxdb", /(?:^|[^a-z0-9])influxdb(?:$|[^a-z0-9])/i],
  ["neo4j", /(?:^|[^a-z0-9])neo4j(?:$|[^a-z0-9])/i],
  ["surrealdb", /(?:^|[^a-z0-9])surrealdb(?:$|[^a-z0-9])/i],
  ["pocketbase", /(?:^|[^a-z0-9])pocketbase(?:$|[^a-z0-9])/i],
];

const infrastructureImagePattern =
  /(?:^|\/)(?:postgres|mysql|mariadb|mongo(?:db)?|redis|valkey|sqlite|couchdb|clickhouse|elasticsearch|cassandra|influxdb|neo4j|surrealdb)(?::|@|\/|$)/i;
const proxyImagePattern = /(?:umbrel-app-proxy|docker-socket-proxy|cloudflared|traefik|nginx)(?::|@|\/|$)/i;

export function databaseTypesFromText(text) {
  const value = String(text ?? "");
  return databasePatterns
    .filter(([, pattern]) => pattern.test(value))
    .map(([name]) => name);
}

function composeImages(text) {
  return [...String(text ?? "").matchAll(/^\s*image:\s*["']?([^\s"']+)/gm)]
    .map((match) => match[1])
    .filter(Boolean);
}

export function composeServices(text) {
  const services = [];
  let current = null;
  let inServices = false;
  for (const line of String(text ?? "").split(/\r?\n/)) {
    if (/^services:\s*$/.test(line)) {
      inServices = true;
      continue;
    }
    if (!inServices) continue;
    if (/^[^\s#]/.test(line)) break;
    const service = line.match(/^  ([a-zA-Z0-9_.-]+):\s*$/)?.[1];
    if (service) {
      current = service;
      continue;
    }
    const image = line.match(/^\s{4}image:\s*["']?([^\s"']+)/)?.[1];
    if (current && image) services.push({ image, service: current });
  }
  return services;
}

function hasPersistentStorage(text) {
  return String(text ?? "")
    .split(/\r?\n/)
    .some((line) => {
      const value = line.trim();
      if (!value.startsWith("- ") || !value.includes(":")) return false;
      const mount = value.slice(2).replace(/^['"]|['"]$/g, "");
      const source = mount.split(":", 1)[0];
      if (!source || source === "/tmp" || source.startsWith("/run")) return false;
      return source.includes("APP_DATA_DIR")
        || source.startsWith("/")
        || source.startsWith("./")
        || /^[a-z0-9_.-]+$/i.test(source);
    });
}

export function parseComposeFacts(text) {
  const images = composeImages(text);
  const dockerImage = images.find(
    (image) =>
      databaseTypesFromText(image).length === 0 &&
      !infrastructureImagePattern.test(image) &&
      !proxyImagePattern.test(image),
  ) ?? null;

  return {
    databaseTypes: databaseTypesFromText(text),
    dockerImage,
    persistentStorage: hasPersistentStorage(text),
  };
}

export function parseTrueNasImage(text) {
  const block = String(text ?? "").match(
    /^images:\s*\n(?:^[ \t]+.*\n)*?^  image:\s*\n((?:^    .*\n?)*)/m,
  )?.[1];
  if (!block) return null;

  const repository = block.match(/^    repository:\s*["']?([^\s"']+)/m)?.[1];
  const tag = block.match(/^    tag:\s*["']?([^\n"']+)["']?\s*$/m)?.[1]?.trim();
  return repository && tag ? `${repository}:${tag}` : null;
}

function findVariable(node, variable) {
  if (!node || typeof node !== "object") return null;
  if (node.variable === variable) return node;

  for (const value of Object.values(node)) {
    if (!value || typeof value !== "object") continue;
    const found = Array.isArray(value)
      ? value.map((item) => findVariable(item, variable)).find(Boolean)
      : findVariable(value, variable);
    if (found) return found;
  }
  return null;
}

export function trueNasMemoryLimit(schema) {
  const resources = findVariable(schema, "resources");
  const memory = findVariable(resources, "memory");
  const value = Number(memory?.schema?.default);
  return Number.isFinite(value) && value > 0 ? value : null;
}

export function trueNasPersistentStorage(schema, templateText = "") {
  const storage = findVariable(schema, "storage");
  if (!storage) return false;
  return /add_storage\s*\(|values\.storage\./i.test(String(templateText ?? ""));
}

export function trueNasDatabaseTypes(appMetadata, templateText = "") {
  const services = (appMetadata?.run_as_context ?? [])
    .map((item) => item?.description ?? "")
    .join("\n");
  return databaseTypesFromText(`${services}\n${templateText}`);
}
