"use client";

import { RotateCcw } from "lucide-react";
import { useMemo, useRef, useState, type FormEvent, type ReactNode, type RefObject } from "react";
import { UiLiveChart } from "@/app/ui/charts/chart-client";
import type { UiChartSpec } from "@/app/ui/charts/chart-option";
import { UiButton, UiChoiceGroup, UiDisclosure, UiSelect, UiTextField, uiOption } from "@/app/ui/controls";
import {
  UiActionRow,
  UiDataTable,
  UiKeyValueList,
  UiMetricGroup,
  UiPrimaryResult,
  UiProgressBar,
  UiStatus,
  type UiMetric,
} from "@/app/ui/display";
import {
  calculateMrrGoal,
  type MrrGoalCustomerTimeline,
  type MrrGoalErrors,
  type MrrGoalFieldKey,
  type MrrGoalGrowthTimeline,
  type MrrGoalInput,
  type MrrGoalTraffic,
  type MrrGoalValues,
} from "@/lib/mrr-goal-calculator/engine";
import { SAAS_ECONOMICS_CURRENCIES, type SaasEconomicsCurrency } from "@/lib/saas-economics/shared";
import styles from "./mrr-goal-calculator.module.css";

type StatusMessage = { text: string; tone: "neutral" | "danger" };
type TextKey = Exclude<keyof MrrGoalInput, "currency" | "goalPeriod" | "method" | "solveFor">;

const CHANGED = "Inputs changed. Calculate again.";

function emptyFields(): MrrGoalInput {
  return {
    currency: "USD",
    goalAmount: "",
    goalPeriod: "month",
    monthlyArpa: "",
    method: "customers",
    solveFor: "date",
    currentCustomers: "",
    newCustomersPerMonth: "",
    churnPercent: "",
    currentMrr: "",
    growthPercent: "",
    deadlineMonths: "",
    visitorToSignupPercent: "",
    signupToPaidPercent: "",
  };
}

/** The timeline fields the engine reads for each method and solve mode, in reading order. */
function timelineFields(fields: MrrGoalInput): TextKey[] {
  if (fields.method === "growth") {
    return fields.solveFor === "pace" ? ["currentMrr", "deadlineMonths"] : ["currentMrr", "growthPercent"];
  }
  return fields.solveFor === "pace"
    ? ["currentCustomers", "churnPercent", "deadlineMonths"]
    : ["currentCustomers", "newCustomersPerMonth", "churnPercent"];
}

/* ---------------- formatting ---------------- */

function currencySymbol(currency: SaasEconomicsCurrency): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency })
    .formatToParts(0)
    .find((part) => part.type === "currency")?.value ?? currency;
}

function formatInteger(value: bigint | number): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);
}

function formatMoney(cents: bigint, currency: SaasEconomicsCurrency): string {
  const negative = cents < 0n;
  const magnitude = negative ? -cents : cents;
  const fraction = (magnitude % 100n).toString().padStart(2, "0");
  return `${negative ? "−" : ""}${currencySymbol(currency)}${formatInteger(magnitude / 100n)}.${fraction}`;
}

function formatPercent(hundredths: bigint): string {
  const negative = hundredths < 0n;
  const magnitude = negative ? -hundredths : hundredths;
  const fraction = (magnitude % 100n).toString().padStart(2, "0").replace(/0+$/, "");
  return `${negative ? "−" : ""}${formatInteger(magnitude / 100n)}${fraction ? `.${fraction}` : ""}%`;
}

function plural(count: number, word: string): string {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}

/** "about 3 years 3 months" for spans of a year or more. */
function monthSpan(months: number): string | null {
  if (months < 12) return null;
  const years = Math.floor(months / 12);
  const rest = months % 12;
  return `About ${plural(years, "year")}${rest ? ` ${plural(rest, "month")}` : ""}`;
}

function ceilingText(ceiling: { floor: bigint; isWhole: boolean }): string {
  return `${ceiling.isWhole ? "" : "about "}${formatInteger(ceiling.floor)}`;
}

/* ---------------- results ---------------- */

type TimelineCopy = {
  heading: string;
  sub?: string | null;
  lines: string[];
  metrics: UiMetric[];
  /** The month the table marks, and its label. */
  marker: { month: number; label: string } | null;
  caption: string;
};

