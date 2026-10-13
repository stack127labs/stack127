"use client";

import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import { UiButton, UiCopyAction, UiTextField } from "@/app/ui/controls";
import { UiDataTable, UiResultLead, UiStatus } from "@/app/ui/display";
import {
  characterRows,
  inspectInput,
  labelRows,
  scriptAssessment,
  type PunycodeOutcome,
} from "./punycode-view";
import styles from "./punycode-tool.module.css";

function ConvertedForms({ outcome }: { outcome: PunycodeOutcome }) {
  const identical = outcome.unicode === outcome.ascii;
  const oneLabel = outcome.kind === "url" ? "URL" : "Domain";
  const rows = identical
    ? [{ label: oneLabel, copy: `Copy ${oneLabel.toLowerCase()}`, success: `${oneLabel} copied`, value: outcome.ascii }]
    : [
        { label: "Unicode", copy: "Copy Unicode", success: "Unicode copied", value: outcome.unicode },
        { label: outcome.kind === "url" ? "ASCII URL" : "ASCII for DNS", copy: "Copy ASCII", success: "ASCII copied", value: outcome.ascii },
      ];
  return (
    <output aria-label="Converted forms" className={styles.formsOutput}>
      <h2>Converted {identical ? "form" : "forms"}</h2>
      <dl>
        {rows.map((row) => (
          <div key={row.label}>
            <dt>{row.label}</dt>
            <dd><code>{row.value}</code></dd>
            <UiCopyAction label={row.copy} successLabel={row.success} value={row.value} />
          </div>
        ))}
      </dl>
      {identical ? <p>Unicode and ASCII are identical.</p> : null}
    </output>
  );
}

function LabelTable({ outcome }: { outcome: PunycodeOutcome }) {
  return (
    <UiDataTable
      ariaLabel="Hostname label breakdown"
      columns={[
        { id: "label", label: "UiLabel" },
        { id: "unicode", label: "Unicode" },
        { id: "ascii", label: "ASCII for DNS" },
        { id: "scripts", label: "Scripts" },
        { id: "length", label: "ASCII length" },
      ]}
      rows={labelRows(outcome.labels).map((row) => ({
        cells: {
          ascii: <span className={styles.cellStack}><code>{row.ascii}</code><span className={styles.meta}>{row.conversion}</span></span>,
          label: row.label,
          length: <span className={row.overLimit ? styles.danger : undefined}>{row.length}</span>,
          scripts: row.scripts,
          unicode: <code>{row.unicode}</code>,
        },
        id: row.id,
      }))}
    />
  );
}

function CharacterTable({ outcome }: { outcome: PunycodeOutcome }) {
  const rows = characterRows(outcome.labels);
  if (!rows.length) return null;
  return (
    <section className={styles.section}>
      <h2>Characters in non-ASCII labels</h2>
      <UiDataTable
        ariaLabel="Characters in non-ASCII labels"
        columns={[
          { id: "position", label: "UiLabel and position" },
          { id: "character", label: "Character" },
          { id: "codePoint", label: "Code point" },
          { id: "name", label: "Unicode name" },
          { id: "script", label: "Script" },
        ]}
        rows={rows.map((row) => ({
          cells: {
            character: <code>{row.character}</code>,
            codePoint: <code>{row.codePoint}</code>,
            name: row.name,
            position: row.position,
            script: row.script,
          },
          id: row.id,
        }))}
      />
    </section>
  );
}

