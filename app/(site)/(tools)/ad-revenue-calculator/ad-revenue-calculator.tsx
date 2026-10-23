"use client";

import { RotateCcw } from "lucide-react";
import { useEffect, useId, useRef, useState, type FormEvent, type RefObject } from "react";
import { UiButton, UiQuantityInput, UiShareAction, UiTextField, uiOption } from "@/app/ui/controls";
import { UiActionRow, UiMetricGroup, UiPrimaryResult, UiStatus, UiStatusWord } from "@/app/ui/display";
import { UiTabRow, uiTabPanelProps } from "@/app/ui/tabs";
import { ToolFieldRow, ToolResult, ToolWorkbench } from "@/app/ui/tools/tool-workbench";
import {
  AD_REVENUE_EXAMPLE_INPUT,
  adRevenueShareParams,
  calculateAdRevenue,
  isAdRevenueTab,
  isTrafficUnit,
  unitWord,
  type AdRevenueErrors,
  type AdRevenueField,
  type AdRevenueInput,
  type AdRevenueTab,
  type AdRevenueValues,
  type Cents,
  type TrafficUnit,
} from "@/lib/ad-revenue-calculator/engine";
import styles from "./ad-revenue-calculator.module.css";

type Shown = { input: AdRevenueInput; values: AdRevenueValues | null };

const tabs = [
  { id: "revenue", title: "Revenue" },
  { id: "cpm", title: "CPM to RPM" },
  { id: "rpm", title: "Find RPM" },
];
const trafficUnits = [uiOption("pageviews", "Pageviews"), uiOption("sessions", "Sessions")];
const impressionUnits = [uiOption("pageviews", "per pageview"), uiOption("sessions", "per session")];
const buttonLabel: Record<AdRevenueTab, string> = { revenue: "Calculate revenue", cpm: "Calculate RPM", rpm: "Find RPM" };
const focusOrder: Record<AdRevenueTab, AdRevenueField[]> = {
  revenue: ["traffic", "rpm"],
  cpm: ["cpm", "impressions", "traffic"],
  rpm: ["revenue", "traffic"],
};

/* ---------------- formatting ---------------- */

function formatInteger(value: bigint): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);
}

function formatCents(cents: bigint): string {
  return `$${formatInteger(cents / 100n)}.${(cents % 100n).toString().padStart(2, "0")}`;
}

function formatMoney(value: Cents | null): string {
  if (!value) return "—";
  return value.underCent ? "Under $0.01" : formatCents(value.cents);
}

function formatHundredths(hundredths: bigint): string {
  const fraction = (hundredths % 100n).toString().padStart(2, "0").replace(/0+$/, "");
  return `${formatInteger(hundredths / 100n)}${fraction ? `.${fraction}` : ""}`;
}

function rpmLabel(unit: TrafficUnit): string {
  return unit === "sessions" ? "Session RPM" : "Page RPM";
}

function calculate(input: AdRevenueInput) {
  try {
    return calculateAdRevenue(input);
  } catch {
    return null;
  }
}

function firstError(errors: AdRevenueErrors, tab: AdRevenueTab): AdRevenueField | null {
  return focusOrder[tab].find((field) => field in errors) ?? null;
}

/* ---------------- the tool ---------------- */

