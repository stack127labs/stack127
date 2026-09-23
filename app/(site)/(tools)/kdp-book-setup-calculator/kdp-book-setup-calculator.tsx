"use client";

import { Ruler, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { UiButton, UiCheckbox, UiChoiceGroup, UiCopyAction, UiNumberField, UiSelect, uiOption } from "@/app/ui/controls";
import { UiActionRow, UiDataTable, UiKeyValueList, UiPrimaryResult, UiStatus } from "@/app/ui/display";
import {
  KDP_SETUP_VERSION,
  calculateKdpSetup,
  getKdpSetupDefaults,
  type KdpSetupInput,
  type KdpSetupResult,
} from "@/lib/kdp/setup.ts";
import {
  getKdpInteriorOptions,
  getKdpPaperOptions,
  getKdpTrimOptions,
  interiorLabel,
  paperLabel,
  type KdpBinding,
  type KdpInterior,
} from "@/lib/kdp/specs.ts";
import styles from "../../../ui/tools/kdp-tool.module.css";

const bindingOptions = [uiOption("paperback", "Paperback"), uiOption("hardcover", "Hardcover")];
const directionOptions = [uiOption("ltr", "Left to right"), uiOption("rtl", "Right to left")];
const unitOptions = [uiOption("in", "Inches"), uiOption("mm", "Millimeters")];

function errorFor(result: KdpSetupResult | null, field: string) {
  return result?.issues.find((issue) => issue.field === field && issue.severity === "error")?.message ?? null;
}

function inches(value: number) {
  return `${value.toFixed(4).replace(/0+$/, "").replace(/\.$/, "")} in`;
}

function millimeters(value: number) {
  return `${value.toFixed(2)} mm`;
}

function selectedDimension(dimension: NonNullable<KdpSetupResult["values"]>["cover"] | NonNullable<KdpSetupResult["values"]>["page"], unit: "in" | "mm") {
  return unit === "mm"
    ? `${millimeters(dimension.widthMillimeters)} × ${millimeters(dimension.heightMillimeters)}`
    : `${inches(dimension.widthInches)} × ${inches(dimension.heightInches)}`;
}

function pageSummary(result: NonNullable<KdpSetupResult["values"]>, issues: readonly { message: string }[]) {
  return [
    `${result.trimLabel} ${result.binding}`,
    `Entered pages: ${result.pageCount}`,
    `Effective pages: ${result.effectivePageCount}`,
    `Page file: ${inches(result.page.widthInches)} × ${inches(result.page.heightInches)}`,
    `Inside margin: ${inches(result.margins.insideInches)}`,
    `Spine: ${inches(result.spine.widthInches)}`,
    `Cover: ${inches(result.cover.widthInches)} × ${inches(result.cover.heightInches)}`,
    `Calculation version: ${KDP_SETUP_VERSION}`,
    "Checked: 2026-09-16",
    ...issues.map((issue) => `Possible issue: ${issue.message}`),
  ].join("\n");
}

export function KdpBookSetupCalculator() {
  const [input, setInput] = useState<KdpSetupInput>(getKdpSetupDefaults);
  const [result, setResult] = useState<KdpSetupResult | null>(null);
  const [status, setStatus] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const resultRef = useRef<HTMLOutputElement>(null);
  const pendingFocusRef = useRef<string | null>(null);
  const inputStateRef = useRef(input);
  const pageCountInputRef = useRef<HTMLInputElement>(null);
  const dpiInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const target = pendingFocusRef.current;
    if (!target) return;
    pendingFocusRef.current = null;
    const timer = window.setTimeout(() => {
      if (target === "result") resultRef.current?.focus();
      else formRef.current?.querySelector<HTMLElement>(`[data-focus-key="${target}"]`)?.focus();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [result, status]);

  function change(next: Partial<KdpSetupInput>) {
    const changed = Object.entries(next).some(([key, value]) => !Object.is(inputStateRef.current[key as keyof KdpSetupInput], value));
    inputStateRef.current = { ...inputStateRef.current, ...next };
    setInput(inputStateRef.current);
    if (changed) {
      setResult(null);
      setStatus("");
    }
  }

  function changeBinding(binding: KdpBinding) {
    const interiors = getKdpInteriorOptions(binding);
    const interior = interiors.includes(input.interior) ? input.interior : interiors[0];
    const papers = getKdpPaperOptions(binding, interior);
    change({ binding, interior, paper: papers[0], trimId: getKdpTrimOptions(binding).some((trim) => trim.id === input.trimId) ? input.trimId : getKdpTrimOptions(binding)[0].id });
  }

  function changeInterior(interior: KdpInterior) {
    change({ interior, paper: getKdpPaperOptions(input.binding, interior)[0] });
  }

  function calculate() {
    const parseNumberInput = (element: HTMLInputElement | null) => {
      const value = element?.value.trim().replaceAll(",", "") ?? "";
      return value ? Number(value) : Number.NaN;
    };
    const calculationInput = {
      ...inputStateRef.current,
      pageCount: parseNumberInput(pageCountInputRef.current),
      dpi: parseNumberInput(dpiInputRef.current),
    };
    inputStateRef.current = calculationInput;
    setInput(calculationInput);
    const next = calculateKdpSetup(calculationInput);
    pendingFocusRef.current = next.status === "valid"
      ? "result"
      : next.issues.find((issue) => issue.severity === "error")?.field ?? "pageCount";
    setResult(next);
    setStatus(next.status === "invalid" ? "Fix highlighted fields." : next.issues.length ? "Dimensions calculated; review possible issues." : "Setup calculated.");
  }

  function submit(event?: React.FormEvent) {
    event?.preventDefault();
    (document.activeElement as HTMLElement | null)?.blur();
    window.setTimeout(calculate, 0);
  }

  function reset() {
    const defaults = getKdpSetupDefaults();
    inputStateRef.current = defaults;
    setInput(defaults);
    setResult(null);
    setStatus("Setup reset.");
    requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('[data-focus-key="binding"]')?.focus());
  }

  const values = result?.values ?? null;
  const trims = getKdpTrimOptions(input.binding);
  const interiors = getKdpInteriorOptions(input.binding);
  const papers = getKdpPaperOptions(input.binding, input.interior);

  return (
    <section aria-label="Book setup inputs and results" className={styles.tool} data-tool-workbench>
      <form className={styles.form} noValidate onSubmit={submit} ref={formRef}>
        <div className={styles.grid}>
          <UiChoiceGroup dataFocusKey="binding" error={errorFor(result, "binding")} label="Binding" onChange={(value) => changeBinding(value as KdpBinding)} options={bindingOptions} value={input.binding} />
          <UiSelect dataFocusKey="trimId" error={errorFor(result, "trimId")} label="Trim size" onChange={(value) => change({ trimId: value })} options={trims.map((trim) => uiOption(trim.id, trim.label))} value={input.trimId} />
          <UiNumberField dataFocusKey="pageCount" error={errorFor(result, "pageCount")} inputRef={pageCountInputRef} label="Page count" min={1} onChange={(value) => change({ pageCount: value })} value={input.pageCount} />
          <UiSelect dataFocusKey="interior" error={errorFor(result, "interior")} label="Interior" onChange={(value) => changeInterior(value as KdpInterior)} options={interiors.map((interior) => uiOption(interior, interiorLabel(interior)))} value={input.interior} />
          <UiSelect dataFocusKey="paper" error={errorFor(result, "paper")} label="Paper" onChange={(value) => change({ paper: value as KdpSetupInput["paper"] })} options={papers.map((paper) => uiOption(paper, paperLabel(paper)))} value={input.paper} />
          <UiNumberField dataFocusKey="dpi" description="Pixel output only" error={errorFor(result, "dpi")} inputRef={dpiInputRef} label="DPI" max={600} min={72} onChange={(value) => change({ dpi: value })} value={input.dpi ?? 300} />
          <UiChoiceGroup dataFocusKey="direction" error={errorFor(result, "direction")} label="Reading direction" onChange={(value) => change({ direction: value as KdpSetupInput["direction"] })} options={directionOptions} value={input.direction} />
          <UiChoiceGroup dataFocusKey="units" error={errorFor(result, "units")} label="Display unit" onChange={(value) => change({ units: value as KdpSetupInput["units"] })} options={unitOptions} value={input.units} />
          <div className={styles.wide}>
            <UiCheckbox isSelected={input.bleed} onChange={(selected) => change({ bleed: selected })}>Interior has bleed</UiCheckbox>
          </div>
        </div>
        <UiActionRow>
          <div className={styles.actions}>
            <UiButton onPress={reset} type="button"><RotateCcw aria-hidden="true" size={17} /> Reset</UiButton>
            <UiButton
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  submit();
                }
              }}
              onPointerDown={(event) => {
                event.preventDefault();
                submit();
              }}
              type="button"
              variant="primary"
            ><Ruler aria-hidden="true" size={17} /> Calculate setup</UiButton>
          </div>
        </UiActionRow>
        {status ? <UiStatus tone={result?.status === "invalid" ? "danger" : result?.issues.length ? "warning" : "neutral"}>{status}</UiStatus> : null}
        {result?.status === "invalid" ? <ul className={styles.issueList}>{result.issues.map((issue) => <li data-severity={issue.severity} key={`${issue.code}-${issue.field}`}>{issue.message}</li>)}</ul> : null}
      </form>

      {values ? (
        <section aria-label="Book setup result" className={styles.result}>
          <UiPrimaryResult detail={values.cover.isEstimate ? "Estimate; confirm with KDP's cover calculator" : "Exact paperback cover dimensions"} inputRef={resultRef} label={values.cover.isEstimate ? "Estimated hardcover cover file" : "Paperback cover file"} value={selectedDimension(values.cover, values.units)} />
          <div className={styles.actions}>
            <UiCopyAction label="Copy setup receipt" successLabel="Setup copied" value={pageSummary(values, result?.issues ?? [])} withManualFallback />
          </div>
          <UiKeyValueList rows={[
            { label: "Interior page", value: selectedDimension(values.page, values.units) },
            { label: "Pages", value: `${values.pageCount} entered · ${values.effectivePageCount} effective` },
            { label: "Inside margin", value: inches(values.margins.insideInches) },
            { label: "Outside margin", value: inches(values.margins.outsideInches) },
            { label: "Top and bottom", value: inches(values.margins.topInches) },
            { label: "Spine", value: `${inches(values.spine.widthInches)} / ${millimeters(values.spine.widthMillimeters)}` },
            { label: "Page range", value: `${values.eligibility === "eligible" ? "Within" : "Outside"} ${values.pageLimit.min} to ${values.pageLimit.max}` },
          ]} />
          <figure aria-label="Cover width relationship" className={styles.diagram}>
            <div aria-label={values.segments.map((segment) => `${segment.label} ${inches(segment.widthInches)}`).join(", ")} className={styles.coverDiagram} style={{ gridTemplateColumns: values.segments.map((segment) => `${segment.widthInches}fr`).join(" ") } as CSSProperties}>
              {values.segments.map((segment, index) => <span data-spine={segment.label.toLowerCase().includes("spine") || undefined} key={`${segment.label}-${index}`}>{segment.label}</span>)}
            </div>
            <figcaption>{values.segments.map((segment) => `${segment.label} ${inches(segment.widthInches)}`).join(" · ")}</figcaption>
          </figure>
          <UiDataTable
            ariaLabel="Book setup dimensions"
            columns={[{ id: "part", label: "Part" }, { id: "inches", label: "Inches" }, { id: "millimeters", label: "Millimeters" }, { id: "pixels", label: `Pixels at ${values.dpi} DPI` }]}
            rows={[
              { id: "page", cells: { part: "Interior page", inches: `${inches(values.page.widthInches)} × ${inches(values.page.heightInches)}`, millimeters: `${millimeters(values.page.widthMillimeters)} × ${millimeters(values.page.heightMillimeters)}`, pixels: `${values.page.widthPixels} × ${values.page.heightPixels}` } },
              { id: "cover", cells: { part: "Full cover", inches: `${inches(values.cover.widthInches)} × ${inches(values.cover.heightInches)}`, millimeters: `${millimeters(values.cover.widthMillimeters)} × ${millimeters(values.cover.heightMillimeters)}`, pixels: `${values.cover.widthPixels} × ${values.cover.heightPixels}` } },
            ]}
          />
          {result?.issues.length ? <ul className={styles.issueList}>{result.issues.map((issue) => <li data-severity={issue.severity} key={`${issue.code}-${issue.field ?? "result"}`}>{issue.message}</li>)}</ul> : null}
        </section>
      ) : null}
    </section>
  );
}
