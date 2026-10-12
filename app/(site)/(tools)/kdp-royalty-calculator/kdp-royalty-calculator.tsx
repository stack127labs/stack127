"use client";

import { RotateCcw } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent, type ReactNode, type RefObject } from "react";
import type { UiChartSpec } from "@/app/ui/charts/chart-option";
import { UiLiveChart } from "@/app/ui/charts/chart-client";
import {
  UiButton,
  UiChoiceGroup,
  UiCopyAction,
  UiDisclosure,
  UiSelect,
  UiShareAction,
  UiTextField,
  uiOption,
  uiSetSummary,
  type UiShareParams,
} from "@/app/ui/controls";
import {
  UiActionRow,
  UiAllocationBar,
  UiMetricGroup,
  UiPrimaryResult,
  UiStatus,
  UiStatusWord,
  type UiAllocationSegment,
  type UiMetric,
} from "@/app/ui/display";
import { ToolFieldRow, ToolResult, ToolWorkbench } from "@/app/ui/tools/tool-workbench";
import {
  calculateKdpRoyaltyEstimate,
  type KdpRoyaltyCalculatorField,
  type KdpRoyaltyCalculatorInput,
  type KdpRoyaltyCalculatorValues,
} from "@/lib/kdp/royalty-calculator.ts";
import {
  findKdpTrim,
  getKdpInteriorOptions,
  getKdpPaperOptions,
  getKdpTrimOptions,
  interiorLabel,
  paperLabel,
  type KdpBinding,
  type KdpInterior,
  type KdpPaper,
} from "@/lib/kdp/specs.ts";
import styles from "./kdp-royalty-calculator.module.css";

type Input = KdpRoyaltyCalculatorInput;
type Values = KdpRoyaltyCalculatorValues;
type Errors = Partial<Record<KdpRoyaltyCalculatorField, string>>;
type Format = Values["format"];
type Shown = { input: Input; values: Values };

const EXAMPLE: Input = {
  format: "paperback",
  listPriceText: "12.99",
  pageCountText: "200",
  interior: "black-white",
  trimId: "",
  paper: "",
  channel: "",
  fileSizeText: "",
  plan: "",
  monthlyGoalText: "",
};

const formatOptions = [uiOption("paperback", "Paperback"), uiOption("hardcover", "Hardcover"), uiOption("ebook", "Kindle eBook")];
const channelOptions = [uiOption("amazon", "Amazon.com"), uiOption("expanded", "Expanded Distribution")];
const planOptions = [uiOption("70", "70%"), uiOption("35", "35%")];
const advancedFields = new Set<KdpRoyaltyCalculatorField>(["trimId", "paper", "channel", "fileSize", "plan", "monthlyGoal"]);
const focusOrder: KdpRoyaltyCalculatorField[] = ["format", "listPrice", "interior", "pageCount", "trimId", "paper", "channel", "fileSize", "plan", "monthlyGoal"];
const seriesLabels = { amazon: "Amazon.com", expanded: "Expanded Distribution", plan70: "70% plan", plan35: "35% plan" } as const;

/* ---------------- formatting ---------------- */

const usd = new Intl.NumberFormat("en-US", { currency: "USD", style: "currency" });
const whole = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

function money(cents: number) {
  return usd.format(cents / 100);
}

/** A goal like $1,000 reads without cents unless it has some. */
function goalMoney(cents: number) {
  return cents % 100 === 0 ? `$${whole.format(cents / 100)}` : money(cents);
}

function percent(basisPoints: number) {
  return `${(basisPoints / 100).toFixed(1).replace(/\.0$/, "")}%`;
}

function megabytes(size: number) {
  return `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(size)} MB`;
}

function formatWord(format: Format) {
  return format === "ebook" ? "Kindle eBook" : format;
}

/* ---------------- inputs ---------------- */

function isFormat(value: string): value is Format {
  return value === "paperback" || value === "hardcover" || value === "ebook";
}

