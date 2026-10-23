"use client";

import { RotateCcw } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent, type ReactNode, type RefObject } from "react";
import { adNetworkNiches } from "@/lib/ad-network-niches";
import { recommendAdNetworks, recommendationShareParams, validateRecommendationInput } from "@/lib/ad-network-requirements/engine";
import type { InputErrorCode, InputKey, RecommendationInput, RecommendationResult, RequirementsPageData } from "@/lib/ad-network-requirements/types";
import { UiButton, UiChoiceGroup, UiComboBox, UiDisclosure, UiQuantityInput, UiSelect, UiShareAction, UiTextField, uiSetSummary } from "@/app/ui/controls";
import { UiActionRow, UiResultLead, UiStatus, UiStatusWord } from "@/app/ui/display";
import { ToolFieldRow, ToolResult, ToolWorkbench } from "@/app/ui/tools/tool-workbench";
import styles from "./ad-network-requirements-checker.module.css";
import { CompactRow, currentLabel, GrowthRow, RecommendationCard, type NameOf } from "./recommendation-card";

type Raw = Partial<Record<InputKey, string>>;
type FieldErrors = Partial<Record<InputKey, InputErrorCode>>;
type Shown = { input: RecommendationInput; result: RecommendationResult; shareRaw: Raw; run: number };

const EXAMPLE: Raw = {
  niche: "food",
  current: "google-adsense",
  pageviews: "40000",
  visits: "22000",
  visitsUnit: "sessions",
  tier1Share: "65",
  adRevenueMonth: "350",
  siteAge: "gt12m",
};

const FIELD_ORDER: InputKey[] = ["niche", "tier1Share", "pageviews", "visits", "visitsUnit", "siteAge", "current", "adRevenueMonth", "shareUS", "shareGB", "shareCA", "shareAU", "shareNZ"];
const SPLIT: { key: InputKey; label: string; hint?: string }[] = [
  { key: "shareUS", label: "US", hint: "Part of your Tier 1 share, not added to it." },
  { key: "shareGB", label: "UK" },
  { key: "shareCA", label: "Canada" },
  { key: "shareAU", label: "Australia" },
  { key: "shareNZ", label: "New Zealand" },
];
const SPLIT_KEYS = new Set(SPLIT.map((field) => field.key));
const AGE_OPTIONS = [
  { id: "lt3m", label: "Under 3 months" },
  { id: "3to6m", label: "3 to 6 months" },
  { id: "6to12m", label: "6 to 12 months" },
  { id: "gt12m", label: "Over a year" },
  { id: "unknown", label: "Not sure" },
];
const UNITS = [
  { id: "sessions", label: "Sessions" },
  { id: "visits", label: "Visits" },
  { id: "users", label: "Users" },
];
const LEGACY = new Set(["pubnation", "pubgalaxy"]);
const SUGGEST: Partial<Record<InputKey, { text: string; button: string }>> = {
  adRevenueMonth: { text: "Add your monthly ad revenue to see where Mediavine, Publift, and PubGuru fit.", button: "Add revenue" },
  tier1Share: { text: "Add your Tier 1 share to see where Raptive, Monumetric, and Journey fit.", button: "Add Tier 1 share" },
  siteAge: { text: "Add your site age to see where Raptive, SHE Media, and Journey fit.", button: "Add site age" },
};

// The tool's own share-link parameters. Reset removes only these and keeps anything else, such as utm tags.
const SHARE_PARAMS = ["niche", "pv", "visits", "unit", "age", "t1", "us", "gb", "ca", "au", "nz", "current", "rev"];

function removeShareParams() {
  const url = new URL(window.location.href);
  if (!SHARE_PARAMS.some((param) => url.searchParams.has(param))) return;
  for (const param of SHARE_PARAMS) url.searchParams.delete(param);
  window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
}

function errorText(code: InputErrorCode, key: InputKey): string {
  switch (code) {
    case "required": return key === "pageviews" ? "Enter your pageviews." : "Choose your niche.";
    case "not_a_number": return "Enter a number.";
    case "negative": return "Enter 0 or more.";
    case "not_whole": return "Enter a whole number.";
    case "too_many_decimals": return key === "adRevenueMonth" ? "Use at most 2 decimals." : "Use at most 1 decimal.";
    case "too_large": return key === "adRevenueMonth" ? "Enter up to 100 million." : "Enter up to 10 billion.";
    case "over_100": return "Enter 100 or less.";
    case "shares_over_100": return "These shares add up to more than 100%.";
    case "shares_over_tier1": return "These shares add up to more than your Tier 1 share.";
    case "split_mismatch": return "All five shares should add up to your Tier 1 share.";
    case "invalid_choice": return "Choose one of the options.";
  }
}

