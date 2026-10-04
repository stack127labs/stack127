"use client";

import { RotateCcw } from "lucide-react";
import { useLayoutEffect, useRef, useState, type FormEvent, type RefObject } from "react";
import { UiButton, UiChoiceGroup, UiRepeatableList, UiSelect, UiTextField, uiOption } from "@/app/ui/controls";
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
  BREAK_EVEN_MRR_MAX_FIXED_COST_LINES,
  calculateBreakEvenMrr,
  type BreakEvenMrrErrors,
  type BreakEvenMrrFieldKey,
  type BreakEvenMrrFixedCostInput,
  type BreakEvenMrrInput,
  type BreakEvenMrrValues,
} from "@/lib/break-even-mrr-calculator/engine";
import { SAAS_ECONOMICS_CURRENCIES, type SaasEconomicsCurrency } from "@/lib/saas-economics/shared";
import styles from "./break-even-mrr-calculator.module.css";

type StatusMessage = { text: string; tone: "neutral" | "danger" };
type FormFields = Omit<BreakEvenMrrInput, "fixedCosts">;
type LineField = Exclude<keyof BreakEvenMrrFixedCostInput, "id">;

const CHANGED = "Inputs changed. Calculate again.";

function emptyLine(id: string): BreakEvenMrrFixedCostInput {
  return { id, name: "", amount: "", period: "month" };
}

function emptyFields(): FormFields {
  return {
    currency: "USD",
    monthlyArpa: "",
    variableMethod: "perAccount",
    variableCostPerAccount: "",
    variableCostSharePercent: "",
    currentMrr: "",
  };
}

/* ---------------- formatting ---------------- */

function currencySymbol(currency: SaasEconomicsCurrency): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency })
    .formatToParts(0)
    .find((part) => part.type === "currency")?.value ?? currency;
}

function formatInteger(value: bigint): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);
}

function formatMoney(cents: bigint, currency: SaasEconomicsCurrency): string {
  const negative = cents < 0n;
  const magnitude = negative ? -cents : cents;
  const fraction = (magnitude % 100n).toString().padStart(2, "0");
  return `${negative ? "−" : ""}${currencySymbol(currency)}${formatInteger(magnitude / 100n)}.${fraction}`;
}

function formatPercent(hundredths: bigint, fixedDecimals: boolean): string {
  const negative = hundredths < 0n;
  const magnitude = negative ? -hundredths : hundredths;
  let fraction = (magnitude % 100n).toString().padStart(2, "0");
  if (!fixedDecimals) fraction = fraction.replace(/0+$/, "");
  return `${negative ? "−" : ""}${formatInteger(magnitude / 100n)}${fraction ? `.${fraction}` : ""}%`;
}

function lineLabel(line: BreakEvenMrrFixedCostInput, index: number): string {
  return line.name.trim() || `Fixed cost ${index + 1}`;
}

/* ---------------- results ---------------- */

function leadCopy(values: BreakEvenMrrValues): { value: string; lines: string[] } {
  const { currency, outcome } = values;
  if (outcome.kind === "finite") {
    return {
      value: formatMoney(outcome.breakEvenMrrCents, currency),
      lines: ["The recurring revenue that covers your fixed costs each month."],
    };
  }
  if (outcome.kind === "zeroFixedCosts") {
    return {
      value: formatMoney(0n, currency),
      lines: ["You have no fixed costs, so any paying account adds profit."],
    };
  }

  const shareMode = values.variableMethod === "shareOfMrr";
  const contribution = values.contributionPerAccountCents;
  const loss = contribution !== null && contribution < 0n ? formatMoney(-contribution, currency) : null;
  const fix = shareMode
    ? "Variable costs must be under 100% of MRR."
    : `ARPA must be above ${formatMoney(values.variableCostPerAccountCents ?? 0n, currency)}, the variable cost per account.`;

  if (outcome.fixedCosts === "positive") {
    const reason = outcome.contribution === "negative"
      ? `Each account loses ${loss} after variable costs. More accounts make the gap bigger.`
      : `Each account leaves ${formatMoney(0n, currency)} after variable costs, so more accounts never cover fixed costs.`;
    return { value: "No break-even point", lines: [reason, fix] };
  }
  if (outcome.contribution === "zero") {
    return {
      value: "Breaks even at any MRR",
      lines: [`Fixed costs and contribution are both ${formatMoney(0n, currency)}.`, fix],
    };
  }
  return {
    value: `Only at ${currencySymbol(currency)}0 MRR`,
    lines: [`Each account loses ${loss} after variable costs.`, fix],
  };
}

