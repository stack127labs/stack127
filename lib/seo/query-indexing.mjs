// Keep origin decisions and the static frontend's Ruleset Engine expression together.
export const trackingQueryNames = Object.freeze([
  "gclid", "dclid", "gbraid", "wbraid", "fbclid", "msclkid", "ref", "mc_cid", "mc_eid",
]);

/** @param {string} name Raw, case-sensitive parameter name, without URL decoding. */
export function isTrackingQueryName(name) {
  return name.startsWith("utm_") || trackingQueryNames.includes(name);
}

/** @param {string} search The URL search, with or without its leading question mark. */
export function queryNeedsNoindex(search) {
  const query = search.startsWith("?") ? search.slice(1) : search;
  if (!query) return false;
  // Cloudflare args.names preserves encoding and case. URLSearchParams decodes names,
  // which would incorrectly exempt e.g. %75tm_source only at the origin.
  const arguments_ = query.split("&").filter(Boolean);
  return arguments_.length === 0 || arguments_.some(argument => !isTrackingQueryName(argument.split("=", 1)[0]));
}

export function queryNoindexExpression() {
  const names = "http.request.uri.args.names";
  const allowed = trackingQueryNames.map(name => JSON.stringify(name)).join(" ");
  // The predicates inside any() apply to the SAME name. Two separate any()
  // calls would wrongly reject a mix of utm_source and gclid.
  return `(http.host eq "stack127.com" and http.request.uri.query ne "" and (len(${names}) eq 0 or any(not starts_with(${names}[*], "utm_") and not ${names}[*] in {${allowed}})) and not starts_with(http.request.uri.path, "/api/") and not starts_with(http.request.uri.path, "/_next/") and not starts_with(http.request.uri.path, "/vitals/"))`;
}
