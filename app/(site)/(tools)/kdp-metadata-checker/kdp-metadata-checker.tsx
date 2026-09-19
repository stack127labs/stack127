"use client";

import { RotateCcw, Tags } from "lucide-react";
import { createElement, Fragment, useRef, useState, type FormEvent, type ReactNode } from "react";
import {
  ToolActionRow,
  ToolButton,
  ToolCopyAction,
  ToolKeyValueList,
  ToolPrimaryResult,
  ToolStatus,
  ToolTextArea,
  ToolTextField,
} from "@/app/tool-ui/tool-controls";
import {
  checkKdpMetadata,
  tokenizeKdpDescription,
  type KdpDescriptionToken,
  type KdpMetadataInput,
  type KdpMetadataResult,
} from "@/lib/kdp/metadata.ts";
import styles from "../_components/kdp-tool.module.css";

type PreviewNode = { type: "tag"; name: string; children: Array<PreviewNode | string> } | { type: "root"; children: Array<PreviewNode | string> };

function blankInput(): KdpMetadataInput {
  return { title: "", subtitle: "", description: "", keywords: ["", "", "", "", "", "", ""] };
}

function errorFor(result: KdpMetadataResult | null, field: string) {
  return result?.findings.find((finding) => finding.field === field && finding.severity === "error")?.message ?? null;
}

function previewTree(tokens: KdpDescriptionToken[]): PreviewNode {
  const root: PreviewNode = { type: "root", children: [] };
  const stack: PreviewNode[] = [root];
  for (const token of tokens) {
    if (token.type === "text") {
      stack[stack.length - 1].children.push(token.value);
      continue;
    }
    if (token.closing) {
      const match = stack.map((node) => node.type === "tag" ? node.name : "root").lastIndexOf(token.name);
      if (match > 0) stack.splice(match);
      continue;
    }
    const node: PreviewNode = { type: "tag", name: token.name, children: [] };
    stack[stack.length - 1].children.push(node);
    if (!token.selfClosing) stack.push(node);
  }
  return root;
}

function renderPreviewNode(node: PreviewNode | string, key: string): ReactNode {
  if (typeof node === "string") return node;
  const children = node.children.map((child, index) => renderPreviewNode(child, `${key}-${index}`));
  if (node.type === "root") return <Fragment key={key}>{children}</Fragment>;
  const allowed: Record<string, string> = { p: "p", b: "strong", em: "em", i: "em", u: "u", h4: "h4", h5: "h5", h6: "h6", ol: "ol", ul: "ul", li: "li" };
  if (node.name === "br") return <br key={key} />;
  const element = allowed[node.name];
  return element ? createElement(element, { key }, children) : <Fragment key={key}>{children}</Fragment>;
}

function previewDescription(value: string) {
  return renderPreviewNode(previewTree(tokenizeKdpDescription(value)), "preview");
}