function customerCopy(values: MrrGoalValues, timeline: MrrGoalCustomerTimeline): TimelineCopy {
  const needed = values.goal.customersNeeded;
  const { ceiling, outcome } = timeline;
  const churn = timeline.churnHundredths > 0n;
  const remaining = { id: "remaining", label: "Customers still needed", value: formatInteger(timeline.remainingCustomers) };
  const lost = churn ? [{ id: "lost", label: "Lost each month at goal", value: formatInteger(timeline.lostPerMonthAtGoal) }] : [];
  const ceilingMetric = ceiling ? [{ id: "ceiling", label: "Ceiling at this pace", value: ceilingText(ceiling) }] : [];
  const pace = formatInteger(timeline.pace);
  const caption = timeline.solveFor === "pace"
    ? `At ${pace} new customers a month. Months from today.`
    : "Months from today.";

  switch (outcome.kind) {
    case "reached":
      return {
        heading: `Reached in month ${outcome.month}`,
        sub: monthSpan(outcome.month),
        lines: [],
        metrics: [remaining, ...lost, ...ceilingMetric],
        marker: { month: outcome.month, label: "Goal reached" },
        caption,
      };
    case "alreadyThere":
      return {
        heading: "You're already there",
        lines: outcome.fallsBelowInMonth !== null && ceiling
          ? [`At this pace, you drop below the goal in month ${outcome.fallsBelowInMonth}. Your customer count levels off at ${ceilingText(ceiling)}.`]
          : [],
        metrics: [...lost],
        marker: outcome.fallsBelowInMonth !== null ? { month: outcome.fallsBelowInMonth, label: "Drops below goal" } : null,
        caption,
      };
    case "unreachable":
      if (outcome.reason === "noNewCustomers") {
        return {
          heading: "Out of reach at this pace",
          lines: [`With no new customers and no churn, the count stays at ${formatInteger(timeline.currentCustomers)}.`],
          metrics: [remaining],
          marker: null,
          caption,
        };
      }
      return {
        heading: "Out of reach at this pace",
        lines: [
          `With ${pace} new customers a month and ${formatPercent(timeline.churnHundredths)} churn, ${
            ceiling && ceiling.isWhole && ceiling.floor === needed
              ? `you get close to ${formatInteger(needed)} customers but never reach it.`
              : `you level off at ${ceiling ? ceilingText(ceiling) : "a lower count"} customers, short of ${formatInteger(needed)}.`
          }`,
          `With at least ${formatInteger(outcome.paceToReach)} new customers a month, you'd get there eventually. To aim for a set month, use Pace for a deadline.`,
        ],
        metrics: [remaining, ...lost],
        marker: null,
        caption,
      };
    case "beyondHorizon":
      return {
        heading: "Not within 50 years",
        lines: ["At this pace, the goal is more than 600 months away."],
        metrics: [remaining, ...lost, ...ceilingMetric],
        marker: null,
        caption,
      };
    case "paceForDeadline": {
      const deadline = outcome.deadlineMonths;
      if (outcome.alreadyThere && timeline.pace === 0n) {
        return {
          heading: "You're already there",
          sub: `You stay at ${formatInteger(needed)} or more through month ${deadline} with no new customers.`,
          lines: [],
          metrics: [...lost],
          marker: { month: deadline, label: "Deadline" },
          caption,
        };
      }
      return {
        heading: `Add ${pace} new customers a month`,
        sub: outcome.alreadyThere
          ? `to still have ${formatInteger(needed)} at month ${deadline}`
          : `to reach ${formatInteger(needed)} by month ${deadline}`,
        lines: [],
        metrics: [remaining, ...lost],
        marker: { month: deadline, label: "Deadline" },
        caption,
      };
    }
  }
}

