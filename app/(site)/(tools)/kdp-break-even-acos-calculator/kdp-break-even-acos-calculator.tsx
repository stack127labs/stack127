"use client";

import { useRef, useState, type FormEvent } from "react";
import {
  UiActionRow,
  UiKeyValueList,
  UiPrimaryResult,
  UiResultLead,
  UiStatus,
  UiStatusWord,
} from "@/app/ui/display";
import { UiButton, UiTextField } from "@/app/ui/controls";
import {
  calculateKdpBreakEvenAcos,
  formatKdpBreakEvenAcos,
  formatKdpBreakEvenMoneyCents,
  formatKdpBreakEvenPurchaseRate,
  type KdpBreakEvenField,
  type KdpBreakEvenFieldErrors,
  type KdpBreakEvenInput,
  type KdpBreakEvenResult,
} from "@/lib/kdp/break-even-acos.ts";
import styles from "./kdp-break-even-acos-calculator.module.css";

const FIELD_ORDER: KdpBreakEvenField[] = ["royalty", "profitTarget", "purchaseRate", "cpc", "salesValue"];
const INPUT_FIELD: Record<keyof KdpBreakEvenInput, KdpBreakEvenField> = {
  royaltyText: "royalty",
  profitTargetText: "profitTarget",
  purchaseRateText: "purchaseRate",
  cpcText: "cpc",
  salesValueText: "salesValue",
};

function initialInput(): KdpBreakEvenInput {
  return {
    royaltyText: "",
    profitTargetText: "$0.00",
    purchaseRateText: "",
    cpcText: "",
    salesValueText: "",
  };
}

function firstInvalidField(errors: KdpBreakEvenFieldErrors): KdpBreakEvenField | null {
  return FIELD_ORDER.find((field) => errors[field]) ?? null;
}

function formattedRate(basisPoints: number) {
  return formatKdpBreakEvenPurchaseRate(basisPoints);
}

function resultDetail(values: Extract<KdpBreakEvenResult, { status: "calculated" }>['values']) {
  return `At ${formatKdpBreakEvenMoneyCents(values.royaltyCents)} royalty, ${formatKdpBreakEvenMoneyCents(values.profitTargetCents)} target, and ${formattedRate(values.purchaseRateBasisPoints)} purchase rate.`;
}

function requiredRateLabel(values: Extract<KdpBreakEvenResult, { status: "calculated" }>['values']) {
  switch (values.requiredRate.kind) {
    case "rate":
      return formattedRate(values.requiredRate.hundredthsOfPercent);
    case "any-positive":
      return "Any positive purchase rate";
    case "above-100":
      return "Above 100% — unattainable";
    case "no-headroom":
      return "No rate can cover a positive CPC";
    case "target-exceeds-royalty":
      return "Target exceeds royalty";
  }
}

function leadMessage(values: Extract<KdpBreakEvenResult, { status: "calculated" }>['values']) {
  if (values.purchaseRateBasisPoints === 0) {
    const noPurchaseText = "No positive CPC at 0% purchases. A positive CPC spends money with no attributed purchases under this assumption.";
    if (values.headroomCents < 0) {
      const excess = formatKdpBreakEvenMoneyCents(-values.headroomCents);
      return `No positive CPC at 0% purchases. Positive CPC spends without attributed purchases, and the target also exceeds royalty by ${excess} per sale.`;
    }
    return noPurchaseText;
  }
  if (values.headroomCents < 0) {
    const excess = formatKdpBreakEvenMoneyCents(-values.headroomCents);
    return `Target exceeds royalty by ${excess} per sale. It is unattainable even before advertising.`;
  }
  if (values.headroomCents === 0 && values.cpcCents > 0) {
    return "With zero headroom, the CPC ceiling is $0.00. No positive CPC can meet the target.";
  }
  return null;
}

