/** Conservative WHOIS parsing: a domain echo alone is never a registration. */
import { domainToASCII } from "node:url";
import { STATUS_CODES } from "./status-codes.ts";
import type { RdapFetchStatus } from "./types.ts";

export type WhoisService = {
  server: string;
  parser: "key-value" | "bracket" | "blocks";
  verifiedWith: string;
  notFoundWith: string;
  /** Anchored, observed registry text; {domain} is replaced with the escaped query. */
  notFoundPattern: string;
  verifiedAt: string;
  queryPrefix?: string;
  querySuffix?: string;
  /** Enable only for a server whose day/month/year convention was verified. */
  dateOrder?: "dmy";
  /** Some verified key-value servers (NIC Chile) omit the domain echo entirely. */
  domainEcho?: false;
};

type Fields = Map<string, string[]>;
function key(value: string) { return value.toLowerCase().replace(/^\*+[\t ]*/, "").replace(/\.+$/, "").replace(/[\s_-]+/g, " ").trim(); }
function fieldsFrom(text: string, parser: WhoisService["parser"]): Fields {
  const fields: Fields = new Map();
  let lastKey: string | null = null;
  let block: string | null = null;
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim() || /^[%#>]/.test(line.trim())) { lastKey = null; block = null; continue; }
    const heading = key(line.trim().replace(/:$/, ""));
    if (parser === "blocks" && ["domain", "registrar", "registrant", "nameservers", "name servers", "name server information", "domain servers", "dns servers", "relevant dates", "admin contact", "technical contacts"].includes(heading)) {
      block = heading; lastKey = heading; continue;
    }
    if (block === "relevant dates" && /^\s*Registered on /.test(line)) {
      fields.set(block, [...(fields.get(block) ?? []), line.trim()]); continue;
    }
    // Block values can contain colons in URLs and IPv6 addresses. Those colons
    // are content, not key separators (e.g. MarkMonitor Inc. (http://...)).
    if (parser === "blocks" && lastKey === block &&
      ["registrar", "nameservers", "name servers", "domain servers", "dns servers", "name server information"].includes(block ?? "") &&
      /^\s+\S/.test(line) && !/^\s*(?:name|organisation|organization|website|web|url|nserver|name server|nameserver|dnssec):/i.test(line)) {
      fields.set(lastKey!, [...(fields.get(lastKey!) ?? []), line.trim()]); continue;
    }
    const match = parser === "bracket"
      ? line.match(/^\s*\[([^\]]+)\][\t ]*(.*)$/) ?? line.match(/^\s*([^:]+):[\t ]*(.*)$/)
      : line.match(/^\s*([^:]+):[\t ]*(.*)$/);
    if (match) {
      let name = key(match[1]);
      const value = match[2].trim().replace(/^\.+/, "");
      if (parser === "blocks" && /^\S/.test(line) && !value) block = name;
      if (parser === "blocks" && block && ["domain", "registrar", "registrant", "admin contact", "technical contacts"].includes(block) &&
        !(block === "domain" && name !== "name")) name = `${block} ${name}`;
      lastKey = name;
      if (value) fields.set(name, [...(fields.get(name) ?? []), value]);
    } else if (lastKey && (/^\s+\S/.test(line) || ["domain servers", "dns servers", "name server information"].includes(block ?? ""))) {
      fields.set(lastKey, [...(fields.get(lastKey) ?? []), line.trim()]);
    } else { lastKey = null; block = null; }
  }
  return fields;
}

function values(fields: Fields, names: string[]) { return names.flatMap(name => fields.get(name) ?? []); }
function first(fields: Fields, names: string[]) { return values(fields, names)[0] ?? null; }

