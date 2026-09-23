"use client";

import { CalendarClock, RotateCcw } from "lucide-react";
import { useRef, useState, type FormEvent } from "react";
import { UiButton, UiChoiceGroup, UiTextField, uiOption } from "@/app/ui/controls";
import { UiActionRow, UiDataTable, UiPrimaryResult, UiStatus } from "@/app/ui/display";
import {
  calculateKdpPaymentDate,
  formatKdpPaymentMonth,
  type KdpPaymentDateResult,
  type KdpPaymentDistribution,
} from "@/lib/kdp-payment-date-calculator/engine";
import styles from "./kdp-payment-date-calculator.module.css";

const distributionOptions = [
  uiOption("standard", "Standard"),
  uiOption("expanded", "Expanded Distribution"),
];

const paymentTimingUrl = "https://kdp.amazon.com/en_US/help/topic/GK2MKZUL6U3SFBPZ";
const paymentThresholdsUrl = "https://kdp.amazon.com/en_US/help/topic/G201207800";
const paymentReportUrl = "https://kdp.amazon.com/en_US/help/topic/G201436840";

function issuesFor(result: KdpPaymentDateResult | null, field: "reportedMonth" | "distribution") {
  return result?.status === "invalid"
    ? result.issues.find((issue) => issue.field === field)?.message ?? null
    : null;
}

function distributionLabel(distribution: KdpPaymentDistribution) {
  return distribution === "standard" ? "Standard" : "Expanded Distribution";
}

export function KdpPaymentDateCalculator() {
  const [reportedMonth, setReportedMonth] = useState("");
  const [distribution, setDistribution] = useState<KdpPaymentDistribution>("standard");
  const [result, setResult] = useState<KdpPaymentDateResult | null>(null);
  const [resetNotice, setResetNotice] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const [failure, setFailure] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const monthRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLOutputElement>(null);

  function clearSubmittedState() {
    const hadEstimate = result?.status === "valid";
    setResult(null);
    setFailure("");
    setResetNotice("");
    setAnnouncement(hadEstimate ? "Inputs changed. Estimate again." : "");
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResetNotice("");
    setAnnouncement("");

    try {
      const next = calculateKdpPaymentDate({ reportedMonth, distribution });
      setResult(next);
      setFailure("");
      requestAnimationFrame(() => {
        if (next.status === "valid") {
          resultRef.current?.focus();
          return;
        }
        const firstField = next.issues[0]?.field ?? "reportedMonth";
        formRef.current?.querySelector<HTMLElement>(`[data-focus-key="${firstField}"]`)?.focus();
      });
    } catch {
      setResult(null);
      setFailure("The estimate could not be calculated. Try again.");
    }
  }

  function reset() {
    setReportedMonth("");
    setDistribution("standard");
    setResult(null);
    setFailure("");
    setAnnouncement("");
    setResetNotice("Calculator reset.");
    requestAnimationFrame(() => monthRef.current?.focus());
  }

  const values = result?.status === "valid" ? result.values : null;
  const emptyPrompt = result === null && !failure;

  return (
    <section aria-label="KDP payment timing inputs and results" className={styles.tool} data-tool-workbench>
      <form className={styles.form} noValidate onSubmit={submit} ref={formRef}>
        <UiTextField
          autoCapitalize="none"
          autoComplete="off"
          className={styles.monthField}
          dataFocusKey="reportedMonth"
          description="Enter the month from your KDP royalty report as YYYY-MM."
          error={issuesFor(result, "reportedMonth")}
          inputRef={monthRef}
          label="Reported earnings month"
          onChange={(value) => {
            setReportedMonth(value);
            clearSubmittedState();
          }}
          placeholder="2026-01"
          required
          spellCheck={false}
          value={reportedMonth}
        />
        <UiChoiceGroup
          dataFocusKey="distribution"
          description="Choose Expanded Distribution only for royalties reported through that program."
          error={issuesFor(result, "distribution")}
          label="Distribution"
          onChange={(value) => {
            setDistribution(value as KdpPaymentDistribution);
            clearSubmittedState();
          }}
          options={distributionOptions}
          required
          value={distribution}
        />
        <UiActionRow>
          <div className={styles.actions}>
            <UiButton type="submit" variant="primary"><CalendarClock aria-hidden="true" size={17} /> Estimate payment month</UiButton>
            <UiButton onPress={reset} type="button"><RotateCcw aria-hidden="true" size={17} /> Reset</UiButton>
          </div>
        </UiActionRow>
        {failure ? <UiStatus tone="danger">{failure}</UiStatus> : null}
        {resetNotice ? <UiStatus>{resetNotice}</UiStatus> : null}
        <p aria-live="polite" className={styles.visuallyHidden}>{announcement}</p>
      </form>

      <section aria-label="Estimated payment schedule" className={styles.result}>
        {values ? (
          <div className={styles.resultContent}>
            <UiPrimaryResult
              detail="Amazon usually issues payment toward the end of this month. Allow extra time for delivery."
              inputRef={resultRef}
              label="Approximate payment month"
              value={formatKdpPaymentMonth(values.paymentMonth)}
            />
            <p>
              Direct deposit has no KDP payment threshold. Check and wire payments must meet the <a href={paymentThresholdsUrl}>threshold for each marketplace</a>. Balances below the threshold carry forward and can be paid later. This calculator can't confirm your payment eligibility or status.
            </p>
            <p>
              For {formatKdpPaymentMonth(values.reportedMonth)}, the {distributionLabel(values.distribution)} estimate adds {values.monthOffset === 2 ? "two" : "three"} calendar months, based on KDP's approximate {values.monthOffset === 2 ? "60" : "90"}-day schedule.
            </p>
            <section aria-labelledby="kdp-payment-delivery-heading" className={styles.delivery}>
              <h2 className={styles.sectionTitle} id="kdp-payment-delivery-heading">After Amazon issues payment</h2>
              <p>Allow the following time from the actual payment date. These are delivery estimates.</p>
              <UiDataTable
                ariaLabel="Typical payment delivery estimates"
                columns={[
                  { id: "method", label: "Payment method" },
                  { id: "delivery", label: "Typical delivery after issue" },
                ]}
                rows={[
                  { id: "eft", cells: { method: "Direct deposit", delivery: "1 to 5 business days" } },
                  { id: "india-eft", cells: { method: "Direct deposit to banks in India", delivery: "7 to 10 business days" } },
                  { id: "wire", cells: { method: "Wire transfer", delivery: "5 to 10 days" } },
                  { id: "check", cells: { method: "Check", delivery: "Up to 30 days" } },
                ]}
              />
            </section>
            <p>Check your KDP Payment Report for an actual payment's date and status. <a href={paymentReportUrl}>Understand your Payment Report</a>.</p>
            <p className={styles.sourceNote}>Based on <a href={paymentTimingUrl}>KDP payment timing</a>. Rules checked 23 September 2026.</p>
          </div>
        ) : emptyPrompt ? (
          <p className={styles.emptyPrompt}>Enter a reported earnings month to see the payment estimate.</p>
        ) : null}
      </section>
    </section>
  );
}
