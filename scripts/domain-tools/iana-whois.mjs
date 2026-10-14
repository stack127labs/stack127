import { domainToASCII } from "node:url";

/** Empty fields must never consume the next line (\s includes newlines). */
export function parseIanaWhoisServer(text) {
  const value = text.match(/^whois:[\t ]*([^\r\n]*)$/mi)?.[1]?.trim().toLowerCase();
  return value && /^(?=.{1,253}$)[a-z0-9-]+(?:\.[a-z0-9-]+)+$/.test(value) ? value : null;
}

export function parseIanaDomain(text) {
  const value = text.match(/^domain-ace:[\t ]*([^\r\n]+)/mi)?.[1]
    ?? text.match(/^domain:[\t ]*([^\r\n]+)/mi)?.[1];
  return value ? domainToASCII(value.trim().toLowerCase()) : null;
}
