"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  UiActionRow,
  UiKeyValueList,
  UiPrimaryResult,
  UiStatus,
} from "@/app/ui/display";
import {
  UiButton,
  UiChoiceGroup,
  UiDisclosure,
  UiTextField,
  uiOption,
} from "@/app/ui/controls";
import {
  calculateKdpKenpEarnings,
  KDP_KENP_SOURCES,
  normalizeKdpKenpCurrencyCode,
  type KdpKenpFieldErrors,
  type KdpKenpInput,
  type KdpKenpResult,
} from "@/lib/kdp/kenp.ts";
import styles from "./kindle-unlimited-kenp-earnings-calculator.module.css";

const BASIS_OPTIONS = [
  uiOption("kdp-reported", "Rate I entered from KDP for this month"),
  uiOption("planning-assumption", "My planning assumption"),
];

function initialInput(): KdpKenpInput {
  return {
    earningsMonthText: "",
    marketplaceText: "",
    currencyCodeText: "",
    kenpReadText: "",
    rateText: "",
    rateBasis: "planning-assumption",
  };
}

function CalculationDetails() {
  return (
    <UiDisclosure label="How this estimate works">
      <div className={styles.details}>
        <p>The estimate multiplies the aggregate KENP Read for one title, month, and marketplace by the per-page rate you enter. The rate is not looked up or verified by this tool.</p>
        <p>The result is rounded once, half up, to the selected currency's usual minor unit. A positive amount below that unit is shown as less than one unit. Zero reads produce a zero amount.</p>
        <p>KDP rates vary by month and marketplace. KDP credits eligible pages read for the first time; rereads do not earn again. The estimate does not account for bonuses, taxes, or other adjustments.</p>
        <ul>
          <li><a href={KDP_KENP_SOURCES.unlimitedRoyalties} rel="noreferrer" target="_blank">Royalties in Kindle Unlimited</a></li>
          <li><a href={KDP_KENP_SOURCES.royaltiesEstimator} rel="noreferrer" target="_blank">KDP Royalties Estimator</a></li>
          <li><a href={KDP_KENP_SOURCES.reports} rel="noreferrer" target="_blank">KDP Reports</a></li>
        </ul>
      </div>
    </UiDisclosure>
  );
}

function firstInvalidFocusKey(errors: KdpKenpFieldErrors): string | null {
  return ["earningsMonth", "marketplace", "kenpRead", "currencyCode", "rate", "rateBasis"]
    .find((field) => errors[field]) ?? null;
}

function formattedPages(pages: number) {
  return pages.toLocaleString("en-US");
}

function formulaText(values: Extract<KdpKenpResult, { status: "calculated" }>['values']) {
  return `${formattedPages(values.kenpRead)} KENP × ${values.rateText} ${values.currencyCode}/KENP`;
}

