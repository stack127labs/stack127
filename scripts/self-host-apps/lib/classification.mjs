const dependencyImagePattern = /^(?:docker\.io\/)?(?:library\/)?(?:redis|valkey|postgres|postgresql|mariadb|mysql)(?::|$)/i;
const dependencyNamePattern = /(?:^|[- ])(?:redis|valkey|postgres|postgresql|mariadb|mysql)(?:[- ]|$)/i;
const standaloneServiceSlugs = new Set([
  "redis", "valkey", "postgres", "postgresql", "mariadb", "mysql",
]);
const duplicateAliasSlugs = new Set([
  "elastic-search", "actualserver", "apache-solr", "baby-buddy", "flowise",
  "lyrionmusicserver", "nginx-proxy-manager", "nzbhydra2",
]);
const canonicalProductSlugs = new Map([
  ["postgres", /^postgres(?:ql)?(?:\s+\d+(?:\.\d+)*)?$/i],
  ["postgresql", /^postgres(?:ql)?(?:\s+\d+(?:\.\d+)*)?$/i],
  ["elasticsearch", /^elasticsearch(?:\s+\d+(?:\.\d+)*)?$/i],
  ["couchdb", /^(?:apache\s+)?couchdb(?:\s+\d+(?:\.\d+)*)?$/i],
  ["redis", /^redis(?:\s+\d+(?:\.\d+)*)?$/i],
  ["valkey", /^valkey(?:\s+\d+(?:\.\d+)*)?$/i],
  ["mysql", /^mysql(?:\s+\d+(?:\.\d+)*)?$/i],
  ["mariadb", /^mariadb(?:\s+\d+(?:\.\d+)*)?$/i],
  ["mongodb", /^mongodb(?:\s+\d+(?:\.\d+)*)?$/i],
  ["rabbitmq", /^rabbitmq(?:\s+\d+(?:\.\d+)*)?$/i],
  ["memcached", /^memcached(?:\s+\d+(?:\.\d+)*)?$/i],
  ["neo4j", /^neo4j(?:\s+\d+(?:\.\d+)*)?$/i],
]);

function isCanonicalProductIdentity(slug, name) {
  return canonicalProductSlugs.get(slug)?.test(name) ?? false;
}

function hasStrongVersionVariantEvidence(record) {
  const slug = String(record.slug ?? "").toLowerCase();
  const name = String(record.name ?? "").toLowerCase();
  const source = String(record.source_code_url ?? "").replace(/\/$/, "").toLowerCase();
  const image = String(record.docker_image ?? "").toLowerCase();

  if (/\b(?:official|offical)[ -]docker\b/.test(`${slug} ${name}`) &&
      source === "https://github.com/docker-library/official-images" &&
      /couchdb/.test(`${slug} ${name}`) && /^(?:docker\.io\/)?(?:apache\/)?couchdb(?::|$)/.test(image)) return true;
  if (/^couchdb-v\d+-x$/.test(slug) && /couchdb/.test(name) &&
      source === "https://github.com/apache/couchdb-docker" &&
      /^(?:docker\.io\/)?(?:apache\/)?couchdb(?::|$)/.test(image)) return true;
  if (/^elasticsearch\d+$/.test(slug) && /^elasticsearch\s*\d+$/.test(name) && source === "https://github.com/elastic/elasticsearch") return true;
  if (/^postgresql\d+$/.test(slug) && /^postgresql\s*\d+$/.test(name) && source === "https://github.com/postgres/postgres" && /^postgres:\d/.test(image)) return true;
  return false;
}

/** Classify only records with direct evidence that they are not standalone apps. */
export function classifySelfHostRecord(record = {}) {
  const slug = String(record.slug ?? "").toLowerCase();
  const name = String(record.name ?? "").toLowerCase();
  const summary = String(record.summary ?? "").toLowerCase();
  const image = String(record.docker_image ?? "").trim();
  const identity = `${slug} ${name}`;

  // Versioned canonical names such as PostgreSQL 18 remain the same product.
  if (isCanonicalProductIdentity(slug, String(record.name ?? "").trim())) {
    return { kind: "application", reason: "canonical product identity, including its versioned display name" };
  }

  if (duplicateAliasSlugs.has(slug)) {
    return { kind: "duplicate", reason: "reviewed duplicate slug for an existing app record" };
  }

  if (/\b(?:example|demo|sample) stack\b|\bexample deployment\b|\bdemo deployment\b/.test(summary)) {
    return { kind: "example_stack", reason: "summary identifies an example or demo stack" };
  }

  if (/\b(?:dependency|dependancy) container\b|\b(?:postgresql|redis|valkey|mysql|mariadb) companion for\b|\bexternal database for\b|\bdatabase for the .{1,60} suite\b|\b(?:redis|valkey) persistence backend\b|\b(?:database|cache|redis-compatible valkey service) .{0,50} for (?:immich|makerworks|onlyoffice)\b|\bused by (?:immich|lucia|makerworks|tube ?archivist) for\b/.test(summary)) {
    return { kind: "dependency_container", reason: "source summary identifies a helper service for another app" };
  }

  if (/\bseparate docker daemon inside a container\b|\bbuild tools can create images\b/.test(summary)) {
    return { kind: "dependency_container", reason: "container runtime helper for other build tools" };
  }

  if (!standaloneServiceSlugs.has(slug) && dependencyNamePattern.test(identity) && dependencyImagePattern.test(image) &&
      !/\b(?:database|cache|queue|broker) (?:management|admin|monitor|insight|browser|ui|web interface)\b/.test(summary)) {
    return { kind: "dependency_container", reason: "app-branded name uses a generic database or cache image" };
  }

  if (hasStrongVersionVariantEvidence(record)) {
    return { kind: "image_variant", reason: "record is an upstream image/version variant of a canonical product" };
  }

  return { kind: "application", reason: "no direct artifact evidence matched" };
}

export function selfHostRecordClassificationError(record) {
  const classification = classifySelfHostRecord(record);
  if (classification.kind === "application") return null;
  return `${classification.kind} cannot be published as a standalone app: ${classification.reason}`;
}
