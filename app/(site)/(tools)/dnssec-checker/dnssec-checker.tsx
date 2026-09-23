"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import type { WalkStep } from "@namefi/dnssec-audit";
import { UiButton, UiChoiceGroup, UiDisclosure, UiDownloadAction, UiRawOutput, UiTextField, type UiOption } from "@/app/ui/controls";
import { UiActionRow, UiDataTable, UiKeyValueList, UiResultLead, UiStatus } from "@/app/ui/display";
import { DNSSEC_RECORD_TYPES, type DnssecRecordType, type DnssecSignature, type DnssecVerdict } from "@/lib/dns/dnssec-types.ts";
import type { NormalizedDnsRecord } from "@/lib/dns/types.ts";
import { diagnosticReportJson } from "../../(catalogs)/dns-tools/diagnostic-result-ui";
import styles from "./dnssec-checker.module.css";

type Evidence = {
  authenticatedData: boolean | null;
  error: string | null;
  rawResponse: unknown;
  records: NormalizedDnsRecord[];
  responseCode: string | null;
};

type Outcome = "secure-positive" | "secure-nodata" | "secure-nxdomain" | "insecure" | "bogus" | null;

type Result = {
  answer: Evidence;
  chain: Array<{ dnskey: Evidence; ds: Evidence | null; zone: string }>;
  checkedAt: string;
  durationMs: number;
  explanation: string;
  query: { name: string; recordType: DnssecRecordType };
  signatures: DnssecSignature[];
  validation: { outcome: Outcome; steps: WalkStep[] };
  validator: { exitCode: number; name: string; performedLocalValidation: boolean; rawReport: unknown };
  verdict: DnssecVerdict;
};

const recordTypeOptions: UiOption[] = DNSSEC_RECORD_TYPES.map((type) => ({ id: type, label: type }));
const verdictLabels: Record<DnssecVerdict, string> = {
  bogus: "Bogus",
  indeterminate: "Indeterminate",
  insecure: "Insecure",
  secure: "Secure",
};

function stepName(step: WalkStep) {
  if (step.kind === "root-trust-anchor") return "Start with the DNS root trust anchor";
  if (step.kind === "ds") return `Verify the DS link for ${step.zone ?? "this zone"}`;
  if (step.kind === "dnskey") return `Verify the DNSKEY set for ${step.zone ?? "this zone"}`;
  if (step.kind === "answer") return `Verify the ${step.qtype ?? "requested"} answer`;
  if (step.kind === "denial") return "Verify the signed proof of absence";
  if (step.kind === "insecure") return "Prove where the signed chain ends";
  return step.zone ? `Check ${step.zone}` : "Validation note";
}

function verdictDetail(result: Result) {
  switch (result.validation.outcome) {
    case "secure-positive":
      return `The ${result.query.recordType} answer for ${result.query.name} is signed and validates through the chain to the DNS root.`;
    case "secure-nodata":
      return `${result.query.name} exists, but it has no ${result.query.recordType} record. DNSSEC validated the signed proof of that absence.`;
    case "secure-nxdomain":
      return `${result.query.name} does not exist, and DNSSEC validated the signed denial proof.`;
    case "insecure":
      return `The chain proves that ${result.query.name} is not DNSSEC-protected, but the chain is not broken.`;
    case "bogus": {
      const failedStep = result.validation.steps.find((step) => !step.ok);
      const failure = failedStep ? `the first failed chain step was ${stepName(failedStep)}` : "a required chain step failed";
      return `The ${result.query.recordType} answer for ${result.query.name} should validate, but ${failure}. Validating resolvers may return SERVFAIL.`;
    }
    default:
      return result.validation.steps.length > 0
        ? `The validator could not gather enough evidence to classify the ${result.query.recordType} answer for ${result.query.name}.`
        : `The validator could not complete the ${result.query.recordType} check for ${result.query.name}.`;
  }
}

function verdictTone(verdict: DnssecVerdict) {
  if (verdict === "secure") return "success";
  if (verdict === "bogus") return "danger";
  return "warning";
}

function signatureTime(signature: DnssecSignature) {
  const seconds = Math.abs(signature.secondsRemaining);
  const roundedDays = Math.round(seconds / 86400);
  const roundedHours = Math.round(seconds / 3600);
  const roundedMinutes = Math.max(1, Math.round(seconds / 60));
  const value = seconds >= 86400
    ? `${roundedDays} day${roundedDays === 1 ? "" : "s"}`
    : seconds >= 3600
      ? `${roundedHours} hour${roundedHours === 1 ? "" : "s"}`
      : `${roundedMinutes} minute${roundedMinutes === 1 ? "" : "s"}`;
  if (signature.status === "expired") return `Expired ${value} ago`;
  if (signature.status === "not-yet-valid") return `Not valid yet. Expires in ${value}.`;
  return `${value} remaining`;
}

