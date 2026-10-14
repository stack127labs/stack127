import { assertValidDomainLabels } from "./public-suffix.ts";
import type { WhoisService } from "./whois-parser.ts";

/** Only reviewed query syntax can decorate a valid, normalized domain. */
export function whoisQueryFor(domain: string, service: Pick<WhoisService, "queryPrefix" | "querySuffix">): string {
  assertValidDomainLabels(domain);
  return (service.queryPrefix ?? "") + domain + (service.querySuffix ?? "");
}