function firstError(errors: FieldErrors) {
  return FIELD_ORDER.find((key) => errors[key]) ?? null;
}

function run(raw: Raw, peers: RequirementsPageData["peers"]): { ok: true; shown: Shown } | { ok: false; errors: FieldErrors } {
  const validated = validateRecommendationInput(raw);
  if (!validated.ok) return { ok: false, errors: validated.errors };
  const input = validated.input;
  const result = recommendAdNetworks(input, input.niche === "other" ? null : peers[input.niche]);
  return { ok: true, shown: { input, result, shareRaw: { ...raw }, run: Date.now() } };
}

function leadText(result: RecommendationResult, nameOf: NameOf) {
  const lead = result.lead;
  switch (lead.kind) {
    case "apply": return `Apply to ${nameOf(lead.slug).name} first`;
    case "grow": return `Grow toward ${nameOf(lead.slug).name} next`;
    case "no_step_up": return `No clear step up from ${currentLabel(lead.current, nameOf)} right now`;
    case "none_stand_out": return "No network stands out for these numbers yet";
  }
}

function places(n: number) {
  return n === 1 ? "1 place to try" : `${n} places to try`;
}

function focusField(form: HTMLFormElement, key: InputKey) {
  const target = key === "visitsUnit" ? "visits" : key;
  const node = form.querySelector<HTMLElement>(`[data-focus-key="${target}"]`);
  if (!node) return;
  if (node.matches("input, button, [role='radio']")) node.focus();
  else node.querySelector<HTMLElement>("input, button, [role='radio']")?.focus();
}

