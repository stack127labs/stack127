/** The one entry point every domain tool uses to get a registration record. */

import { buildRegistration } from "./normalize.ts";
import { normalizeDomainInput } from "./public-suffix.ts";
import { fetchRegistrar, fetchRegistry, registrarUrlFrom, type FetchOptions } from "./rdap.ts";
import { tldTypeFor } from "./tld-directory.ts";
import type { DomainRegistration } from "./types.ts";

export type LookupOptions = FetchOptions & {
  /** Skip the registrar hop when a tool only needs registry facts. */
  includeRegistrar?: boolean;
};

export async function lookupDomain(rawInput: string, options: LookupOptions = {}): Promise<DomainRegistration> {
  const startedAt = Date.now();
  const query = normalizeDomainInput(rawInput);
  const { coverage, fetch: registry } = await fetchRegistry(query.domain, query.tld, options);

  let registrar = null;
  if (options.includeRegistrar !== false && registry.status === "registered" && coverage.source !== "whois") {
    const registrarUrl = registrarUrlFrom(registry.body);
    // The hop is optional. A failure degrades the page quietly and never fails
    // the lookup, so it is deliberately not awaited inside a try that rethrows.
    if (registrarUrl) registrar = await fetchRegistrar(registrarUrl, options, query.tld);
  }

  return buildRegistration({
    query: {
      input: query.input,
      domain: query.domain,
      unicode: query.unicode,
      tld: query.tld,
      tldType: tldTypeFor(query.tld),
      suffix: query.suffix,
      reduced: query.reduced,
      isIdn: query.isIdn,
      guessedSuffix: query.guessedSuffix,
    },
    coverage: {
      source: coverage.source,
      operator: coverage.operator,
      url: coverage.url,
      host: coverage.host,
      unknownTld: coverage.unknownTld,
    },
    registry,
    registrar,
    startedAt,
  });
}
