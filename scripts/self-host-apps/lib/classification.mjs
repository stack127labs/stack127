const dependencyImagePattern = /^(?:docker\.io\/)?(?:library\/)?(?:redis|valkey|postgres|postgresql|mariadb|mysql)(?::|$)/i;
const dependencyNamePattern = /(?:^|[- ])(?:redis|valkey|postgres|postgresql|mariadb|mysql)(?:[- ]|$)/i;
const standaloneServiceSlugs = new Set([
  "redis", "valkey", "postgres", "postgresql", "mariadb", "mysql",
]);
const duplicateAliasSlugs = new Set([
  "elastic-search", "actualserver", "apache-solr", "baby-buddy", "flowise",
  "lyrionmusicserver", "nginx-proxy-manager", "nzbhydra2",
]);

/** Classify only records with direct evidence that they are not standalone apps. */
export function classifySelfHostRecord(record = {}) {
  const slug = String(record.slug ?? "").toLowerCase();
  const name = String(record.name ?? "").toLowerCase();
  const summary = String(record.summary ?? "").toLowerCase();
  const image = String(record.docker_image ?? "").trim();
  const identity = `${slug} ${name}`;

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

  if (/\b(?:official|offical)[ -]docker\b|\b(?:couchdb|elasticsearch|postgres(?:ql)?)[- ]?(?:v)?\d+(?:[.-]x)?\b/i.test(`${slug} ${name}`)) {
    return { kind: "image_variant", reason: "record names an upstream image or version rather than a distinct product" };
  }

  return { kind: "application", reason: "no direct artifact evidence matched" };
}

export function selfHostRecordClassificationError(record) {
  const classification = classifySelfHostRecord(record);
  if (classification.kind === "application") return null;
  return `${classification.kind} cannot be published as a standalone app: ${classification.reason}`;
}
