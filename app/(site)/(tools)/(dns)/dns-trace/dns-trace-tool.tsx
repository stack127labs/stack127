"use client";

import Link from "next/link";
import { useRef, useState, type FormEvent, type ReactNode } from "react";
import { UiButton, UiChoiceGroup, UiCopyAction, UiRawOutput, UiTextField } from "@/app/ui/controls";
import { UiDataTable, UiKeyValueList, UiResultLead, UiStatus } from "@/app/ui/display";
import { formatAuthoritativeTtl } from "@/lib/dns/format-record.ts";
import {
  TRACE_RECORD_TYPES,
  type DnsTraceRecordType,
  type DnsTraceResponse,
  type DnsTraceStep,
} from "@/lib/dns/trace-types.ts";
import type { NormalizedDnsRecord } from "@/lib/dns/types.ts";
import { sentenceFragment } from "./dns-trace-format";
import styles from "./dns-trace.module.css";

function stageTitle(step: DnsTraceStep) {
  if (step.stage === "root") return "Root nameserver";
  if (step.stage === "tld") return `.${step.zone} nameserver`;
  return `Nameserver for ${step.zone}`;
}

function traceAsText(result: DnsTraceResponse) {
  const lines = [`DNS trace for ${result.query.normalizedName} (${result.query.recordType})`];
  for (const step of result.steps) {
    lines.push("", `${step.sequence}. ${stageTitle(step)}`, step.message);
    if (step.server) lines.push(`Server: ${step.server.hostname} (${step.server.address})`);
    lines.push(`Question: ${step.questionName} ${step.requestedType}`);
    if (step.responseCode) lines.push(`Response: ${step.responseCode}${step.durationMs === null ? "" : ` in ${step.durationMs} ms`}`);
    if (step.nameservers.length) lines.push(`Nameservers: ${step.nameservers.join(", ")}`);
    for (const record of step.glueRecords) lines.push(`Glue: ${record.ownerName} ${record.type} ${record.value}`);
    for (const record of step.additionalAddressRecords) lines.push(`Included nameserver address: ${record.ownerName} ${record.type} ${record.value}`);
    for (const record of step.answerRecords) lines.push(`Answer: ${record.ownerName} ${record.type} ${record.value} TTL ${record.resolverTtlSeconds ?? "not reported"}`);
    for (const attempt of step.attempts) lines.push(`Earlier attempt: ${attempt.server.hostname} (${attempt.server.address}): ${attempt.error}`);
  }
  return lines.join("\n");
}

function decisiveReason(result: DnsTraceResponse, lastStep: DnsTraceStep | undefined) {
  return result.warnings.at(-1)
    ?? lastStep?.attempts.at(-1)?.error
    ?? lastStep?.message
    ?? "The trace could not reach a DNS server.";
}

function outcomeSentence(result: DnsTraceResponse) {
  const lastStep = result.steps.at(-1);
  const server = lastStep?.server?.hostname;
  const type = result.query.recordType;
  const normalizedName = result.query.normalizedName;
  const finalName = result.finalName;

  if (result.outcome === "found") {
    const answerKind = lastStep?.authoritative ? "an authoritative" : "a final";
    const destination = server ? ` at ${server}` : "";
    if (finalName !== normalizedName) {
      return `The trace followed ${normalizedName} to ${finalName} and reached ${answerKind} ${type} answer${destination}.`;
    }
    return `The trace reached ${answerKind} ${type} answer for ${finalName}${destination}.`;
  }

  if (result.outcome === "no_answer") {
    return `The trace reached ${server ?? "the final nameserver"}, but it returned no ${type} record for ${finalName}.`;
  }

  if (result.outcome === "nxdomain") {
    const source = lastStep?.authoritative ? "The authoritative nameserver" : "The nameserver";
    return `${source}${server ? ` ${server}` : ""} says ${finalName} does not exist.`;
  }

  const reason = sentenceFragment(decisiveReason(result, lastStep));
  if (!lastStep) return `The trace stopped before reaching a DNS server because ${reason}.`;
  return `The trace stopped at ${stageTitle(lastStep).toLocaleLowerCase()} because ${reason}.`;
}

function responseValue(step: DnsTraceStep) {
  const authority = step.authoritative === true
    ? "authoritative"
    : step.authoritative === false
      ? "not authoritative"
      : "authority not reported";
  const duration = step.durationMs === null
    ? "time not reported"
    : `${step.durationMs.toLocaleString("en-US")} ms`;
  return <><code>{step.responseCode ?? "No response code"}</code>, {authority}, {duration}</>;
}