export function KindleUnlimitedKenpEarningsCalculator() {
  const [input, setInput] = useState<KdpKenpInput>(initialInput);
  const [result, setResult] = useState<KdpKenpResult | null>(null);
  const [fieldErrors, setFieldErrors] = useState<KdpKenpFieldErrors>({});
  const [failure, setFailure] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const [pendingFocusKey, setPendingFocusKey] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const monthRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLOutputElement>(null);

  useEffect(() => {
    if (!pendingFocusKey) return;
    requestAnimationFrame(() => {
      if (pendingFocusKey === "earningsMonth") monthRef.current?.focus();
      else formRef.current?.querySelector<HTMLElement>(`[data-focus-key="${pendingFocusKey}"]`)?.focus();
      setPendingFocusKey(null);
    });
  }, [input, pendingFocusKey]);

  function update(field: keyof KdpKenpInput, value: string) {
    const hadAnswer = result?.status === "calculated" || result?.status === "unavailable" || Boolean(failure);
    setInput((current) => ({ ...current, [field]: value }));
    setResult(null);
    setFailure("");
    setFieldErrors((current) => {
      const keyByField: Record<keyof KdpKenpInput, string> = {
        earningsMonthText: "earningsMonth",
        marketplaceText: "marketplace",
        currencyCodeText: "currencyCode",
        kenpReadText: "kenpRead",
        rateText: "rate",
        rateBasis: "rateBasis",
      };
      const next = { ...current };
      delete next[keyByField[field]];
      return next;
    });
    if (hadAnswer) setAnnouncement("Inputs changed. Estimate again.");
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAnnouncement("");
    setFailure("");
    try {
      const next = calculateKdpKenpEarnings(input);
      if (next.status === "invalid") {
        setResult(null);
        setFieldErrors(next.fieldErrors);
        const focusKey = firstInvalidFocusKey(next.fieldErrors);
        if (focusKey) {
          requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>(`[data-focus-key="${focusKey}"]`)?.focus());
        }
        return;
      }
      setFieldErrors({});
      setResult(next);
      if (next.status === "unavailable") {
        setFailure("The estimate could not be calculated. Try again.");
        return;
      }
      requestAnimationFrame(() => resultRef.current?.focus());
    } catch {
      setResult(null);
      setFailure("The estimate could not be calculated. Try again.");
    }
  }

  function reset() {
    setInput(initialInput());
    setResult(null);
    setFieldErrors({});
    setFailure("");
    setAnnouncement("Calculator reset");
    setPendingFocusKey("earningsMonth");
  }

  const calculated = result?.status === "calculated" ? result.values : null;
  const normalizedCurrency = normalizeKdpKenpCurrencyCode(input.currencyCodeText);
  const rateLabel = normalizedCurrency ? `Rate per KENP (${normalizedCurrency})` : "Rate per KENP";

  return (
    <section aria-label="Kindle Unlimited KENP earnings calculator" className={styles.tool} data-tool-workbench>
      <form className={styles.form} noValidate onSubmit={submit} ref={formRef}>
        <div className={styles.contextGrid}>
          <UiTextField
            dataFocusKey="earningsMonth"
            description="The KDP fund month you want to estimate."
            error={fieldErrors.earningsMonth}
            inputRef={monthRef}
            label="Earnings month"
            name="earningsMonth"
            onChange={(value) => update("earningsMonthText", value)}
            placeholder="YYYY-MM"
            required
            spellCheck={false}
            value={input.earningsMonthText}
          />
          <UiTextField
            autoCapitalize="none"
            dataFocusKey="marketplace"
            description="Use the same KDP marketplace as your reads and rate."
            error={fieldErrors.marketplace}
            label="Marketplace"
            name="marketplace"
            onChange={(value) => update("marketplaceText", value)}
            placeholder="Amazon.com"
            required
            spellCheck={false}
            value={input.marketplaceText}
          />
          <div className={styles.pagesField}>
            <UiTextField
              autoCapitalize="none"
              dataFocusKey="kenpRead"
              description="Enter this title's aggregate credited pages from KDP Reports, not its KENPC or print-page count."
              error={fieldErrors.kenpRead}
              inputMode="numeric"
              label="KENP Read"
              name="kenpRead"
              onChange={(value) => update("kenpReadText", value)}
              required
              spellCheck={false}
              value={input.kenpReadText}
            />
          </div>
          <UiTextField
            autoCapitalize="none"
            dataFocusKey="currencyCode"
            description="Enter the currency that matches this marketplace's rate. No conversion is applied."
            error={fieldErrors.currencyCode}
            label="Currency code"
            name="currencyCode"
            onChange={(value) => update("currencyCodeText", value)}
            required
            spellCheck={false}
            value={input.currencyCodeText}
          />
          <UiTextField
            autoCapitalize="none"
            dataFocusKey="rate"
            description="KDP rates change by month and marketplace. The rate stays blank until you enter it."
            error={fieldErrors.rate}
            inputMode="decimal"
            label={rateLabel}
            name="rate"
            onChange={(value) => update("rateText", value)}
            required
            spellCheck={false}
            value={input.rateText}
          />
          <div className={styles.basisField}>
            <UiChoiceGroup
              dataFocusKey="rateBasis"
              description="If you use a rate from another month, mark it as a planning assumption."
              error={fieldErrors.rateBasis}
              label="Rate basis"
              name="rateBasis"
              onChange={(value) => update("rateBasis", value)}
              options={BASIS_OPTIONS}
              required
              value={input.rateBasis}
            />
          </div>
        </div>

        <UiActionRow>
          <UiButton className={styles.submit} type="submit" variant="primary">Estimate KENP earnings</UiButton>
          <UiButton onPress={reset} type="button" variant="ghost">Reset</UiButton>
        </UiActionRow>
      </form>

      {calculated ? (
        <section aria-label="KENP earnings estimate" className={styles.result}>
          <UiPrimaryResult
            detail="Uses the rate you entered; it is not a confirmed KDP payout."
            inputRef={resultRef}
            label="Estimated Kindle Unlimited royalty"
            tone="neutral"
            value={calculated.lessThanMinorUnit ? `Less than ${calculated.minorUnitDisplay}` : calculated.amountDisplay}
          />
          <UiKeyValueList rows={[
            { label: "Calculation", value: formulaText(calculated) },
            { label: "Earnings month", value: calculated.earningsMonth },
            { label: "Marketplace", value: calculated.marketplace },
            { label: "Rate basis", value: calculated.rateBasisLabel },
          ]} />
          <p className={styles.verification}>
            This is an estimate from values you entered. For a past month, KDP's <a href={KDP_KENP_SOURCES.reports} rel="noreferrer" target="_blank">Prior Months' Royalties report</a> gives the final amount.
          </p>
          {calculated.kenpRead > 3_000 ? (
            <p className={styles.capNote}>KDP's 3,000 KENP limit is per title per customer; it is not a cap on a monthly aggregate.</p>
          ) : null}
          <CalculationDetails />
        </section>
      ) : failure ? (
        <div className={styles.result}><UiStatus tone="danger">{failure}</UiStatus></div>
      ) : Object.keys(fieldErrors).length === 0 ? (
        <p className={styles.initialPrompt}>Enter KENP Read and a rate to estimate earnings. If you do not have that month's KDP rate, enter a rate you want to test and choose My planning assumption. This tool cannot look up or verify rates.</p>
      ) : null}
      <p aria-live="polite" className={styles.visuallyHidden}>{announcement}</p>
    </section>
  );
}