function BreakEvenResults({ resultRef, values }: { resultRef: RefObject<HTMLOutputElement | null>; values: BreakEvenMrrValues }) {
  const { currency, current, outcome } = values;
  const lead = leadCopy(values);
  const finite = outcome.kind === "finite" ? outcome : null;
  const accounts = finite?.accounts ?? null;

  const currentItems: UiMetric[] = [];
  if (current) {
    currentItems.push({ id: "result", label: "Monthly result now", value: formatMoney(current.monthlyResultCents, currency) });
    if (current.mrrGapCents !== null) {
      currentItems.push(current.mrrGapCents < 0n
        ? { id: "gap", label: "Above break-even by", value: formatMoney(-current.mrrGapCents, currency) }
        : { id: "gap", label: "MRR still needed", value: formatMoney(current.mrrGapCents, currency) });
    }
    if (current.additionalAccounts !== null && values.monthlyArpaCents !== null) {
      currentItems.push({
        id: "accounts",
        label: `More accounts at ${formatMoney(values.monthlyArpaCents, currency)} ARPA`,
        value: formatInteger(current.additionalAccounts),
      });
    }
  }
  const showProgress = finite !== null && current !== null && current.mrrGapCents !== null && current.mrrGapCents > 0n;

  const tableRows = [
    ...values.fixedCosts.map((line) => ({
      id: line.id,
      cells: {
        cost: line.name,
        entered: `${formatMoney(line.enteredCents, currency)} a ${line.period}`,
        monthly: formatMoney(line.monthlyCents, currency),
      },
    })),
    {
      id: "total",
      cells: { cost: <strong>Total</strong>, entered: "", monthly: <strong>{formatMoney(values.fixedMonthlyCents, currency)}</strong> },
    },
  ];

  const keyValues = [
    {
      label: "Monthly ARPA",
      value: values.monthlyArpaCents === null ? "Not entered" : formatMoney(values.monthlyArpaCents, currency),
    },
    values.variableMethod === "perAccount"
      ? { label: "Variable cost per account", value: formatMoney(values.variableCostPerAccountCents ?? 0n, currency) }
      : { label: "Variable costs", value: `${formatPercent(values.variableCostShareHundredths ?? 0n, false)} of MRR` },
    {
      label: "Contribution per account",
      value: values.contributionPerAccountCents === null
        ? "Needs monthly ARPA"
        : formatMoney(values.contributionPerAccountCents, currency),
    },
    { label: "Contribution ratio", value: formatPercent(values.contributionRatioHundredths, true) },
  ];

  return (
    <section aria-label="Break-even MRR results" className={styles.results}>
      <div className={styles.answer}>
        <UiPrimaryResult
          detail={(
            <span className={styles.detailLines}>
              {lead.lines.map((line) => <span key={line}>{line}</span>)}
            </span>
          )}
          inputRef={resultRef}
          label="Break-even MRR"
          value={lead.value}
        />
        {finite && accounts !== null && finite.mrrAtAccountsCents !== null && finite.leftAfterFixedCents !== null ? (
          <UiMetricGroup
            ariaLabel="Whole paying accounts"
            items={[
              { id: "accounts", label: "Paying accounts needed", value: formatInteger(accounts) },
              { id: "mrr", label: `MRR at ${formatInteger(accounts)} accounts`, value: formatMoney(finite.mrrAtAccountsCents, currency) },
              {
                id: "left",
                label: `Left after fixed costs at ${formatInteger(accounts)} accounts`,
                value: formatMoney(finite.leftAfterFixedCents, currency),
              },
            ]}
          />
        ) : null}
        {finite && finite.accountsUnknownReason === "arpaMissing" ? (
          <p className={styles.note}>Add monthly ARPA to see how many accounts this takes.</p>
        ) : null}
      </div>

      {current ? (
        <section aria-labelledby="break-even-now-title" className={styles.resultGroup}>
          <h2 id="break-even-now-title">Where you are now</h2>
          {showProgress && finite ? (
            <UiProgressBar
              label="Current MRR toward break-even"
              max={Number(finite.breakEvenMrrCents)}
              value={Number(current.mrrCents)}
              valueText={`${formatMoney(current.mrrCents, currency)} of ${formatMoney(finite.breakEvenMrrCents, currency)}`}
            />
          ) : null}
          <UiMetricGroup ariaLabel="Where you are now" items={currentItems} />
        </section>
      ) : null}

      <section aria-labelledby="break-even-inputs-title" className={styles.resultGroup}>
        <h2 id="break-even-inputs-title">What the answer uses</h2>
        <UiDataTable
          ariaLabel="Fixed costs"
          caption="Fixed costs"
          columns={[
            { id: "cost", label: "Cost" },
            { id: "entered", label: "Entered", align: "right" },
            { id: "monthly", label: "Per month", align: "right" },
          ]}
          rows={tableRows}
        />
        <UiKeyValueList rows={keyValues} />
        <p className={styles.formula}>
          {values.variableMethod === "perAccount"
            ? "Break-even MRR = fixed costs ÷ contribution ratio. Accounts = fixed costs ÷ contribution per account, rounded up."
            : "Break-even MRR = fixed costs ÷ (1 − variable share)."}
        </p>
      </section>
    </section>
  );
}

