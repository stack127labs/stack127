import { normalizeDomain } from "./lib.mjs";

export const PARSER_VERSION = "ads-txt-1.1.0";

const DOMAIN_VARIABLES = new Set([
  "OWNERDOMAIN",
  "MANAGERDOMAIN",
  "SUBDOMAIN",
  "INVENTORYPARTNERDOMAIN",
]);

function withoutComment(line) {
  const commentAt = line.indexOf("#");
  return (commentAt >= 0 ? line.slice(0, commentAt) : line).trim();
}

function parseVariable(line, lineNumber) {
  const match = line.match(/^([A-Za-z][A-Za-z0-9_-]*)\s*=\s*(.*?)\s*$/);
  if (!match) return null;
  const name = match[1].toUpperCase();
  const rawValue = match[2].trim();
  if (!rawValue) return { error: { line: lineNumber, reason: "empty_variable", value: line } };

  if (!DOMAIN_VARIABLES.has(name)) {
    return { variable: { name, value: rawValue, line: lineNumber } };
  }

  const fields = rawValue.split(",").map((field) => field.trim());
  const domain = normalizeDomain(fields[0], { stripWww: name !== "SUBDOMAIN" });
  if (!domain) return { error: { line: lineNumber, reason: "invalid_variable_domain", value: line } };

  const variable = { name, value: domain, line: lineNumber };
  if (name === "MANAGERDOMAIN" && fields[1]) {
    const country = fields[1].toUpperCase();
    if (!/^[A-Z]{2}$/.test(country)) {
      return { error: { line: lineNumber, reason: "invalid_manager_country", value: line } };
    }
    variable.country = country;
  }
  return { variable };
}

function parseSeller(line, lineNumber) {
  const fields = line.split(",").map((field) => field.trim());
  if (fields.length < 3) {
    return { error: { line: lineNumber, reason: "too_few_seller_fields", value: line } };
  }

  const adSystem = normalizeDomain(fields[0]);
  const sellerId = fields[1];
  const relationship = fields[2].toUpperCase();
  const certificationAuthorityId = fields[3] || null;
  if (!adSystem) return { error: { line: lineNumber, reason: "invalid_ad_system", value: line } };
  if (!sellerId) return { error: { line: lineNumber, reason: "missing_seller_id", value: line } };
  if (relationship !== "DIRECT" && relationship !== "RESELLER") {
    return { error: { line: lineNumber, reason: "invalid_relationship", value: line } };
  }

  return {
    seller: {
      adSystem,
      sellerId,
      relationship,
      certificationAuthorityId,
      line: lineNumber,
      raw: line,
    },
  };
}

export function parseAdsTxt(text, { deduplicate = true } = {}) {
  if (typeof text !== "string") throw new TypeError("ads.txt content must be text");
  const sellers = [];
  const variables = [];
  const errors = [];
  const seenSellerRows = new Set();
  const normalizedText = text.replace(/^\uFEFF/, "");

  for (const [index, rawLine] of normalizedText.split(/\r\n|\n|\r/).entries()) {
    const lineNumber = index + 1;
    const line = withoutComment(rawLine);
    if (!line) continue;

    const parsed = line.includes("=") && !line.includes(",")
      ? parseVariable(line, lineNumber)
      : line.match(/^[A-Za-z][A-Za-z0-9_-]*\s*=/)
        ? parseVariable(line, lineNumber)
        : parseSeller(line, lineNumber);

    if (parsed?.error) errors.push(parsed.error);
    if (parsed?.variable) variables.push(parsed.variable);
    if (parsed?.seller) {
      const key = [
        parsed.seller.adSystem,
        parsed.seller.sellerId,
        parsed.seller.relationship,
        parsed.seller.certificationAuthorityId ?? "",
      ].join("\u0000");
      if (!deduplicate || !seenSellerRows.has(key)) {
        seenSellerRows.add(key);
        sellers.push(parsed.seller);
      }
    }
  }

  const values = (name) => variables.filter((item) => item.name === name);
  return {
    parserVersion: PARSER_VERSION,
    sellers,
    variables,
    ownerDomains: values("OWNERDOMAIN"),
    managerDomains: values("MANAGERDOMAIN"),
    subdomains: values("SUBDOMAIN"),
    inventoryPartnerDomains: values("INVENTORYPARTNERDOMAIN"),
    errors,
    nonEmptyLineCount: sellers.length + variables.length + errors.length,
  };
}
