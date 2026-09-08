"use client";

import { useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import {
  ToolActionRow,
  ToolButton,
  ToolDataTable,
  ToolDownloadAction,
  ToolRawOutput,
  ToolResultLead,
  ToolSelect,
  ToolStatus,
  ToolTextField,
  type ToolOption,
} from "@/app/tool-ui/tool-controls";
import { CHANGE_RECORD_TYPES, type ChangeRecordType, type DnsSourceAnswer } from "@/lib/dns/diagnostic-types.ts";
import { groupDnsSources } from "@/lib/dns/diagnostic-presentation.ts";
import { diagnosticReportJson } from "../../(catalogs)/dns-tools/diagnostic-result-ui";
import styles from "./dns-change-checker.module.css";

type Result = {
  query: { name: string; recordType: ChangeRecordType; expectedAnswer: string | null };
  checkedAt: string;
  durationMs: number;
  zone: string;
  ipv6Connectivity: boolean | null;
  authoritative: DnsSourceAnswer[];
  resolvers: DnsSourceAnswer[];
  summary: {
    authoritativeServersAgree: boolean;
    matchingAuthoritativeSources: number;
    totalAuthoritativeSources: number;
    agreeingResolvers: number;
    totalResolvers: number;
    expectedAnswerMatches: string[] | null;
  };
};

const recordTypeOptions: ToolOption[] = CHANGE_RECORD_TYPES.map((type) => ({ id: type, label: type }));

function normalizedRecordSet(source: DnsSourceAnswer) {
  return source.records
    .map((record) => `${record.ownerName}|${record.type}|${record.value.trim().replace(/\.$/, "").toLowerCase()}`)
    .sort()
    .join("\n");
}

function authoritativeReferenceKey(sources: DnsSourceAnswer[]) {
  const counts = new Map<string, number>();
  let referenceKey: string | null = null;
  let referenceCount = 0;
  for (const source of sources) {
    if (source.error || source.responseCode !== "NOERROR" || source.authoritative !== true) continue;
    const key = normalizedRecordSet(source);
    const count = (counts.get(key) ?? 0) + 1;
    counts.set(key, count);
    if (count > referenceCount) {
      referenceKey = key;
      referenceCount = count;
    }
  }
  return referenceKey;
}

function resolverAgreementSentence(result: Result, hasUsableAuthoritativeAnswer: boolean) {
  const usableReplies = result.resolvers.filter((source) => !source.error && source.responseCode === "NOERROR").length;
  const unavailable = Math.max(0, result.summary.totalResolvers - usableReplies);
  let agreement: string;
  if (!hasUsableAuthoritativeAnswer) {
    agreement = usableReplies === 0
      ? "No public resolver returned a usable reply."
      : `${usableReplies} public resolver ${usableReplies === 1 ? "reply was" : "replies were"} usable, but there is no authoritative reference to compare ${usableReplies === 1 ? "it" : "them"} with.`;
  } else if (usableReplies === 0) {
    agreement = "No public resolver returned a usable reply.";
  } else if (usableReplies === 1) {
    agreement = result.summary.agreeingResolvers === 1
      ? "The one usable public resolver reply matches it."
      : "The one usable public resolver reply does not match it.";
  } else {
    agreement = `${result.summary.agreeingResolvers} of ${usableReplies} usable public resolver replies match it.`;
  }
  if (unavailable === 0) return agreement;
  return `${agreement} ${unavailable} other resolver${unavailable === 1 ? "" : "s"} did not return a usable reply.`;
}

function leadSentence(result: Result) {
  const usableAuthoritative = result.authoritative.filter(
    (source) => !source.error && source.responseCode === "NOERROR" && source.authoritative === true,
  );
  const usableSources = [...usableAuthoritative, ...result.resolvers.filter(
    (source) => !source.error && source.responseCode === "NOERROR",
  )];
  const allUsableAnswersEmpty = usableSources.length > 0 && usableSources.every((source) => source.records.length === 0);
  const unavailableAuthoritative = Math.max(0, result.authoritative.length - usableAuthoritative.length);
  const empty = allUsableAnswersEmpty
    ? `No ${result.query.recordType} record was returned by the usable sources checked. `
    : "";
  const hasUsableAuthoritativeAnswer = usableAuthoritative.length > 0;
  let authoritative = !hasUsableAuthoritativeAnswer
    ? "None of the authoritative nameserver addresses returned a usable answer, so there is no source answer to compare yet."
    : usableAuthoritative.length === 1
      ? "One authoritative nameserver returned a usable answer."
    : result.summary.authoritativeServersAgree
      ? `The usable authoritative nameserver replies agree on ${allUsableAnswersEmpty ? "that empty" : "the current"} answer.`
      : `The authoritative nameservers returned more than one answer. ${result.summary.matchingAuthoritativeSources} of ${result.summary.totalAuthoritativeSources} usable authoritative replies returned the answer used for comparison.`;
  if (unavailableAuthoritative > 0) {
    authoritative += ` ${unavailableAuthoritative} other authoritative nameserver address${unavailableAuthoritative === 1 ? "" : "es"} did not return a usable reply.`;
  }
  const expected = result.query.expectedAnswer && result.summary.expectedAnswerMatches
    ? result.summary.expectedAnswerMatches.length > 0
      ? ` The expected value appears in ${result.summary.expectedAnswerMatches.length} source${result.summary.expectedAnswerMatches.length === 1 ? "" : "s"}.`
      : " The expected value did not appear in any response received."
    : "";
  return `${empty}${authoritative} ${resolverAgreementSentence(result, hasUsableAuthoritativeAnswer)}${expected}`;
}

function sourceState(source: DnsSourceAnswer, authoritative: boolean, referenceKey: string | null) {
  if (source.error) return "No usable reply";
  if (source.responseCode !== "NOERROR") return source.responseCode ?? "No usable reply";
  if (!authoritative && referenceKey !== null) {
    return normalizedRecordSet(source) === referenceKey ? "Matches reference" : "Different answer";
  }
  return source.records.length > 0 ? "Answered" : "No record";
}

function ttlValue(source: DnsSourceAnswer) {
  const values = [...new Set(source.records
    .map((record) => record.resolverTtlSeconds)
    .filter((value): value is number => value !== null))];
  if (values.length === 0) return "";
  return values.map((value) => `${value.toLocaleString("en-US")} seconds`).join(" / ");
}

function sourceRows(sources: DnsSourceAnswer[], authoritative: boolean, referenceKey: string | null) {
  return sources.map((source) => ({
    id: source.id,
    cells: {
      source: source.label,
      ...(authoritative ? { address: source.server?.address ?? "" } : {}),
      ttl: ttlValue(source),
      state: sourceState(source, authoritative, referenceKey),
      error: source.error ?? "",
    },
  }));
}

function AnswerValues({ group, recordType }: {
  group: ReturnType<typeof groupDnsSources>[number];
  recordType: ChangeRecordType;
}) {
  if (group.error) return <p className={styles.groupMessage}>No usable reply.</p>;
  if (group.records.length === 0) return <p className={styles.groupMessage}>No {recordType} record returned.</p>;
  return (
    <ul className={styles.answerValues} data-answer-values>
      {group.records.map((record, index) => (
        <li key={`${record.ownerName}-${record.type}-${record.value}-${index}`}>
          <code>{record.value}</code>
          <span>{record.ownerName} · {record.type}</span>
        </li>
      ))}
    </ul>
  );
}

function AnswerGroups({ authoritative, recordType, referenceKey, sectionName, sources }: {
  authoritative: boolean;
  recordType: ChangeRecordType;
  referenceKey: string | null;
  sectionName: string;
  sources: DnsSourceAnswer[];
}) {
  const groups = groupDnsSources(sources);
  const columns = [
    { id: "source", label: "Source" },
    ...(authoritative ? [{ id: "address", label: "Address" }] : []),
    { id: "ttl", label: authoritative ? "Authoritative TTL" : "Resolver TTL" },
    { id: "state", label: "State" },
    { id: "error", label: "Error" },
  ];

  return (
    <div className={styles.answerGroups}>
      {groups.map((group, index) => (
        <section className={styles.answerGroup} data-answer-group key={group.key}>
          <AnswerValues group={group} recordType={recordType} />
          <div className={styles.tableRegion}>
            <ToolDataTable
              ariaLabel={`${sectionName} sources for answer ${index + 1}`}
              columns={columns}
              rows={sourceRows(group.sources, authoritative, referenceKey)}
            />
          </div>
          <div className={styles.rawList}>
            {group.sources.map((source) => (
              <div data-dns-change-raw key={source.id}>
                <ToolRawOutput
                  label={`Raw response from ${source.label}`}
                  value={{ source: source.label, server: source.server, response: source.rawResponse, error: source.error }}
                />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function PreviousResultStatus({ error, loading, stale }: { error: string | null; loading: boolean; stale: boolean }) {
  let children: ReactNode = null;
  if (loading) children = "Previous result. A new check is running.";
  else if (error) children = "Previous result. The latest check failed.";
  else if (stale) children = "Previous result. Inputs changed since this check.";
  return children ? <ToolStatus tone={error ? "warning" : "neutral"}>{children}</ToolStatus> : null;
}

export function DnsChangeChecker({ initialName = "", initialRecordType = "A" }: {
  initialName?: string;
  initialRecordType?: ChangeRecordType;
}) {
  const [name, setName] = useState(initialName);
  const [recordType, setRecordType] = useState(initialRecordType);
  const [expectedAnswer, setExpectedAnswer] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [resultIsStale, setResultIsStale] = useState(false);
  const [loading, setLoading] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const report = useMemo(() => result ? diagnosticReportJson("DNS Change Checker", result) : "", [result]);
  const referenceKey = useMemo(() => result ? authoritativeReferenceKey(result.authoritative) : null, [result]);
  const hasUsableAuthoritativeAnswer = result?.authoritative.some(
    (source) => !source.error && source.responseCode === "NOERROR" && source.authoritative === true,
  ) ?? false;

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) {
      if (result) setResultIsStale(true);
      setValidationError("Enter a domain or hostname.");
      nameRef.current?.focus();
      return;
    }
    setLoading(true);
    setValidationError(null);
    setRequestError(null);
    try {
      const response = await fetch("/api/dns/change-checker", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, recordType, expectedAnswer }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error?.message ?? "The DNS change check failed.");
      setResult(data);
      setResultIsStale(false);
    } catch (caught) {
      setRequestError(caught instanceof Error ? caught.message : "The DNS change check failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section aria-label="DNS change checker" className={styles.workbench} data-tool-workbench>
      <form className={styles.form} onSubmit={submit}>
        <ToolTextField
          autoCapitalize="none"
          autoComplete="off"
          error={validationError}
          inputRef={nameRef}
          label="Domain or hostname"
          onChange={(value) => {
            setName(value);
            if (result) setResultIsStale(true);
            if (validationError) setValidationError(null);
          }}
          placeholder="www.google.com"
          required
          spellCheck={false}
          value={name}
        />
        <ToolSelect
          label="Record type"
          onChange={(value) => {
            setRecordType(value as ChangeRecordType);
            if (result) setResultIsStale(true);
          }}
          options={recordTypeOptions}
          required
          value={recordType}
        />
        <ToolTextField
          autoCapitalize="none"
          autoComplete="off"
          label="Expected answer (optional)"
          onChange={(value) => {
            setExpectedAnswer(value);
            if (result) setResultIsStale(true);
          }}
          placeholder="The new value you expect to see"
          spellCheck={false}
          value={expectedAnswer}
        />
        <ToolActionRow>
          <ToolButton className={styles.submit} isDisabled={loading} type="submit" variant="primary">
            {loading ? "Checking DNS..." : "Check DNS change"}
          </ToolButton>
        </ToolActionRow>
        {loading ? <ToolStatus>Checking authoritative sources and public resolver caches.</ToolStatus> : null}
        {requestError ? <ToolStatus tone="danger">{requestError}</ToolStatus> : null}
      </form>

      {result ? (
        <section aria-busy={loading || undefined} aria-live="polite" className={styles.results} data-dns-change-results>
          <PreviousResultStatus error={requestError} loading={loading} stale={resultIsStale} />
          <header className={styles.resultHeader}>
            <h2>{result.query.name} <span>{result.query.recordType}</span></h2>
            <div data-dns-change-lead>
              <ToolResultLead>{leadSentence(result)}</ToolResultLead>
            </div>
            {result.ipv6Connectivity === false ? (
              <p className={styles.ipv6Note}>IPv6 authoritative checks were skipped because this checker does not have IPv6 connectivity.</p>
            ) : null}
          </header>

          <section className={styles.resultSection}>
            <h3>Published by authoritative nameservers</h3>
            <AnswerGroups authoritative recordType={result.query.recordType} referenceKey={referenceKey} sectionName="Authoritative" sources={result.authoritative} />
          </section>

          <section className={styles.resultSection}>
            <h3>Seen in public resolver caches</h3>
            <AnswerGroups authoritative={false} recordType={result.query.recordType} referenceKey={referenceKey} sectionName="Public resolver" sources={result.resolvers} />
          </section>

          {!result.summary.authoritativeServersAgree && hasUsableAuthoritativeAnswer ? (
            <p className={styles.nextCheck}>If you did not expect the answers to vary, <a href={`/soa-checker?name=${encodeURIComponent(result.zone)}`}>compare their SOA serials</a> to see whether one nameserver still has an older copy of the zone.</p>
          ) : null}

          <footer className={styles.resultFooter}>
            <p>Checked {new Date(result.checkedAt).toLocaleString()} in {result.durationMs.toLocaleString("en-US")} ms.</p>
            <ToolDownloadAction contents={report} filename={`${result.query.name}-${result.query.recordType}-dns-change-report.json`} label="Download report" mimeType="application/json;charset=utf-8" />
          </footer>
        </section>
      ) : null}
    </section>
  );
}