/** Keeps print choices valid for a binding: a trim, interior, or paper it doesn't offer falls back to the default. */
function fitPrintChoices(input: Input, binding: KdpBinding): Input {
  const trimId = getKdpTrimOptions(binding).some((trim) => trim.id === input.trimId) ? input.trimId : "";
  const interior = getKdpInteriorOptions(binding).includes(input.interior as KdpInterior) ? input.interior : "black-white";
  const paper = getKdpPaperOptions(binding, interior as KdpInterior).includes(input.paper as KdpPaper) ? input.paper : "";
  return { ...input, trimId, interior, paper };
}

/** A shared link's values. Unknown choices fall back to their defaults; typed values stay as written, so errors show. */
/** The parameters a shared link carries. Anything else in the address, such as tracking tags, is ignored. */
const shareParamNames = ["format", "price", "pages", "interior", "trim", "paper", "channel", "size", "plan", "goal"] as const;

export function isSharedLink(get: (name: string) => string): boolean {
  return shareParamNames.some((name) => get(name) !== "");
}

export function inputFromQuery(get: (name: string) => string): Input {
  const format = isFormat(get("format")) ? get("format") : "paperback";
  const input: Input = {
    format,
    listPriceText: get("price"),
    pageCountText: get("pages"),
    interior: get("interior") || "black-white",
    trimId: get("trim"),
    paper: get("paper"),
    channel: get("channel") === "expanded" ? "expanded" : "",
    fileSizeText: get("size"),
    plan: get("plan") === "35" ? "35" : "",
    monthlyGoalText: get("goal"),
  };
  return format === "ebook" ? input : fitPrintChoices(input, format as KdpBinding);
}

function shareParams(input: Input): UiShareParams {
  const print = input.format !== "ebook";
  const params: Record<(typeof shareParamNames)[number], string | null> = {
    format: input.format,
    price: input.listPriceText.trim(),
    pages: print ? input.pageCountText.trim() : null,
    interior: print ? input.interior : null,
    trim: print ? input.trimId : null,
    paper: print ? input.paper : null,
    channel: input.format === "paperback" ? input.channel : null,
    size: print ? null : input.fileSizeText.trim(),
    plan: print ? null : input.plan,
    goal: input.monthlyGoalText.trim(),
  };
  return params;
}

function advancedCount(input: Input) {
  const print = input.format !== "ebook";
  return [
    print && input.trimId !== "" && input.trimId !== "6x9",
    print && input.paper !== "" && input.paper !== "white",
    input.format === "paperback" && input.channel === "expanded",
    !print && input.fileSizeText.trim() !== "",
    !print && input.plan === "35",
    input.monthlyGoalText.trim() !== "",
  ].filter(Boolean).length;
}

function advancedLabel(format: string) {
  if (format === "ebook") return "File size, plan, and goal";
  if (format === "hardcover") return "Trim, paper, and goal";
  return "Trim, paper, channel, and goal";
}

/* ---------------- the tool ---------------- */

