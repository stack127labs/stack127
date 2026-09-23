"use client";

import { useMemo, useRef, useState, type FormEvent } from "react";
import { UiButton, UiDownloadAction, UiRawOutput, UiTextField } from "@/app/ui/controls";
import { UiActionRow, UiDataTable, UiResultLead, UiStatus } from "@/app/ui/display";
import type { CaaRecord } from "@/lib/dns/diagnostic-types.ts";
import { diagnosticReportJson } from "../../(catalogs)/dns-tools/diagnostic-result-ui";
import styles from "./caa-checker.module.css";

type SearchReason = "requested" | "alias" | "parent";

type UiLevel = {
  name: string;
  searchReason: SearchReason;
  responseCode: string | null;
  records: CaaRecord[];
  aliasTarget: string | null;
  rawResponse: unknown;
  error: string | null;
};

type Policy = {
  unrestricted: boolean;
  denied: boolean;
  issuers: string[];
};

type Result = {
  checkedAt: string;
  durationMs: number;
  query: { inputName: string };
  status: "undetermined" | "policy_found" | "no_policy";
  effectiveName: string | null;
  levels: UiLevel[];
  records: CaaRecord[];
  normal: Policy;
  wildcard: Policy;
  usesIssueForWildcard: boolean;
  iodef: Array<{ value: string; validUrl: boolean }>;
  unknownCriticalTags: string[];
  malformedRecords: number;
  error: string | null;
};

const listFormatter = new Intl.ListFormat("en", {
  style: "long",
  type: "conjunction",
});

function policySentence(policy: Policy) {
  if (policy.denied) return "No certificate authority is allowed.";
  if (policy.unrestricted) return "CAA does not restrict this kind of certificate.";
  if (!policy.issuers.length) return "No certificate authority is listed.";
  return `${listFormatter.format(policy.issuers)} may issue.`;
}

function reasonLabel(reason: SearchReason) {
  if (reason === "requested") return "Requested name";
  if (reason === "alias") return "Alias target";
  return "Parent name";
}

function levelOutcome(level: UiLevel) {
  if (level.error) return "Lookup failed";
  if (level.records.length) {
    return `Policy found, ${level.records.length.toLocaleString("en-US")} ${level.records.length === 1 ? "record" : "records"}`;
  }
  return "No CAA here";
}

function rawEvidence(levels: UiLevel[]) {
  return levels.map((level) => ({
    name: level.name,
    searchReason: level.searchReason,
    responseCode: level.responseCode,
    aliasTarget: level.aliasTarget,
    rawResponse: level.rawResponse,
    error: level.error,
  }));
}

function qualificationMessages(result: Result) {
  const messages: string[] = [];
  if (result.unknownCriticalTags.length) {
    const tags = listFormatter.format(result.unknownCriticalTags);
    messages.push(
      `The policy has ${result.unknownCriticalTags.length === 1 ? "an unknown critical tag" : "unknown critical tags"}: ${tags}. A certificate authority must understand ${result.unknownCriticalTags.length === 1 ? "it" : "them"} before issuing.`,
    );
  }
  if (result.malformedRecords) {
    messages.push(
      `${result.malformedRecords.toLocaleString("en-US")} CAA ${result.malformedRecords === 1 ? "record is" : "records are"} malformed, so this policy may not work as intended.`,
    );
  }
  const invalidIodefCount = result.iodef.filter((entry) => !entry.validUrl).length;
  if (invalidIodefCount) {
    messages.push(
      `${invalidIodefCount.toLocaleString("en-US")} iodef ${invalidIodefCount === 1 ? "destination has" : "destinations have"} an invalid URL. iodef accepts mailto, HTTP, or HTTPS URLs.`,
    );
  }
  return messages;
}

