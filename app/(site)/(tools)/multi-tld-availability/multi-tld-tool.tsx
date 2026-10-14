"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { UiButton, UiCheckbox, UiTextField } from "@/app/ui/controls";
import { UiDataTable, UiPrimaryResult, UiResultLead, UiStatus } from "@/app/ui/display";
import { DEFAULT_TLDS, MAX_TLDS, type MultiTldResult, type MultiTldRow } from "@/lib/domain/multi-tld-shared.ts";
import {
  multiTldSummary,
  resultDetail,
  sourceAndFreshness,
  stateLabel,
  type MultiTldDisplayRow,
} from "./multi-tld-view";
import styles from "./multi-tld-tool.module.css";

const OPTIONAL_TLDS = ["co", "me", "so", "sh", "gg", "to", "eu", "us", "de", "uk", "site", "online", "tech"];
const ALL_TLDS = [...DEFAULT_TLDS, ...OPTIONAL_TLDS];

class MultiTldRequestError extends Error {
  constructor(message: string, readonly fieldError = false) {
    super(message);
  }
}

function initialPendingRows(name: string, selected: string[]): MultiTldDisplayRow[] {
  const normalized = name.trim().toLowerCase();
  return selected.map((tld) => ({ domain: `${normalized}.${tld}`, state: "checking", tld }));
}

function fallbackRow(name: string, tld: string, detail: string): MultiTldRow {
  return {
    detail,
    domain: `${name.trim().toLowerCase()}.${tld}`,
    expiryDate: null,
    fetchedAt: null,
    fromCache: false,
    registrar: null,
    sourceHost: null,
    state: "check_failed",
    tld,
  };
}

async function checkOne(name: string, tld: string) {
  let response: Response;
  try {
    response = await fetch("/api/domain/multi-tld", {
      body: JSON.stringify({ name, tlds: [tld] }),
      headers: { "content-type": "application/json" },
      method: "POST",
    });
  } catch {
    throw new MultiTldRequestError("The selected endings could not be checked. Try again.");
  }
  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new MultiTldRequestError("The check returned an incomplete response. Try the selected endings again.");
  }
  if (!response.ok) {
    const message = (data as { error?: { message?: string } })?.error?.message ?? "The selected endings could not be checked. Try again.";
    throw new MultiTldRequestError(message, response.status === 400);
  }
  const result = data as MultiTldResult;
  if (
    !Array.isArray(result.rows) ||
    result.rows.length !== 1 ||
    result.rows[0]?.tld !== tld ||
    typeof result.name !== "string" ||
    typeof result.unicode !== "string"
  ) {
    throw new MultiTldRequestError("The check returned an incomplete response. Try the selected endings again.");
  }
  return {
    ...result.rows[0],
    unicodeDomain: result.unicode !== result.name ? `${result.unicode}.${tld}` : null,
  };
}