/* ---------------- form ---------------- */

export function BreakEvenMrrCalculator() {
  const [lines, setLines] = useState<BreakEvenMrrFixedCostInput[]>(() => [emptyLine("cost-1")]);
  const [fields, setFields] = useState<FormFields>(emptyFields);
  const [errors, setErrors] = useState<BreakEvenMrrErrors>({});
  const [result, setResult] = useState<BreakEvenMrrValues | null>(null);
  const [status, setStatus] = useState<StatusMessage | null>(null);
  const nextLineId = useRef(2);
  const formRef = useRef<HTMLFormElement>(null);
  const resultRef = useRef<HTMLOutputElement>(null);

  const shareMode = fields.variableMethod === "shareOfMrr";
  const atLimit = lines.length >= BREAK_EVEN_MRR_MAX_FIXED_COST_LINES;

  useLayoutEffect(() => {
    const form = formRef.current;
    if (!form) return;
    lines.forEach((line, index) => {
      const number = index + 1;
      form.querySelector<HTMLElement>(`[data-focus-key="fixedCosts.${line.id}.name"]`)
        ?.setAttribute("aria-label", `Fixed cost ${number} name`);
      form.querySelector<HTMLElement>(`[data-focus-key="fixedCosts.${line.id}.amount"]`)
        ?.setAttribute("aria-label", `Fixed cost ${number} amount`);
    });
  });

  function clearForEdit(announce?: string) {
    const hadResult = result !== null;
    setErrors({});
    setResult(null);
    if (hadResult) setStatus({ text: CHANGED, tone: "neutral" });
    else if (announce) setStatus({ text: announce, tone: "neutral" });
    else if (status?.text !== CHANGED) setStatus(null);
  }

  function updateField<K extends keyof FormFields>(field: K, value: FormFields[K]) {
    setFields((current) => ({ ...current, [field]: value }));
    clearForEdit();
  }

  function updateLine(id: string, field: LineField, value: string) {
    setLines((current) => current.map((line) => line.id === id ? { ...line, [field]: value } : line));
    clearForEdit();
  }

  function addLine() {
    if (atLimit) return;
    const line = emptyLine(`cost-${nextLineId.current++}`);
    setLines((current) => current.length >= BREAK_EVEN_MRR_MAX_FIXED_COST_LINES ? current : [...current, line]);
    clearForEdit(`Fixed cost ${lines.length + 1} added.`);
  }

  function removeLine(id: string) {
    const index = lines.findIndex((line) => line.id === id);
    const label = index >= 0 ? lineLabel(lines[index], index) : "Fixed cost";
    setLines((current) => current.filter((line) => line.id !== id));
    clearForEdit(`${label} removed.`);
  }

  function focusKey(key: string) {
    requestAnimationFrame(() => {
      formRef.current?.querySelector<HTMLElement>(`[data-focus-key="${key}"]`)?.focus();
    });
  }

  function focusFirstError(nextErrors: BreakEvenMrrErrors) {
    const order: BreakEvenMrrFieldKey[] = [
      "currency",
      ...lines.flatMap((line) => [
        `fixedCosts.${line.id}.name`,
        `fixedCosts.${line.id}.amount`,
        `fixedCosts.${line.id}.period`,
      ] as const),
      "fixedCosts",
      "variableMethod",
      "monthlyArpa",
      shareMode ? "variableCostSharePercent" : "variableCostPerAccount",
      "currentMrr",
    ];
    const first = order.find((key) => nextErrors[key]);
    if (!first) return;
    if (first === "fixedCosts") {
      requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>("[data-repeatable-add]")?.focus());
    } else {
      focusKey(first);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);
    try {
      const calculation = calculateBreakEvenMrr({ ...fields, fixedCosts: lines });
      if (calculation.status === "invalid") {
        setErrors(calculation.errors);
        setResult(null);
        if (calculation.errors.form) setStatus({ text: calculation.errors.form, tone: "danger" });
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
    const first = emptyLine(`cost-${nextLineId.current++}`);
    setLines([first]);
    setFields(emptyFields());
    setErrors({});
    setResult(null);
    setStatus({ text: "Form reset.", tone: "neutral" });
    focusKey(`fixedCosts.${first.id}.name`);
  }

  const listNote = errors.fixedCosts ?? (atLimit ? "Up to 20 costs." : undefined);

  return (
    <section aria-label="Break-even MRR calculator" className={styles.workbench} data-tool-workbench>
      <div className={styles.content}>
        <form aria-label="Break-even MRR inputs" className={styles.form} noValidate onSubmit={submit} ref={formRef}>
          <section aria-labelledby="break-even-fixed-title" className={styles.group}>
            <div className={styles.groupHeader}>
              <div className={styles.groupTitle}>
                <h2 id="break-even-fixed-title">Fixed monthly costs</h2>
                <p className={styles.helper}>Costs that stay the same as you add accounts. Include your own pay if this should cover it.</p>
              </div>
              <div className={styles.currency}>
                <UiSelect
                  dataFocusKey="currency"
                  error={errors.currency ?? null}
                  label="Currency"
                  onChange={(value) => {
                    if (!SAAS_ECONOMICS_CURRENCIES.includes(value as SaasEconomicsCurrency)) return;
                    updateField("currency", value);
                  }}
                  options={SAAS_ECONOMICS_CURRENCIES.map((currency) => uiOption(currency, currency))}
                  required
                  value={fields.currency}
                />
              </div>
            </div>
            <div className={styles.lineList}>
              <UiRepeatableList
                addDescription={listNote}
                addDescriptionIsError={Boolean(errors.fixedCosts)}
                addDisabled={atLimit}
                addLabel="Add cost"
                ariaLabel="Fixed costs"
                items={lines}
                onAdd={addLine}
                onRemove={removeLine}
                removeLabel={(line, index) => `Remove ${lineLabel(line, index)}`}
                renderItem={(line, index) => (
                  <fieldset className={styles.line}>
                    <legend className={styles.visuallyHidden}>Fixed cost {index + 1}</legend>
                    <UiTextField
                      autoCapitalize="none"
                      className={styles.lineName}
                      dataFocusKey={`fixedCosts.${line.id}.name`}
                      error={errors[`fixedCosts.${line.id}.name`] ?? null}
                      label="Name"
                      onChange={(value) => updateLine(line.id, "name", value)}
                      placeholder={`Fixed cost ${index + 1}`}
                      value={line.name}
                    />
                    <UiTextField
                      autoCapitalize="none"
                      className={styles.lineAmount}
                      dataFocusKey={`fixedCosts.${line.id}.amount`}
                      error={errors[`fixedCosts.${line.id}.amount`] ?? null}
                      inputMode="decimal"
                      label="Amount"
                      onChange={(value) => updateLine(line.id, "amount", value)}
                      required
                      spellCheck={false}
                      suffix={fields.currency}
                      value={line.amount}
                    />
                    <div className={styles.linePeriod}>
                      <UiSelect
                        ariaLabel={`Fixed cost ${index + 1} period`}
                        dataFocusKey={`fixedCosts.${line.id}.period`}
                        error={errors[`fixedCosts.${line.id}.period`] ?? null}
                        label="Period"
                        onChange={(value) => updateLine(line.id, "period", value)}
                        options={[uiOption("month", "per month"), uiOption("year", "per year")]}
                        value={line.period}
                      />
                    </div>
                  </fieldset>
                )}
              />
            </div>
          </section>

          <section aria-labelledby="break-even-revenue-title" className={styles.group}>
            <h2 id="break-even-revenue-title">Revenue and variable costs</h2>
            <UiChoiceGroup
              dataFocusKey="variableMethod"
              error={errors.variableMethod ?? null}
              label="Variable costs"
              onChange={(value) => {
                if (value !== "perAccount" && value !== "shareOfMrr") return;
                updateField("variableMethod", value);
              }}
              options={[uiOption("perAccount", "Per account"), uiOption("shareOfMrr", "Share of MRR")]}
              required
              value={fields.variableMethod}
            />
            <div className={styles.fieldGrid}>
              <UiTextField
                autoCapitalize="none"
                dataFocusKey="monthlyArpa"
                description={shareMode ? "Optional. Needed for the account count." : undefined}
                error={errors.monthlyArpa ?? null}
                inputMode="decimal"
                label="Monthly ARPA"
                onChange={(value) => updateField("monthlyArpa", value)}
                required={!shareMode}
                spellCheck={false}
                suffix={fields.currency}
                value={fields.monthlyArpa}
              />
              {shareMode ? (
                <UiTextField
                  autoCapitalize="none"
                  dataFocusKey="variableCostSharePercent"
                  description="Costs that grow with revenue, like payment fees."
                  error={errors.variableCostSharePercent ?? null}
                  inputMode="decimal"
                  key="share"
                  label="Variable costs as a share of MRR"
                  onChange={(value) => updateField("variableCostSharePercent", value)}
                  required
                  spellCheck={false}
                  suffix="%"
                  value={fields.variableCostSharePercent}
                />
              ) : (
                <UiTextField
                  autoCapitalize="none"
                  dataFocusKey="variableCostPerAccount"
                  description="Costs that grow with each paying account, like usage hosting or per-seat tools."
                  error={errors.variableCostPerAccount ?? null}
                  inputMode="decimal"
                  key="per-account"
                  label="Variable cost per account"
                  onChange={(value) => updateField("variableCostPerAccount", value)}
                  required
                  spellCheck={false}
                  suffix={fields.currency}
                  value={fields.variableCostPerAccount}
                />
              )}
            </div>
          </section>

          <div className={styles.fieldGrid}>
            <UiTextField
              autoCapitalize="none"
              dataFocusKey="currentMrr"
              error={errors.currentMrr ?? null}
              inputMode="decimal"
              label="Current MRR (optional)"
              onChange={(value) => updateField("currentMrr", value)}
              spellCheck={false}
              suffix={fields.currency}
              value={fields.currentMrr}
            />
          </div>

          <UiActionRow>
            <UiButton type="submit" variant="primary">Calculate break-even MRR</UiButton>
            <UiButton onPress={reset} type="button" variant="secondary">
              <RotateCcw aria-hidden="true" size={17} />
              Reset
            </UiButton>
          </UiActionRow>
          {status ? <UiStatus tone={status.tone}>{status.text}</UiStatus> : null}
        </form>
        {result ? <BreakEvenResults resultRef={resultRef} values={result} /> : null}
      </div>
    </section>
  );
}
