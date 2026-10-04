"use client";

import { createElement, Fragment, useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { RotateCcw } from "lucide-react";
import { UiButton, UiChoiceGroup, UiCopyAction, UiTextArea, uiOption } from "@/app/ui/controls";
import { UiActionRow, UiCodeOutput, UiKeyValueList, UiResultLead, UiStatus } from "@/app/ui/display";
import {
  formatKdpDescription,
  type KdpDescriptionFormatResult,
  type KdpDescriptionMode,
  type KdpDescriptionTreeNode,
} from "@/lib/kdp/description-formatter.ts";
import styles from "../../../ui/tools/kdp-tool.module.css";
import pageStyles from "./kdp-book-description-formatter.module.css";

const PREVIEW_TAGS = {
  br: "br",
  p: "p",
  b: "b",
  em: "em",
  i: "i",
  u: "u",
  h4: "h4",
  h5: "h5",
  h6: "h6",
  ol: "ol",
  ul: "ul",
  li: "li",
} as const;

function renderPreview(nodes: readonly KdpDescriptionTreeNode[]): ReactNode[] {
  return nodes.map((node, index) => {
    if (node.type === "text") return <Fragment key={index}>{node.value}</Fragment>;
    const tag = PREVIEW_TAGS[node.tag as keyof typeof PREVIEW_TAGS];
    if (!tag) return <Fragment key={index}>{renderPreview(node.children)}</Fragment>;
    if (tag === "br") return createElement("br", { key: index });
    return createElement(tag, { key: index }, ...renderPreview(node.children));
  });
}

function leadText(result: Exclude<KdpDescriptionFormatResult, { status: "invalid" }>): string {
  if (result.status === "no-output") return result.message;
  return result.copyAllowed
    ? "Formatted HTML is within the local 4,000-character count and available to copy."
    : `Formatted HTML is ${result.overBy} characters over the local 4,000-character count.`;
}

function ChangeList({ result }: { result: Exclude<KdpDescriptionFormatResult, { status: "invalid" }> }) {
  if (!result.changes.length) return <p className={styles.notice}>No cleanup changes were needed beyond formatting the source for the selected mode.</p>;
  return (
    <ul className={styles.plainList}>
      {result.changes.map((change) => (
        <li key={change.type}>
          <strong>{change.type === "whitespace" ? "Whitespace normalized" : change.type === "unsupported-tags" ? "Unsupported tags unwrapped" : change.type === "converted-tags" ? "Formatting tags converted" : change.type === "invisible-characters" ? "Invisible characters removed" : change.type === "attributes" ? "Attributes stripped" : change.type === "dropped-content" ? "Content dropped" : change.type === "entities" ? "Entities or spaces normalized" : change.type === "comments" ? "Comments removed" : "Declarations removed"}:</strong> {change.details.join(" ")}
          {change.count > 1 ? ` (${change.count} occurrences)` : ""}
        </li>
      ))}
    </ul>
  );
}

export function KdpBookDescriptionFormatter() {
  const [mode, setMode] = useState<KdpDescriptionMode>("plain-text");
  const [source, setSource] = useState("");
  const [result, setResult] = useState<Exclude<KdpDescriptionFormatResult, { status: "invalid" }> | null>(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [failure, setFailure] = useState("");
  const [pendingFocus, setPendingFocus] = useState<"mode" | "source" | "result" | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const sourceRef = useRef<HTMLTextAreaElement>(null);
  const resultRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (pendingFocus === "mode") formRef.current?.querySelector<HTMLElement>('[role="radio"]')?.focus();
    else if (pendingFocus === "source") sourceRef.current?.focus();
    else if (pendingFocus === "result") resultRef.current?.focus();
    if (pendingFocus) setPendingFocus(null);
  }, [pendingFocus, result]);

  function updateSource(value: string) {
    const hadOutput = Boolean(result || error || failure);
    setSource(value);
    setResult(null);
    setError("");
    setFailure("");
    if (hadOutput) setStatus("Formatted output cleared. Format again to use this source.");
  }

  function changeMode(value: string) {
    if (value !== "plain-text" && value !== "html-source") return;
    const next = value as KdpDescriptionMode;
    if (next === mode) return;
    const hadOutput = Boolean(result || error || failure);
    setMode(next);
    setResult(null);
    setError("");
    setFailure("");
    if (hadOutput) setStatus("Formatted output cleared. Format again to use this mode.");
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFailure("");
    try {
      const next = formatKdpDescription({ source, mode });
      if (next.status === "invalid") {
        setResult(null);
        setError(next.message);
        setStatus("Check the description source and format it again.");
        setPendingFocus("source");
        return;
      }
      setError("");
      setResult(next);
      setStatus(next.status === "formatted" && next.copyAllowed ? "Description formatted." : next.status === "no-output" ? "Formatting finished; no visible text remains." : "Formatted output exceeds the local character count.");
      setPendingFocus("result");
    } catch {
      setResult(null);
      setError("");
      setFailure("The formatter is unavailable. Your source is still here; try again.");
      setStatus("Description formatting failed. Your source is still here; try again.");
      setPendingFocus("source");
    }
  }

  function reset() {
    setMode("plain-text");
    setSource("");
    setResult(null);
    setError("");
    setFailure("");
    setStatus("Source and formatted output cleared.");
    setPendingFocus("mode");
  }

  return (
    <section aria-label="KDP description formatter" className={styles.tool} data-tool-workbench>
      <form className={styles.form} onSubmit={submit} ref={formRef}>
        <UiChoiceGroup
          label="Input format"
          onChange={changeMode}
          options={[uiOption("plain-text", "Plain text"), uiOption("html-source", "HTML source")]}
          value={mode}
        />
        <p className={styles.notice}>Plain text treats angle brackets as text. HTML source treats them as tags and removes unsupported markup.</p>
        <UiTextArea
          description="Paste one description. It stays in this browser and is not sent to a formatting service."
          error={error}
          inputRef={sourceRef}
          label="Description source"
          onChange={updateSource}
          required
          rows={12}
          spellCheck
          value={source}
        />
        <UiActionRow>
          <UiButton type="submit" variant="primary">Format description</UiButton>
          <UiButton onPress={reset} type="button"><RotateCcw aria-hidden="true" size={17} /> Reset</UiButton>
        </UiActionRow>
        {status ? <UiStatus tone={failure || error ? "danger" : result?.status === "no-output" ? "warning" : "neutral"}>{status}</UiStatus> : null}
      </form>

      {failure ? <section aria-label="Formatter unavailable" className={styles.failure} role="alert"><p className={styles.resultLead}>{failure}</p><UiButton onPress={() => submit({ preventDefault() {} } as FormEvent<HTMLFormElement>)} type="button">Format description again</UiButton></section> : null}

      {result ? (
        <section aria-label="Formatted KDP description" className={styles.result}>
          <UiResultLead inputRef={resultRef}>{leadText(result)}</UiResultLead>
          {result.status === "formatted" ? (
            <>
              <UiCodeOutput
                actions={result.copyAllowed ? <UiCopyAction label="Copy formatted HTML" value={result.html} withManualFallback /> : undefined}
                code={result.html}
                label="Generated HTML"
              />
              <section className={pageStyles.resultGroup}>
                <h3>Local character counts</h3>
                <UiKeyValueList rows={[
                  { label: "Generated HTML", value: `${result.htmlCharacters} / 4,000 characters` },
                  { label: "Visible text", value: `${result.visibleTextCharacters} characters` },
                  { label: "Source overhead", value: `${result.sourceOverhead} characters` },
                ]} />
                {!result.copyAllowed ? <p className={pageStyles.limitNotice}>{result.overBy} over the local 4,000-character limit. Shorten the source, format again, and check KDP's current counter.</p> : null}
              </section>
              <section className={pageStyles.resultGroup}>
                <h3>What changed</h3>
                <ChangeList result={result} />
              </section>
              <section aria-label="Approximate KDP rendering" className={pageStyles.previewSection}>
                <div>
                  <h3>Approximate preview</h3>
                  <p className={styles.notice}>Inspect the saved description in KDP; its display can differ from this preview.</p>
                </div>
                <div className={styles.preview}>{renderPreview(result.tree)}</div>
              </section>
              <p className={styles.notice}>The local code-point count may differ from KDP's Unicode counting. Formatting does not check description policy or promise acceptance.</p>
            </>
          ) : (
            <section className={pageStyles.resultGroup}>
              <h3>What changed</h3>
              <ChangeList result={result} />
            </section>
          )}
        </section>
      ) : null}
    </section>
  );
}