function RecordTable({
  ariaLabel,
  collapseLabel,
  heading,
  records,
}: {
  ariaLabel: string;
  collapseLabel?: string;
  heading: string;
  records: NormalizedDnsRecord[];
}) {
  const [expanded, setExpanded] = useState(false);
  const hasMore = Boolean(collapseLabel) && records.length > 4;
  const visibleRecords = hasMore && !expanded ? records.slice(0, 4) : records;

  if (!records.length) return null;
  return (
    <section className={styles.evidenceGroup}>
      <h4>{heading}</h4>
      <UiDataTable
        ariaLabel={ariaLabel}
        columns={[
          { id: "type", label: "Type" },
          { id: "name", label: "Name" },
          { id: "value", label: "Value" },
          { id: "ttl", label: "TTL" },
        ]}
        rows={visibleRecords.map((record, index) => ({
          id: `${record.ownerName}-${record.type}-${record.value}-${index}`,
          cells: {
            type: <code>{record.type}</code>,
            name: <code>{record.ownerName}</code>,
            value: <code>{record.value}</code>,
            ttl: formatAuthoritativeTtl(record.resolverTtlSeconds),
          },
        }))}
      />
      {hasMore ? (
        <UiButton
          aria-expanded={expanded}
          className={styles.expandButton}
          onClick={() => setExpanded((current) => !current)}
          type="button"
          variant="ghost"
        >
          {expanded ? `Show fewer ${collapseLabel}` : `Show all ${records.length} ${collapseLabel}`}
        </UiButton>
      ) : null}
    </section>
  );
}

function ExpandableValues({ label, values }: { label: string; values: ReactNode[] }) {
  const [expanded, setExpanded] = useState(false);
  const hasMore = values.length > 4;
  const visibleValues = expanded ? values : values.slice(0, 4);

  return (
    <div className={styles.valueList}>
      <div>{visibleValues.map((value, index) => <span key={index}>{value}</span>)}</div>
      {hasMore ? (
        <UiButton
          aria-expanded={expanded}
          className={styles.expandButton}
          onClick={() => setExpanded((current) => !current)}
          type="button"
          variant="ghost"
        >
          {expanded ? `Show fewer ${label}` : `Show all ${values.length} ${label}`}
        </UiButton>
      ) : null}
    </div>
  );
}

function ValueGroup({ actionLabel, heading, values }: { actionLabel: string; heading: string; values: ReactNode[] }) {
  if (!values.length) return null;
  return (
    <section className={styles.evidenceGroup}>
      <h4>{heading}</h4>
      <ExpandableValues label={actionLabel} values={values} />
    </section>
  );
}

function TraceStep({ step }: { step: DnsTraceStep }) {
  return (
    <li className={styles.step} data-trace-step={step.stage}>
      <span aria-hidden="true" className={styles.marker}>{step.sequence}</span>
      <div className={styles.stepBody}>
        <header className={styles.stepHeader}>
          <h3>{stageTitle(step)}</h3>
          <p>{step.message}</p>
        </header>

        <UiKeyValueList
          rows={[
            ...(step.server ? [{
              label: "Server",
              value: <><code>{step.server.hostname}</code> <code>{step.server.address}</code></>,
            }] : []),
            {
              label: "Question",
              value: <><code>{step.questionName}</code> <code>{step.requestedType}</code></>,
            },
            { label: "Response", value: responseValue(step) },
          ]}
        />

        <ValueGroup
          actionLabel="nameservers"
          heading="Nameservers in the referral"
          values={step.nameservers.map((nameserver) => <code key={nameserver}>{nameserver}</code>)}
        />
        <RecordTable
          ariaLabel={`Glue records from step ${step.sequence}`}
          collapseLabel="glue addresses"
          heading="Glue from this referral"
          records={step.glueRecords}
        />
        <RecordTable
          ariaLabel={`Included nameserver addresses from step ${step.sequence}`}
          collapseLabel="nameserver addresses"
          heading="Nameserver addresses included with this referral"
          records={step.additionalAddressRecords}
        />
        <RecordTable
          ariaLabel={`Answer records from step ${step.sequence}`}
          heading="Answer records"
          records={step.answerRecords}
        />

        {step.attempts.length ? (
          <section className={styles.evidenceGroup}>
            <h4>Earlier server attempts</h4>
            <UiDataTable
              ariaLabel={`Earlier server attempts from step ${step.sequence}`}
              columns={[
                { id: "server", label: "Server" },
                { id: "address", label: "Address" },
                { id: "duration", label: "Duration" },
                { id: "error", label: "Error" },
              ]}
              rows={step.attempts.map((attempt, index) => ({
                id: `${attempt.server.hostname}-${attempt.server.address}-${index}`,
                cells: {
                  server: <code>{attempt.server.hostname}</code>,
                  address: <code>{attempt.server.address}</code>,
                  duration: `${attempt.durationMs.toLocaleString("en-US")} ms`,
                  error: attempt.error,
                },
              }))}
            />
          </section>
        ) : null}

        <UiRawOutput
          label="Raw response from this step"
          value={step.rawResponse ?? { attempts: step.attempts }}
        />
      </div>
    </li>
  );
}

