"use client";

import { CircleDollarSign, RotateCcw } from "lucide-react";
import { useRef, useState, type FormEvent } from "react";
import { UiButton, UiChoiceGroup, UiCopyAction, UiDisclosure, UiNumberField, UiSelect, UiTextField, uiOption } from "@/app/ui/controls";
import { UiActionRow, UiDataTable, UiKeyValueList, UiPrimaryResult, UiStatus } from "@/app/ui/display";
import { calculateKdpRoyalty, formatKdpMoney, formatKdpPercent, parseKdpRoyaltyMoney, type KdpRoyaltyFormat, type KdpRoyaltyInput, type KdpRoyaltyResult } from "@/lib/kdp/royalty.ts";
import { getKdpInteriorOptions, getKdpPaperOptions, getKdpTrimOptions, interiorLabel, paperLabel, type KdpBinding, type KdpInterior } from "@/lib/kdp/specs.ts";
import styles from "../../../ui/tools/kdp-tool.module.css";

const formatOptions = [uiOption("paperback", "Paperback"), uiOption("hardcover", "Hardcover"), uiOption("ebook", "Kindle ebook")];
const ebookRateOptions = [uiOption("70", "70%"), uiOption("35", "35%")];
const distributionNote = "Expanded Distribution excluded";

function defaultInput(): KdpRoyaltyInput {
  return { format: "paperback", trimId: "6x9", pageCount: 300, interior: "black-white", paper: "white", listPrice: 9.99, ebookFileSizeMB: 5, ebookRoyaltyOption: 70 };
}

function errorFor(result: KdpRoyaltyResult | null, field: string) {
  return result?.issues.find((issue) => issue.field === field && issue.severity === "error")?.message ?? null;
}

function summary(values: NonNullable<KdpRoyaltyResult["values"]>) {
  return [
    `Format: ${values.format}`,
    `List price: ${formatKdpMoney(values.listPriceCents)}`,
    `Royalty: ${formatKdpMoney(values.royaltyCents)}`,
    `Rate: ${values.effectiveRoyaltyRate}%`,
    values.effectivePageCount === null ? "" : `Effective pages: ${values.effectivePageCount}`,
    values.printingCostCents === null ? `Delivery: ${formatKdpMoney(values.deliveryCostCents ?? 0)}` : `Printing: ${formatKdpMoney(values.printingCostCents)}`,
  ].join("\n");
}