export function AdRevenueCalculator({ initialInput }: { initialInput?: AdRevenueInput }) {
  const shared = initialInput !== undefined;
  const [first] = useState(() => {
    const input = initialInput ?? AD_REVENUE_EXAMPLE_INPUT;
    const calculation = calculate(input);
    const tab = isAdRevenueTab(input.tab) ? input.tab : "revenue";
    const errors = shared ? calculation?.errors ?? {} : {};
    return {
      input,
      shown: { input, values: calculation?.status === "valid" ? calculation.values : null } satisfies Shown,
      errors,
      focus: shared ? firstError(errors, tab) : null,
    };
  });
  const [input, setInput] = useState<AdRevenueInput>(first.input);
  const [shown, setShown] = useState<Shown>(first.shown);
  const [errors, setErrors] = useState<AdRevenueErrors>(first.errors);
  const [isExample, setIsExample] = useState(!shared);
  const [isStale, setIsStale] = useState(false);
  const [failed, setFailed] = useState(false);
  const [focusTarget, setFocusTarget] = useState<string | null>(first.focus);
  const panelId = useId();
  const formRef = useRef<HTMLFormElement>(null);
  // Edited since the example, so a tab switch no longer shows an example answer.
  const edited = useRef(false);
  const answerRef = useRef<HTMLOutputElement>(null);

  useEffect(() => {
    if (!focusTarget) return;
    if (focusTarget === "answer") answerRef.current?.focus();
    else formRef.current?.querySelector<HTMLElement>(`[data-focus-key="${focusTarget}"]`)?.focus();
    setFocusTarget(null);
  }, [focusTarget]);

  const tab: AdRevenueTab = isAdRevenueTab(input.tab) ? input.tab : "revenue";
  const unit: TrafficUnit = isTrafficUnit(input.unit) ? input.unit : "pageviews";

  function edit(next: AdRevenueInput, clearKeys: AdRevenueField[]) {
    setInput(next);
    setIsStale(true);
    setFailed(false);
    edited.current = true;
    if (clearKeys.some((key) => key in errors)) {
      setErrors((current) => {
        const rest = { ...current };
        for (const key of clearKeys) delete rest[key];
        return rest;
      });
    }
  }

  function setField(field: AdRevenueField, value: string) {
    edit({ ...input, [field]: value }, [field]);
  }

  // The unit changes every label and error message, so old errors go with it.
  function setUnit(value: string) {
    setInput({ ...input, unit: value });
    setIsStale(true);
    edited.current = true;
    setErrors({});
  }

  // A tab is a different question about the same numbers, so switching answers it right away
  // when it can. Errors wait for the button.
  function selectTab(id: string) {
    if (id === input.tab) return;
    const next = { ...input, tab: id };
    setInput(next);
    setErrors({});
    setFailed(false);
    const calculation = calculate(next);
    if (calculation?.status === "valid") {
      setShown({ input: next, values: calculation.values });
      setIsStale(false);
      if (edited.current) setIsExample(false);
    } else {
      setIsStale(true);
    }
  }

  function submit(event?: FormEvent) {
    event?.preventDefault();
    const calculation = calculate(input);
    if (!calculation) {
      setFailed(true);
      return;
    }
    setFailed(false);
    setErrors(calculation.errors);
    if (calculation.status === "valid") {
      setShown({ input, values: calculation.values });
      setIsStale(false);
      setIsExample(false);
    }
    setFocusTarget(firstError(calculation.errors, tab) ?? "answer");
  }

  function reset() {
    const example = { ...AD_REVENUE_EXAMPLE_INPUT, tab };
    const calculation = calculate(example);
    edited.current = false;
    setInput(example);
    setShown({ input: example, values: calculation?.status === "valid" ? calculation.values : null });
    setErrors({});
    setIsExample(true);
    setIsStale(false);
    setFailed(false);
  }

  const trafficField = (
    <UiQuantityInput
      dataFocusKey="traffic"
      error={errors.traffic}
      hint="Your traffic for one month, from your analytics or ad dashboard."
      label="Monthly traffic"
      onChange={(value) => setField("traffic", value)}
      onUnitChange={setUnit}
      required={tab !== "cpm"}
      unit={unit}
      unitAriaLabel="Traffic unit"
      units={trafficUnits}
      value={input.traffic}
    />
  );

  return (
    <ToolWorkbench label="Ad revenue calculator">
      <UiTabRow label="What to calculate" onChange={selectTab} panelId={panelId} tabs={tabs} value={tab} />
      <form {...uiTabPanelProps(panelId, tab)} className={styles.form} noValidate onSubmit={submit} ref={formRef}>
        {tab === "revenue" ? (
          <ToolFieldRow className={styles.pairRow}>
            {trafficField}
            <UiTextField
              dataFocusKey="rpm"
              error={errors.rpm}
              hint={`What you earn for every 1,000 ${unitWord(unit)}.`}
              inputMode="decimal"
              label={rpmLabel(unit)}
              onChange={(value) => setField("rpm", value)}
              required
              suffix="USD"
              value={input.rpm}
            />
          </ToolFieldRow>
        ) : null}

        {tab === "cpm" ? (
          <>
            <ToolFieldRow className={styles.pairRow}>
              <UiTextField
                dataFocusKey="cpm"
                error={errors.cpm}
                hint="What you earn for every 1,000 ad impressions, after your network's cut."
                inputMode="decimal"
                label="CPM"
                onChange={(value) => setField("cpm", value)}
                required
                suffix="USD"
                value={input.cpm}
              />
              <UiQuantityInput
                dataFocusKey="impressions"
                error={errors.impressions}
                hint={unit === "sessions" ? "How many ads load in an average visit." : "How many ads load on an average page."}
                label="Ad impressions"
                onChange={(value) => setField("impressions", value)}
                onUnitChange={setUnit}
                required
                unit={unit}
                unitAriaLabel="Ad impressions per"
                units={impressionUnits}
                value={input.impressions}
              />
            </ToolFieldRow>
            <ToolFieldRow className={styles.pairRow}>{trafficField}</ToolFieldRow>
          </>
        ) : null}

        {tab === "rpm" ? (
          <ToolFieldRow className={styles.pairRow}>
            <UiTextField
              dataFocusKey="revenue"
              error={errors.revenue}
              hint="Your ad earnings for the same month as the traffic."
              inputMode="decimal"
              label="Monthly ad revenue"
              onChange={(value) => setField("revenue", value)}
              required
              suffix="USD"
              value={input.revenue}
            />
            {trafficField}
          </ToolFieldRow>
        ) : null}

        <UiActionRow>
          {failed ? <UiStatus tone="danger">Couldn&apos;t calculate. Try again.</UiStatus> : isStale ? <UiStatus>Inputs changed</UiStatus> : null}
          <UiButton type="submit" variant="primary">{buttonLabel[tab]}</UiButton>
          <UiButton onPress={reset} type="button" variant="secondary">
            <RotateCcw aria-hidden="true" size={17} />
            Reset
          </UiButton>
        </UiActionRow>
      </form>

      <ToolResult label="Ad revenue result" stale={isStale}>
        <ResultView answerRef={answerRef} isExample={isExample} shown={shown} />
      </ToolResult>
    </ToolWorkbench>
  );
}