function authenticatedDataLabel(value: boolean | null, supporting = false) {
  if (value === null) return "Not reported.";
  if (value) return supporting ? "Set. Supporting resolver evidence only." : "Set. Resolver evidence only.";
  return supporting ? "Not set. Supporting resolver evidence only." : "Not set. Resolver evidence only.";
}

function recordRows(records: NormalizedDnsRecord[]) {
  return records.map((record, index) => ({
    id: `${record.ownerName}-${record.type}-${record.value}-${index}`,
    cells: {
      owner: <code>{record.ownerName}</code>,
      ttl: record.resolverTtlSeconds === null ? "Not reported" : `${record.resolverTtlSeconds.toLocaleString("en-US")} seconds`,
      type: record.type,
      value: <code>{record.value}</code>,
    },
  }));
}

const recordColumns = [
  { id: "owner", label: "Owner" },
  { id: "type", label: "Type" },
  { id: "value", label: "Value" },
  { id: "ttl", label: "Resolver TTL" },
];

function EvidenceBlock({ evidence, recordType, zone }: {
  evidence: Evidence;
  recordType: "DS" | "DNSKEY";
  zone: string;
}) {
  return (
    <section className={styles.evidenceBlock}>
      <h5>{recordType}</h5>
      <UiKeyValueList rows={[
        { label: "Response code", value: evidence.responseCode ?? "Not reported" },
        { label: "Resolver AD", value: authenticatedDataLabel(evidence.authenticatedData) },
      ]} />
      {evidence.error ? (
        <p className={styles.evidenceMessage}>{evidence.error}</p>
      ) : evidence.records.length > 0 ? (
        <UiDataTable
          ariaLabel={`${recordType} records for ${zone}`}
          columns={recordColumns}
          rows={recordRows(evidence.records)}
        />
      ) : (
        <p className={styles.evidenceMessage}>No {recordType} records were returned.</p>
      )}
    </section>
  );
}

function requestedAnswerMessage(result: Result) {
  if (result.answer.error) return result.answer.error;
  if (result.validation.outcome === "secure-nodata") {
    return `No ${result.query.recordType} record rows were returned by the evidence lookup.`;
  }
  if (result.validation.outcome === "secure-nxdomain") {
    return "No record rows were returned because the requested name does not exist.";
  }
  return `No ${result.query.recordType} record rows were returned by the evidence lookup.`;
}

