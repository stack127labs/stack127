"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  UiActionRow,
  UiDataTable,
  UiResultLead,
  UiStatus,
} from "@/app/ui/display";
import {
  UiButton,
  UiCheckbox,
  UiChoiceGroup,
  UiDisclosure,
  UiSelect,
  UiTextField,
  uiOption,
} from "@/app/ui/controls";
import {
  calculateKdpPriceProfit,
  formatKdpPriceProfitMoney,
  kdpPriceProfitOptionFieldKey,
  type KdpPriceProfitFieldErrors,
  type KdpPriceProfitInput,
  type KdpPriceProfitOptionInput,
  type KdpPriceProfitResult,
} from "@/lib/kdp/price-profit.ts";
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
import styles from "./kdp-price-profit-calculator.module.css";

type OptionInput = KdpPriceProfitOptionInput;
type PrintProfile = Readonly<{ interior: KdpInterior; paper: KdpPaper }>;

const INITIAL_OPTIONS: OptionInput[] = [
  {
    id: "option-1",
    binding: "paperback",
    trimId: "6x9",
    interior: "black-white",
    paper: "white",
    pageCountText: "300",
    otherCostPerSaleText: "",
    oneTimeCostText: "",
  },
  {
    id: "option-2",
    binding: "hardcover",
    trimId: "6x9",
    interior: "black-white",
    paper: "white",
    pageCountText: "300",
    otherCostPerSaleText: "",
    oneTimeCostText: "",
  },
];

function initialInput(): KdpPriceProfitInput {
  return {
    listPriceText: "19.99",
    options: INITIAL_OPTIONS.map((option) => ({ ...option })),
    includeCosts: false,
    plannedCopiesText: "",
  };
}

function profileKey(profile: PrintProfile) {
  return `${profile.interior}|${profile.paper}`;
}

function profilesFor(binding: KdpBinding, trimId: string): PrintProfile[] {
  return getKdpInteriorOptions(binding).flatMap((interior) =>
    getKdpPaperOptions(binding, interior)
      .filter((paper) => getKdpPageLimit(trimId, binding, interior, paper) !== null)
      .map((paper) => ({ interior, paper })),
  );
}

function optionError(errors: KdpPriceProfitFieldErrors | null, id: string, field: Parameters<typeof kdpPriceProfitOptionFieldKey>[1]) {
  return errors?.[kdpPriceProfitOptionFieldKey(id, field)] ?? null;
}

function firstInvalidFocusKey(result: Extract<KdpPriceProfitResult, { status: "invalid" }>, options: readonly OptionInput[], includeCosts: boolean): string | null {
  const order = ["listPrice"];
  for (const option of options) {
    order.push(
      kdpPriceProfitOptionFieldKey(option.id, "binding"),
      kdpPriceProfitOptionFieldKey(option.id, "trimId"),
      kdpPriceProfitOptionFieldKey(option.id, "interiorPaper"),
      kdpPriceProfitOptionFieldKey(option.id, "pageCount"),
    );
  }
  if (includeCosts) {
    order.push("plannedCopies");
    for (const option of options) {
      order.push(
        kdpPriceProfitOptionFieldKey(option.id, "otherCostPerSale"),
        kdpPriceProfitOptionFieldKey(option.id, "oneTimeCost"),
      );
    }
  }
  return order.find((key) => result.fieldErrors[key]) ?? null;
}

function CalculationDetails({ values }: { values: Extract<KdpPriceProfitResult, { status: "calculated" }>['values'] }) {
  return (
    <UiDisclosure label="Calculation details">
      <div className={styles.details}>
        <p>Royalty rules: {values.rulesVersion}. Print setup limits: {values.printSetupVersion}. KDP help pages reviewed {values.rulesReviewedDate}.</p>
        <p>Print royalties use 50% through $9.98 and 60% from $9.99 on Amazon.com. A row below its KDP minimum has no sellable royalty estimate.</p>
        <p>Profit includes only the costs and planned copies entered here. It does not include other expenses, taxes, refunds, demand, price matching, or Expanded Distribution. Confirm each edition in KDP before setting its price.</p>
        <ul>
          {values.sources.map((source) => (
            <li key={source.url}><a href={source.url} rel="noreferrer" target="_blank">{source.label}</a></li>
          ))}
        </ul>
      </div>
    </UiDisclosure>
  );
}

