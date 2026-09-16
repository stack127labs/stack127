import net from "node:net";
import { isPublicDnsAddress } from "../dns/authoritative.ts";
import type { NetworkQuery } from "./types.ts";

const MAX_QUERY_LENGTH = 256;

export type NetworkInputErrorCode =
  | "empty_query"
  | "invalid_query"
  | "cidr_not_supported"
  | "private_or_reserved"
  | "invalid_asn";

export class NetworkInputError extends Error {
  code: NetworkInputErrorCode;

  constructor(code: NetworkInputErrorCode, message: string) {
    super(message);
    this.name = "NetworkInputError";
    this.code = code;
  }
}

export type ParsedIp = {
  version: 4 | 6;
  value: bigint;
  normalized: string;
};

function parseIPv4(value: string): ParsedIp | null {
  if (net.isIP(value) !== 4) return null;
  const parts = value.split(".").map(Number);
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) return null;
  return {
    version: 4,
    value: parts.reduce((total, part) => (total << 8n) + BigInt(part), 0n),
    normalized: parts.join("."),
  };
}

function parseIPv6Groups(value: string): number[] | null {
  if (net.isIP(value) !== 6 || value.includes("%")) return null;
  const lower = value.toLowerCase();
  const pieces = lower.split("::");
  if (pieces.length > 2) return null;

  const parseSide = (side: string) => {
    if (!side) return [];
    const output: number[] = [];
    for (const piece of side.split(":")) {
      if (piece.includes(".")) {
        const ipv4 = parseIPv4(piece);
        if (!ipv4) return null;
        output.push(Number((ipv4.value >> 16n) & 0xffffn), Number(ipv4.value & 0xffffn));
      } else {
        if (!/^[0-9a-f]{1,4}$/.test(piece)) return null;
        output.push(Number.parseInt(piece, 16));
      }
    }
    return output;
  };

  const left = parseSide(pieces[0]);
  const right = parseSide(pieces[1] ?? "");
  if (!left || !right) return null;
  if (pieces.length === 1) return left.length === 8 ? left : null;
  const missing = 8 - left.length - right.length;
  if (missing < 1) return null;
  return [...left, ...Array.from({ length: missing }, () => 0), ...right];
}

function formatIPv6(groups: number[]) {
  const values = groups.map((group) => group.toString(16));
  let bestStart = -1;
  let bestLength = 0;
  let start = -1;
  for (let index = 0; index <= values.length; index += 1) {
    if (index < values.length && values[index] === "0") {
      if (start === -1) start = index;
    } else if (start !== -1) {
      const length = index - start;
      if (length > bestLength && length >= 2) {
        bestStart = start;
        bestLength = length;
      }
      start = -1;
    }
  }
  if (bestStart === -1) return values.join(":");
  const before = values.slice(0, bestStart).join(":");
  const after = values.slice(bestStart + bestLength).join(":");
  return `${before}::${after}`;
}

function parseIPv6(value: string): ParsedIp | null {
  const groups = parseIPv6Groups(value);
  if (!groups) return null;
  const numeric = groups.reduce((total, group) => (total << 16n) + BigInt(group), 0n);
  return { version: 6, value: numeric, normalized: formatIPv6(groups) };
}

export function parseIpLiteral(value: string): ParsedIp | null {
  return parseIPv4(value) ?? parseIPv6(value);
}

export function isPublicAsn(asn: number) {
  return Number.isSafeInteger(asn)
    && asn >= 1
    && asn <= 4_294_967_294
    && asn !== 23_456
    && !(asn >= 64_496 && asn <= 64_511)
    && !(asn >= 64_512 && asn <= 65_534)
    && asn !== 65_535
    && !(asn >= 65_536 && asn <= 65_551)
    && !(asn >= 4_200_000_000 && asn <= 4_294_967_294);
}

export function parseNetworkQuery(input: unknown): NetworkQuery {
  if (typeof input !== "string") throw new NetworkInputError("invalid_query", "Enter an IP address or ASN.");
  if (/[\u0000-\u001f\u007f]/.test(input)) {
    throw new NetworkInputError("invalid_query", "Enter one IP address or ASN.");
  }
  const raw = input.trim();
  if (!raw) throw new NetworkInputError("empty_query", "Enter an IP address or ASN.");
  if (raw.length > MAX_QUERY_LENGTH) {
    throw new NetworkInputError("invalid_query", "Enter one IP address or ASN.");
  }
  if (raw.includes("/")) throw new NetworkInputError("cidr_not_supported", "Enter one IP address, not a CIDR range.");

  const parsedIp = parseIpLiteral(raw);
  if (parsedIp) {
    if (!isPublicDnsAddress(raw)) {
      throw new NetworkInputError("private_or_reserved", "Private and reserved IP addresses are not checked here.");
    }
    return {
      raw,
      normalized: parsedIp.normalized,
      kind: "ip",
      ipVersion: parsedIp.version,
      address: parsedIp.normalized,
      asn: null,
    };
  }

  const asnMatch = /^(?:as)?([0-9]+)$/i.exec(raw);
  if (!asnMatch) throw new NetworkInputError("invalid_query", "Enter a public IP address or ASN such as AS13335.");
  const asn = Number(asnMatch[1]);
  if (!isPublicAsn(asn)) throw new NetworkInputError("private_or_reserved", "Private and reserved ASNs are not checked here.");
  return { raw, normalized: `AS${asn}`, kind: "asn", ipVersion: null, address: null, asn };
}
