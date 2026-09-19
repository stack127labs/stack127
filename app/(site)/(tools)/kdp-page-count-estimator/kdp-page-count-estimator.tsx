"use client";

import { BookOpen, RotateCcw } from "lucide-react";
import { useRef, useState, type FormEvent } from "react";
import {
  ToolActionRow,
  ToolButton,
  ToolChoiceGroup,
  ToolDataTable,
  ToolDisclosure,
  ToolKeyValueList,
  ToolNumberField,
  ToolPrimaryResult,
  ToolSelect,
  ToolStatus,
  toolOption,
} from "@/app/tool-ui/tool-controls";
import { estimateKdpPageCount, formatKdpPageRange, getKdpPageCountDefaults, type KdpPageCountInput, type KdpPageCountResult } from "@/lib/kdp/page-count.ts";
import { getKdpTrimOptions } from "@/lib/kdp/specs.ts";
import styles from "../_components/kdp-tool.module.css";

const fontOptions = [toolOption("serif", "Serif"), toolOption("sans", "Sans"), toolOption("mono", "Monospaced")];
const trimOptions = getKdpTrimOptions("paperback").map((trim) => toolOption(trim.id, trim.label));

function errorFor(result: KdpPageCountResult | null, field: string) {
  return result?.issues.find((issue) => issue.field === field)?.message ?? null;
}