function growthCopy(values: MrrGoalValues, timeline: MrrGoalGrowthTimeline): TimelineCopy {
  const { currency, goal } = values;
  const { outcome } = timeline;
  const goalMrr = formatMoney(goal.monthlyGoalCents, currency);
  const remaining = timeline.remainingMrrCents > 0n
    ? [{ id: "remaining", label: "MRR still needed", value: formatMoney(timeline.remainingMrrCents, currency) }]
    : [];
  const rate = formatPercent(timeline.growthHundredths);
  const caption = timeline.solveFor === "pace" ? `At ${rate} a month. Months from today.` : "Months from today.";

  switch (outcome.kind) {
    case "reached":
      return {
        heading: `Reached in month ${outcome.month}`,
        sub: monthSpan(outcome.month),
        lines: [],
        metrics: remaining,
        marker: { month: outcome.month, label: "Goal reached" },
        caption,
      };
    case "alreadyThere":
      return { heading: "You're already there", lines: [], metrics: [], marker: null, caption };
    case "unreachable":
      return {
        heading: "Out of reach at this rate",
        lines: [outcome.reason === "noGrowth" ? "MRR doesn't grow at 0% a month." : `MRR shrinks ${formatPercent(-timeline.growthHundredths)} a month.`],
        metrics: remaining,
        marker: null,
        caption,
      };
    case "beyondHorizon":
      return {
        heading: "Not within 50 years",
        lines: ["At this rate, the goal is more than 600 months away."],
        metrics: remaining,
        marker: null,
        caption,
      };
    case "rateForDeadline":
      if (outcome.alreadyThere) {
        return {
          heading: "You're already there",
          sub: `Current MRR already meets ${goalMrr}.`,
          lines: [],
          metrics: [],
          marker: null,
          caption,
        };
      }
      return {
        heading: `Grow MRR ${rate} a month`,
        sub: `to reach ${goalMrr} MRR by month ${outcome.deadlineMonths}`,
        lines: [],
        metrics: remaining,
        marker: { month: outcome.deadlineMonths, label: "Deadline" },
        caption,
      };
    case "aboveMaxRate":
      return {
        heading: "Needs more than 1,000% a month",
        sub: `to reach ${goalMrr} MRR by month ${outcome.deadlineMonths}`,
        lines: ["Try a later deadline."],
        metrics: remaining,
        marker: null,
        caption,
      };
  }
}

function chartSpec(values: MrrGoalValues, copy: TimelineCopy): UiChartSpec | null {
  const timeline = values.timeline;
  if (!timeline || timeline.path.length < 2) return null;
  // Already at the goal with nothing to watch for: a chart would only show the line staying above it.
  if (timeline.outcome.kind === "alreadyThere" && !("fallsBelowInMonth" in timeline.outcome && timeline.outcome.fallsBelowInMonth !== null)) return null;
  if (timeline.method === "customers") {
    const needed = Number(values.goal.customersNeeded);
    const points = timeline.path.map((point) => [point.month, Number(point.customers)] as const);
    if (points.every(([, y]) => y === points[0][1])) return null;
    const series = [
      { id: "customers", label: "Paying customers", points },
      { id: "needed", label: "Customers needed", points: timeline.path.map((point) => [point.month, needed] as const) },
    ];
    if (timeline.outcome.kind === "unreachable" && timeline.outcome.reason === "ceiling" && timeline.ceiling) {
      const ceiling = Number(timeline.ceiling.floor);
      series.push({ id: "ceiling", label: "Ceiling at this pace", points: timeline.path.map((point) => [point.month, ceiling] as const) });
    }
    return { caption: copy.caption, format: "number", height: 280, kind: "line", series, title: "Paying customers by month", xFormat: "number" };
  }
  const points = timeline.path.map((point) => [point.month, Number(point.mrrCents) / 100] as const);
  if (points.every(([, y]) => y === points[0][1])) return null;
  const goal = Number(values.goal.monthlyGoalCents) / 100;
  // The shared chart formats currency as US dollars, so other currencies use plain numbers and name the code.
  const usd = values.currency === "USD";
  return {
    caption: copy.caption,
    format: usd ? "currency" : "number",
    height: 280,
    kind: "line",
    series: [
      { id: "mrr", label: "MRR", points },
      { id: "goal", label: "Goal", points: timeline.path.map((point) => [point.month, goal] as const) },
    ],
    title: usd ? "MRR by month" : `MRR by month, in ${values.currency}`,
    xFormat: "number",
  };
}