function RegisteredDetails({ row }: { row: MultiTldRow }) {
  if (row.state !== "registered") return null;
  return (
    <span className={styles.cellStack}>
      {row.registrar ? <span>Registrar: {row.registrar}</span> : null}
      {row.expiryDate ? <span>Expires: <time dateTime={row.expiryDate}>{new Date(row.expiryDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC", year: "numeric" })}</time></span> : null}
      <Link href={`/domain-lookup?name=${encodeURIComponent(row.domain)}`}>Open registration lookup</Link>
    </span>
  );
}

function DomainCell({ row }: { row: MultiTldDisplayRow }) {
  if ("unicodeDomain" in row && row.unicodeDomain && row.unicodeDomain !== row.domain) {
    return <span className={styles.domainCell}><code className={styles.domain}>{row.unicodeDomain}</code><code className={styles.asciiDomain}>{row.domain}</code></span>;
  }
  return <code className={styles.domain}>{row.domain}</code>;
}

function ResultCell({ retryingTld, row, onRetry }: { retryingTld: string | null; row: MultiTldDisplayRow; onRetry: (row: MultiTldRow) => void }) {
  if (row.state === "checking") return <strong>{stateLabel(row.state)}</strong>;
  const detail = resultDetail(row);
  return (
    <span className={styles.cellStack}>
      <strong data-state={row.state}>{stateLabel(row.state)}</strong>
      {detail ? <span>{detail}</span> : null}
      <RegisteredDetails row={row} />
      {row.state === "cannot_check" ? <Link href="/tld-directory">Open TLD directory</Link> : null}
      {row.state === "check_failed" ? (
        <UiButton isDisabled={Boolean(retryingTld)} onPress={() => onRetry(row)} variant="secondary">
          {retryingTld === row.tld ? `Retrying .${row.tld}...` : `Retry .${row.tld}`}
        </UiButton>
      ) : null}
    </span>
  );
}

function SourceCell({ row }: { row: MultiTldDisplayRow }) {
  if (row.state === "checking") return <span>Checking...</span>;
  const source = sourceAndFreshness(row);
  return (
    <span className={styles.cellStack}>
      <code>{source.source}</code>
      {source.freshness ? <span className={styles.meta}>{source.freshness}</span> : null}
    </span>
  );
}

function ResultTable({ retryingTld, rows, onRetry }: { retryingTld: string | null; rows: MultiTldDisplayRow[]; onRetry: (row: MultiTldRow) => void }) {
  return (
    <UiDataTable
      ariaLabel="Domain registry results"
      columns={[
        { id: "domain", label: "Domain" },
        { id: "result", label: "Registry result" },
        { id: "source", label: "Source and freshness" },
      ]}
      rows={rows.map((row) => ({
        cells: {
          domain: <DomainCell row={row} />,
          result: <ResultCell onRetry={onRetry} retryingTld={retryingTld} row={row} />,
          source: <SourceCell row={row} />,
        },
        id: row.tld,
      }))}
    />
  );
}

export function MultiTldTool() {
  const [name, setName] = useState("");
  const [selected, setSelected] = useState<string[]>([...DEFAULT_TLDS]);
  const [rows, setRows] = useState<MultiTldDisplayRow[]>([]);
  const [nameError, setNameError] = useState<string | null>(null);
  const [selectionError, setSelectionError] = useState<string | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [retryingTld, setRetryingTld] = useState<string | null>(null);
  const inFlight = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const choicesRef = useRef<HTMLDivElement>(null);

  useEffect(() => setHydrated(true), []);

  const settled = rows.filter((row) => row.state !== "checking") as MultiTldRow[];
  const complete = rows.length > 0 && settled.length === rows.length;
  const summary = complete ? multiTldSummary(settled) : null;

  function clearResult() {
    setRows([]);
    setRequestError(null);
  }

  function changeName(value: string) {
    setName(value);
    setNameError(null);
    clearResult();
  }

  function toggle(tld: string) {
    setSelected((current) => current.includes(tld) ? current.filter((entry) => entry !== tld) : [...current, tld]);
    setSelectionError(null);
    clearResult();
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current) return;
    clearResult();
    const trimmed = name.trim();
    if (!trimmed) {
      setNameError("Enter a name to check.");
      requestAnimationFrame(() => inputRef.current?.focus());
      return;
    }
    if (!selected.length) {
      setSelectionError("Choose at least one ending.");
      requestAnimationFrame(() => choicesRef.current?.querySelector<HTMLElement>("[role='checkbox'], input")?.focus());
      return;
    }

    inFlight.current = true;
    setLoading(true);
    setNameError(null);
    setSelectionError(null);
    const pending = initialPendingRows(trimmed, selected);
    setRows(pending);
    let firstValidationError: string | null = null;
    let requestFailure: string | null = null;
    let requestFailureCount = 0;
    await Promise.all(selected.map(async (tld) => {
      let row: MultiTldRow;
      try {
        row = await checkOne(trimmed, tld);
      } catch (error) {
        const detail = error instanceof Error ? error.message : `The .${tld} registry check failed.`;
        if (error instanceof MultiTldRequestError) {
          if (error.fieldError) firstValidationError ??= detail;
          else {
            requestFailure ??= detail;
            requestFailureCount += 1;
          }
        }
        row = fallbackRow(trimmed, tld, detail);
      }
      setRows((current) => current.map((entry) => entry.tld === tld ? row : entry));
    }));
    if (firstValidationError) {
      setRows([]);
      setNameError(firstValidationError);
      requestAnimationFrame(() => inputRef.current?.focus());
    } else if (requestFailure && requestFailureCount === selected.length) {
      setRows([]);
      setRequestError(requestFailure);
    }
    inFlight.current = false;
    setLoading(false);
  }

  async function retry(row: MultiTldRow) {
    if (inFlight.current) return;
    inFlight.current = true;
    setRetryingTld(row.tld);
    setRows((current) => current.map((entry) => entry.tld === row.tld ? { domain: row.domain, state: "checking", tld: row.tld } : entry));
    try {
      const next = await checkOne(name, row.tld);
      setRows((current) => current.map((entry) => entry.tld === row.tld ? next : entry));
    } catch (error) {
      const detail = error instanceof Error ? error.message : `The .${row.tld} registry check failed.`;
      setRows((current) => current.map((entry) => entry.tld === row.tld ? fallbackRow(name, row.tld, detail) : entry));
    } finally {
      inFlight.current = false;
      setRetryingTld(null);
    }
  }

  const countCopy = `${selected.length} selected, ${MAX_TLDS} maximum${selected.length === MAX_TLDS ? ". Remove one to choose another." : ""}`;

  return (
    <section aria-label="Multi-TLD availability" className={`domain-tool ${styles.workbench}`} data-hydrated={hydrated ? "true" : undefined} data-tool-workbench>
      <form aria-busy={loading} className={styles.form} onSubmit={submit}>
        <UiTextField
          autoCapitalize="none"
          autoComplete="off"
          error={nameError}
          inputMode="url"
          inputRef={inputRef}
          label="Name without an ending"
          name="name"
          onChange={changeName}
          placeholder="stack127"
          readOnly={loading}
          required
          spellCheck={false}
          value={name}
        />

        <fieldset aria-describedby={selectionError ? "multi-tld-selection-error" : undefined} className={styles.fieldset}>
          <legend>Endings <span aria-hidden="true" className={styles.required}>*</span></legend>
          <span className={styles.count}>{countCopy}</span>
          <div className={styles.choices} ref={choicesRef}>
            {ALL_TLDS.map((tld) => {
              const checked = selected.includes(tld);
              return (
                <UiCheckbox
                  isDisabled={loading || (!checked && selected.length >= MAX_TLDS)}
                  isSelected={checked}
                  key={tld}
                  onChange={() => toggle(tld)}
                >
                  <span className={styles.choiceLabel}>.{tld}</span>
                </UiCheckbox>
              );
            })}
          </div>
          {selectionError ? <p className={styles.error} id="multi-tld-selection-error" role="alert">{selectionError}</p> : null}
        </fieldset>

        <UiButton aria-busy={loading} className={styles.submit} isDisabled={loading} type="submit" variant="primary">
          {loading ? `Checking ${settled.length} of ${selected.length}...` : `Check ${selected.length} ending${selected.length === 1 ? "" : "s"}`}
        </UiButton>
        {requestError ? <UiStatus tone="danger">{requestError}</UiStatus> : null}
      </form>

      {rows.length ? (
        <section aria-label="Multi-TLD result" className={styles.results}>
          {summary ? (
            <>
              <div aria-atomic="true" aria-live="polite">
                <UiPrimaryResult detail={summary.detail} label="Set result" unit="without a registry record" value={summary.value} />
              </div>
              {summary.noRegistration ? <UiResultLead>No registration record does not rule out a reserved, blocked, or premium-priced name.</UiResultLead> : null}
            </>
          ) : (
            <UiStatus>Checked {settled.length} of {rows.length} endings...</UiStatus>
          )}
          <ResultTable onRetry={retry} retryingTld={retryingTld} rows={rows} />
        </section>
      ) : null}
    </section>
  );
}