/* ---------------- the result ---------------- */

function ResultView({ answerRef, isExample, shown }: {
  answerRef: RefObject<HTMLOutputElement | null>;
  isExample: boolean;
  shown: Shown;
}) {
  const { values } = shown;
  const tab: AdRevenueTab = values?.tab ?? (isAdRevenueTab(shown.input.tab) ? shown.input.tab : "revenue");
  const unit: TrafficUnit = values?.unit ?? (isTrafficUnit(shown.input.unit) ? shown.input.unit : "pageviews");
  const traffic = values?.traffic ?? null;
  const trafficText = traffic !== null ? `${formatInteger(traffic)} ${unitWord(unit, traffic !== 1n)}` : "";

  let working = "";
  if (values && tab === "revenue" && traffic !== null) {
    working = `${trafficText} × ${formatMoney(values.rpm)} ÷ 1,000 a month`;
  } else if (values && tab === "cpm" && values.cpmCents !== null && values.impressionsHundredths !== null) {
    const count = values.impressionsHundredths;
    working = `${formatCents(values.cpmCents)} CPM × ${formatHundredths(count)} ad ${count === 100n ? "impression" : "impressions"} per ${unitWord(unit, false)}`;
  } else if (values && tab === "rpm" && values.revenueCents !== null) {
    working = `${formatCents(values.revenueCents)} ÷ ${trafficText} × 1,000`;
  }

  const monthly = (
    <UiPrimaryResult inputRef={tab === "revenue" ? answerRef : undefined} label="Monthly revenue" value={formatMoney(values?.monthly ?? null)} />
  );
  const yearly = <UiPrimaryResult label="Yearly revenue" value={formatMoney(values?.yearly ?? null)} />;

  return (
    <>
      {isExample ? <div className={styles.head}><UiStatusWord>Example</UiStatusWord></div> : null}

      {tab === "revenue" ? (
        <div className={styles.lead}>
          <div className={styles.pair}>{monthly}{yearly}</div>
          {working ? <p className={styles.working}>{working}</p> : null}
        </div>
      ) : (
        <>
          <UiPrimaryResult
            detail={working ? <span className={styles.working}>{working}</span> : undefined}
            inputRef={answerRef}
            label={rpmLabel(unit)}
            value={values ? formatMoney(values.rpm) : "—"}
          />
          <div className={styles.pair}>{monthly}{yearly}</div>
        </>
      )}

      {tab === "cpm" && values?.impressions ? (
        <UiMetricGroup
          ariaLabel="Ad impressions"
          items={[
            { id: "impressions-month", label: "Ad impressions a month", value: formatInteger(values.impressions.monthly) },
            { id: "impressions-year", label: "Ad impressions a year", value: formatInteger(values.impressions.yearly) },
          ]}
        />
      ) : null}

      {values ? (
        <div className={styles.share}>
          <UiShareAction params={adRevenueShareParams(shown.input)} />
        </div>
      ) : null}
    </>
  );
}
