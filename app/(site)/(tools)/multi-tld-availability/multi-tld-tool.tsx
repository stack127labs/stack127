"use client";

import { useMemo, useState, type FormEvent } from "react";
import { DEFAULT_TLDS, MAX_TLDS, type MultiTldResult, type MultiTldRow } from "@/lib/domain/multi-tld-shared.ts";
import {
  DomainForm,
  DownloadReportButton,
  StatePill,
  formatDate,
  reportJson,
  useDomainLookup,
  type Tone,
} from "../../(catalogs)/domain-tools/domain-lookup-client";

/** Cannot check and check failed must never read as available. */
const STATE_TONE: Record<MultiTldRow["state"], Tone> = {
  not_registered: "good",
  registered: "bad",
  cannot_check: "quiet",
  check_failed: "warn",
};

const STATE_LABEL: Record<MultiTldRow["state"], string> = {
  not_registered: "No registration found",
  registered: "Taken",
  cannot_check: "Cannot check",
  check_failed: "Check failed",
};

/** A few extra endings people expect. Offered, not defaulted, since some cannot be checked. */
const OPTIONAL_TLDS = ["co", "me", "us", "de", "uk", "site", "online", "tech"];

export function MultiTldTool() {
  const [name, setName] = useState("");
  const [selected, setSelected] = useState<string[]>([...DEFAULT_TLDS]);
  const { result, error, loading, run, setError } = useDomainLookup<MultiTldResult>("/api/domain/multi-tld");
  const report = useMemo(() => (result ? reportJson("Multi-TLD Availability", result) : ""), [result]);

  function toggle(tld: string) {
    setSelected((current) =>
      current.includes(tld)
        ? current.filter((entry) => entry !== tld)
        : current.length >= MAX_TLDS
          ? current
          : [...current, tld],
    );
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) return setError("Enter a name to check.");
    if (!selected.length) return setError("Choose at least one ending.");
    void run({ name, tlds: selected });
  }

  const free = result?.rows.filter((row) => row.state === "not_registered").length ?? 0;

  return (
    <section className="domain-tool" aria-label="Multi-TLD availability">
      <DomainForm
        busyLabel="Asking the registries..."
        error={error}
        label="Name, without an ending"
        loading={loading}
        onChange={setName}
        onSubmit={submit}
        placeholder="stack127"
        submitLabel={`Check ${selected.length} ending${selected.length === 1 ? "" : "s"}`}
        value={name}
      >
        <div>
          <span className="domain-meta">
            Endings to check. Up to {MAX_TLDS} at once, because each one is a separate request to a different registry.
          </span>
          <div className="domain-tld-options">
            {[...DEFAULT_TLDS, ...OPTIONAL_TLDS].map((tld) => (
              <label key={tld}>
                <input checked={selected.includes(tld)} onChange={() => toggle(tld)} type="checkbox" />
                <span>.{tld}</span>
              </label>
            ))}
          </div>
        </div>
      </DomainForm>

      {result ? (
        <section className="domain-results" aria-live="polite">
          <div className="domain-answer">
            <div className="domain-answer-head">
              <StatePill tone={free ? "good" : "quiet"}>
                {free} of {result.rows.length} with no registration
              </StatePill>
            </div>
            <p className="domain-answer-lead">
              <code>{result.unicode}</code> across {result.rows.length} ending
              {result.rows.length === 1 ? "" : "s"}.
            </p>
            <p>
              A row with no registration usually means you can register it, but reserved names, registry blocklists and
              premium pricing all look exactly the same from here. Premium pricing in particular is common on the newer
              endings, so check the price before planning around a free row.
            </p>
          </div>

          <section>
            <h2>Results</h2>
            <div className="domain-table-scroll">
              <table className="domain-table">
                <thead>
                  <tr>
                    <th>Domain</th>
                    <th>Outcome</th>
                    <th>Detail</th>
                  </tr>
                </thead>
                <tbody>
                  {result.rows.map((row) => (
                    <tr key={row.tld}>
                      <td>
                        <code>{row.domain}</code>
                      </td>
                      <td>
                        <StatePill tone={STATE_TONE[row.state]}>{STATE_LABEL[row.state]}</StatePill>
                      </td>
                      <td>
                        {row.detail}
                        {row.registrar ? <small style={{ display: "block" }}>Through {row.registrar}</small> : null}
                        {row.expiryDate ? (
                          <small style={{ display: "block" }}>Expires {formatDate(row.expiryDate)}</small>
                        ) : null}
                        {row.fromCache ? <small style={{ display: "block" }}>From our cache</small> : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="domain-meta">
              Checked {result.checkedCount} ending{result.checkedCount === 1 ? "" : "s"} at{" "}
              {formatDate(result.checkedAt)}. Nothing was silently skipped: every ending you selected has a row.
            </p>
          </section>

          <div className="domain-result-header">
            <span />
            <DownloadReportButton contents={report} filename={`${result.name}-availability.json`} />
          </div>
        </section>
      ) : null}
    </section>
  );
}