export function AdNetworkRequirementsChecker({ data, initialRaw }: { data: RequirementsPageData; initialRaw?: Raw }) {
  const [first] = useState(() => {
    const example = validateRecommendationInput(EXAMPLE);
    if (!example.ok) throw new Error("The ad network example must validate.");
    const exampleShown: Shown = { input: example.input, result: data.defaultResult, shareRaw: { ...EXAMPLE }, run: 0 };
    if (!initialRaw) return { exampleShown, raw: { ...EXAMPLE }, shown: exampleShown, errors: {} as FieldErrors, example: true, stale: false };
    const outcome = run(initialRaw, data.peers);
    if (outcome.ok) return { exampleShown, raw: initialRaw, shown: outcome.shown, errors: {} as FieldErrors, example: false, stale: false };
    return { exampleShown, raw: initialRaw, shown: exampleShown, errors: outcome.errors, example: true, stale: true };
  });
  const [raw, setRaw] = useState<Raw>(first.raw);
  const [shown, setShown] = useState<Shown>(first.shown);
  const [errors, setErrors] = useState<FieldErrors>(first.errors);
  const [isExample, setIsExample] = useState(first.example);
  const [isStale, setIsStale] = useState(first.stale);
  const firstErr = firstError(first.errors);
  const [splitOpen, setSplitOpen] = useState(Boolean(firstErr && SPLIT_KEYS.has(firstErr)));
  const [focusTarget, setFocusTarget] = useState<InputKey | "answer" | null>(firstErr);
  const [announcement, setAnnouncement] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const leadRef = useRef<HTMLParagraphElement>(null);

  const networks = new Map(data.networks.map((network) => [network.slug, network]));
  const nameOf: NameOf = (slug) => networks.get(slug) ?? { name: slug, logo: null, directoryHref: "/ad-networks" };

  useEffect(() => {
    if (!focusTarget) return;
    if (focusTarget === "answer") leadRef.current?.focus();
    else if (formRef.current) focusField(formRef.current, focusTarget);
    setFocusTarget(null);
  }, [focusTarget]);

  function update(key: InputKey, value: string) {
    setRaw((current) => ({ ...current, [key]: value }));
    setIsStale(true);
    setErrors((current) => {
      if (!(key in current) && !(SPLIT_KEYS.has(key) || key === "tier1Share")) return current;
      const next = { ...current };
      delete next[key];
      if (SPLIT_KEYS.has(key) || key === "tier1Share") delete next.shareUS;
      return next;
    });
  }

  function submit(event?: FormEvent) {
    event?.preventDefault();
    const outcome = run(raw, data.peers);
    if (!outcome.ok) {
      setErrors(outcome.errors);
      setIsStale(true);
      const target = firstError(outcome.errors);
      if (target && SPLIT_KEYS.has(target)) setSplitOpen(true);
      setFocusTarget(target);
      return;
    }
    setErrors({});
    setShown(outcome.shown);
    setIsExample(false);
    setIsStale(false);
    setAnnouncement(leadText(outcome.shown.result, nameOf));
    setFocusTarget("answer");
  }

  function reset() {
    removeShareParams();
    setRaw({ ...EXAMPLE });
    setShown((current) => ({ ...first.exampleShown, run: current.run + 1 }));
    setErrors({});
    setIsExample(true);
    setIsStale(false);
    setSplitOpen(false);
  }

  function reveal(key: InputKey) {
    if (SPLIT_KEYS.has(key)) setSplitOpen(true);
    setFocusTarget(key);
  }

  const value = (key: InputKey) => raw[key] ?? "";
  const message = (key: InputKey) => (errors[key] ? errorText(errors[key]!, key) : undefined);
  const splitCount = SPLIT.filter((field) => value(field.key).trim()).length;
  const currentOptions = [
    { id: "none", label: "None" },
    ...data.networks.filter((network) => !LEGACY.has(network.slug)).map((network) => ({ id: network.slug, label: network.name })).sort((a, b) => a.label.localeCompare(b.label, "en")),
    { id: "pubnation", label: "PubNation" },
    { id: "pubgalaxy", label: "PubGalaxy" },
    { id: "snigel", label: "Snigel (now Publisher Collective)" },
    { id: "other", label: "Another network" },
  ];

  return (
    <ToolWorkbench label="Where should I apply?">
      <form className={styles.form} noValidate onSubmit={submit} ref={formRef}>
        <ToolFieldRow>
          <UiSelect
            dataFocusKey="niche"
            error={message("niche")}
            label="Niche"
            onChange={(next) => update("niche", next)}
            options={[...adNetworkNiches.map((niche) => ({ id: niche.slug, label: niche.name })), { id: "other", label: "Something else" }]}
            required
            value={value("niche") || null}
          />
          <UiTextField
            dataFocusKey="tier1Share"
            error={message("tier1Share")}
            hint="US, UK, Canada, Australia, and New Zealand together."
            inputMode="decimal"
            label="Tier 1 share"
            onChange={(next) => update("tier1Share", next)}
            suffix="%"
            value={value("tier1Share")}
          />
        </ToolFieldRow>
        <ToolFieldRow>
          <UiTextField
            dataFocusKey="pageviews"
            error={message("pageviews")}
            hint="From your analytics, a typical recent month."
            inputMode="numeric"
            label="Pageviews a month"
            onChange={(next) => update("pageviews", next)}
            required
            value={value("pageviews")}
          />
          <UiQuantityInput
            dataFocusKey="visits"
            error={message("visits") ?? message("visitsUnit")}
            hint="Pick the name your analytics uses."
            label="Visits or sessions a month"
            onChange={(next) => update("visits", next)}
            onUnitChange={(next) => update("visitsUnit", next)}
            unit={value("visitsUnit") || "sessions"}
            unitAriaLabel="What your analytics calls it"
            units={UNITS}
            value={value("visits")}
          />
        </ToolFieldRow>
        <div className={styles.ageWrap}>
          <UiChoiceGroup
            dataFocusKey="siteAge"
            error={message("siteAge")}
            label="Site age"
            name="siteAge"
            onChange={(next) => update("siteAge", next === "unknown" ? "" : next)}
            options={AGE_OPTIONS}
            value={value("siteAge") || "unknown"}
          />
        </div>
        <ToolFieldRow>
          <div data-focus-key="current">
            <UiComboBox
              error={message("current")}
              hint="Choose None if you don't run ads yet."
              label="Current ad network"
              onChange={(next) => update("current", next ?? "")}
              options={currentOptions}
              placeholder="Type to search"
              value={value("current") || null}
            />
          </div>
          <UiTextField
            dataFocusKey="adRevenueMonth"
            error={message("adRevenueMonth")}
            hint="Ads only, in US dollars, for a typical recent month."
            inputMode="decimal"
            label="Ad revenue a month"
            onChange={(next) => update("adRevenueMonth", next)}
            suffix="USD"
            value={value("adRevenueMonth")}
          />
        </ToolFieldRow>
        <UiDisclosure isExpanded={splitOpen} label="Country split" onExpandedChange={setSplitOpen} summary={uiSetSummary(splitCount)}>
          <div className={styles.split}>
            {SPLIT.map((field) => (
              <UiTextField
                dataFocusKey={field.key}
                error={message(field.key)}
                hint={field.hint}
                inputMode="decimal"
                key={field.key}
                label={field.label}
                onChange={(next) => update(field.key, next)}
                suffix="%"
                value={value(field.key)}
              />
            ))}
          </div>
        </UiDisclosure>
        <UiActionRow>
          {isStale ? <UiStatus>Inputs changed</UiStatus> : null}
          <UiButton type="submit" variant="primary">Find networks</UiButton>
          <UiButton onPress={reset} type="button" variant="secondary">
            <RotateCcw aria-hidden="true" size={17} />
            Reset
          </UiButton>
        </UiActionRow>
      </form>
      <ToolResult label="Where to apply" stale={isStale}>
        <div aria-live="polite" className={styles.visuallyHidden} role="status">{announcement}</div>
        <ResultView isExample={isExample} leadRef={leadRef} nameOf={nameOf} onReveal={reveal} shown={shown} />
      </ToolResult>
    </ToolWorkbench>
  );
}