function Results({ outcome }: { outcome: PunycodeOutcome }) {
  return (
    <section aria-label="Punycode conversion result" className={styles.results}>
      <ConvertedForms outcome={outcome} />

      {outcome.problemText.length ? (
        <section aria-label="Validation findings" aria-live="polite" className={styles.findings}>
          <p>This hostname cannot be used as-is:</p>
          <ul>{outcome.problemText.map((text) => <li key={text}>{text}</li>)}</ul>
        </section>
      ) : null}

      <UiResultLead>{scriptAssessment(outcome.labels)}</UiResultLead>

      <p className={outcome.hostnameOctets > 253 ? styles.danger : styles.length}>
        ASCII hostname length: <strong>{outcome.hostnameOctets} of 253 bytes</strong>
      </p>

      <section className={styles.section}>
        <h2>UiLabel breakdown</h2>
        <LabelTable outcome={outcome} />
      </section>

      <CharacterTable outcome={outcome} />

      <dl aria-label="Conversion processing" className={styles.metadata}>
        <div><dt>Unicode data</dt><dd>{outcome.unicodeVersion}</dd></div>
        <div><dt>Processing</dt><dd>UTS-46 non-transitional, STD3 ASCII rules</dd></div>
        <div><dt>Not checked</dt><dd>Bidi, CONTEXTJ, and CONTEXTO rules</dd></div>
      </dl>

      {!outcome.problems.length ? (
        <p className={styles.related}>
          Open the <Link href={`/domain-lookup?name=${encodeURIComponent(outcome.asciiHostname)}`}>registration lookup</Link> or <Link href={`/dns-lookup?name=${encodeURIComponent(outcome.asciiHostname)}`}>DNS lookup</Link> for <code>{outcome.asciiHostname}</code>.
        </p>
      ) : null}
    </section>
  );
}

export function PunycodeTool() {
  const [value, setValue] = useState("");
  const [outcome, setOutcome] = useState<PunycodeOutcome | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [failure, setFailure] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const inFlight = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function changeValue(next: string) {
    setValue(next);
    setError(null);
    setFailure(null);
    setOutcome(null);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current) return;
    setOutcome(null);
    setFailure(null);
    let parsed: ReturnType<typeof inspectInput>;
    try {
      parsed = inspectInput(value);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Enter a domain name or URL.");
      requestAnimationFrame(() => inputRef.current?.focus());
      return;
    }

    inFlight.current = true;
    setBusy(true);
    setError(null);
    try {
      const [punycode, unicode] = await Promise.all([
        import("@/lib/domain/punycode.ts"),
        import("@/lib/domain/unicode.ts"),
      ]);
      const converted = punycode.convertName(parsed.hostname, unicode.mapLabel);
      const labels = converted.labels.map((label) => ({
        characters: /^[\x00-\x7f]*$/.test(label.unicode) ? [] : unicode.describeCharacters(label.unicode),
        label,
        octets: punycode.octetLength(label.ascii),
        scripts: unicode.analyzeScripts(label.unicode),
      }));
      const problemText = [...new Set(converted.problems.map((problem) => punycode.LABEL_PROBLEM_TEXT[problem]))];
      setOutcome({
        ascii: parsed.reconstruct(converted.ascii),
        asciiHostname: converted.ascii,
        hostnameOctets: punycode.octetLength(converted.ascii),
        kind: parsed.kind,
        labels,
        problems: converted.problems,
        problemText,
        unicode: parsed.reconstruct(converted.unicode),
        unicodeHostname: converted.unicode,
        unicodeVersion: unicode.UNICODE_VERSION,
      });
    } catch {
      setFailure("The browser could not convert this name. Try again.");
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }

  return (
    <section aria-label="Punycode and IDN converter" className={`domain-tool ${styles.workbench}`} data-tool-workbench>
      <form aria-busy={busy} className={styles.form} onSubmit={submit}>
        <UiTextField
          autoCapitalize="none"
          autoComplete="off"
          className={styles.queryField}
          description="Conversion runs in this browser. Nothing is sent to stack127."
          error={error}
          inputMode="url"
          inputRef={inputRef}
          label="Domain name or URL"
          onChange={changeValue}
          placeholder="münchen.de or xn--mnchen-3ya.de"
          readOnly={busy}
          required
          spellCheck={false}
          value={value}
        />
        <UiButton aria-busy={busy} className={styles.submit} isDisabled={busy} type="submit" variant="primary">
          {busy ? "Converting..." : "Convert domain"}
        </UiButton>
        {busy ? <UiStatus>Loading Unicode data and converting...</UiStatus> : null}
        {failure ? <UiStatus tone="danger">{failure}</UiStatus> : null}
      </form>
      {outcome ? <Results outcome={outcome} /> : null}
    </section>
  );
}