export function KdpRoyaltyCalculator({ initialInput }: { initialInput?: Input }) {
  const shared = initialInput !== undefined;
  const [first] = useState(() => {
    const example = calculateKdpRoyaltyEstimate(EXAMPLE);
    if (example.status !== "calculated") throw new Error("The KDP royalty example must calculate.");
    const exampleShown: Shown = { input: EXAMPLE, values: example.values };
    if (!initialInput) return { input: EXAMPLE, shown: exampleShown, errors: {} as Errors, stale: false };
    const result = calculateKdpRoyaltyEstimate(initialInput);
    return result.status === "calculated"
      ? { input: initialInput, shown: { input: initialInput, values: result.values }, errors: result.fieldErrors as Errors, stale: false }
      : { input: initialInput, shown: exampleShown, errors: result.fieldErrors, stale: true };
  });
  const [input, setInput] = useState<Input>(first.input);
  const [shown, setShown] = useState<Shown>(first.shown);
  const [errors, setErrors] = useState<Errors>(first.errors);
  const [isExample, setIsExample] = useState(!shared || first.stale);
  const [isStale, setIsStale] = useState(first.stale);
  const [advancedOpen, setAdvancedOpen] = useState(Object.keys(first.errors).some((key) => advancedFields.has(key as KdpRoyaltyCalculatorField)));
  const [focusTarget, setFocusTarget] = useState<string | null>(shared ? firstError(first.errors) : null);
  const formRef = useRef<HTMLFormElement>(null);
  const answerRef = useRef<HTMLOutputElement>(null);

  // Focus waits for a render, so a field inside Advanced exists before it gets focus.
  useEffect(() => {
    if (!focusTarget) return;
    if (focusTarget === "answer") answerRef.current?.focus();
    else formRef.current?.querySelector<HTMLElement>(`[data-focus-key="${focusTarget}"]`)?.focus();
    setFocusTarget(null);
  }, [focusTarget]);

  function edit(next: Input, fields: KdpRoyaltyCalculatorField[]) {
    setInput(next);
    setIsStale(true);
    if (fields.some((field) => field in errors)) {
      setErrors((current) => {
        const rest = { ...current };
        for (const field of fields) delete rest[field];
        return rest;
      });
    }
  }

  function changeFormat(value: string) {
    if (!isFormat(value)) return;
    const next = { ...input, format: value };
    edit(value === "ebook" ? next : fitPrintChoices(next, value), ["format", "trimId", "interior", "paper", "pageCount", "channel", "fileSize", "plan"]);
  }

  function changeInterior(value: string) {
    edit(fitPrintChoices({ ...input, interior: value }, input.format as KdpBinding), ["interior", "paper", "pageCount"]);
  }

  function submit(event?: FormEvent) {
    event?.preventDefault();
    const result = calculateKdpRoyaltyEstimate(input);
    const nextErrors: Errors = result.fieldErrors;
    setErrors(nextErrors);
    if (result.status === "calculated") {
      setShown({ input, values: result.values });
      setIsExample(false);
      setIsStale(false);
    }
    const target = firstError(nextErrors);
    if (target && advancedFields.has(target)) setAdvancedOpen(true);
    setFocusTarget(target ?? "answer");
  }

  function reset() {
    const example = calculateKdpRoyaltyEstimate(EXAMPLE);
    setInput(EXAMPLE);
    if (example.status === "calculated") setShown({ input: EXAMPLE, values: example.values });
    setErrors({});
    setIsExample(true);
    setIsStale(false);
    setAdvancedOpen(false);
  }

  const format: Format = isFormat(input.format) ? input.format : "paperback";
  const print = format !== "ebook";
  const binding = (print ? format : "paperback") as KdpBinding;
  const interiors = getKdpInteriorOptions(binding);
  const papers = getKdpPaperOptions(binding, (interiors.includes(input.interior as KdpInterior) ? input.interior : "black-white") as KdpInterior);
  const trimOptions = getKdpTrimOptions(binding).map((trim) => uiOption(trim.id, trim.label));

  const goalField = (
    <UiTextField
      dataFocusKey="monthlyGoal"
      error={errors.monthlyGoal}
      hint="Shows how many copies a month earn this much."
      inputMode="decimal"
      label="Monthly royalty goal"
      onChange={(value) => edit({ ...input, monthlyGoalText: value }, ["monthlyGoal"])}
      suffix="USD"
      value={input.monthlyGoalText}
    />
  );

  return (
    <ToolWorkbench label="KDP royalty calculator">
      <form className={styles.form} noValidate onSubmit={submit} ref={formRef}>
        <ToolFieldRow className={styles.basicRow}>
          <UiChoiceGroup
            dataFocusKey="format"
            error={errors.format}
            label="Format"
            required
            onChange={changeFormat}
            options={formatOptions}
            value={format}
          />
          <UiTextField
            dataFocusKey="listPrice"
            error={errors.listPrice}
            hint="The price readers pay on Amazon.com, before any sale."
            inputMode="decimal"
            label="List price"
            required
            onChange={(value) => edit({ ...input, listPriceText: value }, ["listPrice"])}
            suffix="USD"
            value={input.listPriceText}
          />
        </ToolFieldRow>
        {print ? (
          <ToolFieldRow className={styles.basicRow}>
            <UiChoiceGroup
              dataFocusKey="interior"
              error={errors.interior}
              hint="Premium color prints richer images than standard color, and costs more."
              label="Interior"
              required
              onChange={changeInterior}
              options={interiors.map((interior) => uiOption(interior, interiorLabel(interior)))}
              value={input.interior}
            />
            <UiTextField
              dataFocusKey="pageCount"
              error={errors.pageCount}
              hint="Every page in your interior file, including blank pages."
              inputMode="numeric"
              label="Page count"
              required
              onChange={(value) => edit({ ...input, pageCountText: value }, ["pageCount"])}
              suffix="pages"
              value={input.pageCountText}
            />
          </ToolFieldRow>
        ) : null}

        <UiDisclosure
          isExpanded={advancedOpen}
          label={advancedLabel(format)}
          onExpandedChange={setAdvancedOpen}
          summary={uiSetSummary(advancedCount(input))}
        >
          <div className={styles.advanced}>
            {print ? (
              <>
                <ToolFieldRow className={styles.pairRow}>
                  <UiSelect
                    dataFocusKey="trimId"
                    error={errors.trimId}
                    hint="Trims over 6.12 in wide or 9 in tall cost more per page."
                    label="Trim size"
                    onChange={(value) => edit({ ...input, trimId: value }, ["trimId", "pageCount"])}
                    options={trimOptions}
                    value={input.trimId || "6x9"}
                  />
                  {papers.length > 1 ? (
                    <UiChoiceGroup
                      dataFocusKey="paper"
                      error={errors.paper}
                      hint={papers.includes("groundwood") ? "Cream allows fewer pages, and groundwood is thinner and cheaper." : "Cream allows fewer pages than white."}
                      label="Paper"
                      onChange={(value) => edit({ ...input, paper: value }, ["paper", "pageCount"])}
                      options={papers.map((paper) => uiOption(paper, paperLabel(paper)))}
                      value={input.paper || "white"}
                    />
                  ) : null}
                </ToolFieldRow>
                <ToolFieldRow className={styles.pairRow}>
                  {format === "paperback" ? (
                    <UiChoiceGroup
                      dataFocusKey="channel"
                      error={errors.channel}
                      hint="Expanded Distribution sells to bookstores and libraries, and pays 40% minus printing."
                      label="Sales channel"
                      onChange={(value) => edit({ ...input, channel: value === "expanded" ? "expanded" : "" }, ["channel"])}
                      options={channelOptions}
                      value={input.channel || "amazon"}
                    />
                  ) : null}
                  {goalField}
                </ToolFieldRow>
              </>
            ) : (
              <ToolFieldRow>
                <UiTextField
                  dataFocusKey="fileSize"
                  error={errors.fileSize}
                  hint="Empty uses 2 MB until KDP shows your converted size."
                  inputMode="decimal"
                  label="Converted file size"
                  onChange={(value) => edit({ ...input, fileSizeText: value }, ["fileSize"])}
                  placeholder="2"
                  suffix="MB"
                  value={input.fileSizeText}
                />
                <UiChoiceGroup
                  dataFocusKey="plan"
                  error={errors.plan}
                  hint="KDP pays 70% only on prices from $2.99 to $12.99."
                  label="Royalty plan"
                  onChange={(value) => edit({ ...input, plan: value === "35" ? "35" : "" }, ["plan"])}
                  options={planOptions}
                  value={input.plan || "70"}
                />
                {goalField}
              </ToolFieldRow>
            )}
          </div>
        </UiDisclosure>

        <UiActionRow>
          {isStale ? <UiStatus>Inputs changed</UiStatus> : null}
          <UiButton type="submit" variant="primary">Calculate royalty</UiButton>
          <UiButton onPress={reset} type="button" variant="secondary">
            <RotateCcw aria-hidden="true" size={17} />
            Reset
          </UiButton>
        </UiActionRow>
      </form>

      <ToolResult label="Royalty result" stale={isStale}>
        <ResultView answerRef={answerRef} isExample={isExample} shown={shown} />
      </ToolResult>
    </ToolWorkbench>
  );
}

