"use client";

import { useRef, useState, type FormEvent, type ReactNode } from "react";
import {
  ToolButton,
  ToolDataTable,
  ToolDisclosure,
  ToolDownloadAction,
  ToolRawOutput,
  ToolResultLead,
  ToolStatus,
  ToolTextField,
} from "@/app/tool-ui/tool-controls";
import { groupSoaObservations, negativeCacheTtlSeconds } from "@/lib/dns/diagnostic-presentation.ts";
import { diagnosticReportJson } from "../../(catalogs)/dns-tools/diagnostic-result-ui";
import {
  buildSoaComparison,
  soaDifferenceLabels,
  type SoaCheckerResult,
  type SoaDifferenceField,
  type SoaObservation,
} from "./soa-checker-view";
import styles from "./soa-checker.module.css";

const seconds = (value: number | null) => value === null ? "Not reported" : `${value.toLocaleString("en-US")}s`;

function DifferenceValue({ children, field, differences }: {
  children: ReactNode;
  field: SoaDifferenceField;
  differences: SoaDifferenceField[];
}) {
  if (!differences.includes(field)) return children;
  return (
    <span className={styles.difference} data-soa-difference={field}>
      {children}
      <span className={styles.visuallyHidden}> {soaDifferenceLabels[field]} differs</span>
    </span>
  );
}

function SourceValue({ hostname }: { hostname: string }) {
  return <code className={styles.source}>{hostname}</code>;
}

function AddressesValue({ addresses }: { addresses: string[] }) {
  return <span className={styles.addresses}>{addresses.map((address) => <code key={address}>{address}</code>)}</span>;
}

function unavailableCells() {
  return {
    owner: "Not available",
    serial: "Not available",
    primary: "Not available",
    mailbox: "Not available",
    refresh: "Not available",
    retry: "Not available",
    expire: "Not available",
    minimum: "Not available",
    ttl: "Not available",
    negativeCache: "Not available",
  };
}

function RawObservation({ observation }: { observation: SoaObservation }) {
  const source = `${observation.server.hostname} at ${observation.server.address}`;
  if (observation.skippedReason) {
    return (
      <section className={styles.rawSource}>
        <h4>{source}</h4>
        <p>No response captured. Skipped by checker because it has no IPv6 route.</p>
      </section>
    );
  }

  return (
    <section className={styles.rawSource}>
      <h4>{source}</h4>
      {(["udp", "tcp"] as const).map((transport) => {
        const response = observation.rawResponses?.[transport] ?? null;
        return response === null ? (
          <p className={styles.missingResponse} key={transport}>
            <strong>{transport.toUpperCase()}</strong>: No response captured{observation.error ? `. ${observation.error}` : "."}
          </p>
        ) : (
          <ToolRawOutput
            key={transport}
            label={`${transport.toUpperCase()} response from ${source}`}
            value={response}
          />
        );
      })}
    </section>
  );
}