function optionLabel(row: OptionInput, index: number) {
  const binding = row.binding === "hardcover" ? "Hardcover" : row.binding === "paperback" ? "Paperback" : "Print binding needed";
  const trim = getKdpTrimOptions(row.binding === "hardcover" ? "hardcover" : "paperback").find((item) => item.id === row.trimId)?.label ?? "Trim size needed";
  const profile = row.interior && row.paper
    ? `${interiorLabel(row.interior as KdpInterior)}, ${paperLabel(row.paper as KdpPaper).toLowerCase()} paper`
    : "Interior and paper needed";
  const pageCount = row.pageCountText.trim() ? `${row.pageCountText} entered pages` : "Page count needed";
  return <><strong>Option {index + 1}</strong><span>{binding} · {trim} · {profile} · {pageCount}</span></>;
}

export function KdpPriceProfitCalculator() {
  const [input, setInput] = useState<KdpPriceProfitInput>(initialInput);
  const [result, setResult] = useState<KdpPriceProfitResult | null>(null);
  const [failure, setFailure] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const [pendingFocusKey, setPendingFocusKey] = useState<string | null>(null);
  const [pendingHeadingId, setPendingHeadingId] = useState<string | null>(null);
  const nextOptionNumber = useRef(3);
  const formRef = useRef<HTMLFormElement>(null);
  const resultRef = useRef<HTMLParagraphElement>(null);
  const headingRefs = useRef(new Map<string, HTMLLegendElement>());

  useEffect(() => {
    if (pendingFocusKey) {
      formRef.current?.querySelector<HTMLElement>(`[data-focus-key="${pendingFocusKey}"]`)?.focus();
      setPendingFocusKey(null);
    } else if (pendingHeadingId) {
      headingRefs.current.get(pendingHeadingId)?.focus();
      setPendingHeadingId(null);
    }
  }, [input.options, pendingFocusKey, pendingHeadingId]);

  function clearPriorAnswer(nextAnnouncement?: string) {
    const hadAnswer = result?.status === "calculated" || result?.status === "unavailable" || Boolean(failure);
    setResult(null);
    setFailure("");
    if (nextAnnouncement) {
      setAnnouncement(nextAnnouncement);
    } else if (hadAnswer) {
      setAnnouncement("Comparison cleared. Compare print options again.");
    } else {
      setAnnouncement("");
    }
  }

  function updateShared(next: Partial<Pick<KdpPriceProfitInput, "listPriceText" | "includeCosts" | "plannedCopiesText">>, notice?: string) {
    setInput((current) => ({ ...current, ...next }));
    clearPriorAnswer(notice);
  }

  function updateOption(id: string, next: Partial<OptionInput>, notice?: string) {
    setInput((current) => ({
      ...current,
      options: current.options.map((option) => option.id === id ? { ...option, ...next } : option),
    }));
    clearPriorAnswer(notice);
  }

  function changeBinding(option: OptionInput, value: string, index: number) {
    if (value !== "paperback" && value !== "hardcover") return;
    const binding = value as KdpBinding;
    const bindingTrims = getKdpTrimOptions(binding);
    const trimIsCompatible = bindingTrims.some((trim) => trim.id === option.trimId);
    const nextTrimId = trimIsCompatible ? option.trimId : "";
    const profiles = nextTrimId ? profilesFor(binding, nextTrimId) : [];
    const existing = profiles.find((profile) => profile.interior === option.interior && profile.paper === option.paper);
    const clearTrim = !trimIsCompatible;
    const next = {
      binding,
      trimId: nextTrimId,
      interior: existing?.interior ?? "",
      paper: existing?.paper ?? "",
    };
    const needs = [clearTrim ? "a trim size" : "", !existing ? "an interior and paper choice" : ""].filter(Boolean);
    const notice = needs.length ? `Option ${index + 1} needs ${needs.join(" and ")} for this binding.` : undefined;
    updateOption(option.id, next, notice);
  }

  function changeTrim(option: OptionInput, selection: string, index: number) {
    const [, trimId] = selection.split("::");
    if (!trimId || !getKdpTrimOptions(option.binding === "hardcover" ? "hardcover" : "paperback").some((trim) => trim.id === trimId)) return;
    const profiles = profilesFor(option.binding as KdpBinding, trimId);
    const currentProfile = profiles.find((profile) => profile.interior === option.interior && profile.paper === option.paper);
    const notice = currentProfile ? undefined : `Option ${index + 1} needs a compatible interior and paper choice for this trim size.`;
    updateOption(option.id, {
      trimId,
      interior: currentProfile?.interior ?? "",
      paper: currentProfile?.paper ?? "",
    }, notice);
  }

  function changeProfile(option: OptionInput, selection: string) {
    const [, key] = selection.split("::");
    const profile = profilesFor(option.binding as KdpBinding, option.trimId).find((candidate) => profileKey(candidate) === key);
    if (!profile) return;
    updateOption(option.id, { interior: profile.interior, paper: profile.paper });
  }

  function addOption() {
    if (input.options.length >= 3) return;
    const id = `option-${nextOptionNumber.current++}`;
    const next: OptionInput = {
      id,
      binding: "paperback",
      trimId: "6x9",
      interior: "black-white",
      paper: "white",
      pageCountText: "300",
      otherCostPerSaleText: "",
      oneTimeCostText: "",
    };
    setInput((current) => ({ ...current, options: [...current.options, next] }));
    clearPriorAnswer();
    setPendingFocusKey(kdpPriceProfitOptionFieldKey(id, "binding"));
  }

  function removeOption(id: string, index: number) {
    if (input.options.length <= 2) return;
    const focusId = input.options[index === 0 ? 1 : index - 1]?.id ?? input.options[0]?.id;
    setInput((current) => ({ ...current, options: current.options.filter((option) => option.id !== id) }));
    clearPriorAnswer();
    setPendingHeadingId(focusId ?? null);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAnnouncement("");
    setFailure("");
    try {
      const next = calculateKdpPriceProfit(input);
      setResult(next);
      if (next.status === "unavailable") {
        setFailure(next.message);
        return;
      }
      requestAnimationFrame(() => {
        if (next.status === "calculated") {
          resultRef.current?.focus();
        } else if (next.status === "invalid") {
          const focusKey = firstInvalidFocusKey(next, input.options, input.includeCosts);
          if (focusKey) formRef.current?.querySelector<HTMLElement>(`[data-focus-key="${focusKey}"]`)?.focus();
        }
      });
    } catch {
      setResult(null);
      setFailure("Could not compare these options with the current KDP rules. Reload and try again.");
    }
  }

  function reset() {
    setInput(initialInput());
    setResult(null);
    setFailure("");
    setAnnouncement("Calculator reset.");
    nextOptionNumber.current = 3;
    setPendingFocusKey("listPrice");
  }

  const errors = result?.status === "invalid" ? result.fieldErrors : null;
  const calculated = result?.status === "calculated" ? result.values : null;
  const tableColumns = [
    { id: "option", label: "Print option" },
    { id: "printingCost", label: "Printing cost", align: "right" as const },
    { id: "minimumPrice", label: "KDP minimum price", align: "right" as const },
    { id: "royalty", label: "Estimated KDP royalty per sale", align: "right" as const },
    ...(calculated?.includeCosts ? [
      { id: "costs", label: "Your costs", align: "right" as const },
      { id: "profit", label: "Estimated profit after entered costs", align: "right" as const },
    ] : []),
  ];
  const tableRows = calculated?.rows.map((row) => ({
    id: row.id,
    cells: {
      option: <div className={styles.optionSummary}>{optionLabel(input.options.find((item) => item.id === row.id) ?? INITIAL_OPTIONS[0]!, row.optionNumber - 1)}</div>,
      printingCost: formatKdpPriceProfitMoney(row.printingCostCents),
      minimumPrice: formatKdpPriceProfitMoney(row.minimumPriceCents),
      royalty: row.eligible && row.royaltyCents !== null
        ? formatKdpPriceProfitMoney(row.royaltyCents)
        : <span className={styles.unavailableValue}>Below KDP minimum at this price</span>,
      ...(calculated.includeCosts ? {
        costs: `${formatKdpPriceProfitMoney(row.otherCostPerSaleCents ?? 0)} per sale + ${formatKdpPriceProfitMoney(row.oneTimeCostCents ?? 0)} one time`,
        profit: row.eligible && row.profitCents !== null
          ? formatKdpPriceProfitMoney(row.profitCents)
          : <span className={styles.unavailableValue}>Unavailable</span>,
      } : {}),
    },
  })) ?? [];

  return (
    <section aria-label="KDP print price and profit inputs and results" className={styles.tool} data-tool-workbench>
      <p className={styles.scope}>Amazon.com · USD · standard Amazon sales</p>
      <form className={styles.form} noValidate onSubmit={submit} ref={formRef}>
        <div className={styles.priceRow}>
          <UiTextField
            dataFocusKey="listPrice"
            error={errors?.listPrice}
            inputMode="decimal"
            label="Shared list price (USD)"
            name="listPrice"
            onChange={(listPriceText) => updateShared({ listPriceText })}
            required
            value={input.listPriceText}
          />
        </div>

        <div className={styles.options}>
          <h2>Print options</h2>
          {input.options.map((option, index) => {
            const binding = option.binding === "hardcover" ? "hardcover" : "paperback";
            const trimOptions = getKdpTrimOptions(binding);
            const profiles = option.trimId ? profilesFor(binding, option.trimId) : [];
            const selectedProfile = profiles.find((profile) => profile.interior === option.interior && profile.paper === option.paper);
            const bindingChoiceOptions = [
              uiOption(`${option.id}::paperback`, "Paperback"),
              uiOption(`${option.id}::hardcover`, "Hardcover"),
            ];
            const trimChoiceOptions = trimOptions.map((trim) => uiOption(`${option.id}::${trim.id}`, trim.label));
            const profileChoiceOptions = profiles.map((profile) => uiOption(`${option.id}::${profileKey(profile)}`, `${interiorLabel(profile.interior)}, ${paperLabel(profile.paper).toLowerCase()} paper`));
            return (
              <fieldset className={styles.option} key={option.id}>
                <legend
                  className={styles.optionLegend}
                  data-option-heading={option.id}
                  ref={(node) => {
                    if (node) headingRefs.current.set(option.id, node);
                    else headingRefs.current.delete(option.id);
                  }}
                  tabIndex={-1}
                >Option {index + 1}</legend>
                <div className={styles.optionGrid}>
                  <UiChoiceGroup
                    dataFocusKey={kdpPriceProfitOptionFieldKey(option.id, "binding")}
                    error={optionError(errors, option.id, "binding")}
                    label="Binding"
                    name={`${option.id}-binding`}
                    onChange={(value) => changeBinding(option, value.split("::")[1] ?? "", index)}
                    options={bindingChoiceOptions}
                    required
                    value={option.binding ? `${option.id}::${option.binding}` : ""}
                  />
                  <UiSelect
                    dataFocusKey={kdpPriceProfitOptionFieldKey(option.id, "trimId")}
                    error={optionError(errors, option.id, "trimId")}
                    label="Trim size"
                    name={`${option.id}-trim`}
                    onChange={(value) => changeTrim(option, value, index)}
                    options={trimChoiceOptions}
                    placeholder="Choose a trim size"
                    required
                    value={option.trimId ? `${option.id}::${option.trimId}` : null}
                  />
                  <UiSelect
                    dataFocusKey={kdpPriceProfitOptionFieldKey(option.id, "interiorPaper")}
                    disabled={!option.trimId}
                    error={optionError(errors, option.id, "interiorPaper")}
                    label="Interior and paper"
                    name={`${option.id}-interior-paper`}
                    onChange={(value) => changeProfile(option, value)}
                    options={profileChoiceOptions}
                    placeholder={option.trimId ? "Choose an interior and paper" : "Choose a trim size first"}
                    required
                    value={selectedProfile ? `${option.id}::${profileKey(selectedProfile)}` : null}
                  />
                  <UiTextField
                    dataFocusKey={kdpPriceProfitOptionFieldKey(option.id, "pageCount")}
                    error={optionError(errors, option.id, "pageCount")}
                    inputMode="numeric"
                    label="Printed pages"
                    name={`${option.id}-page-count`}
                    onChange={(pageCountText) => updateOption(option.id, { pageCountText })}
                    required
                    value={option.pageCountText}
                  />
                </div>
                {input.options.length === 3 ? (
                  <UiButton
                    aria-label={`Remove option ${index + 1}`}
                    className={styles.remove}
                    onPress={() => removeOption(option.id, index)}
                    type="button"
                    variant="ghost"
                  >Remove option {index + 1}</UiButton>
                ) : null}
              </fieldset>
            );
          })}
          {input.options.length < 3 ? (
            <UiButton onPress={addOption} type="button" variant="secondary">Add option</UiButton>
          ) : null}
        </div>

        <div className={styles.costMode}>
          <UiCheckbox isSelected={input.includeCosts} onChange={(includeCosts) => updateShared({ includeCosts })}>Include my costs</UiCheckbox>
          {input.includeCosts ? (
            <div className={styles.costs}>
              <p className={styles.costHelp}>Printing cost is already deducted from KDP royalty, so do not enter it again. Enter 0 when a cost does not apply. Blank means unknown.</p>
              <UiTextField
                dataFocusKey="plannedCopies"
                error={errors?.plannedCopies}
                inputMode="numeric"
                label="Planned copies sold per option"
                name="plannedCopies"
                onChange={(plannedCopiesText) => updateShared({ plannedCopiesText })}
                required
                value={input.plannedCopiesText}
              />
              {input.options.map((option, index) => (
                <div className={styles.costOption} key={`${option.id}-costs`}>
                  <h3>Option {index + 1} costs</h3>
                  <div className={styles.costGrid}>
                    <UiTextField
                      dataFocusKey={kdpPriceProfitOptionFieldKey(option.id, "otherCostPerSale")}
                      error={optionError(errors, option.id, "otherCostPerSale")}
                      inputMode="decimal"
                      label="Other cost per sale (USD)"
                      name={`${option.id}-other-cost-per-sale`}
                      onChange={(otherCostPerSaleText) => updateOption(option.id, { otherCostPerSaleText })}
                      required
                      value={option.otherCostPerSaleText}
                    />
                    <UiTextField
                      dataFocusKey={kdpPriceProfitOptionFieldKey(option.id, "oneTimeCost")}
                      error={optionError(errors, option.id, "oneTimeCost")}
                      inputMode="decimal"
                      label="One-time cost (USD)"
                      name={`${option.id}-one-time-cost`}
                      onChange={(oneTimeCostText) => updateOption(option.id, { oneTimeCostText })}
                      required
                      value={option.oneTimeCostText}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <UiActionRow>
          <UiButton className={styles.submit} type="submit" variant="primary">Compare print options</UiButton>
          <UiButton onPress={reset} type="button" variant="ghost">Reset</UiButton>
        </UiActionRow>
      </form>

      {announcement ? <UiStatus>{announcement}</UiStatus> : null}
      {failure ? <UiStatus tone="danger">{failure}</UiStatus> : null}

      {calculated ? (
        <div className={styles.result}>
          <UiResultLead inputRef={resultRef}>
            {calculated.eligibleCount === 0
              ? "No options meet KDP's minimum at this price."
              : `${calculated.eligibleCount} of ${calculated.rows.length} options meet KDP's minimum at ${formatKdpPriceProfitMoney(calculated.listPriceCents)}.`}
          </UiResultLead>
          {calculated.sharedRoyaltyRate !== null ? (
            <p className={styles.resultNote}>A {calculated.sharedRoyaltyRate}% royalty rate applies to eligible rows.</p>
          ) : null}
          {calculated.plannedCopies !== null ? (
            <p className={styles.resultNote}>Profit uses {calculated.plannedCopies.toLocaleString("en-US")} planned copies for each option.</p>
          ) : null}
          <UiDataTable
            ariaLabel="KDP print option comparison"
            columns={tableColumns}
            rows={tableRows}
          />
          {calculated.rows.some((row) => row.enteredPageCount !== row.effectivePageCount) ? (
            <ul className={styles.pageNotes}>
              {calculated.rows.filter((row) => row.enteredPageCount !== row.effectivePageCount).map((row) => (
                <li key={row.id}>Option {row.optionNumber}: this estimate rounds {row.enteredPageCount} entered pages up to {row.effectivePageCount} effective pages.</li>
              ))}
            </ul>
          ) : null}
          <p className={styles.estimateNote}>Estimate. Confirm each edition in KDP before setting its price.</p>
          <CalculationDetails values={calculated} />
        </div>
      ) : null}
    </section>
  );
}