function firstError(errors: Errors): KdpRoyaltyCalculatorField | null {
  return focusOrder.find((field) => field in errors) ?? null;
}

/* ---------------- the result ---------------- */

const limitCopy = {
  "below-minimum": { label: "Lowest price KDP allows", status: "Below KDP minimum", mark: "KDP minimum" },
  "below-break-even": { label: "Expanded Distribution break-even", status: "Below break-even", mark: "Break-even" },
  "above-maximum": { label: "Highest price KDP allows", status: "Above KDP maximum", mark: "KDP maximum" },
} as const;

function statusWords(values: Values, isExample: boolean): ReactNode[] {
  const words: string[] = [];
  if (isExample) words.push("Example");
  if (values.limit) words.push(limitCopy[values.limit.kind].status);
  if (values.seventyOutsideBand) words.push("Paid at 35%");
  if (values.deliveryExceedsShare) words.push("Delivery tops the 70% share");
  return words.map((word) => <UiStatusWord key={word}>{word}</UiStatusWord>);
}

function costLabel(values: Values) {
  if (values.costKind === "printing" && values.printing) {
    const { enteredPages, printedPages } = values.printing;
    return printedPages !== enteredPages ? `Printing, ${printedPages} pages` : "Printing";
  }
  if (!values.delivery) return "Delivery";
  const label = `Delivery, ${megabytes(values.delivery.fileSizeMB)}`;
  // The bar splits the price, so a fee larger than the price shows only the part it takes.
  return values.delivery.costCents > values.split.costCents ? `${label}, part of a ${money(values.delivery.costCents)} fee` : label;
}