function PolicyLead({ result }: { result: Result }) {
  const undetermined = result.status === "undetermined";
  const noPolicy = result.status === "no_policy";

  return (
    <section
      aria-atomic="true"
      aria-label="Effective CAA policy result"
      aria-live={undetermined ? "assertive" : "polite"}
      className={styles.lead}
      role={undetermined ? "alert" : "region"}
    >
      <UiResultLead>Effective CAA policy</UiResultLead>

      {undetermined ? (
        <div className={styles.undetermined}>
          <p>The effective CAA policy could not be determined.</p>
          <p>{result.error ?? "The DNS search did not complete."}</p>
        </div>
      ) : noPolicy ? (
        <div className={styles.noPolicy}>
          <p>CAA does not restrict normal or wildcard issuance for {result.query.inputName}.</p>
          <p>This does not promise that a certificate authority will issue.</p>
        </div>
      ) : (
        <div className={styles.policyRows}>
          <div data-tone={result.normal.denied ? "danger" : undefined}>
            <h3>Normal certificates</h3>
            <p>{policySentence(result.normal)}</p>
          </div>
          <div data-tone={result.wildcard.denied ? "danger" : undefined}>
            <h3>Wildcard certificates</h3>
            <p>{policySentence(result.wildcard)}</p>
          </div>
        </div>
      )}

      {result.status === "policy_found" && result.effectiveName ? (
        <div className={styles.location}>
          <p>
            {result.effectiveName === result.query.inputName ? "Policy found at" : "Policy inherited from"}{" "}
            <code>{result.effectiveName}</code>.
          </p>
          {result.usesIssueForWildcard ? (
            <p>No <code>issuewild</code> record was found, so the <code>issue</code> policy also applies to wildcard certificates.</p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

function LookupPath({ levels }: { levels: UiLevel[] }) {
  return (
    <section aria-labelledby="caa-path-heading" className={styles.evidenceSection}>
      <h3 id="caa-path-heading">Where the policy came from</h3>
      <ol aria-label="CAA lookup path" className={styles.path}>
        {levels.map((level, index) => (
          <li className={styles.pathStep} key={`${level.searchReason}-${level.name}-${index}`}>
            <span aria-hidden="true" className={styles.stepNumber}>{index + 1}</span>
            <div className={styles.stepBody}>
              <div className={styles.stepHeader}>
                <span className={styles.stepReason}>{reasonLabel(level.searchReason)}</span>
                <strong data-tone={level.error ? "danger" : level.records.length ? "success" : "neutral"}>
                  {levelOutcome(level)}
                </strong>
              </div>
              <code className={styles.stepName}>{level.name}</code>
              <p className={styles.stepMeta}>
                {level.responseCode ?? "No response code"}
                {level.aliasTarget ? <>. CNAME to <code>{level.aliasTarget}</code></> : null}
              </p>
              {level.error ? <p className={styles.stepError}>{level.error}</p> : null}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function CaaChecker({ initialName = "" }: { initialName?: string }) {
  const [name, setName] = useState(initialName);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const report = useMemo(
    () => (result ? diagnosticReportJson("CAA Policy Checker", result) : ""),
    [result],
  );

  async function submit(event: FormEvent) {
    event.preventDefault();
    setResult(null);
    if (!name.trim()) {
      setError("Enter a domain or hostname.");
      requestAnimationFrame(() => inputRef.current?.focus());
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/dns/caa-checker", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error?.message ?? "The CAA check failed.");
      setResult(data);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The CAA check failed.");
    } finally {
      setLoading(false);
    }
  }

  const qualifications = result && result.status !== "undetermined"
    ? qualificationMessages(result)
    : [];

  return (
    <section aria-label="CAA policy checker" className={styles.workbench} data-tool-workbench>
      <form aria-busy={loading} className={styles.form} onSubmit={submit}>
        <UiTextField
          autoCapitalize="none"
          autoComplete="off"
          className={styles.queryField}
          error={error}
          inputMode="url"
          inputRef={inputRef}
          label="Domain or hostname"
          name="name"
          onChange={(value) => {
            setName(value);
            if (error) setError(null);
          }}
          placeholder="www.github.com"
          required
          spellCheck={false}
          type="text"
          value={name}
        />
        <UiButton
          aria-busy={loading}
          className={styles.submit}
          isDisabled={loading}
          type="submit"
          variant="primary"
        >
          {loading ? "Checking CAA policy..." : "Check CAA policy"}
        </UiButton>
        {loading ? (
          <div className={styles.loadingStatus}>
            <UiStatus>Checking CAA policy...</UiStatus>
          </div>
        ) : null}
      </form>

      {result ? (
        <section aria-label="CAA policy result" className={styles.results} data-caa-result>
          <PolicyLead result={result} />

          {qualifications.length ? (
            <div aria-label="Policy qualifications" className={styles.qualifications}>
              <UiStatus tone="warning">{qualifications.join(" ")}</UiStatus>
            </div>
          ) : null}

          {result.status !== "undetermined" && result.records.length ? (
            <section aria-labelledby="caa-records-heading" className={styles.evidenceSection}>
              <h3 id="caa-records-heading">The records that create this policy</h3>
              <UiDataTable
                ariaLabel="Effective CAA records"
                columns={[
                  { id: "flag", label: "Flag" },
                  { id: "tag", label: "Tag" },
                  { id: "value", label: "Value" },
                  { id: "ttl", label: "Resolver TTL" },
                ]}
                rows={result.records.map((record, index) => ({
                  id: `${record.flags}-${record.tag}-${record.value}-${index}`,
                  cells: {
                    flag: `${record.flags}${record.critical ? ", critical" : ""}`,
                    tag: <code>{record.tag || "Malformed"}</code>,
                    value: <code>{record.value}</code>,
                    ttl: record.ttlSeconds === null
                      ? "Not reported"
                      : `${record.ttlSeconds.toLocaleString("en-US")}s`,
                  },
                }))}
              />
            </section>
          ) : null}

          <LookupPath levels={result.levels} />

          <p className={styles.metadata}>
            Checked {new Date(result.checkedAt).toLocaleString()} in {result.durationMs.toLocaleString("en-US")} ms.
          </p>

          <UiActionRow>
            <UiDownloadAction
              contents={report}
              filename={`${result.query.inputName}-caa-report.json`}
              label="Download report"
              mimeType="application/json;charset=utf-8"
            />
          </UiActionRow>

          <UiRawOutput label="Raw CAA responses" value={rawEvidence(result.levels)} />
        </section>
      ) : null}
    </section>
  );
}
