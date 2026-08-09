export const NGINX_PROXY_PASS_FORMULA_VERSION = "nginx-proxy-pass-uri-v1";
export const NGINX_FIXTURE_VERSION = "1.30.4";

export type LocationType = "prefix" | "exact" | "regex" | "named";
export type RewriteState = "none" | "break" | "last" | "other";

export type ProxyPassInput = {
  locationType: LocationType;
  location: string;
  requestTarget: string;
  proxyPass: string;
  rewriteState: RewriteState;
  compareSlash: boolean;
};

type InputField = "locationType" | "location" | "requestTarget" | "proxyPass" | "rewriteState" | "compareSlash";

export type ProxyPassTrace = {
  requestPath: string;
  matchedLocation: string;
  retainedSuffix: string;
  proxyUriPresence: "absent" | "present";
  replacementUri: string | null;
  finalPath: string;
  requestArguments: string | null;
};

export type ProxyPassResult =
  | { status: "invalid"; errors: Partial<Record<InputField, string>> }
  | {
      status: "unknown";
      reason:
        | "regex-location"
        | "named-location"
        | "variables"
        | "rewrite-break"
        | "rewrite-last"
        | "rewrite-other"
        | "proxy-query"
        | "normalization-sensitive";
      field: "locationType" | "location" | "requestTarget" | "proxyPass" | "rewriteState";
    }
  | {
      status: "success";
      finalUrl: string;
      trace: ProxyPassTrace;
      comparison: { proxyPass: string; finalUrl: string } | null;
      formulaVersion: typeof NGINX_PROXY_PASS_FORMULA_VERSION;
      fixtureVersion: typeof NGINX_FIXTURE_VERSION;
    };

const inputKeys: InputField[] = [
  "locationType",
  "location",
  "requestTarget",
  "proxyPass",
  "rewriteState",
  "compareSlash",
];
const locationTypes = new Set<LocationType>(["prefix", "exact", "regex", "named"]);
const rewriteStates = new Set<RewriteState>(["none", "break", "last", "other"]);
const controlPattern = /[\u0000-\u001f\u007f]/;

type ParsedProxyPass = {
  schemeAuthority: string;
  uri: string | null;
};

function invalid(field: InputField, message: string): ProxyPassResult {
  return { status: "invalid", errors: { [field]: message } };
}

function hasExactKeys(value: Record<string, unknown>) {
  const keys = Object.keys(value).sort();
  return keys.length === inputKeys.length && inputKeys.every((key, index) => keys[index] === [...inputKeys].sort()[index]);
}

function normalizationSensitive(path: string) {
  if (path.includes("%") || path.includes("\\") || path.includes("//")) return true;
  return path.split("/").some((segment) => segment === "." || segment === "..");
}