function rateHint(values: Values) {
  if (values.rate === 40) return "Expanded Distribution pays 40% of the list price, minus printing.";
  if (values.rate === 70) return "70% of the list price after the delivery cost.";
  if (values.rate === 35) return "35% of the list price, with no delivery cost.";
  return "KDP pays 50% below $9.99 and 60% from $9.99, minus printing.";
}

function comparisonMetric(values: Values): UiMetric | null {
  const comparison = values.comparison;
  if (!comparison) return null;
  const value = money(comparison.royaltyCents);
  if (comparison.kind === "rate-step") {
    return { id: "comparison", label: `At ${money(comparison.priceCents)}`, hint: "KDP pays 60% from $9.99.", value };
  }
  if (comparison.kind === "other-channel") {
    return { id: "comparison", label: "Amazon.com only", hint: "What an Amazon.com sale at the same price pays.", value };
  }
  if (comparison.kind === "other-plan") {
    return { id: "comparison", label: `On the ${comparison.rate}% plan`, hint: "What the other plan pays at the same price.", value };
  }
  return { id: "comparison", label: `At ${money(comparison.priceCents)} on 70%`, hint: "The nearest price KDP pays 70% on.", value };
}

function metricsFor(values: Values): UiMetric[] {
  const breakEven = values.minimumKind === "break-even";
  // Below the minimum, the answer already is the minimum, so it isn't repeated here.
  const answeredAtMinimum = values.limit !== null && values.limit.kind !== "above-maximum";
  const minimumHint = breakEven
    ? "Where 40% just covers printing; KDP's own minimum may be higher."
    : values.format === "ebook"
      ? "KDP sets it by file size; 70% starts at $2.99."
      : "KDP sets it so your share covers printing.";
  const comparison = comparisonMetric(values);
  return [
    { id: "rate", label: "Royalty rate", hint: rateHint(values), value: `${values.rate}%` },
    ...(answeredAtMinimum ? [] : [{
      id: "minimum",
      label: breakEven ? "Break-even price" : "Lowest list price",
      hint: minimumHint,
      value: money(values.minimumPriceCents),
    }]),
    {
      id: "share",
      label: "Share of list price",
      hint: "Also your break-even ACoS: ad spend above this share of sales loses money.",
      value: percent(values.shareBasisPoints),
    },
    ...(comparison ? [comparison] : []),
    ...(values.goal ? [{
      id: "goal",
      label: `Copies a month for ${goalMoney(values.goal.goalCents)}`,
      value: values.goal.copies === null ? "—" : whole.format(values.goal.copies),
    }] : []),
  ];
}

function chartSpec(values: Values): UiChartSpec {
  const markLabel = values.limit ? limitCopy[values.limit.kind].mark : "Your price";
  return {
    format: "currency",
    height: 280,
    kind: "line",
    marks: [{ label: markLabel, x: values.curve.mark.priceCents / 100, y: values.curve.mark.royaltyCents / 100 }],
    series: values.curve.series.map((series) => ({
      id: series.id,
      label: seriesLabels[series.id],
      points: series.points.map(([price, royalty]) => [price / 100, royalty / 100] as const),
    })),
    title: "Royalty at each list price",
    xFormat: "currency",
  };
}