export function KdpPageCountEstimator() {
  const [input, setInput] = useState<KdpPageCountInput>(getKdpPageCountDefaults);
  const [result, setResult] = useState<KdpPageCountResult | null>(null);
  const [status, setStatus] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const resultRef = useRef<HTMLOutputElement>(null);

  function update(next: Partial<KdpPageCountInput>) {
    setInput((current) => ({ ...current, ...next }));
    setResult(null);
    setStatus("");
  }

  function submit(event?: FormEvent) {
    event?.preventDefault();
    const next = estimateKdpPageCount(input);
    setResult(next);
    setStatus(next.status === "valid" ? "Range estimated." : "Fix highlighted fields.");
    requestAnimationFrame(() => {
      if (next.status === "valid") resultRef.current?.focus();
      else formRef.current?.querySelector<HTMLElement>(`[data-focus-key="${next.issues.find((issue) => issue.severity === "error")?.field ?? "words"}"]`)?.focus();
    });
  }

  function reset() {
    setInput(getKdpPageCountDefaults());
    setResult(null);
    setStatus("Estimator reset.");
    requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('[data-focus-key="words"]')?.focus());
  }

  const values = result?.values ?? null;
  return (
    <section aria-label="Page count inputs and results" className={styles.tool} data-tool-workbench>
      <form className={styles.form} onSubmit={submit} ref={formRef}>
        <div className={styles.grid}>
          <ToolNumberField dataFocusKey="words" error={errorFor(result, "words")} label="Word count" min={0} onChange={(value) => update({ words: value })} value={input.words} />
          <ToolSelect dataFocusKey="trimId" error={errorFor(result, "trimId")} label="Trim size" onChange={(value) => update({ trimId: value })} options={trimOptions} value={input.trimId} />
          <ToolChoiceGroup dataFocusKey="font" error={errorFor(result, "font")} label="Font" onChange={(value) => update({ font: value as KdpPageCountInput["font"] })} options={fontOptions} value={input.font} />
          <ToolNumberField dataFocusKey="fontSize" error={errorFor(result, "fontSize")} label="Font size" max={24} min={8} onChange={(value) => update({ fontSize: value })} step={0.5} suffix="pt" value={input.fontSize} />
          <ToolNumberField dataFocusKey="lineSpacing" error={errorFor(result, "lineSpacing")} label="Line spacing" max={2.5} min={1} onChange={(value) => update({ lineSpacing: value })} step={0.05} value={input.lineSpacing} />
          <ToolNumberField dataFocusKey="insideMargin" error={errorFor(result, "insideMargin")} label="Inside margin" max={2} min={0.1} onChange={(value) => update({ insideMargin: value })} step={0.025} suffix="in" value={input.insideMargin} />
          <ToolNumberField dataFocusKey="outsideMargin" error={errorFor(result, "outsideMargin")} label="Outside margin" max={2} min={0.1} onChange={(value) => update({ outsideMargin: value })} step={0.025} suffix="in" value={input.outsideMargin} />
          <ToolNumberField dataFocusKey="topBottomMargin" error={errorFor(result, "topBottomMargin")} label="Top and bottom" max={2} min={0.1} onChange={(value) => update({ topBottomMargin: value })} step={0.025} suffix="in" value={input.topBottomMargin} />
          <ToolNumberField dataFocusKey="chapterCount" error={errorFor(result, "chapterCount")} label="Chapter starts" max={2000} min={0} onChange={(value) => update({ chapterCount: value })} value={input.chapterCount} />
          <ToolNumberField dataFocusKey="imagePages" error={errorFor(result, "imagePages")} label="Image pages" max={2000} min={0} onChange={(value) => update({ imagePages: value })} value={input.imagePages} />
          <ToolNumberField dataFocusKey="frontMatterPages" error={errorFor(result, "frontMatterPages")} label="Front matter" max={2000} min={0} onChange={(value) => update({ frontMatterPages: value })} value={input.frontMatterPages} />
          <ToolNumberField dataFocusKey="backMatterPages" error={errorFor(result, "backMatterPages")} label="Back matter" max={2000} min={0} onChange={(value) => update({ backMatterPages: value })} value={input.backMatterPages} />
        </div>
        <ToolActionRow>
          <div className={styles.actions}>
            <ToolButton onPress={reset} type="button"><RotateCcw aria-hidden="true" size={17} /> Reset</ToolButton>
            <ToolButton type="submit" variant="primary"><BookOpen aria-hidden="true" size={17} /> Estimate pages</ToolButton>
          </div>
        </ToolActionRow>
        {status ? <ToolStatus tone={result?.status === "invalid" ? "danger" : "neutral"}>{status}</ToolStatus> : null}
        {result?.status === "invalid" ? <ul className={styles.issueList}>{result.issues.map((issue) => <li key={issue.field}>{issue.message}</li>)}</ul> : null}
      </form>

      {values ? (
        <section aria-label="Page count result" className={styles.result}>
          <ToolPrimaryResult detail={`Range midpoint: ${values.rangeMidpoint} pages`} inputRef={resultRef} label="Estimated print pages" value={formatKdpPageRange(values.totalPages)} />
          <ToolKeyValueList rows={[
            { label: "Body text", value: formatKdpPageRange(values.textPages) },
            { label: "Added pages", value: values.addedPages.total },
            { label: "Trim size", value: values.trim.label },
            { label: "Raw total", value: formatKdpPageRange(values.rawPages) },
          ]} />
          <ToolDataTable
            ariaLabel="Page count additions"
            columns={[{ id: "part", label: "Part" }, { id: "pages", label: "Pages" }]}
            rows={[
              { id: "chapters", cells: { part: "Chapter starts", pages: values.addedPages.chapterStarts } },
              { id: "images", cells: { part: "Image pages", pages: values.addedPages.image } },
              { id: "front", cells: { part: "Front matter", pages: values.addedPages.frontMatter } },
              { id: "back", cells: { part: "Back matter", pages: values.addedPages.backMatter } },
            ]}
          />
          <h3 className={styles.sectionTitle}>Typography model</h3>
          <ToolKeyValueList rows={[
            { label: "Words per page", value: `${values.wordsPerPage.low} to ${values.wordsPerPage.high}` },
            { label: "Text block", value: `${values.textBlockInches.width} × ${values.textBlockInches.height} in` },
            { label: "Characters per line", value: values.capacity.charactersPerLine },
            { label: "Lines per page", value: values.capacity.linesPerPage },
            { label: "Font width factor", value: values.modelConstants.glyphWidthFactor },
          ]} />
          <h3 className={styles.sectionTitle}>KDP guidance</h3>
          {result?.issues.length ? <ul className={styles.issueList}>{result.issues.map((issue) => <li data-severity={issue.severity} key={issue.code}>{issue.message}</li>)}</ul> : null}
          {values.gutterBands.length ? <ToolDataTable
            ariaLabel="KDP inside margin bands"
            columns={[{ id: "pages", label: "Estimated pages" }, { id: "margin", label: "Minimum inside margin" }]}
            rows={values.gutterBands.map((band) => ({ id: `${band.minPages}-${band.maxPages}`, cells: { pages: `${band.minPages} to ${band.maxPages}`, margin: `${band.insideMarginInches} in` } }))}
          /> : null}
          <p className={styles.notice}>Final file rules apply. Even-page estimate.</p>
          <ToolDisclosure label="Calculation details">
            <p className={styles.notice}>{values.modelStatement}</p>
            <p className={styles.notice}>Model: 5 chars/word; 80%-120%; chapters.</p>
            <p className={styles.notice}>{values.calculationVersion} · {values.inputVersion} · KDP rules checked 2026-09-16.</p>
          </ToolDisclosure>
        </section>
      ) : null}
    </section>
  );
}
