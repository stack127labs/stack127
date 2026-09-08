"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import {
  ToolButton,
  ToolKeyValueList,
  ToolRawOutput,
  ToolResultLead,
  ToolStatus,
  ToolTextField,
} from "@/app/tool-ui/tool-controls";
import type { RdapFetch } from "@/lib/domain/types.ts";
import type { TransferFinding, TransferReadiness } from "@/lib/domain/transfer-readiness.ts";
import {
  findingAction,
  formatTransferDate,
  orderedTransferFindings,
  publicFindingDetail,
  sourceHost,
  transferConclusion,
  transferPolicyApplies,
} from "./transfer-readiness-view";
import styles from "./transfer-readiness-tool.module.css";

const STATE_LABEL: Record<TransferFinding["state"], string> = {
  blocked: "Blocked",
  clear: "Clear",
  risk: "Risk",
  unknown: "Unknown",
};

function CheckedName({ result }: { result: TransferReadiness }) {
  const query = result.registration.query;
  if (!query.reduced) return null;
  return <p className={styles.checkedName}>Checked <code>{query.unicode}</code> after reducing <code>{query.input}</code> to its registrable domain.</p>;
}

function FindingAction({ action }: { action: ReturnType<typeof findingAction> }) {
  if (!action) return null;
  return action.href ? <Link href={action.href}>{action.label}</Link> : <span className={styles.nextAction}>{action.label}</span>;
}

function PublicChecks({ result }: { result: TransferReadiness }) {
  const domain = result.registration.query.domain;
  return (
    <section className={styles.section}>
      <h2>Public checks</h2>
      <ol className={styles.findings}>
        {orderedTransferFindings(result.findings).map((finding) => (
          <li data-state={finding.state} key={finding.id}>
            <div className={styles.findingHead}>
              <strong>{finding.title}</strong>
              <span>{STATE_LABEL[finding.state]}</span>
            </div>
            <p>{publicFindingDetail(finding)}</p>
            {finding.evidence ? (
              <p className={styles.evidence}>
                <code>{finding.evidence}</code>
                {["client-lock", "server-lock", "pending-transfer", "lifecycle"].includes(finding.id) ? <> · <Link href="/epp-status-codes">Explain this status</Link></> : null}
              </p>
            ) : null}
            <FindingAction action={findingAction(finding, domain)} />
          </li>
        ))}
      </ol>
    </section>
  );
}

function PolicyUsed({ result }: { result: TransferReadiness }) {
  const policy = result.policy;
  const pending = result.pendingPolicyChange;
  const rows: { label: string; value: ReactNode }[] = [
    { label: "Active rule", value: policy.label },
    { label: "Effective", value: policy.effectiveDate ? formatTransferDate(policy.effectiveDate) : "Not reported" },
    { label: "Timing locks", value: `${policy.afterRegistrationDays} days after registration and ${policy.afterTransferDays} days after registrar transfer` },
    { label: "Source", value: <a href={policy.source} rel="noreferrer" target="_blank">ICANN Transfer Policy</a> },
    { label: "Verified", value: formatTransferDate(policy.verifiedAt) },
  ];
  if (pending) rows.push({ label: "Adopted change", value: `${pending.afterRegistrationDays * 24} hours, not effective; no effective date published` });
  return (
    <section className={styles.section}>
      <h2>Policy used</h2>
      <ToolKeyValueList rows={rows} />
    </section>
  );
}

function AccountChecklist({ items }: { items: string[] }) {
  return (
    <section className={styles.section}>
      <h2>Check in your registrar account</h2>
      <ul className={styles.checklist}>{items.map((item) => <li key={item}>{item}</li>)}</ul>
    </section>
  );
}

function SourceMetadata({ result }: { result: TransferReadiness }) {
  const registration = result.registration;
  const fetch = registration.registryFetch;
  if (!fetch) return null;
  return (
    <dl aria-label="Registry source" className={styles.metadata}>
      <div><dt>Registry source</dt><dd><code>{sourceHost(fetch.url) ?? "Host not reported"}</code></dd></div>
      <div><dt>Fetched</dt><dd><time dateTime={fetch.fetchedAt}>{formatTransferDate(fetch.fetchedAt)}</time>{fetch.fromCache ? ", cached" : ""}</dd></div>
      {registration.registryDatabaseUpdated && registration.registryDatabaseUpdated !== fetch.fetchedAt ? (
        <div><dt>Registry data</dt><dd><time dateTime={registration.registryDatabaseUpdated}>{formatTransferDate(registration.registryDatabaseUpdated)}</time></dd></div>
      ) : null}
    </dl>
  );
}

