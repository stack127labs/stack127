"use client";

import { useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { UiButton, UiDisclosure, UiDownloadAction, UiRawOutput, UiTextField } from "@/app/ui/controls";
import { UiDataTable, UiResultLead, UiStatus } from "@/app/ui/display";
import type {
  DelegationCheck,
  DelegationObservation,
  NameserverAddressObservation,
  NameserverReachability,
} from "@/lib/dns/diagnostic-types.ts";
import { diagnosticReportJson } from "@/app/ui/tools/dns/diagnostic-result-ui";
import {
  checkedAddressCount,
  delegationContextNotes,
  delegationDiagnosis,
  delegationHostnames,
  delegationRow,
  networkDetails,
  remainingDelegationFindings,
  transportText,
} from "./nameserver-checker-view";
import styles from "./nameserver-checker.module.css";

function StackedValues({ values, mono = false }: { values: ReactNode[]; mono?: boolean }) {
  return <span className={styles.stackedValues}>{values.map((value, index) => mono ? <code key={index}>{value}</code> : <span key={index}>{value}</span>)}</span>;
}

function DelegationChain({ result }: { result: DelegationCheck }) {
  const testedAddresses = checkedAddressCount(result);
  return (
    <section className={styles.chainSection}>
      <h3>Delegation path</h3>
      <ol aria-label="DNS delegation path" className={styles.chain}>
        <li><span>Parent referral</span><code>{result.parentZone}</code><small>{result.parentDelegatedNameservers.length} NS record{result.parentDelegatedNameservers.length === 1 ? "" : "s"}</small></li>
        <li><span>Delegated zone</span><code>{result.zone}</code><small>{result.childPublishedNameservers.length} published name{result.childPublishedNameservers.length === 1 ? "" : "s"}</small></li>
        <li><span>Direct checks</span><strong>{testedAddresses}</strong><small>address{testedAddresses === 1 ? "" : "es"}</small></li>
      </ol>
    </section>
  );
}

function ResultLists({ context, issues }: { context: string[]; issues: string[] }) {
  if (!issues.length && !context.length) return null;
  return (
    <div className={styles.listGroups}>
      {issues.length ? <section><h3>Other issues</h3><ol>{issues.map((issue) => <li key={issue}>{issue}</li>)}</ol></section> : null}
      {context.length ? <section><h3>Check context</h3><ul>{context.map((note) => <li key={note}>{note}</li>)}</ul></section> : null}
    </div>
  );
}

function DelegationTable({ result }: { result: DelegationCheck }) {
  const hostnames = delegationHostnames(result);
  if (!hostnames.length) return null;
  return (
    <section className={styles.resultSection}>
      <h3>Delegation, glue, and addresses</h3>
      <UiDataTable
        ariaLabel="Nameserver delegation, glue, and address comparison"
        columns={[
          { id: "nameserver", label: "Nameserver" },
          { id: "parent", label: "Parent" },
          { id: "child", label: "Child" },
          { id: "rule", label: "Glue rule" },
          { id: "glue", label: "Parent glue" },
          { id: "zone", label: "Zone A and AAAA" },
          { id: "tested", label: "Tested addresses" },
        ]}
        rows={hostnames.map((hostname) => {
          const row = delegationRow(result, hostname);
          return {
            id: hostname,
            cells: {
              nameserver: <code>{hostname}</code>,
              parent: row.parent,
              child: row.child,
              rule: row.glueRule,
              glue: <StackedValues mono values={row.parentGlue} />,
              zone: <StackedValues mono values={row.zoneAddresses} />,
              tested: <StackedValues mono values={row.testedAddresses} />,
            },
          };
        })}
      />
    </section>
  );
}

function SoaValue({ check }: { check: NameserverReachability }) {
  if (check.skippedReason) return <StackedValues values={["Not checked", "No IPv6 route in checker"]} />;
  if (!check.soa) return "No SOA returned";
  return <StackedValues mono values={[check.soa.ownerName, `Primary ${check.soa.primaryNameserver}`]} />;
}

function AddressTable({ result }: { result: DelegationCheck }) {
  if (!result.reachability.length) return null;
  return (
    <section className={styles.resultSection}>
      <h3>Nameserver address checks</h3>
      <UiDataTable
        ariaLabel="UDP, TCP, and authoritative SOA checks by nameserver address"
        columns={[
          { id: "server", label: "Server and address" },
          { id: "scope", label: "Scope" },
          { id: "network", label: "Network" },
          { id: "udp", label: "UDP" },
          { id: "tcp", label: "TCP" },
          { id: "soa", label: "Authoritative SOA" },
        ]}
        rows={result.reachability.map((check) => ({
          id: `${check.server.hostname}-${check.server.address}`,
          cells: {
            server: <StackedValues mono values={[check.server.hostname, check.server.address]} />,
            scope: check.skippedReason ? <StackedValues values={["Skipped by checker", "No IPv6 route"]} /> : "Checked",
            network: <StackedValues values={networkDetails(result, check.server.address)} />,
            udp: <StackedValues values={transportText(check, "udp")} />,
            tcp: <StackedValues values={transportText(check, "tcp")} />,
            soa: <SoaValue check={check} />,
          },
        }))}
      />
    </section>
  );
}

function MissingRaw({ detail }: { detail: string }) {
  return <p className={styles.missingRaw}>{detail}</p>;
}

function ObservationRaw({ kind, observation }: { kind: string; observation: DelegationObservation }) {
  const source = `${observation.server.hostname} at ${observation.server.address}`;
  return observation.rawResponse
    ? <UiRawOutput label={`${kind} response from ${source}`} value={observation.rawResponse} />
    : <MissingRaw detail={`${kind} response from ${source}: ${observation.error ?? "No response captured"}.`} />;
}

function AddressObservationRaw({ observation }: { observation: NameserverAddressObservation }) {
  const source = `${observation.hostname} via ${observation.server.hostname} at ${observation.server.address}`;
  return (
    <section className={styles.rawGroup}>
      <h4>{source}</h4>
      {(["A", "AAAA"] as const).map((type) => observation.rawResponses[type]
        ? <UiRawOutput key={type} label={`${type} response`} value={observation.rawResponses[type]} />
        : <MissingRaw key={type} detail={`${type}: ${observation.error ?? "No response captured"}.`} />)}
    </section>
  );
}

function DelegationEvidence({ result }: { result: DelegationCheck }) {
  const hasEvidence = result.parentObservations.length || result.childObservations.length || result.authoritativeAddressObservations.length;
  if (!hasEvidence) return null;
  return (
    <UiDisclosure label="Parent, child, and address responses">
      <div className={styles.rawEvidence}>
        {result.parentObservations.map((item, index) => <ObservationRaw kind="Parent" key={`parent-${index}-${item.server.address}`} observation={item} />)}
        {result.childObservations.map((item, index) => <ObservationRaw kind="Child" key={`child-${index}-${item.server.address}`} observation={item} />)}
        {result.authoritativeAddressObservations.map((item, index) => <AddressObservationRaw key={`address-${index}-${item.server.address}`} observation={item} />)}
      </div>
    </UiDisclosure>
  );
}

function ReachabilityRaw({ check }: { check: NameserverReachability }) {
  const source = `${check.server.hostname} at ${check.server.address}`;
  return (
    <section className={styles.rawGroup}>
      <h4>{source}</h4>
      {(["udp", "tcp"] as const).map((transport) => check.rawResponses[transport]
        ? <UiRawOutput key={transport} label={`${transport.toUpperCase()} response`} value={check.rawResponses[transport]} />
        : <MissingRaw key={transport} detail={`${transport.toUpperCase()}: ${check.skippedReason ? "Not run by this checker" : check[transport].error ?? "No response captured"}.`} />)}
    </section>
  );
}

function ReachabilityEvidence({ result }: { result: DelegationCheck }) {
  if (!result.reachability.length) return null;
  return (
    <UiDisclosure label="UDP and TCP responses">
      <div className={styles.rawEvidence}>{result.reachability.map((check) => <ReachabilityRaw check={check} key={`${check.server.hostname}-${check.server.address}`} />)}</div>
    </UiDisclosure>
  );
}

function RunMetadata({ result }: { result: DelegationCheck }) {
  return (
    <dl className={styles.metadata}>
      <div><dt>Checked</dt><dd><time dateTime={result.checkedAt}>{new Date(result.checkedAt).toLocaleString()}</time></dd></div>
      <div><dt>Duration</dt><dd>{result.durationMs.toLocaleString("en-US")} ms</dd></div>
    </dl>
  );
}

function NameserverResult({ result }: { result: DelegationCheck }) {
  const diagnosis = delegationDiagnosis(result);
  const issues = remainingDelegationFindings(result, diagnosis.leadFinding);
  const context = delegationContextNotes(result);
  const report = diagnosticReportJson("Nameserver Delegation Checker", result);
  return (
    <section aria-label="Nameserver delegation result" className={styles.results} data-nameserver-result>
      <div className={styles.resultLead} data-tone={diagnosis.tone}>
        <div aria-atomic="true" aria-live="polite"><UiResultLead>{diagnosis.text}</UiResultLead></div>
        <UiDownloadAction contents={report} filename={`${result.zone}-nameserver-report.json`} label="Download report" mimeType="application/json;charset=utf-8" />
      </div>
      <DelegationChain result={result} />
      <ResultLists context={context} issues={issues} />
      <DelegationTable result={result} />
      <DelegationEvidence result={result} />
      <AddressTable result={result} />
      <ReachabilityEvidence result={result} />
      <RunMetadata result={result} />
    </section>
  );
}

export function NameserverChecker({ initialName = "" }: { initialName?: string }) {
  const [name, setName] = useState(initialName);
  const [result, setResult] = useState<DelegationCheck | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const submittedName = useMemo(() => name.trim(), [name]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setResult(null);
    if (!submittedName) {
      setRequestError(null);
      setFieldError("Enter a domain or hostname.");
      requestAnimationFrame(() => inputRef.current?.focus());
      return;
    }
    setLoading(true);
    setFieldError(null);
    setRequestError(null);
    try {
      const response = await fetch("/api/dns/nameserver-checker", {
        body: JSON.stringify({ name }),
        headers: { "content-type": "application/json" },
        method: "POST",
      });
      const data = await response.json();
      if (!response.ok) {
        const message = data?.error?.message ?? "The nameserver check failed.";
        if (response.status === 400) {
          setFieldError(message);
          requestAnimationFrame(() => inputRef.current?.focus());
          return;
        }
        throw new Error(message);
      }
      setResult(data as DelegationCheck);
    } catch (caught) {
      setRequestError(caught instanceof Error ? caught.message : "The nameserver check failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section aria-label="Nameserver delegation checker" className={styles.workbench} data-tool-workbench>
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
            if (fieldError) setFieldError(null);
            if (requestError) setRequestError(null);
          }}
          placeholder="github.com"
          required
          spellCheck={false}
          type="text"
          value={name}
        />
        <UiButton aria-busy={loading} className={styles.submit} isDisabled={loading} type="submit" variant="primary">
          {loading ? "Checking nameservers..." : "Check nameservers"}
        </UiButton>
        {loading ? <div className={styles.formStatus}><UiStatus>Checking nameservers...</UiStatus></div> : null}
        {requestError ? <div className={styles.formStatus}><UiStatus tone="danger">{requestError}</UiStatus></div> : null}
      </form>
      {result ? <NameserverResult result={result} /> : null}
    </section>
  );
}