function optionalAcosRows(values: Extract<KdpBreakEvenResult, { status: "calculated" }>['values']) {
  return [
    {
      label: "Modeled ACoS at entered CPC",
      value: values.modeledAcosTenthsPercent === null
        ? "Unavailable at 0% purchases"
        : formatKdpBreakEvenAcos(values.modeledAcosTenthsPercent),
    },
    {
      label: "ACoS ceiling for your target",
      value: values.targetAcosTenthsPercent === null
        ? "Unavailable because the target exceeds royalty"
        : formatKdpBreakEvenAcos(values.targetAcosTenthsPercent),
    },
  ];
}

export function KdpBreakEvenAcosCalculator() {
  const [input, setInput] = useState<KdpBreakEvenInput>(initialInput);
  const [result, setResult] = useState<KdpBreakEvenResult | null>(null);
  const [fieldErrors, setFieldErrors] = useState<KdpBreakEvenFieldErrors>({});
  const [failure, setFailure] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const royaltyRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLOutputElement>(null);
  const leadRef = useRef<HTMLParagraphElement>(null);

  function update(field: keyof KdpBreakEvenInput, value: string) {
    const hadAnswer = result?.status === "calculated";
    setInput((current) => ({ ...current, [field]: value }));
    setResult(null);
    setFailure("");
    setFieldErrors((current) => {
      const next = { ...current };
      delete next[INPUT_FIELD[field]];
      return next;
    });
    if (hadAnswer) setAnnouncement("Inputs changed. Check bid again.");
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAnnouncement("");
    setFailure("");
    try {
      const next = calculateKdpBreakEvenAcos(input);
      if (next.status === "invalid") {
        setResult(null);
        setFieldErrors(next.fieldErrors);
        const first = firstInvalidField(next.fieldErrors);
        if (first) {
          requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>(`[data-focus-key="${first}"]`)?.focus());
        }
        return;
      }
      setFieldErrors({});
      if (next.status === "unavailable") {
        setResult(null);
        setFailure(next.message);
        return;
      }

      setResult(next);
      const useLead = next.values.headroomCents < 0
        || next.values.purchaseRateBasisPoints === 0
        || (next.values.headroomCents === 0 && next.values.cpcCents > 0);
      requestAnimationFrame(() => {
        if (useLead) leadRef.current?.focus();
        else resultRef.current?.focus();
      });
    } catch {
      setResult(null);
      setFieldErrors({});
      setFailure("The bid check could not be calculated. Your inputs are still here; try again.");
    }
  }

  function reset() {
    setInput(initialInput());
    setResult(null);
    setFieldErrors({});
    setFailure("");
    setAnnouncement("Calculator reset");
    requestAnimationFrame(() => royaltyRef.current?.focus());
  }

  const values = result?.status === "calculated" ? result.values : null;
  const lead = values ? leadMessage(values) : null;
  const enteredVerdict = values?.meetsTarget;

  return (
    <section aria-label="KDP break-even ACoS calculator" className={styles.tool} data-tool-workbench>
      <form className={styles.form} noValidate onSubmit={submit} ref={formRef}>
        <div className={styles.contextGrid}>
          <div className={styles.royaltyField}>
            <UiTextField
              dataFocusKey="royalty"
              description="Net KDP royalty after KDP deductions and before ads, for one sale."
              error={fieldErrors.royalty}
              inputMode="decimal"
              inputRef={royaltyRef}
              label="Net royalty per sale (USD)"
              name="royalty"
              onChange={(value) => update("royaltyText", value)}
              required
              spellCheck={false}
              value={input.royaltyText}
            />
            <a className={styles.royaltyLink} href="/kdp-royalty-calculator">Estimate royalty</a>
          </div>
          <UiTextField
            dataFocusKey="profitTarget"
            description="Your chosen amount left per ad-attributed sale after ad cost."
            error={fieldErrors.profitTarget}
            inputMode="decimal"
            label="Desired amount left per sale (USD)"
            name="profitTarget"
            onChange={(value) => update("profitTargetText", value)}
            required
            spellCheck={false}
            value={input.profitTargetText}
          />
          <UiTextField
            dataFocusKey="purchaseRate"
            description="Attributed purchases divided by ad clicks. Enter a percent; the % sign is shown after this field."
            error={fieldErrors.purchaseRate}
            inputMode="decimal"
            label="Assumed purchase rate (%)"
            name="purchaseRate"
            onChange={(value) => update("purchaseRateText", value)}
            required
            spellCheck={false}
            suffix="%"
            value={input.purchaseRateText}
          />
          <UiTextField
            dataFocusKey="cpc"
            description="Planned or observed average cost per click, not the Amazon auction bid."
            error={fieldErrors.cpc}
            inputMode="decimal"
            label="CPC to check (USD)"
            name="cpc"
            onChange={(value) => update("cpcText", value)}
            required
            spellCheck={false}
            value={input.cpcText}
          />
          <UiTextField
            className={styles.salesField}
            dataFocusKey="salesValue"
            description="Optional ACoS revenue denominator per purchase. This is sales value, not royalty or list price."
            error={fieldErrors.salesValue}
            inputMode="decimal"
            label="Ad-attributed sales value per purchase (USD)"
            name="salesValue"
            onChange={(value) => update("salesValueText", value)}
            spellCheck={false}
            value={input.salesValueText}
          />
        </div>

        <UiActionRow>
          <UiButton className={styles.submit} type="submit" variant="primary">Check bid</UiButton>
          <UiButton onPress={reset} type="button" variant="ghost">Reset</UiButton>
        </UiActionRow>
      </form>

      {values ? (
        <section aria-label="Bid check result" className={styles.result}>
          <UiStatus tone="success">Bid checked</UiStatus>
          {lead ? (
            <UiResultLead inputRef={leadRef}>{lead}</UiResultLead>
          ) : (
            <UiPrimaryResult
              detail={resultDetail(values)}
              inputRef={resultRef}
              label="Maximum CPC"
              tone={enteredVerdict ? "success" : "warning"}
              value={formatKdpBreakEvenMoneyCents(values.maximumCpcCents ?? 0)}
            />
          )}

          {enteredVerdict !== null ? (
            <p className={styles.verdict}>
              At {formatKdpBreakEvenMoneyCents(values.cpcCents)} CPC: {" "}
              <UiStatusWord tone={enteredVerdict ? "success" : "danger"}>{enteredVerdict ? "Meets target" : "Misses target"}</UiStatusWord>
              {" "}for the entered purchase rate.
            </p>
          ) : (
            <p className={styles.verdict}>No verdict is available because no attributed purchases are assumed.</p>
          )}

          <UiKeyValueList rows={[
            {
              label: "Modeled amount left per attributed sale",
              value: values.modeledAmountLeftCents === null
                ? "Unavailable at 0% purchases"
                : formatKdpBreakEvenMoneyCents(values.modeledAmountLeftCents),
            },
            { label: "Minimum purchase rate at entered CPC", value: requiredRateLabel(values) },
            {
              label: "Modeled click cost per attributed sale",
              value: values.modeledClickCostCents === null
                ? "Unavailable at 0% purchases"
                : formatKdpBreakEvenMoneyCents(values.modeledClickCostCents),
            },
          ]} />

          {values.salesValueCents !== null ? (
            <section aria-label="ACoS comparison" className={styles.acosSection}>
              <h2>ACoS using {formatKdpBreakEvenMoneyCents(values.salesValueCents)} ad-attributed sales value</h2>
              <UiKeyValueList rows={optionalAcosRows(values)} />
            </section>
          ) : null}
        </section>
      ) : failure ? (
        <div className={styles.result}><UiStatus tone="danger">{failure}</UiStatus></div>
      ) : Object.keys(fieldErrors).length === 0 ? (
        <p className={styles.initialPrompt}>Enter a royalty, purchase-rate assumption, and average CPC to check the bid. All amounts should refer to the same book and one attributed purchase. ACoS appears only when you enter ad-attributed sales value.</p>
      ) : null}
      <p aria-live="polite" className={styles.visuallyHidden}>{announcement}</p>
    </section>
  );
}