/** Reject ambiguous local timestamps and invalid/rolled-over calendar dates. */
export function parseWhoisDate(value: string | null, dateOrder?: "dmy"): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  // Without a timezone we know the published calendar day, not the instant.
  const local = trimmed.match(/^(\d{4})[-/.](\d{2})[-/.](\d{2})[T ](?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\s*\([^)]*\))?$/);
  if (local) return parseWhoisDate(`${local[1]}-${local[2]}-${local[3]}`);
  const compact = trimmed.match(/^(\d{4})(\d{2})(\d{2})(?: [0-2]\d:[0-5]\d:[0-5]\d)?$/);
  if (compact) return parseWhoisDate(`${compact[1]}-${compact[2]}-${compact[3]}`);
  const dmy = dateOrder === "dmy" && trimmed.match(/^(\d{2})[\/.-](\d{2})[\/.-](\d{4})(?: [0-2]\d:[0-5]\d:[0-5]\d)?$/);
  if (dmy) return parseWhoisDate(`${dmy[3]}-${dmy[2]}-${dmy[1]}`);
  const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
  const named = trimmed.match(/^(?:[A-Za-z]{3} )?([A-Za-z]{3}) (\d{1,2}) (\d{4})$/)
    ?? trimmed.match(/^(\d{4})-([A-Za-z]{3})-(\d{1,2})\.?$/)
    ?? trimmed.match(/^(\d{1,2})(?:st|nd|rd|th)?[- ]([A-Za-z]+)[- ](\d{4})(?:(?: at)? [\d:.]+)?$/);
  if (named) {
    const monthName = named.slice(1).find(part => /^[a-z]+$/i.test(part));
    const month = months.indexOf(monthName?.slice(0, 3).toLowerCase() ?? "") + 1;
    const year = named.slice(1).find(part => /^\d{4}$/.test(part));
    const day = named.slice(1).find(part => /^\d{1,2}$/.test(part));
    return month && year && day ? parseWhoisDate(`${year}-${String(month).padStart(2, "0")}-${day.padStart(2, "0")}`) : null;
  }
  const date = trimmed.match(/^(\d{4})[-/.](\d{2})[-/.](\d{2})(?:\s*\([^)]*\))?$/);
  if (date) {
    const iso = `${date[1]}-${date[2]}-${date[3]}`;
    const parsed = new Date(`${iso}T00:00:00Z`);
    return Number.isFinite(parsed.getTime()) && parsed.toISOString().startsWith(iso) ? iso : null;
  }
  if (!/^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})$/i.test(trimmed)) return null;
  const normalized = trimmed.replace(" ", "T");
  const time = Date.parse(normalized);
  const day = normalized.slice(0, 10);
  const calendar = new Date(`${day}T00:00:00Z`);
  return Number.isFinite(time) && Number.isFinite(calendar.getTime()) && calendar.toISOString().startsWith(day)
    ? new Date(time).toISOString() : null;
}

const DATE_FIELDS = [
  ["registration", ["creation date", "created", "created on", "created date", "created at", "domain created", "registered", "registered on", "registration date", "registration time", "registered date", "domain dateregistered", "domain record activated"]],
  ["expiration", ["registry expiry date", "expiry", "expiry date", "expire date", "expiration", "expiration date", "expiration time", "expires", "expires on", "expires at", "domain expires", "paid till", "paid till date", "renewal date", "renew by date", "expire"]],
  ["registrar expiration", ["registrar registration expiration date"]],
  ["last changed", ["updated date", "last updated", "last updated on", "last modified", "last update", "modified", "changed", "changed on", "last modified date", "modification date", "domain datemodified"]],
] as const;

const domainKeys = ["domain", "domain name", "domainname", "domain name ascii", "domain name unicode"];
const nsKeys = ["name server", "name servers", "nameserver", "nameservers", "nserver", "domain nameservers", "domain servers", "dns servers", "name server information", "name server (db)"];
const registrarKeys = ["registrar organization", "registrar organisation", "registrar company name", "registrar name", "registrar", "sponsoring registrar"];