function ResultView({ isExample, leadRef, nameOf, onReveal, shown }: {
  isExample: boolean;
  leadRef: RefObject<HTMLParagraphElement | null>;
  nameOf: NameOf;
  onReveal: (key: InputKey) => void;
  shown: Shown;
}) {
  const { result, input } = shown;
  const { add, setup, growth } = result.more;
  const moreCount = add.length + setup.length + growth.length;
  const moreSummary = [
    add.length ? `${add.length} to add` : null,
    setup.length ? `${setup.length} for your own setup` : null,
    growth.length ? `${growth.length} to grow toward` : null,
  ].filter(Boolean).join(", ");
  const suggestion = result.suggestInput ? SUGGEST[result.suggestInput] : undefined;
  return (
    <div className={styles.result}>
      <div className={styles.leadBlock}>
        <UiResultLead inputRef={leadRef}>{leadText(result, nameOf)}</UiResultLead>
        <p className={styles.leadMeta}>
          {result.main.length ? <span>{places(result.main.length)}</span> : null}
          <UiStatusWord>Estimate</UiStatusWord>
          {isExample ? <UiStatusWord>Example</UiStatusWord> : null}
        </p>
      </div>
      {result.main.length ? (
        <ol aria-label="Networks to apply to, best first" className={styles.cards}>
          {result.main.map((card, index) => (
            <RecommendationCard card={card} key={`${shown.run}:${card.slug}:${card.program ?? ""}`} nameOf={nameOf} niche={input.niche} rank={index + 1} />
          ))}
        </ol>
      ) : null}
      {suggestion ? (
        <div className={styles.suggest}>
          <p>{suggestion.text}</p>
          <UiButton onPress={() => onReveal(result.suggestInput!)} type="button" variant="ghost">{suggestion.button}</UiButton>
        </div>
      ) : null}
      {moreCount ? (
        <UiDisclosure label="More options" summary={moreSummary}>
          <div className={styles.more}>
            <MoreGroup title="Add alongside">{add.map((card) => <CompactRow card={card} key={card.slug} nameOf={nameOf} />)}</MoreGroup>
            <MoreGroup title="For your own ad setup">{setup.map((card) => <CompactRow card={card} key={card.slug} nameOf={nameOf} />)}</MoreGroup>
            <MoreGroup title="Grow toward">{growth.map((target) => <GrowthRow key={target.slug} nameOf={nameOf} target={target} />)}</MoreGroup>
          </div>
        </UiDisclosure>
      ) : null}
      <UiShareAction params={recommendationShareParams(shown.shareRaw)} />
    </div>
  );
}

function MoreGroup({ children, title }: { children: ReactNode[]; title: string }) {
  if (!children.length) return null;
  return (
    <section className={styles.moreGroup}>
      <h3>{title}</h3>
      <ul className={styles.compactList}>{children}</ul>
    </section>
  );
}