function rawLabel(label: string, fetch: RdapFetch) {
  return `${label}${sourceHost(fetch.url) ? ` from ${sourceHost(fetch.url)}` : ""}`;
}

function RawEvidence({ result }: { result: TransferReadiness }) {
  const responses = [
    { fetch: result.registration.registryFetch, label: "Registry response" },
    { fetch: result.registration.registrarFetch, label: "Registrar response" },
  ].filter((item): item is { fetch: RdapFetch; label: string } => Boolean(item.fetch));
  if (!responses.length) return null;
  return (
    <div className={styles.rawEvidence}>
      {responses.map(({ fetch, label }) => (
        <ToolRawOutput key={label} label={rawLabel(label, fetch)} value={fetch.body ?? { error: fetch.error }} />
      ))}
    </div>
  );
}

function TransferResult({ result }: { result: TransferReadiness }) {
  const registeredInScope = result.registration.status === "registered" && transferPolicyApplies(result);
  const hasPublicBlocker = registeredInScope && result.findings.some((finding) => finding.state === "blocked");
  return (
    <section aria-label="Domain transfer readiness result" className={styles.results}>
      <div aria-atomic="true" aria-live={hasPublicBlocker ? "assertive" : "polite"} role={hasPublicBlocker ? "alert" : "status"}>
        <ToolResultLead>{transferConclusion(result)}</ToolResultLead>
      </div>
      <CheckedName result={result} />
      {registeredInScope ? (
        <>
          <PublicChecks result={result} />
          <PolicyUsed result={result} />
          <AccountChecklist items={result.cannotCheck} />
        </>
      ) : result.registration.status === "no_service" || !transferPolicyApplies(result) ? (
        <p className={styles.related}>Review this ending in the <Link href="/tld-directory">TLD directory</Link>.</p>
      ) : null}
      <SourceMetadata result={result} />
      <RawEvidence result={result} />
    </section>
  );
}

export function TransferReadinessTool({ initialName = "" }: { initialName?: string }) {
  const [hydrated, setHydrated] = useState(false);
  const [name, setName] = useState(initialName);
  const [result, setResult] = useState<TransferReadiness | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const inFlight = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => setHydrated(true), []);

  function changeName(value: string) {
    setName(value);
    setFieldError(null);
    setRequestError(null);
    setResult(null);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current) return;
    setResult(null);
    if (!name.trim()) {
      setFieldError("Enter a domain name.");
      requestAnimationFrame(() => inputRef.current?.focus());
      return;
    }
    inFlight.current = true;
    setLoading(true);
    setFieldError(null);
    setRequestError(null);
    try {
      const response = await fetch("/api/domain/transfer-readiness", {
        body: JSON.stringify({ name }),
        headers: { "content-type": "application/json" },
        method: "POST",
      });
      const data = await response.json();
      if (!response.ok) {
        const message = data?.error?.message ?? "The transfer check failed.";
        if (response.status === 400) {
          setFieldError(message);
          requestAnimationFrame(() => inputRef.current?.focus());
        } else setRequestError(message);
        return;
      }
      setResult(data as TransferReadiness);
    } catch {
      setRequestError("The transfer check could not be completed. Try again.");
    } finally {
      inFlight.current = false;
      setLoading(false);
    }
  }

  return (
    <section aria-label="Domain transfer readiness" className={`domain-tool ${styles.workbench}`} data-hydrated={hydrated ? "true" : undefined} data-tool-workbench>
      <form aria-busy={loading} className={styles.form} onSubmit={submit}>
        <ToolTextField
          autoCapitalize="none"
          autoComplete="off"
          className={styles.queryField}
          error={fieldError}
          inputMode="url"
          inputRef={inputRef}
          label="Domain name"
          name="name"
          onChange={changeName}
          placeholder="example.com"
          required
          spellCheck={false}
          value={name}
        />
        <ToolButton aria-busy={loading} className={styles.submit} isDisabled={loading} type="submit" variant="primary">
          {loading ? "Checking transfer readiness..." : "Check transfer readiness"}
        </ToolButton>
        {loading ? <ToolStatus>Checking public transfer data...</ToolStatus> : null}
        {requestError ? <ToolStatus tone="danger">{requestError}</ToolStatus> : null}
      </form>
      {result ? <TransferResult result={result} /> : null}
    </section>
  );
}