export function DnssecChecker({ initialName = "", initialRecordType = "A" }: {
  initialName?: string;
  initialRecordType?: DnssecRecordType;
}) {
  const [name, setName] = useState(initialName);
  const [recordType, setRecordType] = useState(initialRecordType);
  const [result, setResult] = useState<Result | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [recordTypeError, setRecordTypeError] = useState<string | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const recordTypeRef = useRef<HTMLDivElement>(null);
  const report = useMemo(() => result ? diagnosticReportJson("DNSSEC Chain Checker", result) : "", [result]);
  const signatures = useMemo(
    () => result ? [...result.signatures].sort((left, right) => left.expiration.localeCompare(right.expiration)) : [],
    [result],
  );

  useEffect(() => setHydrated(true), []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) {
      setResult(null);
      setNameError("Enter a domain or hostname.");
      setRecordTypeError(null);
      setRequestError(null);
      nameRef.current?.focus();
      return;
    }

    setLoading(true);
    setResult(null);
    setNameError(null);
    setRecordTypeError(null);
    setRequestError(null);
    try {
      const response = await fetch("/api/dns/dnssec-checker", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, recordType }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error?.message ?? "The DNSSEC check failed.");
      setResult(data);
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "The DNSSEC check failed.";
      if (/record type|choose A,/i.test(message)) {
        setRecordTypeError(message);
        recordTypeRef.current?.querySelector<HTMLElement>("[role=radio]")?.focus();
      } else if (/domain|hostname/i.test(message)) {
        setNameError(message);
        nameRef.current?.focus();
      } else {
        setRequestError(message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      aria-label="DNSSEC chain checker"
      className={styles.workbench}
      data-hydrated={hydrated}
      data-tool-workbench
    >
      <form aria-busy={loading || undefined} className={styles.form} onSubmit={submit}>
        <UiTextField
          autoCapitalize="none"
          autoComplete="off"
          error={nameError}
          inputMode="url"
          inputRef={nameRef}
          label="Domain or hostname"
          onChange={(value) => {
            setName(value);
            if (nameError || requestError) {
              setNameError(null);
              setRequestError(null);
            }
          }}
          placeholder="cloudflare.com"
          required
          spellCheck={false}
          value={name}
        />
        <div ref={recordTypeRef}>
          <UiChoiceGroup
            error={recordTypeError}
            label="Record type"
            onChange={(value) => {
              setRecordType(value as DnssecRecordType);
              if (recordTypeError || requestError) {
                setRecordTypeError(null);
                setRequestError(null);
              }
            }}
            options={recordTypeOptions}
            required
            value={recordType}
          />
        </div>
        <UiActionRow>
          <UiButton className={styles.submit} isDisabled={loading} type="submit" variant="primary">
            {loading ? "Validating DNSSEC..." : "Validate DNSSEC"}
          </UiButton>
        </UiActionRow>
        {loading ? <UiStatus>Validating DNSSEC...</UiStatus> : null}
        {requestError ? <UiStatus tone="danger">{requestError}</UiStatus> : null}
      </form>

      {result ? (
        <section aria-live="polite" className={styles.results} data-dnssec-results>
          <div className={styles.resultLeadRow}>
            <div data-dnssec-verdict>
              <UiResultLead>
                <span className={styles.verdictWord} data-tone={verdictTone(result.verdict)} data-verdict-word>
                  {verdictLabels[result.verdict]}.
                </span>{" "}
                {verdictDetail(result)}
              </UiResultLead>
            </div>
            <UiDownloadAction
              contents={report}
              filename={`${result.query.name}-${result.query.recordType}-dnssec-report.json`}
              label="Download report"
              mimeType="application/json;charset=utf-8"
            />
          </div>

          <section className={styles.resultSection}>
            <h3>What the validator checked</h3>
            {result.validation.steps.length > 0 ? (
              <ol aria-label="DNSSEC validation chain" className={styles.chain}>
                {result.validation.steps.map((step, index) => (
                  <li data-state={step.ok ? "passed" : "failed"} key={`${step.kind}-${step.zone ?? step.qname ?? index}-${index}`}>
                    <h4>
                      {stepName(step)}{" "}
                      <span className={styles.stepState}>{step.ok ? "Passed" : "Failed"}</span>
                    </h4>
                    <p>{step.detail}</p>
                  </li>
                ))}
              </ol>
            ) : (
              <p className={styles.evidenceMessage}>No validation steps were returned.</p>
            )}
          </section>

          <section className={styles.resultSection}>
            <h3>Requested answer</h3>
            <UiKeyValueList rows={[
              { label: "Response code", value: result.answer.responseCode ?? "Not reported" },
              { label: "Resolver AD", value: authenticatedDataLabel(result.answer.authenticatedData, true) },
            ]} />
            {result.answer.records.length > 0 ? (
              <UiDataTable
                ariaLabel="Requested answer records"
                columns={recordColumns}
                rows={recordRows(result.answer.records)}
              />
            ) : (
              <p className={styles.evidenceMessage}>{requestedAnswerMessage(result)}</p>
            )}
            <div className={styles.requestedRaw} data-requested-raw>
              <UiRawOutput label="Raw requested answer" value={result.answer} />
            </div>
          </section>

          {signatures.length > 0 ? (
            <section className={styles.resultSection}>
              <h3>Signature validity</h3>
              <UiDataTable
                ariaLabel="DNSSEC signatures"
                columns={[
                  { id: "recordSet", label: "Record set" },
                  { id: "signer", label: "Signer" },
                  { id: "algorithm", label: "Algorithm" },
                  { id: "keyTag", label: "Key tag" },
                  { id: "validFrom", label: "Valid from" },
                  { id: "validUntil", label: "Valid until" },
                  { id: "status", label: "Status" },
                ]}
                rows={signatures.map((signature) => ({
                  id: `${signature.ownerName}-${signature.typeCovered}-${signature.keyTag}-${signature.expiration}`,
                  cells: {
                    algorithm: `${signature.algorithmName} (${signature.algorithm})`,
                    keyTag: signature.keyTag,
                    recordSet: <><code>{signature.typeCovered}</code> for <code>{signature.ownerName}</code></>,
                    signer: <code>{signature.signerName}</code>,
                    status: signatureTime(signature),
                    validFrom: new Date(signature.inception).toLocaleString(),
                    validUntil: new Date(signature.expiration).toLocaleString(),
                  },
                }))}
              />
            </section>
          ) : null}

          <UiDisclosure label="DS and DNSKEY evidence by zone">
            <div className={styles.zoneEvidence} data-zone-evidence>
              {result.chain.map((zone) => (
                <section className={styles.zone} key={zone.zone}>
                  <h4>{zone.zone} zone</h4>
                  {zone.ds ? <EvidenceBlock evidence={zone.ds} recordType="DS" zone={zone.zone} /> : null}
                  <EvidenceBlock evidence={zone.dnskey} recordType="DNSKEY" zone={zone.zone} />
                </section>
              ))}
            </div>
          </UiDisclosure>

          <dl className={styles.metadata}>
            <div><dt>Checked</dt><dd>{new Date(result.checkedAt).toLocaleString()}</dd></div>
            <div><dt>Duration</dt><dd>{result.durationMs.toLocaleString("en-US")} ms</dd></div>
            <div><dt>Validation</dt><dd>{result.validator.performedLocalValidation ? `Local, ${result.validator.name}` : result.validator.name}</dd></div>
          </dl>
        </section>
      ) : null}
    </section>
  );
}
