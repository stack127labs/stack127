"use client";

import { RotateCcw } from "lucide-react";
import { useRef, useState, type FormEvent } from "react";
import { UiButton, UiChoiceGroup, UiDisclosure, UiSelect, UiTextField, uiOption } from "@/app/ui/controls";
import { UiActionRow, UiKeyValueList, UiPrimaryResult, UiResultLead, UiStatus } from "@/app/ui/display";
import {
  calculateKdpMinimumListPrice,
  formatKdpMinimumMoney,
  parseKdpMinimumPageCount,
  type KdpMinimumPriceField,
  type KdpMinimumPriceInput,
  type KdpMinimumPriceResult,
  type KdpMinimumPriceSource,
} from "@/lib/kdp/minimum-list-price.ts";
import {
  getKdpInteriorOptions,
  getKdpPageLimit,
  getKdpPaperOptions,
  getKdpTrimOptions,
  interiorLabel,
  paperLabel,
  type KdpBinding,
  type KdpInterior,
  type KdpPaper,
} from "@/lib/kdp/specs.ts";
import styles from "./kdp-minimum-list-price-calculator.module.css";

type FormInput = KdpMinimumPriceInput;
type PrintProfile = Readonly<{ interior: KdpInterior; paper: KdpPaper }>;

const formatOptions = [
  uiOption("paperback", "Paperback"),
  uiOption("hardcover", "Hardcover"),
  uiOption("ebook", "Kindle ebook"),
];
const ebookRateOptions = [uiOption("70", "70%"), uiOption("35", "35%")];

function defaultInput(): FormInput {
  return {
    desiredRoyaltyText: "",
    ebookFileSizeText: "1",
    ebookRoyaltyOption: 70,
    format: "paperback",
    interior: "black-white",
    pageCountText: "300",
    paper: "white",
    trimId: "6x9",
  };
}

function profilesFor(binding: KdpBinding, trimId: string): PrintProfile[] {
  return getKdpInteriorOptions(binding).flatMap((interior) =>
    getKdpPaperOptions(binding, interior)
      .filter((paper) => getKdpPageLimit(trimId, binding, interior, paper) !== null)
      .map((paper) => ({ interior, paper })),
  );
}

function profileKey(profile: PrintProfile) {
  return `${profile.interior}|${profile.paper}`;
}

function compatiblePrintInput(input: FormInput, format: KdpBinding): Pick<FormInput, "trimId" | "interior" | "paper" | "pageCountText"> {
  const trimOptions = getKdpTrimOptions(format);
  const trimId = trimOptions.some((trim) => trim.id === input.trimId)
    ? input.trimId
    : trimOptions.some((trim) => trim.id === "6x9") ? "6x9" : trimOptions[0]?.id ?? "6x9";
  const profiles = profilesFor(format, trimId);
  const existingProfile = profiles.find((profile) => profile.interior === input.interior && profile.paper === input.paper);
  const defaultProfile = profiles.find((profile) => profile.interior === "black-white" && profile.paper === "white") ?? profiles[0];
  const profile = existingProfile ?? defaultProfile ?? { interior: "black-white", paper: "white" };
  const pageLimit = getKdpPageLimit(trimId, format, profile.interior, profile.paper);
  const pageCount = parseKdpMinimumPageCount(input.pageCountText);
  const effectivePageCount = pageCount === null ? null : pageCount + (pageCount % 2);
  const keepPages = pageLimit !== null && effectivePageCount !== null && effectivePageCount >= pageLimit.min && effectivePageCount <= pageLimit.max;
  return {
    interior: profile.interior,
    pageCountText: keepPages ? input.pageCountText : "300",
    paper: profile.paper,
    trimId,
  };
}

function fieldError(result: KdpMinimumPriceResult | null, field: KdpMinimumPriceField) {
  return result?.status === "invalid" ? result.fieldErrors[field] ?? null : null;
}

function firstInvalidField(result: Extract<KdpMinimumPriceResult, { status: "invalid" }>, isEbook: boolean): KdpMinimumPriceField | null {
  const order: KdpMinimumPriceField[] = isEbook
    ? ["ebookRoyaltyOption", "ebookFileSizeMB", "desiredRoyalty"]
    : ["trimId", "interiorPaper", "pageCount", "desiredRoyalty"];
  return order.find((field) => result.fieldErrors[field]) ?? null;
}