function trafficLines(traffic: MrrGoalTraffic): { metrics: UiMetric[]; note: string | null } {
  if (traffic.kind === "noFiniteTraffic") {
    const stage = traffic.stage === "signupToPaid" ? "signup-to-paid" : "visitor-to-signup";
    return { metrics: [], note: `At 0% ${stage}, no amount of traffic adds paying customers.` };
  }
  const metrics: UiMetric[] = [
    { id: "signups", label: "Signups a month", value: formatInteger(traffic.signupsPerMonth) },
    { id: "visitors", label: "Visitors a month", value: formatInteger(traffic.visitorsPerMonth) },
  ];
  if (traffic.visitorsToGoal !== null && traffic.months !== null) {
    metrics.push({ id: "total", label: `Visitors over ${plural(traffic.months, "month")}`, value: formatInteger(traffic.visitorsToGoal) });
  }
  return { metrics, note: null };
}

function MonthTable({ copy, values }: { copy: TimelineCopy; values: MrrGoalValues }) {
  const timeline = values.timeline!;
  const { currency } = values;
  const monthCell = (month: number): ReactNode => copy.marker?.month === month
    ? <span className={styles.markedMonth}><span>{month}</span><span className={styles.marker}>{copy.marker.label}</span></span>
    : month;
  if (timeline.method === "customers") {
    return (
      <UiDataTable
        ariaLabel="Paying customers and MRR by month"
        columns={[
          { id: "month", label: "Month" },
          { id: "customers", label: "Paying customers", align: "right" },
          { id: "mrr", label: "MRR", align: "right" },
        ]}
        rows={timeline.path.map((point) => ({
          id: String(point.month),
          cells: { month: monthCell(point.month), customers: formatInteger(point.customers), mrr: formatMoney(point.mrrCents, currency) },
        }))}
      />
    );
  }
  return (
    <UiDataTable
      ariaLabel="MRR by month"
      columns={[{ id: "month", label: "Month" }, { id: "mrr", label: "MRR", align: "right" }]}
      rows={timeline.path.map((point) => ({
        id: String(point.month),
        cells: { month: monthCell(point.month), mrr: formatMoney(point.mrrCents, currency) },
      }))}
    />
  );
}

function assumptions(values: MrrGoalValues): { label: string; value: string }[] {
  const { currency, goal, timeline, traffic } = values;
  const rows = [
    {
      label: "Goal",
      value: goal.period === "month"
        ? `${formatMoney(goal.enteredCents, currency)} a month (MRR)`
        : `${formatMoney(goal.enteredCents, currency)} a year (ARR)`,
    },
    { label: "Monthly price or ARPA", value: formatMoney(values.monthlyArpaCents, currency) },
  ];
  if (timeline?.method === "customers") {
    rows.push({ label: "Current paying customers", value: formatInteger(timeline.currentCustomers) });
    if (timeline.solveFor === "date") rows.push({ label: "New customers a month", value: formatInteger(timeline.pace) });
    rows.push({ label: "Monthly customer churn", value: formatPercent(timeline.churnHundredths) });
  }
  if (timeline?.method === "growth") {
    rows.push({ label: "Current MRR", value: formatMoney(timeline.currentMrrCents, currency) });
    if (timeline.solveFor === "date") rows.push({ label: "Net monthly MRR growth", value: formatPercent(timeline.growthHundredths) });
  }
  if (timeline && (timeline.outcome.kind === "paceForDeadline" || timeline.outcome.kind === "rateForDeadline" || timeline.outcome.kind === "aboveMaxRate")) {
    rows.push({ label: "Deadline", value: `Month ${timeline.outcome.deadlineMonths}` });
  }
  if (traffic?.kind === "finite") {
    rows.push(
      { label: "Visitor to signup", value: formatPercent(traffic.visitorToSignupHundredths) },
      { label: "Signup to paid", value: formatPercent(traffic.signupToPaidHundredths) },
    );
  }
  return rows;
}