export function KdpRoyaltyCalculator() {
  const [input, setInput] = useState<KdpRoyaltyInput>(defaultInput);
  const [listPriceText, setListPriceText] = useState("9.99");
  const [monthlyTargetText, setMonthlyTargetText] = useState("");
  const [result, setResult] = useState<KdpRoyaltyResult | null>(null);
  const [status, setStatus] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const resultRef = useRef<HTMLOutputElement>(null);

  function update(next: Partial<KdpRoyaltyInput>) {
    setInput((current) => ({ ...current, ...next }));
    setResult(null);
    setStatus("");
  }

  function changeFormat(format: KdpRoyaltyFormat) {
    if (format === "ebook") {
      update({ format, ebookFileSizeMB: input.ebookFileSizeMB ?? 5, ebookRoyaltyOption: input.ebookRoyaltyOption ?? 70 });
      return;
    }
    const binding = format as KdpBinding;
    const trimOptions = getKdpTrimOptions(binding);
    const trimId = trimOptions.some((trim) => trim.id === input.trimId) ? input.trimId : trimOptions[0].id;
    const interiors = getKdpInteriorOptions(binding);
    const interior = interiors.includes(input.interior as KdpInterior) ? input.interior : interiors[0];
    const papers = getKdpPaperOptions(binding, interior as KdpInterior);
    update({ format, trimId, interior, paper: papers[0] });
  }

  function changeInterior(interior: KdpInterior) {
    update({ interior, paper: getKdpPaperOptions(input.format as KdpBinding, interior)[0] });
  }

  function submit(event?: FormEvent) {
    event?.preventDefault();
    const listPrice = parseKdpRoyaltyMoney(listPriceText);
    const monthlyTarget = monthlyTargetText.trim() === "" ? undefined : parseKdpRoyaltyMoney(monthlyTargetText);
    const next = calculateKdpRoyalty({ ...input, listPrice, monthlyTarget });
    setResult(next);
    setStatus(next.status === "invalid" ? "Fix highlighted fields." : next.issues.length ? "Royalty calculated; review possible issues." : "Royalty calculated.");
    requestAnimationFrame(() => {
      if (next.status === "valid") resultRef.current?.focus();
      else formRef.current?.querySelector<HTMLElement>(`[data-focus-key="${next.issues.find((issue) => issue.severity === "error")?.field ?? "listPrice"}"]`)?.focus();
    });
  }

  function reset() {
    setInput(defaultInput());
    setListPriceText("9.99");
    setMonthlyTargetText("");
    setResult(null);
    setStatus("Calculator reset.");
    requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('[data-focus-key="format"]')?.focus());
  }

  const isEbook = input.format === "ebook";
  const binding = isEbook ? "paperback" : input.format as KdpBinding;
  const trimOptions = getKdpTrimOptions(binding);
  const interiorOptions = getKdpInteriorOptions(binding);
  const paperOptions = getKdpPaperOptions(binding, input.interior as KdpInterior);
  const values = result?.values ?? null;

  return (
    <section aria-label="Royalty inputs and results" className={styles.tool} data-tool-workbench>
      <form className={styles.form} onSubmit={submit} ref={formRef}>
        <div className={styles.grid}>
          <UiChoiceGroup dataFocusKey="format" label="Format" onChange={(value) => changeFormat(value as KdpRoyaltyFormat)} options={formatOptions} value={input.format} />
          <UiTextField dataFocusKey="listPrice" error={errorFor(result, "listPrice")} inputMode="decimal" label="List price (USD)" onChange={(value) => { setListPriceText(value); setResult(null); setStatus(""); }} value={listPriceText} />
          {!isEbook ? <>
            <UiSelect dataFocusKey="trimId" error={errorFor(result, "trimId")} label="Trim size" onChange={(value) => update({ trimId: value })} options={trimOptions.map((trim) => uiOption(trim.id, trim.label))} value={input.trimId} />
            <UiNumberField dataFocusKey="pageCount" error={errorFor(result, "pageCount")} label="Page count" min={1} onChange={(value) => update({ pageCount: value })} value={input.pageCount} />
            <UiSelect dataFocusKey="interior" error={errorFor(result, "interior")} label="Interior" onChange={(value) => changeInterior(value as KdpInterior)} options={interiorOptions.map((interior) => uiOption(interior, interiorLabel(interior)))} value={input.interior} />
            <UiSelect dataFocusKey="paper" error={errorFor(result, "paper")} label="Paper" onChange={(value) => update({ paper: value as KdpRoyaltyInput["paper"] })} options={paperOptions.map((paper) => uiOption(paper, paperLabel(paper)))} value={input.paper} />
          </> : <>
            <UiNumberField dataFocusKey="ebookFileSizeMB" error={errorFor(result, "ebookFileSizeMB")} label="Ebook file size" min={0.01} onChange={(value) => update({ ebookFileSizeMB: value })} step={0.01} suffix="MB" value={input.ebookFileSizeMB ?? 5} />
            <UiChoiceGroup dataFocusKey="ebookRoyaltyOption" error={errorFor(result, "ebookRoyaltyOption")} label="Royalty option" onChange={(value) => update({ ebookRoyaltyOption: Number(value) as 35 | 70 })} options={ebookRateOptions} value={String(input.ebookRoyaltyOption ?? 70)} />
          </>}
          <UiTextField dataFocusKey="monthlyTarget" description="Optional target in USD" error={errorFor(result, "monthlyTarget")} inputMode="decimal" label="Monthly income target" onChange={(value) => { setMonthlyTargetText(value); setResult(null); setStatus(""); }} value={monthlyTargetText} />
        </div>
        <UiActionRow>
          <div className={styles.actions}>
            <UiButton onPress={reset} type="button"><RotateCcw aria-hidden="true" size={17} /> Reset</UiButton>
            <UiButton type="submit" variant="primary"><CircleDollarSign aria-hidden="true" size={17} /> Calculate royalty</UiButton>
          </div>
        </UiActionRow>
        {status ? <UiStatus tone={result?.status === "invalid" ? "danger" : result?.issues.length ? "warning" : "neutral"}>{status}</UiStatus> : null}
        {result?.status === "invalid" ? <ul className={styles.issueList}>{result.issues.map((issue) => <li data-severity={issue.severity} key={`${issue.code}-${issue.field}`}>{issue.message}</li>)}</ul> : null}
      </form>

      {values ? (
        <section aria-label="Royalty result" className={styles.result}>
          <UiPrimaryResult detail={`${values.effectiveRoyaltyRate}% rate after print or delivery cost`} inputRef={resultRef} label="Royalty per sale" tone={values.royaltyCents > 0 ? "success" : "warning"} value={formatKdpMoney(values.royaltyCents)} />
          <div className={styles.actions}><UiCopyAction label="Copy royalty" successLabel="Royalty copied" value={summary(values)} withManualFallback /></div>
          <UiKeyValueList rows={[
            { label: "Minimum list price", value: formatKdpMoney(values.minimumListPriceCents) },
            ...(values.effectivePageCount === null ? [] : [{ label: "Effective pages", value: values.effectivePageCount }]),
            { label: "Printing cost", value: values.printingCostCents === null ? "Not used" : formatKdpMoney(values.printingCostCents) },
            ...(values.fixedCostCents === null ? [] : [{ label: "Fixed cost", value: formatKdpMoney(values.fixedCostCents) }, { label: "Page cost", value: formatKdpMoney(values.pageCostCents ?? 0) }]),
            { label: "Delivery cost", value: values.deliveryCostCents === null ? "Not used" : formatKdpMoney(values.deliveryCostCents) },
            { label: "Royalty margin", value: formatKdpPercent(values.royaltyMarginBasisPoints) },
            { label: "Break-even ad spend", value: formatKdpMoney(values.breakEvenAdSpendCents) },
            ...(values.breakEvenAcosBasisPoints === null ? [] : [{ label: "Break-even ACoS", value: formatKdpPercent(values.breakEvenAcosBasisPoints) }]),
            ...(values.monthlyTargetStatus === "omitted" ? [] : [{ label: `${formatKdpMoney(values.monthlyTargetCents ?? 0)} monthly target`, value: values.monthlyTargetStatus === "unavailable" ? "Unknown — no positive royalty" : values.copiesForMonthlyTarget ?? 0 }]),
          ]} />
          {result?.issues.length ? <ul className={styles.issueList}>{result.issues.map((issue) => <li data-severity={issue.severity} key={`${issue.code}-${issue.field ?? "result"}`}>{issue.message}</li>)}</ul> : null}
          <UiDataTable
            ariaLabel="Price comparison"
            columns={[{ id: "price", label: "List price" }, { id: "rate", label: "Rate" }, { id: "cost", label: "KDP cost" }, { id: "royalty", label: "Royalty" }, { id: "margin", label: "Margin" }]}
            rows={values.pricePoints.map((point) => ({ id: String(point.listPriceCents), cells: { price: formatKdpMoney(point.listPriceCents), rate: `${point.royaltyRate}%`, cost: point.deductionCents ? formatKdpMoney(point.deductionCents) : "—", royalty: formatKdpMoney(point.royaltyCents), margin: formatKdpPercent(point.marginBasisPoints) } }))}
          />
          <UiDisclosure label="Calculation details">
            <p className={styles.notice}>US Amazon.com · Standard distribution · USD.</p>
            <p className={styles.notice}>{distributionNote}</p>
            <p className={styles.notice}>Rules checked 2026-09-16. Sources: {values.sources.map((source, index) => <span key={source}>{index ? "; " : ""}<a href={source} rel="noreferrer">KDP help</a></span>)}.</p>
          </UiDisclosure>
        </section>
      ) : null}
    </section>
  );
}