function setupLine(input: Input, values: Values) {
  if (values.format === "ebook") {
    const size = values.delivery ? megabytes(values.delivery.fileSizeMB) : "";
    return `Kindle eBook, ${size}, ${values.plan}% plan`;
  }
  const trim = findKdpTrim(input.trimId || "6x9")?.label ?? "6 × 9 in";
  const parts = [
    values.format === "paperback" ? "Paperback" : "Hardcover",
    trim,
    interiorLabel(input.interior as KdpInterior).toLowerCase(),
    `${paperLabel((input.paper || "white") as KdpPaper).toLowerCase()} paper`,
    `${values.printing?.enteredPages ?? ""} pages`,
  ];
  if (values.channel === "expanded") parts.push("Expanded Distribution");
  return parts.join(", ");
}

function summaryText(input: Input, values: Values) {
  const lines = [
    "KDP royalty estimate, Amazon.com, USD",
    setupLine(input, values),
    `List price: ${money(values.priceCents)}${values.limit ? ` (${limitCopy[values.limit.kind].label.toLowerCase()}; you entered ${money(values.enteredPriceCents)})` : ""}`,
    `Royalty: ${money(values.royaltyCents)} per copy at ${values.rate}%`,
  ];
  if (values.printing) {
    const { costCents, fixedCents, pageCents, printedPages } = values.printing;
    lines.push(`Printing: ${money(costCents)} (${money(fixedCents)} fixed + ${money(pageCents)} for ${printedPages} pages)`);
  }
  if (values.costKind === "delivery" && values.delivery) lines.push(`Delivery: ${money(values.delivery.costCents)}`);
  lines.push(`${values.minimumKind === "break-even" ? "Break-even price" : "Lowest list price"}: ${money(values.minimumPriceCents)}`);
  lines.push(`Share of list price: ${percent(values.shareBasisPoints)}`);
  const comparison = comparisonMetric(values);
  if (comparison) lines.push(`${comparison.label}: ${comparison.value}`);
  if (values.goal) lines.push(`Copies a month for ${goalMoney(values.goal.goalCents)}: ${values.goal.copies === null ? "none, no royalty" : whole.format(values.goal.copies)}`);
  lines.push(`KDP rules as of ${values.rulesVersion}`);
  return lines.join("\n");
}

function ResultView({ answerRef, isExample, shown }: { answerRef: RefObject<HTMLOutputElement | null>; isExample: boolean; shown: Shown }) {
  const { input, values } = shown;
  const limit = values.limit;
  const words = statusWords(values, isExample);
  const detail = limit ? `earns ${money(values.royaltyCents)} a copy` : `on a ${money(values.priceCents)} ${formatWord(values.format)}`;
  const segments: UiAllocationSegment[] = [
    { id: "royalty", label: "Your royalty", tone: "chartreuse", value: values.split.royaltyCents },
    ...(values.costKind ? [{ id: "cost", label: costLabel(values), tone: "medium" as const, value: values.split.costCents }] : []),
    { id: "amazon", label: "Amazon", tone: "light", value: values.split.amazonCents },
  ];

  return (
    <>
      <div className={styles.top}>
        <UiPrimaryResult
          detail={(
            <span className={styles.detail}>
              {detail}
              {words.length ? <span className={styles.status}>{words}</span> : null}
            </span>
          )}
          inputRef={answerRef}
          label={limit ? limitCopy[limit.kind].label : "Royalty per copy"}
          value={money(limit ? limit.priceCents : values.royaltyCents)}
        />
        <UiAllocationBar
          ariaLabel={`How the ${money(values.priceCents)} list price splits`}
          formatValue={(value) => money(Number(value))}
          segments={segments}
        />
      </div>
      <UiMetricGroup ariaLabel="Supporting numbers" items={metricsFor(values)} />
      <UiLiveChart spec={chartSpec(values)} />
      <div className={styles.actions}>
        <UiCopyAction label="Copy summary" successLabel="Summary copied" value={summaryText(input, values)} withManualFallback />
        <UiShareAction params={shareParams(input)} />
      </div>
    </>
  );
}