function MrrGoalResults({ resultRef, values }: { resultRef: RefObject<HTMLOutputElement | null>; values: MrrGoalValues }) {
  const { currency, goal, timeline, traffic } = values;
  const needed = formatInteger(goal.customersNeeded);
  const arpa = formatMoney(values.monthlyArpaCents, currency);
  const mrrAt = formatMoney(goal.mrrAtCustomersNeededCents, currency);
  const detail = goal.period === "month"
    ? `At ${arpa} a month, ${needed} customers bring in ${mrrAt} MRR.`
    : `${formatMoney(goal.enteredCents, currency)} ARR is ${formatMoney(goal.monthlyGoalCents, currency)} a month. At ${arpa}, ${needed} customers bring in ${mrrAt} MRR.`;

  // Keyed on the result alone, so unrelated form updates don't redraw the chart or reset its toggles.
  const { copy, spec } = useMemo(() => {
    const view = values.timeline
      ? values.timeline.method === "customers" ? customerCopy(values, values.timeline) : growthCopy(values, values.timeline)
      : null;
    return { copy: view, spec: view ? chartSpec(values, view) : null };
  }, [values]);

  let progress: ReactNode = null;
  if (timeline?.method === "customers" && timeline.currentCustomers > 0n && timeline.currentCustomers < goal.customersNeeded) {
    progress = (
      <UiProgressBar
        label="Customers today toward goal"
        max={Number(goal.customersNeeded)}
        value={Number(timeline.currentCustomers)}
        valueText={`${formatInteger(timeline.currentCustomers)} of ${needed}`}
      />
    );
  } else if (timeline?.method === "growth" && timeline.currentMrrCents < goal.monthlyGoalCents) {
    progress = (
      <UiProgressBar
        label="MRR today toward goal"
        max={Number(goal.monthlyGoalCents)}
        value={Number(timeline.currentMrrCents)}
        valueText={`${formatMoney(timeline.currentMrrCents, currency)} of ${formatMoney(goal.monthlyGoalCents, currency)}`}
      />
    );
  }

  const trafficView = traffic ? trafficLines(traffic) : null;

  return (
    <section aria-label="MRR goal results" className={styles.results}>
      <UiPrimaryResult detail={detail} inputRef={resultRef} label="Paying customers needed" value={needed} />

      {copy ? (
        <section aria-labelledby="mrr-goal-timeline-title" className={styles.resultGroup}>
          <div className={styles.timelineHeading}>
            <h2 id="mrr-goal-timeline-title">{copy.heading}</h2>
            {copy.sub ? <p className={styles.sub}>{copy.sub}</p> : null}
          </div>
          {copy.lines.length ? (
            <div className={styles.lines}>
              {copy.lines.map((line) => <p key={line}>{line}</p>)}
            </div>
          ) : null}
          {copy.metrics.length ? <UiMetricGroup ariaLabel="Timeline figures" items={copy.metrics} /> : null}
          {progress}
          {spec ? <UiLiveChart spec={spec} /> : null}
        </section>
      ) : (
        <p className={styles.note}>Add your current numbers to see when you&apos;d reach it.</p>
      )}

      {trafficView ? (
        <section aria-labelledby="mrr-goal-traffic-title" className={styles.resultGroup}>
          <h2 id="mrr-goal-traffic-title">Traffic for this pace</h2>
          {trafficView.metrics.length ? <UiMetricGroup ariaLabel="Traffic needed" items={trafficView.metrics} /> : null}
          {trafficView.note ? <p className={styles.note}>{trafficView.note}</p> : null}
        </section>
      ) : null}

      {copy && timeline && spec ? (
        <UiDisclosure label="Month by month" summary={`Months 0 to ${timeline.path[timeline.path.length - 1].month}`}>
          <div className={styles.monthTable}>
            <MonthTable copy={copy} values={values} />
          </div>
        </UiDisclosure>
      ) : null}

      <section aria-labelledby="mrr-goal-inputs-title" className={styles.resultGroup}>
        <h2 id="mrr-goal-inputs-title">What the answer uses</h2>
        <UiKeyValueList rows={assumptions(values)} />
        {timeline ? (
          <p className={styles.formula}>
            {timeline.method === "customers"
              ? "Next month = customers × (1 − churn) + new customers."
              : "Next month = MRR × (1 + growth)."}
          </p>
        ) : null}
      </section>
    </section>
  );
}

/* ---------------- form ---------------- */

