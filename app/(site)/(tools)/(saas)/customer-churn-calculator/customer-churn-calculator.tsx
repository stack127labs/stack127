"use client";

import { RotateCcw } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { UiButton, UiTextField } from "@/app/ui/controls";
import { UiActionRow, UiKeyValueList, UiPrimaryResult, UiStatus } from "@/app/ui/display";
import { calculateCustomerChurn, type CustomerChurnValidationErrors, type CustomerChurnValues } from "@/lib/customer-churn-calculator/engine";
import styles from "./customer-churn-calculator.module.css";

function formatCount(value: number) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);
}

function formatChurnRate(values: CustomerChurnValues) {
  if (values.churnBasisPoints === null) return "Unavailable";
  if (values.lostAccounts > 0 && values.lostAccounts * 10_000 < values.openingAccounts) return "<0.01%";

  const whole = Math.floor(values.churnBasisPoints / 100);
  const fraction = String(values.churnBasisPoints % 100).padStart(2, "0");
  return `${whole}.${fraction}%`;
}

export function CustomerChurnCalculator() {
  const [isHydrated, setIsHydrated] = useState(false);
  const [openingAccounts, setOpeningAccounts] = useState("");
  const [lostAccounts, setLostAccounts] = useState("");
  const [errors, setErrors] = useState<CustomerChurnValidationErrors>({});
  const [result, setResult] = useState<CustomerChurnValues | null>(null);
  const [status, setStatus] = useState("");
  const [unexpectedFailure, setUnexpectedFailure] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const resultRef = useRef<HTMLOutputElement>(null);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  function focusField(field: "openingAccounts" | "lostAccounts") {
    requestAnimationFrame(() => {
      formRef.current?.querySelector<HTMLInputElement>(`[data-focus-key="${field}"]`)?.focus();
    });
  }

  function clearForEdit() {
    const hadResult = result !== null;
    setResult(null);
    setErrors({});
    setUnexpectedFailure(false);
    setStatus((current) => {
      if (hadResult) return "The counts changed. Calculate customer churn again.";
      return current === "Calculator reset." ? "" : current;
    });
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("");
    setUnexpectedFailure(false);

    try {
      const calculation = calculateCustomerChurn({ openingAccounts, lostAccounts });
      if (calculation.status === "invalid") {
        setErrors(calculation.errors);
        setResult(null);
        focusField(calculation.errors.openingAccounts ? "openingAccounts" : "lostAccounts");
        return;
      }

      setErrors({});
      setResult(calculation.values);
      requestAnimationFrame(() => resultRef.current?.focus());
    } catch {
      setResult(null);
      setErrors({});
      setUnexpectedFailure(true);
    }
  }

  function reset() {
    setOpeningAccounts("");
    setLostAccounts("");
    setErrors({});
    setResult(null);
    setUnexpectedFailure(false);
    setStatus("Calculator reset.");
    focusField("openingAccounts");
  }

  return (
    <section aria-label="Customer churn inputs and results" className={styles.workbench} data-tool-workbench>
      <div className={styles.content}>
        <form aria-label="Customer churn inputs" className={styles.form} noValidate onSubmit={submit} ref={formRef}>
          <div className={styles.fieldGrid}>
            <UiTextField
              autoCapitalize="off"
              dataFocusKey="openingAccounts"
              description="Count active, paying accounts at the start of one reporting period."
              error={errors.openingAccounts ?? null}
              inputMode="numeric"
              label="Opening paying accounts"
              onChange={(value) => {
                setOpeningAccounts(value);
                clearForEdit();
              }}
              required
              spellCheck={false}
              value={openingAccounts}
            />
            <UiTextField
              autoCapitalize="off"
              dataFocusKey="lostAccounts"
              description="Of those opening accounts, count those still not paying at the end. Exclude accounts that joined later."
              error={errors.lostAccounts ?? null}
              inputMode="numeric"
              label="Lost opening accounts"
              onChange={(value) => {
                setLostAccounts(value);
                clearForEdit();
              }}
              required
              spellCheck={false}
              value={lostAccounts}
            />
          </div>

          <UiActionRow>
            <UiButton isDisabled={!isHydrated} type="submit" variant="primary">Calculate customer churn</UiButton>
            <UiButton onPress={reset} type="button">
              <RotateCcw aria-hidden="true" size={17} />
              Reset
            </UiButton>
          </UiActionRow>

          {status ? <UiStatus>{status}</UiStatus> : null}
          {unexpectedFailure
            ? <UiStatus tone="danger">Customer churn could not be calculated. Try again.</UiStatus>
            : null}
        </form>

        {result ? (
          <div className={styles.results}>
            <UiPrimaryResult
              detail={result.churnBasisPoints === null
                ? "For the reporting period. No paying accounts at the start."
                : "For the reporting period."}
              inputRef={resultRef}
              label="Customer churn"
              value={formatChurnRate(result)}
            />
            <UiKeyValueList rows={[
              { label: "Opening paying accounts", value: formatCount(result.openingAccounts) },
              { label: "Lost from opening accounts", value: formatCount(result.lostAccounts) },
              { label: "Opening accounts still paying at end", value: formatCount(result.retainedOpeningAccounts) },
            ]} />
          </div>
        ) : null}
      </div>
    </section>
  );
}