export function KdpMetadataChecker() {
  const [input, setInput] = useState<KdpMetadataInput>(blankInput);
  const [snapshot, setSnapshot] = useState<KdpMetadataInput | null>(null);
  const [result, setResult] = useState<KdpMetadataResult | null>(null);
  const [stale, setStale] = useState(false);
  const [status, setStatus] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const resultRef = useRef<HTMLOutputElement>(null);

  function update(next: Partial<KdpMetadataInput>) {
    setInput((current) => ({ ...current, ...next }));
    if (result) {
      setStale(true);
      setStatus("Results are out of date. Check again.");
    }
  }

  function updateKeyword(index: number, value: string) {
    const keywords = [...input.keywords];
    keywords[index] = value;
    update({ keywords });
  }

  function submit(event?: FormEvent) {
    event?.preventDefault();
    const next = checkKdpMetadata(input);
    setResult(next);
    setSnapshot({ ...input, keywords: [...input.keywords] });
    setStale(false);
    const hasErrors = next.findings.some((finding) => finding.severity === "error");
    setStatus(next.findings.length === 0 ? "Metadata checked." : hasErrors ? "Possible issues found." : "Review prompts found.");
    requestAnimationFrame(() => {
      if (next.status === "input-error") formRef.current?.querySelector<HTMLElement>('[data-focus-key="keyword-1"]')?.focus();
      else resultRef.current?.focus();
    });
  }

  function reset() {
    setInput(blankInput());
    setSnapshot(null);
    setResult(null);
    setStale(false);
    setStatus("Checker reset.");
    requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('[data-focus-key="title"]')?.focus());
  }

  return (
    <section aria-label="Metadata inputs and results" className={styles.tool} data-tool-workbench>
      <form className={styles.form} onSubmit={submit} ref={formRef}>
        <div className={styles.grid}>
          <ToolTextField autoCapitalize="sentences" dataFocusKey="title" error={errorFor(result, "title")} label="Title" onChange={(value) => update({ title: value })} required value={input.title} />
          <ToolTextField autoCapitalize="sentences" dataFocusKey="subtitle" error={errorFor(result, "subtitle")} label="Subtitle" onChange={(value) => update({ subtitle: value })} value={input.subtitle} />
          <ToolTextArea autoCapitalize="sentences" className={styles.wide} error={errorFor(result, "description")} label="Description" onChange={(value) => update({ description: value })} required rows={9} value={input.description} />
          <div className={styles.wide}>
            <div className={styles.grid}>
              {input.keywords.map((keyword, index) => (
                <ToolTextField autoCapitalize="none" dataFocusKey={`keyword-${index + 1}`} error={errorFor(result, `keyword-${index + 1}`)} key={`keyword-${index + 1}`} label={`Keyword ${index + 1}`} onChange={(value) => updateKeyword(index, value)} value={keyword} />
              ))}
            </div>
          </div>
        </div>
        <ToolActionRow>
          <div className={styles.actions}>
            <ToolButton onPress={reset} type="button"><RotateCcw aria-hidden="true" size={17} /> Reset</ToolButton>
            <ToolButton type="submit" variant="primary"><Tags aria-hidden="true" size={17} /> Check metadata</ToolButton>
          </div>
        </ToolActionRow>
        {status ? <ToolStatus tone={stale || result?.findings.length ? "warning" : "neutral"}>{status}</ToolStatus> : null}
      </form>

      {result?.values && snapshot ? (
        <section aria-label="Metadata result" className={styles.result} data-stale={stale || undefined}>
          <ToolPrimaryResult detail={stale ? "Last checked snapshot. Check again." : "Local documented checks and review prompts"} inputRef={resultRef} label="Metadata check" tone={result.findings.length ? "warning" : "success"} value={result.findings.length === 0 ? "No possible issues" : `${result.findings.length} possible issue${result.findings.length === 1 ? "" : "s"}`} />
          <div className={styles.actions}>
            <ToolCopyAction label="Copy description source" successLabel="Description source copied" value={snapshot.description} withManualFallback />
          </div>
          <ToolKeyValueList rows={[
            { label: "Description characters", value: `${result.values.descriptionCharacters} / 4000` },
            { label: "Title and subtitle", value: `${result.values.titleWithSubtitleCharacters} / 200` },
            { label: "Keywords", value: `${result.values.keywordCount} of 7` },
            { label: "Supported tags", value: result.values.supportedTagCount },
            { label: "Visible description", value: result.values.descriptionVisibleCharacters },
            { label: "Processing", value: "Browser local" },
          ]} />
          {result.findings.length ? <ul className={styles.issueList}>{result.findings.map((finding, index) => <li data-severity={finding.severity} key={`${finding.code}-${finding.field}-${index}`}>{`${finding.severity === "error" ? "Documented check" : "Review prompt"} · ${finding.field}: ${finding.message}`}</li>)}</ul> : null}
          <div>
            <h3 className={styles.sectionTitle}>Description preview</h3>
            <div className={styles.preview}>{result.values.descriptionCharacters ? previewDescription(snapshot.description) : <span className={styles.notice}>No description yet.</span>}</div>
          </div>
        </section>
      ) : null}
    </section>
  );
}