function CalculationDetails({ sources, values }: { sources: readonly KdpMinimumPriceSource[]; values: NonNullable<Extract<KdpMinimumPriceResult, { status: "available" | "unreachable" }>["values"]> }) {
  const limitText = values.format === "ebook"
    ? values.selectedEbookOption === 70
      ? `Selected 70% option range: ${formatKdpMinimumMoney(values.minimumPriceCents)} to ${formatKdpMinimumMoney(values.maximumPriceCents)}.`
      : `Selected 35% option range: ${formatKdpMinimumMoney(values.minimumPriceCents)} to ${formatKdpMinimumMoney(values.maximumPriceCents)}. The minimum follows KDP's file-size bands.`
    : `Modeled list price range: ${formatKdpMinimumMoney(values.minimumPriceCents)} to ${formatKdpMinimumMoney(values.maximumPriceCents)}. Print royalties use 50% below $9.99 and 60% from $9.99.`;

  return (
    <UiDisclosure label="Calculation details">
      <div className={styles.details}>
        <p>{limitText}</p>
        <p>Rates and cost rules: {values.royaltyRuleVersion}. Print setup limits: {values.printSetupVersion}. KDP help pages reviewed {values.rulesReviewedDate}.</p>
        {values.format === "ebook" ? (
          <p>
            The file-size thresholds use the MB value you entered; KDP's help does not define the byte convention at 3 MB and 10 MB. The 70% option also depends on territory, content, and price eligibility, including an eBook list price at least 20% below an Amazon-listed physical edition; this calculator cannot verify those checks. For the 35% option, KDP does not deduct delivery cost.
          </p>
        ) : (
          <p>Print cost and price are estimates. KDP does not document every cent-rounding detail. Expanded Distribution is excluded.</p>
        )}
        <p>Check the edition in KDP's pricing screen. This calculator cannot check account, territory, tax, price-matching, or other edition-specific rules.</p>
        <ul>
          {sources.map((source) => <li key={source.url}><a href={source.url} rel="noreferrer" target="_blank">{source.label}</a></li>)}
        </ul>
      </div>
    </UiDisclosure>
  );
}