export function MrrGoalCalculator() {
  const [fields, setFields] = useState<MrrGoalInput>(emptyFields);
  const [errors, setErrors] = useState<MrrGoalErrors>({});
  const [result, setResult] = useState<MrrGoalValues | null>(null);
  const [status, setStatus] = useState<StatusMessage | null>(null);
  const [trafficOpen, setTrafficOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const resultRef = useRef<HTMLOutputElement>(null);

  const customers = fields.method === "customers";
  const visible = timelineFields(fields);
  const trafficSet = fields.visitorToSignupPercent.trim() && fields.signupToPaidPercent.trim()
    ? `${fields.visitorToSignupPercent.trim()}% to signup, ${fields.signupToPaidPercent.trim()}% to paid`
    : undefined;

  function clearForEdit() {
    const hadResult = result !== null;
    setErrors({});
    setResult(null);
    if (hadResult) setStatus({ text: CHANGED, tone: "neutral" });
    else if (status?.text !== CHANGED) setStatus(null);
  }

  function update<K extends keyof MrrGoalInput>(field: K, value: MrrGoalInput[K]) {
    setFields((current) => ({ ...current, [field]: value }));
    clearForEdit();
  }

  function focusKey(key: string) {
    // Two frames, so a disclosure opened in the same update has rendered its fields.
    requestAnimationFrame(() => requestAnimationFrame(() => {
      formRef.current?.querySelector<HTMLElement>(`[data-focus-key="${key}"]`)?.focus();
    }));
  }

  function focusFirstError(next: MrrGoalErrors) {
    const order: MrrGoalFieldKey[] = [
      "currency", "goalAmount", "goalPeriod", "monthlyArpa", "method", "solveFor",
      ...visible, "visitorToSignupPercent", "signupToPaidPercent", "traffic",
    ];
    const first = order.find((key) => next[key]);
    if (!first) return;
    if (first === "visitorToSignupPercent" || first === "signupToPaidPercent" || first === "traffic") {
      setTrafficOpen(true);
      focusKey(first === "traffic" ? "visitorToSignupPercent" : first);
      return;
    }
    focusKey(first);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);
    try {
      const calculation = calculateMrrGoal(fields);
      if (calculation.status === "invalid") {
        setErrors(calculation.errors);
        setResult(null);
        if (calculation.errors.form) setStatus({ text: calculation.errors.form.message, tone: "danger" });
        focusFirstError(calculation.errors);
        return;
      }
      setErrors({});
      setResult(calculation.values);
      requestAnimationFrame(() => resultRef.current?.focus());
    } catch {
      setErrors({});
      setResult(null);
      setStatus({ text: "Couldn't calculate. Try again.", tone: "danger" });
    }
  }

  function reset() {
    setFields(emptyFields());
    setErrors({});
    setResult(null);
    setTrafficOpen(false);
    setStatus({ text: "Form reset.", tone: "neutral" });
    focusKey("goalAmount");
  }

  const error = (key: MrrGoalFieldKey) => errors[key]?.message ?? null;

  function textField(key: TextKey, props: { label: string; suffix?: string; description?: string; decimal?: boolean }) {
    return (
      <UiTextField
        autoCapitalize="none"
        dataFocusKey={key}
        description={props.description}
        error={error(key)}
        inputMode={props.decimal === false ? "numeric" : "decimal"}
        key={key}
        label={props.label}
        onChange={(value) => update(key, value)}
        spellCheck={false}
        suffix={props.suffix}
        value={fields[key]}
      />
    );
  }

  const timelineInputs: Record<string, ReactNode> = {
    currentCustomers: textField("currentCustomers", { label: "Current paying customers", decimal: false }),
    newCustomersPerMonth: textField("newCustomersPerMonth", {
      label: "New paying customers a month",
      decimal: false,
      description: "Everyone who starts paying, before any cancel.",
    }),
    churnPercent: textField("churnPercent", {
      label: "Monthly customer churn",
      suffix: "%",
      description: "Share of paying customers who cancel each month. Not lost revenue.",
    }),
    currentMrr: textField("currentMrr", { label: "Current MRR", suffix: fields.currency }),
    growthPercent: textField("growthPercent", {
      label: "Net monthly MRR growth",
      suffix: "%",
      description: "Change in total MRR from last month. Cancellations are already in it.",
    }),
    deadlineMonths: textField("deadlineMonths", { label: "Deadline in months", decimal: false }),
  };

  return (
    <section aria-label="MRR goal calculator" className={styles.workbench} data-tool-workbench>
      <div className={styles.content}>
        <form aria-label="MRR goal inputs" className={styles.form} noValidate onSubmit={submit} ref={formRef}>
          <section aria-labelledby="mrr-goal-goal-title" className={styles.group}>
            <div className={styles.groupHeader}>
              <h2 id="mrr-goal-goal-title">Goal</h2>
              <div className={styles.currency}>
                <UiSelect
                  dataFocusKey="currency"
                  error={error("currency")}
                  label="Currency"
                  onChange={(value) => {
                    if (!SAAS_ECONOMICS_CURRENCIES.includes(value as SaasEconomicsCurrency)) return;
                    update("currency", value);
                  }}
                  options={SAAS_ECONOMICS_CURRENCIES.map((currency) => uiOption(currency, currency))}
                  required
                  value={fields.currency}
                />
              </div>
            </div>
            <div className={styles.goalRow}>
              <UiTextField
                autoCapitalize="none"
                dataFocusKey="goalAmount"
                error={error("goalAmount")}
                inputMode="decimal"
                label="Revenue goal"
                onChange={(value) => update("goalAmount", value)}
                placeholder="10000"
                required
                spellCheck={false}
                suffix={fields.currency}
                value={fields.goalAmount}
              />
              <UiChoiceGroup
                dataFocusKey="goalPeriod"
                error={error("goalPeriod")}
                label="Goal period"
                onChange={(value) => update("goalPeriod", value)}
                options={[uiOption("month", "Per month (MRR)"), uiOption("year", "Per year (ARR)")]}
                required
                value={fields.goalPeriod}
              />
            </div>
            <div className={styles.fieldGrid}>
              <UiTextField
                autoCapitalize="none"
                dataFocusKey="monthlyArpa"
                description="Your plan's monthly price, or the average across plans. Divide a yearly price by 12."
                error={error("monthlyArpa")}
                inputMode="decimal"
                label="Monthly price or ARPA"
                onChange={(value) => update("monthlyArpa", value)}
                required
                spellCheck={false}
                suffix={fields.currency}
                value={fields.monthlyArpa}
              />
            </div>
          </section>

          <section aria-labelledby="mrr-goal-timeline-input-title" className={styles.group}>
            <h2 id="mrr-goal-timeline-input-title">Timeline <span className={styles.optional}>(optional)</span></h2>
            <div className={styles.choices}>
              <UiChoiceGroup
                dataFocusKey="method"
                error={error("method")}
                label="Plan from"
                onChange={(value) => update("method", value)}
                options={[uiOption("customers", "New customers and churn"), uiOption("growth", "MRR growth rate")]}
                value={fields.method}
              />
              <UiChoiceGroup
                dataFocusKey="solveFor"
                error={error("solveFor")}
                label="Work out"
                onChange={(value) => update("solveFor", value)}
                options={[uiOption("date", "When I reach it"), uiOption("pace", "Pace for a deadline")]}
                value={fields.solveFor}
              />
            </div>
            <div className={styles.timelineGrid} data-count={visible.length}>
              {visible.map((key) => timelineInputs[key])}
            </div>
          </section>

          {customers ? (
            <UiDisclosure
              isExpanded={trafficOpen}
              label="Traffic needed"
              onExpandedChange={setTrafficOpen}
              summary={trafficSet}
            >
              <div className={styles.fieldGrid}>
                <UiTextField
                  autoCapitalize="none"
                  dataFocusKey="visitorToSignupPercent"
                  description="Share of visitors who sign up or start a trial."
                  error={error("visitorToSignupPercent") ?? error("traffic")}
                  inputMode="decimal"
                  label="Visitor to signup"
                  onChange={(value) => update("visitorToSignupPercent", value)}
                  spellCheck={false}
                  suffix="%"
                  value={fields.visitorToSignupPercent}
                />
                <UiTextField
                  autoCapitalize="none"
                  dataFocusKey="signupToPaidPercent"
                  description="Share of signups who become paying customers."
                  error={error("signupToPaidPercent")}
                  inputMode="decimal"
                  label="Signup to paid"
                  onChange={(value) => update("signupToPaidPercent", value)}
                  spellCheck={false}
                  suffix="%"
                  value={fields.signupToPaidPercent}
                />
              </div>
            </UiDisclosure>
          ) : null}

          <UiActionRow>
            <UiButton type="submit" variant="primary">Calculate goal</UiButton>
            <UiButton onPress={reset} type="button" variant="secondary">
              <RotateCcw aria-hidden="true" size={17} />
              Reset
            </UiButton>
          </UiActionRow>
          {status ? <UiStatus tone={status.tone}>{status.text}</UiStatus> : null}
        </form>
        {result ? <MrrGoalResults resultRef={resultRef} values={result} /> : null}
      </div>
    </section>
  );
}
