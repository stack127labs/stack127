const registryHosts = new Set([
  "docker.io",
  "index.docker.io",
  "hub.docker.com",
  "ghcr.io",
  "quay.io",
  "lscr.io",
]);

const methodLabels = new Map([
  ["docker", "Docker image"],
  ["compose", "Docker Compose"],
  ["truenas_scale", "TrueNAS SCALE catalog"],
  ["unraid", "Unraid catalog"],
  ["umbrel", "Umbrel catalog"],
  ["yunohost", "YunoHost catalog"],
  ["casaos", "CasaOS catalog"],
  ["runtipi", "Runtipi catalog"],
  ["cosmos", "Cosmos catalog"],
  ["openmediavault", "openmediavault catalog"],
  ["synology", "Synology package"],
  ["qnap", "QNAP package"],
  ["proxmox", "Proxmox helper"],
  ["home_assistant_os", "Home Assistant add-on"],
  ["kubernetes", "Kubernetes manifest"],
  ["helm", "Helm chart"],
  ["native", "Native installation"],
  ["binary", "Binary release"],
  ["package", "System package"],
  ["other", "Other installation"],
]);

function trimImageReference(value) {
  const input = String(value ?? "").trim();
  if (!input || /[\s$`{}]/.test(input)) return null;

  const withoutDigest = input.split("@", 1)[0];
  const segments = withoutDigest.split("/").filter(Boolean);
  if (segments.length === 0) return null;

  const hasRegistry = segments.length > 1 && (
    segments[0].includes(".")
    || segments[0].includes(":")
    || segments[0] === "localhost"
  );
  const host = hasRegistry ? segments.shift().toLowerCase() : "docker.io";
  const path = segments.join("/").replace(/:[^/]+$/, "");
  if (!path || path.startsWith("/") || path.endsWith("/")) return null;

  return { host, path, segments: path.split("/") };
}

export function registryUrlForImage(image, { githubOwner = null, githubRepo = null } = {}) {
  const parsed = trimImageReference(image);
  if (!parsed) return null;

  if (parsed.host === "docker.io" || parsed.host === "index.docker.io") {
    return parsed.segments.length === 1
      ? `https://hub.docker.com/_/${parsed.path}`
      : `https://hub.docker.com/r/${parsed.path}`;
  }

  if (parsed.host === "lscr.io") {
    return parsed.segments.length > 1
      ? `https://hub.docker.com/r/${parsed.path}`
      : null;
  }

  if (parsed.host === "quay.io") {
    return `https://quay.io/repository/${parsed.path}`;
  }

  if (parsed.host === "ghcr.io") {
    const packageName = parsed.segments.at(-1);
    const imageOwner = parsed.segments[0];
    if (githubOwner && githubRepo && packageName && imageOwner?.toLowerCase() === githubOwner.toLowerCase()) {
      return `https://github.com/${githubOwner}/${githubRepo}/pkgs/container/${packageName}`;
    }
    if (parsed.segments.length >= 2) {
      return `https://ghcr.io/${parsed.path}`;
    }
    return `https://ghcr.io/${parsed.path}`;
  }

  return null;
}

function isHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function isComposeUrl(value) {
  return /(?:docker[-_])?compose(?:\.|\/|$)|compose\.ya?ml/i.test(value);
}

function isSourceFileUrl(value) {
  return /\/(?:blob|tree)\/[^/]+\/(?:.+\/)?(?:Dockerfile(?:\.[^/]+)?|docker-compose[^/]*\.ya?ml|compose[^/]*\.ya?ml)(?:$|[?#])/i.test(value);
}

function isRegistryPageUrl(value) {
  if (!isHttpUrl(value) || isSourceFileUrl(value)) return false;

  const url = new URL(value);
  const host = url.hostname.toLowerCase();
  return registryHosts.has(host)
    || host.endsWith(".azurecr.io")
    || url.pathname.includes("/pkgs/container/")
    || url.pathname.includes("/container_registry");
}

function registryUrlMatchesImage(url, image) {
  if (!isRegistryPageUrl(url) || !image) return true;
  if (String(url).includes("/pkgs/container/")) return true;

  const parsedImage = trimImageReference(image);
  if (!parsedImage) return true;
  const host = new URL(url).hostname.toLowerCase();

  if (parsedImage.host === "ghcr.io") return host === "ghcr.io";
  if (parsedImage.host === "quay.io") return host === "quay.io";
  if (parsedImage.host === "lscr.io") return host === "lscr.io" || host === "hub.docker.com";
  return host === "hub.docker.com" || host === "docker.io" || host === "index.docker.io";
}

function supportLevelForDocker(value) {
  if (value === "official") return "official";
  if (value === "community") return "community";
  return "third_party";
}

function sourceRegistryUrls(sourceRow) {
  const rawSources = sourceRow?.payload?.raw?.sources;
  const explicit = [
    sourceRow?.payload?.registry_url,
    sourceRow?.payload?.docker_url,
    sourceRow?.payload?.raw?.registry_url,
  ];
  return [...new Set([
    ...(Array.isArray(rawSources) ? rawSources : []),
    ...explicit,
  ].filter((value) => isRegistryPageUrl(value)))];
}

export function buildInstallOptions(app, sourceRows = []) {
  const options = [];
  const seen = new Set();

  function add({ method, url, image = null, support_level, source_url = null, note = null, sort_order = 0 }) {
    if (!isHttpUrl(url)) return;
    if (method === "docker" && isSourceFileUrl(url)) return;
    const key = `${method}|${url}`;
    if (seen.has(key)) return;
    seen.add(key);
    options.push({
      method,
      label: methodLabels.get(method) ?? method,
      url,
      image,
      support_level,
      source_url,
      note,
      sort_order,
    });
  }

  const dockerSourceUrl = isHttpUrl(app.docker_url) ? app.docker_url : app.install_docs_url ?? app.website_url;
  const registryUrl = isRegistryPageUrl(app.docker_url) && registryUrlMatchesImage(app.docker_url, app.docker_image)
    ? app.docker_url
    : registryUrlForImage(app.docker_image, {
        githubOwner: app.github_owner,
        githubRepo: app.github_repo,
      });

  if (registryUrl && app.docker_support !== "none") {
    add({
      method: "docker",
      url: registryUrl,
      image: app.docker_image,
      support_level: supportLevelForDocker(app.docker_support),
      source_url: dockerSourceUrl,
      note: app.docker_support === "community" ? "Community-maintained image. Verify the publisher before pulling." : null,
      sort_order: 10,
    });
  }

  const composeUrl = app.compose_url
    ?? (isComposeUrl(app.docker_url) ? app.docker_url : null);
  if (composeUrl) {
    add({
      method: "compose",
      url: composeUrl,
      image: app.docker_image,
      support_level: supportLevelForDocker(app.docker_support),
      source_url: composeUrl,
      sort_order: 20,
    });
  }

  for (const sourceRow of sourceRows) {
    if (sourceRow.source === "truenas_apps") {
      add({
        method: "truenas_scale",
        url: sourceRow.source_url,
        support_level: "official",
        source_url: sourceRow.source_url,
        note: "Listed in the TrueNAS SCALE app catalog; catalog listing does not imply publisher support.",
        sort_order: 30,
      });
    }
    if (sourceRow.source === "umbrel_apps") {
      add({
        method: "umbrel",
        url: sourceRow.source_url,
        support_level: "official",
        source_url: sourceRow.source_url,
        note: "Listed in the Umbrel app catalog; catalog listing does not imply publisher support.",
        sort_order: 40,
      });
    }
    if (sourceRow.source === "unraid_apps") {
      add({
        method: "unraid",
        url: sourceRow.source_url,
        support_level: "community",
        source_url: sourceRow.source_url,
        note: "Listed in the Unraid Community Applications catalog; verify the template publisher before installing.",
        sort_order: 35,
      });
    }
    if (sourceRow.source === "casaos_apps") {
      add({
        method: "casaos",
        url: sourceRow.source_url,
        support_level: "official",
        source_url: sourceRow.source_url,
        note: "Listed in the CasaOS app store; store listing does not imply publisher support.",
        sort_order: 45,
      });
      if (sourceRow.payload?.compose_url) {
        add({
          method: "compose",
          url: sourceRow.payload.compose_url,
          image: sourceRow.payload.image ?? app.docker_image,
          support_level: "official",
          source_url: sourceRow.source_url,
          sort_order: 20,
        });
      }
    }
    if (sourceRow.source === "yunohost_apps") {
      add({
        method: "yunohost",
        url: sourceRow.source_url,
        support_level: "official",
        source_url: sourceRow.source_url,
        note: "Listed in the YunoHost app catalog; package status and upstream support still need review.",
        sort_order: 50,
      });
    }

    if (!registryUrl && app.docker_support !== "none") {
      for (const sourceUrl of sourceRegistryUrls(sourceRow)) {
        add({
          method: "docker",
          url: sourceUrl,
          image: app.docker_image,
          support_level: supportLevelForDocker(app.docker_support),
          source_url: sourceRow.source_url,
          sort_order: 10,
        });
      }
    }
  }

  // Every self-hostable app should expose at least one actionable path. Some
  // projects publish native/package instructions without a registry image or
  // compose file, so retain the publisher's installation page as the fallback
  // instead of leaving an empty install-options row.
  if (options.length === 0) {
    const fallbackUrl = [app.install_docs_url, app.docs_url, app.source_code_url, app.website_url]
      .find((value) => isHttpUrl(value));
    if (fallbackUrl) {
      const methods = new Set(Array.isArray(app.deployment_methods) ? app.deployment_methods : []);
      const method = methods.has("package") ? "package"
        : methods.has("binary") ? "binary"
          : methods.has("native") ? "native"
            : "native";
      add({
        method,
        url: fallbackUrl,
        support_level: "official",
        source_url: fallbackUrl,
        note: "Publisher installation documentation; verify dependencies and platform support.",
        sort_order: 60,
      });
    }
  }

  return options.sort((a, b) => a.sort_order - b.sort_order || a.label.localeCompare(b.label) || a.url.localeCompare(b.url));
}