export function parseWhoisResponse(text: string, domain: string, service: WhoisService): {
  status: RdapFetchStatus; body: unknown; error: string | null;
} {
  // These signals take precedence over the domain echo and the not-found pattern.
  const signals = text.split(/\r?\n/).filter(line => line.length < 512 && !/\bif too many\b/i.test(line)).join("\n");
  if (/(?:quota|limit)[^\r\n]{0,60}(?:exceed|reached)|too many (?:queries|requests|connections)|^\s*(?:[%#]\s*)?(?:error[:\s\d]*)?rate[- ]limited[.!\s]*$|temporarily blocked/im.test(signals)) {
    return { status: "rate_limited", body: null, error: "The WHOIS server is limiting our requests." };
  }
  if (/access denied|requests of this client are not permitted|permission denied/i.test(text)) {
    return { status: "blocked", body: null, error: "The WHOIS server refused our request." };
  }
  if (/^[\t ]*(?:[%#][\t ]*)?(?:(?:domain )?status:[\t ]*)?(?:reserved|blocked|restricted)[\t ]*\r?$|^.*(?:domain|name) (?:is|has been) (?:reserved|blocked)\b/im.test(text)) {
    return { status: "registry_error", body: null, error: "The WHOIS server did not provide a registration answer." };
  }
  const fields = fieldsFrom(text, service.parser);
  const domainValues = values(fields, domainKeys);
  const matchesDomain = domainValues.some(value => {
    const match = value.match(/^(\S+)(?: \((\S+)\))?$/);
    return match && [match[1], ...(match[2] ? [match[2]] : [])].every(name => domainToASCII(name.toLowerCase().replace(/\.$/, "")) === domain.toLowerCase());
  });
  if (domainValues.length && !matchesDomain) {
    return { status: "registry_error", body: null, error: "The WHOIS server did not answer for the requested domain." };
  }
  const registrar = first(fields, registrarKeys);
  const nameservers = [...new Set([...values(fields, nsKeys),
    ...[...fields].filter(([name]) => /^ns name \d+$/.test(name)).flatMap(([, values]) => values)]
    .map(value => value.split(/\s+/)[0].toLowerCase().replace(/\.$/, ""))
    .filter(value => /^(?=.{1,253}$)[a-z0-9-]+(?:\.[a-z0-9-]+)+$/.test(value)))];
  const events = DATE_FIELDS.flatMap(([action, names]) => {
    const date = parseWhoisDate(first(fields, [...names]), service.dateOrder);
    return date ? [{ eventAction: action, eventDate: date }] : [];
  });
  const registeredOn = first(fields, ["relevant dates"])?.match(/^Registered on (.+)$/)?.[1];
  if (registeredOn && !events.some(event => event.eventAction === "registration")) {
    const date = parseWhoisDate(registeredOn);
    if (date) events.push({ eventAction: "registration", eventDate: date });
  }
  const statusValues = values(fields, ["domain status", "status", "state", "flags", "lock status", "transfer status"]);
  if (statusValues.some(value => /\b(?:reserved|blocked|restricted)\b/i.test(value))) {
    return { status: "registry_error", body: null, error: "The WHOIS server did not provide a registration answer." };
  }
  // Only exact EPP tokens (possibly followed by their documentation URL) map.
  const statuses = statusValues.flatMap(value => value.split(/,[\t ]*/)).flatMap(value => {
    const token = value.replace(/\s+https?:\/\/\S+$/, "").trim();
    const known = STATUS_CODES.find(code => code.epp === token);
    return known ? [known.rdap] : [];
  });
  const hasRecord = Boolean((matchesDomain || (!domainValues.length && service.domainEcho === false && registrar && nameservers.length))
    && (registrar || nameservers.length || events.length || statusValues.some(value => value === "Registered" || value === "registered" || value === "ok")));
  const escapedDomain = domain.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const notFound = new RegExp(service.notFoundPattern.replaceAll("{domain}", escapedDomain), "im").test(text);
  if (notFound && hasRecord) {
    return { status: "registry_error", body: null, error: "The WHOIS server returned conflicting registration signals." };
  }
  if (notFound) return { status: "not_registered", body: null, error: null };
  if (!hasRecord) return { status: "registry_error", body: null, error: "The WHOIS server did not provide a registration answer." };

  const dnssec = first(fields, ["dnssec", "signed", "dnssec signed delegation"]);
  const signed = dnssec && /^(?:signedDelegation|signed delegation|signed|yes|true)$/i.test(dnssec) ? true
    : dnssec && /^(?:unsigned|unsigned delegation|no|false)$/i.test(dnssec) ? false : null;
  const entities = [];
  if (registrar) entities.push({ roles: ["registrar"],
    handle: /^\d+$/.test(first(fields, ["registrar iana id"]) ?? "") ? first(fields, ["registrar iana id"]) : null,
    vcardArray: ["vcard", [["fn", {}, "text", registrar],
      ...(first(fields, ["registrar url", "registrar website", "registrar web"]) ? [["url", {}, "uri", first(fields, ["registrar url", "registrar website", "registrar web"])]] : [])]] });
  const abuseEmail = first(fields, ["registrar abuse contact email"]);
  const abusePhone = first(fields, ["registrar abuse contact phone"]);
  if (abuseEmail || abusePhone) entities.push({ roles: ["abuse"], vcardArray: ["vcard", [
    ...(abuseEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(abuseEmail) ? [["email", {}, "text", abuseEmail]] : []),
    ...(abusePhone && /\d/.test(abusePhone) ? [["tel", {}, "text", abusePhone]] : []),
  ]] });
  const registrantFields = [
    ["fn", "registrant name"], ["org", "registrant organization"], ["email", "registrant email"], ["tel", "registrant phone"],
  ].flatMap(([property, name]) => {
    const value = first(fields, name === "registrant name" ? [name, "registrant"]
      : name === "registrant organization" ? [name, "registrant organisation"] : [name]);
    if (!value || /redacted|not disclosed|not shown|data protected|^private$/i.test(value)) return [];
    if (property === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return [];
    return [[property, {}, "text", value]];
  });
  if (registrantFields.length) entities.push({ roles: ["registrant"], vcardArray: ["vcard", registrantFields] });
  // RDAP-shaped facts let every existing tool share normalization; protocol says
  // where they came from. Do not store or return the raw contact-heavy WHOIS text.
  return { status: "registered", error: null, body: {
    objectClassName: "domain", ldhName: domain, events, status: [...new Set(statuses)],
    nameservers: nameservers.map(ldhName => ({ ldhName })), entities,
    ...(signed === null ? {} : { secureDNS: { delegationSigned: signed } }),
    whois: { server: service.server, parser: service.parser, rawStatuses: statusValues },
  } };
}
