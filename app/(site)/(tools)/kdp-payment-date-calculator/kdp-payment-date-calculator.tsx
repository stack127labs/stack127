"use client";

import { CalendarClock, RotateCcw } from "lucide-react";
import { useRef, useState, type FormEvent } from "react";
import {
  ToolActionRow,
  ToolButton,
  ToolChoiceGroup,
  ToolDataTable,
  ToolPrimaryResult,
  ToolStatus,
  ToolTextField,
  toolOption,
} from "@/app/tool-ui/tool-controls";
import {
  calculateKdpPaymentDate,
  formatKdpPaymentMonth,
  type KdpPaymentDateResult,
  type KdpPaymentDistribution,
} from "@/lib/kdp-payment-date-calculator/engine";
import styles from "./kdp-payment-date-calculator.module.css";

const distributionOptions = [
  toolOption("standard", "Standard"),
  toolOption("expanded", "Expanded Distribution"),
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
        <ToolTextField
          autoCapitalize="none"
          autoComplete="off"
          className={styles.monthField}
          dataFocusKey="reportedMonth"
          description="Use YYYY-MM for the month shown in your KDP royalty report."
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
        <ToolChoiceGroup
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
        <ToolActionRow>
          <div className={styles.actions}>
            <ToolButton type="submit" variant="primary"><CalendarClock aria-hidden="true" size={17} /> Estimate payment month</ToolButton>
            <ToolButton onPress={reset} type="button"><RotateCcw aria-hidden="true" size={17} /> Reset</ToolButton>
          </div>
        </ToolActionRow>
        {failure ? <ToolStatus tone="danger">{failure}</ToolStatus> : null}
        {resetNotice ? <ToolStatus>{resetNotice}</ToolStatus> : null}
        <p aria-live="polite" className={styles.visuallyHidden}>{announcement}</p>
      </form>

      <section aria-label="Estimated payment schedule" className={styles.result}>
        {values ? (
          <div className={styles.resultContent}>
            <ToolPrimaryResult
              detail="Usually toward the end of the month. This estimates when Amazon issues payment."
              inputRef={resultRef}
              label="Approximate payment month"
              value={formatKdpPaymentMonth(values.paymentMonth)}
            />
            <p>
              Direct deposit has no KDP payment threshold. Check and wire payments depend on the <a href={paymentThresholdsUrl}>threshold for each marketplace</a>. A balance below its threshold carries forward, so payment can be later. This tool cannot confirm your payment eligibility or status.
            </p>
            <p>
              For {formatKdpPaymentMonth(values.reportedMonth)}, {distributionLabel(values.distribution)} estimates a payment month {values.monthOffset} calendar months later, based on KDP's approximate {values.monthOffset === 2 ? "60" : "90"}-day payment schedule.
            </p>
            <section aria-labelledby="kdp-payment-delivery-heading" className={styles.delivery}>
              <h2 className={styles.sectionTitle} id="kdp-payment-delivery-heading">After Amazon issues payment</h2>
              <p>Arrival takes extra time. These are delivery estimates, not guaranteed receipt dates.</p>
              <ToolDataTable
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
            <p>Use your <a href={paymentReportUrl}>KDP Payment Report</a> to check an actual payment.</p>
            <p className={styles.sourceNote}>Schedule source: <a href={paymentTimingUrl}>KDP payment timing</a>. Rules checked 23 September 2026.</p>
          </div>
        ) : emptyPrompt ? (
          <p className={styles.emptyPrompt}>Enter a reported month to estimate payment timing.</p>
        ) : null}
      </section>
    </section>
  );
}