export function KdpMinimumListPriceCalculator() {
  const [input, setInput] = useState<FormInput>(defaultInput);
  const [result, setResult] = useState<KdpMinimumPriceResult | null>(null);
  const [failure, setFailure] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const resultRef = useRef<HTMLOutputElement>(null);
  const unreachableRef = useRef<HTMLParagraphElement>(null);

  function update(next: Partial<FormInput>) {
    const hadAnswer = result?.status === "available" || result?.status === "unreachable" || Boolean(failure);
    setInput((current) => ({ ...current, ...next }));
    setResult(null);
    setFailure("");
    if (hadAnswer) setAnnouncement("Inputs changed. Find the minimum price again.");
  }

  function changeFormat(format: string) {
    if (format === "ebook") {
      update({ format, ebookFileSizeText: input.ebookFileSizeText || "1", ebookRoyaltyOption: input.ebookRoyaltyOption || 70 });
      return;
    }
    if (format !== "paperback" && format !== "hardcover") return;
    update({ format, ...compatiblePrintInput(input, format) });
  }

  function changeTrim(trimId: string) {
    if (input.format === "ebook") return;
    const binding = input.format as KdpBinding;
    const profiles = profilesFor(binding, trimId);
    const current = profiles.find((profile) => profile.interior === input.interior && profile.paper === input.paper);
    const defaultProfile = profiles.find((profile) => profile.interior === "black-white" && profile.paper === "white") ?? profiles[0];
    const profile = current ?? defaultProfile;
    if (!profile) return;
    const currentPages = parseKdpMinimumPageCount(input.pageCountText);
    const effective = currentPages === null ? null : currentPages + (currentPages % 2);
    const pageLimit = getKdpPageLimit(trimId, binding, profile.interior, profile.paper);
    const keepPages = pageLimit !== null && effective !== null && effective >= pageLimit.min && effective <= pageLimit.max;
    update({
      interior: profile.interior,
      paper: profile.paper,
      pageCountText: keepPages ? input.pageCountText : "300",
      trimId,
    });
  }

  function changeProfile(value: string) {
    const [interior, paper] = value.split("|");
    if (!interior || !paper) return;
    update({ interior, paper });
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAnnouncement("");
    setFailure("");
    try {
      const next = calculateKdpMinimumListPrice(input);
      setResult(next);
      if (next.status === "failure") {
        setFailure(next.message);
        return;
      }
      requestAnimationFrame(() => {
        if (next.status === "available") resultRef.current?.focus();
        else if (next.status === "unreachable") unreachableRef.current?.focus();
        else {
          const field = firstInvalidField(next, input.format === "ebook");
          if (field) formRef.current?.querySelector<HTMLElement>(`[data-focus-key="${field}"]`)?.focus();
        }
      });
    } catch {
      setResult(null);
      setFailure("Could not calculate from the current KDP rules. Reload and try again.");
    }
  }

  function reset() {
    setInput(defaultInput());
    setResult(null);
    setFailure("");
    setAnnouncement("Calculator reset.");
    requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('[data-focus-key="format"]')?.focus());
  }

  const isEbook = input.format === "ebook";
  const binding = isEbook ? "paperback" : input.format as KdpBinding;
  const trimOptions = getKdpTrimOptions(binding);
  const profiles = isEbook ? [] : profilesFor(binding, input.trimId);
  const selectedProfile = profiles.find((profile) => profile.interior === input.interior && profile.paper === input.paper) ?? profiles[0];
  const negativeEstimate = result?.status === "available"
    ? result.values.format === "ebook" && result.values.royaltyRate === 70 && result.values.royaltyCents < 0
    : result?.status === "unreachable" && result.values.format === "ebook" && result.values.highestRoyaltyCents < 0;

  return (
    <section aria-label="KDP minimum price inputs and results" className={styles.tool} data-tool-workbench>
      <p className={styles.scope}>Amazon.com · USD · standard KDP distribution</p>
      <form className={styles.form} noValidate onSubmit={submit} ref={formRef}>
        <div className={styles.fieldGrid}>
          <div className={styles.format}>
            <UiChoiceGroup
              dataFocusKey="format"
              label="Format"
              name="format"
              onChange={changeFormat}
              options={formatOptions}
              required
              value={input.format}
            />
          </div>
          {isEbook ? (
            <>
              <UiChoiceGroup
                dataFocusKey="ebookRoyaltyOption"
                error={fieldError(result, "ebookRoyaltyOption")}
                label="Royalty option"
                name="ebookRoyaltyOption"
                onChange={(value) => update({ ebookRoyaltyOption: Number(value) })}
                options={ebookRateOptions}
                required
                value={String(input.ebookRoyaltyOption)}
              />
              <UiTextField
                autoCapitalize="none"
                autoComplete="off"
                dataFocusKey="ebookFileSizeMB"
                error={fieldError(result, "ebookFileSizeMB")}
                inputMode="decimal"
                label="eBook file size (MB)"
                name="ebookFileSizeMB"
                onChange={(value) => update({ ebookFileSizeText: value })}
                required
                spellCheck={false}
                value={input.ebookFileSizeText}
              />
            </>
          ) : (
            <>
              <UiSelect
                dataFocusKey="trimId"
                error={fieldError(result, "trimId")}
                label="Trim size"
                name="trimId"
                onChange={changeTrim}
                options={trimOptions.map((trim) => uiOption(trim.id, trim.label))}
                required
                value={input.trimId}
              />
              <UiSelect
                dataFocusKey="interiorPaper"
                error={fieldError(result, "interiorPaper")}
                label="Interior and paper"
                name="interiorPaper"
                onChange={changeProfile}
                options={profiles.map((profile) => uiOption(profileKey(profile), `${interiorLabel(profile.interior)} · ${paperLabel(profile.paper)}`))}
                required
                value={selectedProfile ? profileKey(selectedProfile) : null}
              />
              <UiTextField
                autoCapitalize="none"
                autoComplete="off"
                dataFocusKey="pageCount"
                error={fieldError(result, "pageCount")}
                inputMode="numeric"
                label="Printed pages"
                name="pageCount"
                onChange={(value) => update({ pageCountText: value })}
                required
                spellCheck={false}
                value={input.pageCountText}
              />
            </>
          )}
          <div className={styles.goalField}>
            <UiTextField
              autoCapitalize="none"
              autoComplete="off"
              dataFocusKey="desiredRoyalty"
              description="Leave blank for the modeled KDP minimum. Enter 0 to look for at least $0.00 estimated royalty; some setups cannot meet it in the selected band."
              error={fieldError(result, "desiredRoyalty")}
              inputMode="decimal"
              label="Desired royalty per copy (USD)"
              name="desiredRoyalty"
              onChange={(value) => update({ desiredRoyaltyText: value })}
              spellCheck={false}
              value={input.desiredRoyaltyText}
            />
          </div>
        </div>
        <UiActionRow>
          <div className={styles.actions}>
            <UiButton type="submit" variant="primary">Find minimum price</UiButton>
            <UiButton onPress={reset} type="button" variant="ghost"><RotateCcw aria-hidden="true" size={17} /> Reset</UiButton>
          </div>
        </UiActionRow>
        {failure ? <UiStatus tone="danger">{failure}</UiStatus> : null}
        {announcement ? <UiStatus>{announcement}</UiStatus> : null}
      </form>

      {result?.status === "available" ? (
        <section aria-label="Minimum price result" className={styles.result}>
          <UiPrimaryResult
            detail={result.values.goalCents === null ? "KDP rule floor" : `Goal: ${formatKdpMinimumMoney(result.values.goalCents)} royalty per copy`}
            inputRef={resultRef}
            label={result.values.goalCents === null ? "KDP minimum list price" : "Lowest price for your royalty goal"}
            value={formatKdpMinimumMoney(result.values.priceCents)}
          />
          <UiKeyValueList rows={[
            { label: "Estimated royalty per sale", value: formatKdpMinimumMoney(result.values.royaltyCents) },
            { label: "Selected royalty rate", value: `${result.values.royaltyRate}%` },
            {
              label: result.values.deductionType === "printing cost" ? "Printing cost" : "Delivery deduction",
              value: result.values.deductionType === "none" ? "None for the 35% option" : formatKdpMinimumMoney(result.values.deductionCents),
            },
            ...(result.values.goalCents === null ? [] : [
              { label: "KDP minimum", value: formatKdpMinimumMoney(result.values.minimumPriceCents) },
              { label: "Above KDP minimum", value: formatKdpMinimumMoney(result.values.priceCents - result.values.minimumPriceCents) },
            ]),
          ]} />
          {result.values.enteredPageCount !== null && result.values.effectivePageCount !== null && result.values.enteredPageCount !== result.values.effectivePageCount ? (
            <p className={styles.pageNote}>This estimate rounds {result.values.enteredPageCount} pages up to the next even count, {result.values.effectivePageCount} pages.</p>
          ) : null}
          <p className={styles.calculationNote}>Estimate. Check this edition in KDP's pricing screen.</p>
          {negativeEstimate ? <UiStatus tone="warning">The 70% formula estimate is below $0.00 at this price. This is not a prediction that KDP will charge or collect money from the author.</UiStatus> : null}
          <CalculationDetails sources={result.values.sources} values={result.values} />
        </section>
      ) : null}

      {result?.status === "unreachable" ? (
        <section aria-label="Unreachable royalty goal" className={styles.result}>
          <UiResultLead inputRef={unreachableRef}>No price meets this royalty goal</UiResultLead>
          <p className={styles.resultLeadDetail}>Goal: {formatKdpMinimumMoney(result.values.goalCents ?? 0)} royalty per copy.</p>
          <UiKeyValueList rows={[
            { label: "KDP minimum", value: formatKdpMinimumMoney(result.values.minimumPriceCents) },
            { label: "Maximum list price", value: formatKdpMinimumMoney(result.values.maximumPriceCents) },
            { label: "Highest modeled royalty in this band", value: formatKdpMinimumMoney(result.values.highestRoyaltyCents) },
          ]} />
          <p className={styles.calculationNote}>Lower the goal or change the book setup or eBook option.</p>
          <p className={styles.calculationNote}>Estimate. Check this edition in KDP's pricing screen.</p>
          {negativeEstimate ? <UiStatus tone="warning">The 70% formula estimate stays below $0.00 throughout this price band. This is not a prediction that KDP will charge or collect money from the author.</UiStatus> : null}
          <CalculationDetails sources={result.values.sources} values={result.values} />
        </section>
      ) : null}
    </section>
  );
}