function TraceResults({ result }: { result: DnsTraceResponse }) {
  const decisiveWarning = result.outcome === "error" ? decisiveReason(result, result.steps.at(-1)) : null;
  const remainingWarnings = [...new Set(result.warnings)].filter((warning) => warning !== decisiveWarning);

  return (
    <section aria-label="DNS trace result" aria-live="polite" className={styles.results} data-dns-trace-result>
      <div className={styles.resultLead}>
        <UiResultLead>{outcomeSentence(result)}</UiResultLead>
        <UiCopyAction
          failureLabel="Copy failed"
          label="Copy trace"
          successLabel="Trace copied"
          value={traceAsText(result)}
        />
      </div>

      <ol aria-label="DNS trace path" className={styles.path}>
        {result.steps.map((step) => <TraceStep key={step.sequence} step={step} />)}
      </ol>

      {remainingWarnings.length ? (
        <UiStatus tone="warning">{remainingWarnings.join(" ")}</UiStatus>
      ) : null}

      {result.outcome === "error" ? (
        <p className={styles.nextCheck}>
          <Link href={`/nameserver-checker?name=${encodeURIComponent(result.query.normalizedName)}`}>Check the nameserver delegation</Link>{" "}
          to compare the parent handoff, glue, and the answers from each nameserver.
        </p>
      ) : null}

      <dl className={styles.metadata}>
        <div>
          <dt>Checked</dt>
          <dd><time dateTime={result.checkedAt}>{new Date(result.checkedAt).toLocaleString()}</time></dd>
        </div>
        <div>
          <dt>Total duration</dt>
          <dd>{result.durationMs.toLocaleString("en-US")} ms</dd>
        </div>
      </dl>
    </section>
  );
}

export function DnsTraceTool({
  initialName = "",
  initialRecordType = "A",
}: {
  initialName?: string;
  initialRecordType?: DnsTraceRecordType;
}) {
  const [name, setName] = useState(initialName);
  const [recordType, setRecordType] = useState<DnsTraceRecordType>(initialRecordType);
  const [result, setResult] = useState<DnsTraceResponse | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function clearErrors() {
    if (fieldError) setFieldError(null);
    if (requestError) setRequestError(null);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setResult(null);
    if (!name.trim()) {
      setRequestError(null);
      setFieldError("Enter a domain or hostname.");
      requestAnimationFrame(() => inputRef.current?.focus());
      return;
    }

    setLoading(true);
    setFieldError(null);
    setRequestError(null);
    try {
      const response = await fetch("/api/dns/trace", {
        body: JSON.stringify({ name, recordType }),
        headers: { "content-type": "application/json" },
        method: "POST",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error?.message ?? "The DNS trace failed.");
      setResult(data as DnsTraceResponse);
    } catch (traceError) {
      setRequestError(traceError instanceof Error ? traceError.message : "The DNS trace failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section aria-label="DNS trace explorer" className={styles.workbench} data-tool-workbench>
      <form aria-busy={loading} className={styles.form} onSubmit={submit}>
        <UiTextField
          autoCapitalize="none"
          autoComplete="off"
          error={fieldError}
          inputMode="url"
          inputRef={inputRef}
          label="Domain or hostname"
          name="name"
          onChange={(value) => {
            setName(value);
            clearErrors();
          }}
          placeholder="www.example.com"
          required
          spellCheck={false}
          type="text"
          value={name}
        />
        <UiChoiceGroup
          label="Record type"
          onChange={(value) => {
            setRecordType(value as DnsTraceRecordType);
            clearErrors();
          }}
          options={TRACE_RECORD_TYPES.map((type) => ({ id: type, label: type }))}
          value={recordType}
        />
        <UiButton
          aria-busy={loading}
          className={styles.submit}
          isDisabled={loading}
          type="submit"
          variant="primary"
        >
          {loading ? "Tracing DNS..." : "Trace DNS"}
        </UiButton>
        {loading ? <UiStatus>Tracing DNS...</UiStatus> : null}
        {requestError ? <UiStatus tone="danger">{requestError}</UiStatus> : null}
      </form>

      {result ? <TraceResults result={result} /> : null}
    </section>
  );
}