function SoaResults({ result }: { result: SoaCheckerResult }) {
  const comparison = buildSoaComparison(result);
  const groups = groupSoaObservations(result.observations.filter((observation) => !observation.skippedReason));
  const report = diagnosticReportJson("SOA Consistency Checker", result);
  const rows = [
    ...groups.map((group, index) => {
      const soa = group.soa;
      const values = soa ? {
        owner: <DifferenceValue differences={comparison.differingFields} field="ownerName"><code>{soa.ownerName}</code></DifferenceValue>,
        serial: (
          <DifferenceValue differences={comparison.differingFields} field="serial">
            {soa.serial.toLocaleString("en-US")}
            {comparison.serialOrder === "defined" && soa.serial === comparison.newestSerial ? ", newest" : ""}
          </DifferenceValue>
        ),
        primary: <DifferenceValue differences={comparison.differingFields} field="primaryNameserver"><code>{soa.primaryNameserver}</code></DifferenceValue>,
        mailbox: <DifferenceValue differences={comparison.differingFields} field="responsibleMailbox"><code>{soa.responsibleMailbox}</code></DifferenceValue>,
        refresh: <DifferenceValue differences={comparison.differingFields} field="refreshSeconds">{seconds(soa.refreshSeconds)}</DifferenceValue>,
        retry: <DifferenceValue differences={comparison.differingFields} field="retrySeconds">{seconds(soa.retrySeconds)}</DifferenceValue>,
        expire: <DifferenceValue differences={comparison.differingFields} field="expireSeconds">{seconds(soa.expireSeconds)}</DifferenceValue>,
        minimum: <DifferenceValue differences={comparison.differingFields} field="minimumSeconds">{seconds(soa.minimumSeconds)}</DifferenceValue>,
        ttl: <DifferenceValue differences={comparison.differingFields} field="ttlSeconds">{seconds(soa.ttlSeconds)}</DifferenceValue>,
        negativeCache: <DifferenceValue differences={comparison.differingFields} field="negativeCacheTtlSeconds">{seconds(negativeCacheTtlSeconds(soa))}</DifferenceValue>,
      } : unavailableCells();

      return {
        id: `${group.hostname}-${group.addresses.join("-")}-${index}`,
        cells: {
          source: <SourceValue hostname={group.hostname} />,
          addresses: <AddressesValue addresses={group.addresses} />,
          state: (
            <span className={soa ? undefined : styles.failedState}>
              {soa ? "SOA returned" : "Failed"}
              {!soa && group.error ? <span className={styles.stateDetail}>{group.error}</span> : null}
            </span>
          ),
          authority: group.authoritative ? "Authoritative" : "Not authoritative",
          ...values,
        },
      };
    }),
    ...result.observations.filter((observation) => observation.skippedReason).map((observation, index) => ({
      id: `skipped-${observation.server.hostname}-${observation.server.address}-${index}`,
      cells: {
        source: <SourceValue hostname={observation.server.hostname} />,
        addresses: <AddressesValue addresses={[observation.server.address]} />,
        state: <span className={styles.skippedState}>Skipped by checker<span className={styles.stateDetail}>No IPv6 route</span></span>,
        authority: "Not checked",
        ...unavailableCells(),
      },
    })),
  ];

  return (
    <section aria-label="SOA comparison result" className={styles.results} data-soa-result data-state={comparison.state}>
      <div aria-atomic="true" aria-live="polite" className={styles.resultLead}>
        <ToolResultLead>{comparison.lead}</ToolResultLead>
        <ToolDownloadAction
          contents={report}
          filename={`${result.query.zone}-soa-report.json`}
          label="Download report"
          mimeType="application/json;charset=utf-8"
        />
      </div>

      {comparison.showTable ? (
        <section className={styles.comparison}>
          <h3>SOA values by authoritative source</h3>
          <ToolDataTable
            ariaLabel={`SOA values for ${result.query.zone} by authoritative source`}
            columns={[
              { id: "source", label: "Source" },
              { id: "addresses", label: "Addresses" },
              { id: "state", label: "Check state" },
              { id: "authority", label: "Authority" },
              { id: "owner", label: "Owner" },
              { id: "serial", label: "Serial" },
              { id: "primary", label: "Primary, MNAME" },
              { id: "mailbox", label: "Mailbox, RNAME" },
              { id: "refresh", label: "Refresh" },
              { id: "retry", label: "Retry" },
              { id: "expire", label: "Expire" },
              { id: "minimum", label: "MINIMUM" },
              { id: "ttl", label: "SOA TTL" },
              { id: "negativeCache", label: "Negative cache" },
            ]}
            rows={rows}
          />
        </section>
      ) : null}

      {result.observations.length ? (
        <ToolDisclosure label="Raw SOA responses">
          <div className={styles.rawSources}>
            {result.observations.map((observation, index) => (
              <RawObservation key={`${observation.server.hostname}-${observation.server.address}-${index}`} observation={observation} />
            ))}
          </div>
        </ToolDisclosure>
      ) : null}

      <dl className={styles.metadata}>
        <div><dt>Checked</dt><dd><time dateTime={result.checkedAt}>{new Date(result.checkedAt).toLocaleString()}</time></dd></div>
        <div><dt>Duration</dt><dd>{result.durationMs.toLocaleString("en-US")} ms</dd></div>
      </dl>
    </section>
  );
}

export function SoaChecker({ initialName = "" }: { initialName?: string }) {
  const [name, setName] = useState(initialName);
  const [result, setResult] = useState<SoaCheckerResult | null>(null);
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
      const response = await fetch("/api/dns/soa-checker", {
        body: JSON.stringify({ name }),
        headers: { "content-type": "application/json" },
        method: "POST",
      });
      const data = await response.json();
      if (!response.ok) {
        const message = data?.error?.message ?? "The SOA check failed.";
        if (response.status === 400) {
          setFieldError(message);
          requestAnimationFrame(() => inputRef.current?.focus());
          return;
        }
        throw new Error(message);
      }
      setResult(data as SoaCheckerResult);
    } catch (caught) {
      setRequestError(caught instanceof Error ? caught.message : "The SOA check failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section aria-label="SOA consistency checker" className={styles.workbench} data-tool-workbench>
      <form aria-busy={loading} className={styles.form} onSubmit={submit}>
        <ToolTextField
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
          placeholder="cloudflare.com"
          required
          spellCheck={false}
          type="text"
          value={name}
        />
        <ToolButton aria-busy={loading} className={styles.submit} isDisabled={loading} type="submit" variant="primary">
          {loading ? "Comparing SOA records..." : "Compare SOA records"}
        </ToolButton>
        {loading ? <ToolStatus>Comparing SOA records...</ToolStatus> : null}
        {requestError ? <ToolStatus tone="danger">{requestError}</ToolStatus> : null}
      </form>
      {result ? <SoaResults result={result} /> : null}
    </section>
  );
}
