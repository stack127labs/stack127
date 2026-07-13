import { DoHResolver, RecordingResolver, walk, type WalkResult, type WalkStep } from "@namefi/dnssec-audit";
import { queryPublicResolver } from "./doh.ts";
import { dnsResponseCode, normalizeChangeRecordType, normalizeDiagnosticName, normalizeWireRecord, type PublicDiagnosticQuery } from "./diagnostics.ts";
import type { RawDnsWireResponse } from "./dns-wire.ts";
import { recordTypeCode } from "./record-types.ts";

export const DNSSEC_RECORD_TYPES = ["A", "AAAA", "CNAME", "MX", "NS", "TXT", "CAA", "SOA", "SRV"] as const;
export type DnssecRecordType = (typeof DNSSEC_RECORD_TYPES)[number];
export type DnssecVerdict = "secure" | "insecure" | "bogus" | "indeterminate";

export function normalizeDnssecRecordType(value: unknown): DnssecRecordType {
  const type = normalizeChangeRecordType(value);
  if (DNSSEC_RECORD_TYPES.includes(type as DnssecRecordType)) return type as DnssecRecordType;
  throw new Error("Choose A, AAAA, CNAME, MX, NS, TXT, CAA, SOA, or SRV.");
}

export function parseDelvVerdict(output: string, exitCode = 0): { verdict: DnssecVerdict; explanation: string } {
  const lower = output.toLowerCase();
  const failure = output.split("\n").map((line) => line.trim()).find((line) => /validation failed|broken trust chain|bad signature|no valid signature|insecurity proof|dnssec.*failed/i.test(line));
  if (/validation failed|broken trust chain|bad signature|no valid signature|insecurity proof failed|must be secure/i.test(lower)) {
    return { verdict: "bogus", explanation: failure ?? "The validator could not build a valid chain of signatures to the root trust anchor." };
  }
  if (/fully validated|trust secure|validated successfully/i.test(lower)) {
    return { verdict: "secure", explanation: "The validator built a complete chain of trust to the DNS root." };
  }
  if (/unsigned answer|trust answer|insecure answer|proved insecure/i.test(lower) && exitCode === 0) {
    return { verdict: "insecure", explanation: "The validator found an unsigned delegation rather than a broken signed chain." };
  }
  return { verdict: "indeterminate", explanation: exitCode === 0 ? "The validator returned data but did not provide a verdict we can safely classify." : "The local DNSSEC validator could not complete the check." };
}

type ValidationOutcome = WalkResult["verdict"];
type ValidatorResult = {
  verdict: DnssecVerdict;
  validationOutcome: ValidationOutcome | null;
  explanation: string;
  rawReport: unknown;
  exitCode: number;
  zones: string[];
  steps: WalkStep[];
};
type ValidatorRunner = (name: string, type: DnssecRecordType) => Promise<ValidatorResult>;

async function runDnssecAudit(name: string, type: DnssecRecordType): Promise<ValidatorResult> {
  const resolver = new RecordingResolver(new DoHResolver("https://cloudflare-dns.com/dns-query"));
  const qtype = recordTypeCode(type);
  if (qtype === null) throw new Error("The selected record type cannot be validated.");
  const result: WalkResult = await walk(`${name}.`, qtype, resolver);
  const verdict: DnssecVerdict = result.verdict === "insecure" || result.verdict === "bogus"
    ? result.verdict
    : "secure";
  const explanation = verdict === "secure"
    ? "The validator built a complete cryptographic chain to the DNS root."
    : verdict === "insecure"
      ? "The validator proved that the delegation is unsigned rather than broken."
      : result.detail || "The validator found a broken DNSSEC chain.";
  return {
    verdict,
    validationOutcome: result.verdict,
    explanation,
    exitCode: verdict === "bogus" ? 1 : 0,
    zones: [...new Set(result.steps.flatMap((step) => step.zone ? [step.zone === "." ? "." : step.zone.replace(/\.$/, "")] : []))],
    steps: result.steps,
    rawReport: { verdict: result.verdict, detail: result.detail, steps: result.steps, queries: resolver.entries },
  };
}

function chainZones(name: string) {
  const labels = name.split(".");
  const zones = ["."];
  for (let index = labels.length - 1; index >= 0; index -= 1) zones.push(labels.slice(index).join("."));
  return zones;
}

async function evidenceQuery(name: string, type: DnssecRecordType | "DS" | "DNSKEY", query: PublicDiagnosticQuery, signal?: AbortSignal) {
  try {
    const response = await query(name, type, "cloudflare", { signal });
    const requestedCode = recordTypeCode(type);
    return {
      responseCode: dnsResponseCode(response.Status),
      authenticatedData: response.AD,
      records: response.Answer.filter((record) => record.type === requestedCode || record.type === 5).map(normalizeWireRecord),
      rawResponse: response,
      error: null,
    };
  } catch (error) {
    return { responseCode: null, authenticatedData: null, records: [], rawResponse: null as RawDnsWireResponse | null, error: error instanceof Error ? error.message : "The evidence lookup failed." };
  }
}

export async function checkDnssec(
  request: { name: string; recordType: unknown },
  options: { validator?: ValidatorRunner; publicQuery?: PublicDiagnosticQuery; signal?: AbortSignal } = {},
) {
  const startedAt = Date.now();
  const name = normalizeDiagnosticName(request.name);
  const recordType = normalizeDnssecRecordType(request.recordType);
  let validation: ValidatorResult;
  try {
    validation = await (options.validator ?? runDnssecAudit)(name, recordType);
  } catch (error) {
    validation = {
      verdict: "indeterminate",
      validationOutcome: null,
      explanation: "The local DNSSEC validator could not complete the check.",
      exitCode: 1,
      zones: [],
      steps: [],
      rawReport: { error: error instanceof Error ? error.message : "The DNSSEC validator failed." },
    };
  }
  const query = options.publicQuery ?? queryPublicResolver;
  const zones = validation.zones.length ? validation.zones : chainZones(name);
  const [answer, chain] = await Promise.all([
    evidenceQuery(name, recordType, query, options.signal),
    Promise.all(zones.map(async (zone, index) => {
    const [ds, dnskey] = await Promise.all([
      index === 0 ? Promise.resolve(null) : evidenceQuery(zone, "DS", query, options.signal),
      evidenceQuery(zone, "DNSKEY", query, options.signal),
    ]);
    return { zone, ds, dnskey };
    })),
  ]);
  return {
    query: { name, recordType },
    checkedAt: new Date().toISOString(),
    durationMs: Date.now() - startedAt,
    verdict: validation.verdict,
    explanation: validation.explanation,
    validation: { outcome: validation.validationOutcome, steps: validation.steps },
    answer,
    chain,
    validator: { name: "Namefi DNSSEC Audit", performedLocalValidation: true, exitCode: validation.exitCode, rawReport: validation.rawReport },
  };
}