function parseProxyPass(raw: string): ParsedProxyPass | ProxyPassResult {
  if (raw.includes("$")) return { status: "unknown", reason: "variables", field: "proxyPass" };
  if (raw.includes("#")) return invalid("proxyPass", "Remove the fragment from proxy_pass.");
  if (controlPattern.test(raw)) return invalid("proxyPass", "Remove control characters from proxy_pass.");
  const match = raw.match(/^(https?):\/\/(\[[0-9a-f:.]+\]|[^\s\/?#:@]+)(?::([^\s\/?#]+))?(.*)$/i);
  if (!match) return invalid("proxyPass", "Use a static http:// or https:// URL without credentials.");
  const [, scheme, host, rawPort, remainder] = match;
  if (!host) return invalid("proxyPass", "Add an upstream hostname or address.");
  if (rawPort !== undefined) {
    if (!/^\d+$/.test(rawPort)) return invalid("proxyPass", "Use a numeric upstream port.");
    const port = Number(rawPort);
    if (!Number.isInteger(port) || port < 1 || port > 65_535) return invalid("proxyPass", "Use a port from 1 to 65535.");
  }
  try {
    new URL(`${scheme}://${host}${rawPort === undefined ? "" : `:${rawPort}`}/`);
  } catch {
    return invalid("proxyPass", "Use a valid upstream hostname or IP address.");
  }
  if (remainder.includes("?")) return { status: "unknown", reason: "proxy-query", field: "proxyPass" };
  if (remainder !== "" && !remainder.startsWith("/")) return invalid("proxyPass", "Start the proxy_pass URI with /.");
  const authority = `${scheme}://${host}${rawPort === undefined ? "" : `:${rawPort}`}`;
  return { schemeAuthority: authority, uri: remainder === "" ? null : remainder };
}

function construct(
  requestPath: string,
  requestArguments: string | null,
  location: string,
  parsed: ParsedProxyPass,
) {
  const retainedSuffix = requestPath.slice(location.length);
  const finalPath = parsed.uri === null ? requestPath : `${parsed.uri}${retainedSuffix}`;
  const finalTarget = requestArguments === null ? finalPath : `${finalPath}?${requestArguments}`;
  return {
    finalUrl: `${parsed.schemeAuthority}${finalTarget}`,
    trace: {
      requestPath,
      matchedLocation: location,
      retainedSuffix,
      proxyUriPresence: parsed.uri === null ? "absent" as const : "present" as const,
      replacementUri: parsed.uri,
      finalPath,
      requestArguments,
    },
  };
}

function toggledProxyPass(parsed: ParsedProxyPass) {
  if (parsed.uri === null) return `${parsed.schemeAuthority}/`;
  if (parsed.uri === "/") return parsed.schemeAuthority;
  return `${parsed.schemeAuthority}${parsed.uri.endsWith("/") ? parsed.uri.slice(0, -1) : `${parsed.uri}/`}`;
}

export function calculateProxyPassUri(candidate: unknown): ProxyPassResult {
  if (candidate === null || typeof candidate !== "object" || Array.isArray(candidate)) {
    return invalid("location", "Provide one calculator input object.");
  }
  const raw = candidate as Record<string, unknown>;
  if (!hasExactKeys(raw)) return invalid("location", "Use only the supported calculator fields.");
  if (typeof raw.locationType !== "string" || !locationTypes.has(raw.locationType as LocationType)) {
    return invalid("locationType", "Choose a supported location type.");
  }
  if (typeof raw.rewriteState !== "string" || !rewriteStates.has(raw.rewriteState as RewriteState)) {
    return invalid("rewriteState", "Choose a supported rewrite state.");
  }
  if (typeof raw.compareSlash !== "boolean") return invalid("compareSlash", "Use a boolean comparison choice.");
  for (const field of ["location", "requestTarget", "proxyPass"] as const) {
    if (typeof raw[field] !== "string") return invalid(field, "Enter text for this field.");
  }

  const locationType = raw.locationType as LocationType;
  const rewriteState = raw.rewriteState as RewriteState;
  const compareSlash = raw.compareSlash;
  const location = (raw.location as string).trim();
  const requestTarget = (raw.requestTarget as string).trim();
  const proxyPass = (raw.proxyPass as string).trim();

  const errors: Partial<Record<InputField, string>> = {};
  if (locationType === "prefix" || locationType === "exact") {
    if (location.length === 0) errors.location = "Enter the matched location.";
    else if (location.length > 512) errors.location = "Keep the location to 512 characters or fewer.";
    else if (controlPattern.test(location) || location.includes("#") || location.includes("?") || location.includes(" ")) {
      errors.location = "Use one literal location path without arguments, fragments, spaces, or controls.";
    } else if (!location.startsWith("/")) errors.location = "Start a prefix or exact location with /.";
  }

  if (requestTarget.length === 0) errors.requestTarget = "Enter the incoming request target.";
  else if (requestTarget.length > 4096) errors.requestTarget = "Keep the request target to 4096 characters or fewer.";
  else if (controlPattern.test(requestTarget) || requestTarget.includes("#") || requestTarget.includes(" ")) {
    errors.requestTarget = "Use a request target without fragments, spaces, or controls.";
  } else if (!requestTarget.startsWith("/")) errors.requestTarget = "Start the request target with /.";

  let parsedProxyPass: ParsedProxyPass | ProxyPassResult | null = null;
  if (proxyPass.length === 0) errors.proxyPass = "Enter the proxy_pass URL.";
  else if (proxyPass.length > 2048) errors.proxyPass = "Keep proxy_pass to 2048 characters or fewer.";
  else {
    parsedProxyPass = parseProxyPass(proxyPass);
    if ("status" in parsedProxyPass && parsedProxyPass.status === "invalid") {
      errors.proxyPass = parsedProxyPass.errors.proxyPass;
    }
  }
  if (Object.keys(errors).length > 0) return { status: "invalid", errors };

  if (locationType === "regex") return { status: "unknown", reason: "regex-location", field: "locationType" };
  if (locationType === "named") return { status: "unknown", reason: "named-location", field: "locationType" };
  if (rewriteState === "break") return { status: "unknown", reason: "rewrite-break", field: "rewriteState" };
  if (rewriteState === "last") return { status: "unknown", reason: "rewrite-last", field: "rewriteState" };
  if (rewriteState === "other") return { status: "unknown", reason: "rewrite-other", field: "rewriteState" };

  const question = requestTarget.indexOf("?");
  const requestPath = question === -1 ? requestTarget : requestTarget.slice(0, question);
  const requestArguments = question === -1 ? null : requestTarget.slice(question + 1);
  if (normalizationSensitive(location)) {
    return { status: "unknown", reason: "normalization-sensitive", field: "location" };
  }
  if (normalizationSensitive(requestPath)) {
    return { status: "unknown", reason: "normalization-sensitive", field: "requestTarget" };
  }

  if (locationType === "exact" ? requestPath !== location : !requestPath.startsWith(location)) {
    return invalid("requestTarget", "This request path does not match the selected location.");
  }

  const parsed = parsedProxyPass ?? parseProxyPass(proxyPass);
  if ("status" in parsed) return parsed;
  const primary = construct(requestPath, requestArguments, location, parsed);
  let comparison: { proxyPass: string; finalUrl: string } | null = null;
  if (compareSlash) {
    const toggled = toggledProxyPass(parsed);
    const toggledParsed = parseProxyPass(toggled);
    if (!("status" in toggledParsed)) {
      comparison = { proxyPass: toggled, finalUrl: construct(requestPath, requestArguments, location, toggledParsed).finalUrl };
    }
  }
  return {
    status: "success",
    finalUrl: primary.finalUrl,
    trace: primary.trace,
    comparison,
    formulaVersion: NGINX_PROXY_PASS_FORMULA_VERSION,
    fixtureVersion: NGINX_FIXTURE_VERSION,
  };
}
