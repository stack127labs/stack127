import { composeServices, databaseTypesFromText } from "./catalog-facts.mjs";

function amount(line, terms) {
  if (!terms.test(line)) return null;
  const match = line.match(/(\d+(?:\.\d+)?)\s*(gb|gib|mb|mib)\b/i);
  if (!match) return null;
  const value = Number(match[1]);
  if (!Number.isFinite(value) || value <= 0) return null;
  return { unit: match[2].toLowerCase(), value };
}

function ramMb(value) {
  if (!value) return null;
  return Math.round(value.value * (value.unit.startsWith("g") ? 1024 : 1));
}

function storageGb(value) {
  if (!value) return null;
  return value.unit.startsWith("g") ? value.value : Math.round((value.value / 1024) * 1000) / 1000;
}

export function parsePublishedRequirements(text) {
  let section = null;
  let ramMinMb = null;
  let ramRecommendedMb = null;
  let storageMinGb = null;

  for (const rawLine of String(text ?? "").split(/\r?\n/)) {
    const line = rawLine.replace(/<[^>]+>/g, " ").trim();
    if (!line) continue;
    if (/^#{1,6}\s/.test(line)) {
      section = /recommend/i.test(line) ? "recommended" : /min(?:imum)?|requirements?/i.test(line) ? "minimum" : null;
    }

    const kind = /recommend/i.test(line)
      ? "recommended"
      : /\b(?:min(?:imum)?|at least|requires?)\b/i.test(line)
        ? "minimum"
        : section;
    if (!kind) continue;

    const ram = ramMb(amount(line, /\b(?:ram|memory)\b/i));
    const storage = storageGb(amount(line, /\b(?:storage|disk(?:\s+space)?|drive\s+space)\b/i));
    if (ram !== null && kind === "recommended" && ramRecommendedMb === null) ramRecommendedMb = ram;
    if (ram !== null && kind === "minimum" && ramMinMb === null) ramMinMb = ram;
    if (storage !== null && kind === "minimum" && storageMinGb === null) storageMinGb = storage;
  }

  return { ramMinMb, ramRecommendedMb, storageMinGb };
}

export function readmeContainerSupport(text) {
  const value = String(text ?? "");
  return {
    compose: /(?:docker\s+compose|docker-compose)(?:\s+up|\.ya?ml|\s+-f)/i.test(value),
    docker: /(?:docker\s+run|docker\s+compose|docker-compose|container\s+image)/i.test(value),
  };
}

export function likelyAppImage(image, app) {
  if (!image) return null;
  const normalizedCandidate = String(image)
    .replace(/:\$\{[^}]+\}$/, "")
    .replace(/:\$[A-Z_][A-Z0-9_]*$/i, "");
  if (
    !normalizedCandidate.includes("/")
    || normalizedCandidate.includes("$")
    || /^(?:localhost|internal)\//i.test(normalizedCandidate)
    || /:(?:dev|development|demo|canary|test)(?:[-_.]|$)/i.test(normalizedCandidate)
  ) {
    return null;
  }
  const repositoryName = String(app.source_code_url ?? "")
    .split("/")
    .filter(Boolean)
    .at(-1)
    ?.replace(/\.git$/i, "") ?? "";
  const tokens = [app.slug, app.name, repositoryName]
    .flatMap((value) => String(value ?? "").toLowerCase().split(/[^a-z0-9]+/))
    .filter((value) => value.length >= 3 && !["app", "server", "self", "hosted", "open", "cloud", "mail", "home"].includes(value));
  const imageBasename = normalizedCandidate.split("/").at(-1).split(":", 1)[0].toLowerCase();
  return tokens.some((token) => imageBasename.includes(token)) ? normalizedCandidate : null;
}

export function likelyAppImageFromCompose(text, app) {
  const repositoryName = String(app.source_code_url ?? "")
    .split("/")
    .filter(Boolean)
    .at(-1)
    ?.replace(/\.git$/i, "") ?? "";
  const tokens = [app.slug, app.name, repositoryName]
    .flatMap((value) => String(value ?? "").toLowerCase().split(/[^a-z0-9]+/))
    .filter((value) => value.length >= 3 && !["app", "server", "self", "hosted", "open", "cloud", "mail", "home"].includes(value));
  const helperService = /(?:^|[-_.])(?:worker|migrat(?:e|ion)?|init|seed|cron|scheduler|queue|consumer|sidekiq|celery|test)(?:$|[-_.])/i;
  const helperImage = /(?:^|\/)(?:mailhog|mailpit|smtp|rspamd|minio|rabbitmq|kafka|zookeeper|nats|vector|grafana|prometheus|loki|temporal|otel-collector)(?::|@|\/|$)/i;
  const candidates = composeServices(text)
    .map((candidate) => ({ ...candidate, image: likelyAppImage(candidate.image, app) }))
    .filter((candidate) => candidate.image && !helperService.test(candidate.service) && databaseTypesFromText(candidate.image).length === 0 && !helperImage.test(candidate.image));

  const exactImageCandidates = candidates.filter((candidate) => {
    const basename = candidate.image.split("/").at(-1).split(":", 1)[0].toLowerCase();
    return tokens.includes(basename);
  });
  if (exactImageCandidates.length === 1) return exactImageCandidates[0].image;

  const exactPrimaryCandidates = candidates.filter((candidate) => /^(?:app|web|server)$/i.test(candidate.service));
  if (exactPrimaryCandidates.length === 1) return exactPrimaryCandidates[0].image;
  if (candidates.length === 1) return candidates[0].image;
  return null;
}

export function likelyAppImageFromText(text, app) {
  const candidates = [...String(text ?? "").matchAll(/\bdocker\s+(?:pull|run(?:\s+--?[a-z-]+(?:[= ]\S+)?)*)\s+([a-z0-9][a-z0-9._/-]*(?::[a-z0-9._-]+)?)/gi)]
    .map((match) => match[1])
    .filter((image) => !["run", "pull", "build", "compose"].includes(image.toLowerCase()));
  return candidates.map((image) => likelyAppImage(image, app)).find(Boolean) ?? null;
}

export function dockerHubImage(url) {
  try {
    const parsed = new URL(url);
    const parts = parsed.pathname.split("/").filter(Boolean);
    if (parsed.hostname !== "hub.docker.com" || parts[0] !== "r" || parts.length < 3) return null;
    return `${parts[1]}/${parts[2]}`;
  } catch {
    return null;
  }
}
