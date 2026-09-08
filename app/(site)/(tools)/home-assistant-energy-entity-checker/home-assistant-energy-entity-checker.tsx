"use client";

import { RotateCcw } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  ToolActionRow,
  ToolButton,
  ToolChoiceGroup,
  ToolDisclosure,
  ToolResultLead,
  ToolSelect,
  ToolStatus,
  ToolTextArea,
  ToolTextField,
  toolOption,
} from "@/app/tool-ui/tool-controls";
import {
  HOME_ASSISTANT_CORE_VERSION,
  HOME_ASSISTANT_ENERGY_FORMULA_VERSION,
  HOME_ASSISTANT_ENERGY_SOURCE_DATE,
  HOME_ASSISTANT_FRONTEND_VERSION,
  evaluateEnergyEntity,
  parseHomeAssistantAttributes,
  type EnergyCounterBehavior,
  type EnergyEntityRole,
  type EnergyEntityStateKind,
  type ValidEnergyEntityResult,
} from "@/lib/home-assistant-energy/eligibility.ts";
import { counterTone, energyAnswer, ENERGY_ROLE_LABELS, statisticsAnswer, visibleReceived } from "./home-assistant-energy-view";
import styles from "./home-assistant-energy-entity-checker.module.css";

const defaults = Object.freeze({
  counterBehavior: "never_resets" as EnergyCounterBehavior,
  deviceClass: "energy",
  entityId: "sensor.grid_import",
  role: "grid_import" as EnergyEntityRole,
  stateClass: "total",
  stateKind: "numeric" as EnergyEntityStateKind,
  unit: "kWh",
});

const FIELD_LABELS = { domain: "Domain", state: "Current state", device_class: "Device class", state_class: "State class", unit: "Unit" };
const SCOPE_LABELS = { both: "Both", energy: "Energy", statistics: "Statistics" };
const STATE_OPTIONS = [toolOption("numeric", "Numeric"), toolOption("non_numeric", "Non-numeric"), toolOption("unknown", "Unknown"), toolOption("unavailable", "Unavailable")];
const COUNTER_OPTIONS = [toolOption("never_resets", "Never resets"), toolOption("resets_to_zero", "Resets to zero"), toolOption("can_decrease", "Can decrease"), toolOption("unknown", "Unknown")];

function removeStateParameter() {
  const url = new URL(window.location.href);
  if (!url.searchParams.has("state")) return false;
  url.searchParams.delete("state");
  history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  return true;
}

function fieldLengthError(field: "entityId" | "deviceClass" | "stateClass" | "unit", value: string) {
  const limits = { deviceClass: 64, entityId: 255, stateClass: 64, unit: 32 };
  return value.length > limits[field] ? `${field === "entityId" ? "Entity ID" : field === "deviceClass" ? "Device class" : field === "stateClass" ? "State class" : "Unit"} must be ${limits[field]} characters or fewer.` : null;
}

function ConclusionBand({ result, resultRef }: { result: ValidEnergyEntityResult; resultRef: React.RefObject<HTMLParagraphElement | null> }) {
  return (
    <section aria-label="Eligibility conclusions" className={styles.conclusions}>
      <div>
        <ToolResultLead inputRef={resultRef}>{energyAnswer(result)}</ToolResultLead>
        <p>Live Energy validation was not inspected.</p>
      </div>
      <div>
        <strong>{statisticsAnswer(result)}</strong>
        <p>Recorder inclusion, statistic metadata, and stored-unit history were not inspected.</p>
      </div>
    </section>
  );
}

function RuleTrace({ result }: { result: ValidEnergyEntityResult }) {
  return (
    <table aria-label="Attribute rule trace" className={styles.ruleTable}>
      <thead><tr><th>Checks</th><th>Rule</th><th>Received</th><th>Accepted</th><th>Result</th></tr></thead>
      <tbody>
        {result.rules.map((entry) => (
          <tr key={`${entry.scope}-${entry.field}`}>
            <td data-label="Checks">{SCOPE_LABELS[entry.scope]}</td>
            <th data-label="Rule" scope="row">{FIELD_LABELS[entry.field]}</th>
            <td data-label="Received"><code aria-label={entry.received} title={entry.received}>{visibleReceived(entry.received)}</code></td>
            <td data-label="Accepted"><code>{entry.accepted.join(", ")}</code></td>
            <td data-label="Result"><strong className={entry.status === "pass" ? styles.pass : styles.fail}>{entry.status === "pass" ? "Pass" : "Fail"}</strong></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Result({ result, resultRef }: { result: ValidEnergyEntityResult; resultRef: React.RefObject<HTMLParagraphElement | null> }) {
  return (
    <section className={styles.result}>
      <ConclusionBand result={result} resultRef={resultRef} />
      {result.counter.status !== "not_applicable" ? (
        <ToolStatus tone={counterTone(result.counter)}>Counter: {result.counter.status === "pass" ? "Fits" : result.counter.status === "fail" ? "Does not fit" : "Needs verification"}. {result.counter.reason}</ToolStatus>
      ) : null}
      <RuleTrace result={result} />
      <p className={styles.provenance}>Core {HOME_ASSISTANT_CORE_VERSION} · Frontend {HOME_ASSISTANT_FRONTEND_VERSION} · Formula v{HOME_ASSISTANT_ENERGY_FORMULA_VERSION} · Checked {HOME_ASSISTANT_ENERGY_SOURCE_DATE}</p>
    </section>
  );
}

export function HomeAssistantEnergyEntityChecker() {
  const [role, setRole] = useState(defaults.role);
  const [entityId, setEntityId] = useState<string>(defaults.entityId);
  const [stateKind, setStateKind] = useState(defaults.stateKind);
  const [deviceClass, setDeviceClass] = useState<string>(defaults.deviceClass);
  const [stateClass, setStateClass] = useState<string>(defaults.stateClass);
  const [unit, setUnit] = useState<string>(defaults.unit);
  const [counterBehavior, setCounterBehavior] = useState(defaults.counterBehavior);
  const [pasted, setPasted] = useState("");
  const [pasteError, setPasteError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<"entityId" | "deviceClass" | "stateClass" | "unit", string>>>({});
  const [result, setResult] = useState<ValidEnergyEntityResult | null>(null);
  const [failed, setFailed] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const roleGroupRef = useRef<HTMLDivElement>(null);
  const pasteRef = useRef<HTMLTextAreaElement>(null);
  const entityRef = useRef<HTMLInputElement>(null);
  const deviceRef = useRef<HTMLInputElement>(null);
  const stateClassRef = useRef<HTMLInputElement>(null);
  const unitRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLParagraphElement>(null);
  const failureRef = useRef<HTMLElement>(null);

  useEffect(() => { if (removeStateParameter()) setNotice("Shared inputs are not supported."); }, []);

  function clearResult() { setResult(null); setFailed(false); removeStateParameter(); }
  function change<T>(setter: (value: T) => void, value: T) { setter(value); setNotice(null); clearResult(); }

  function importAttributes() {
    clearResult();
    const parsed = parseHomeAssistantAttributes(pasted);
    if (parsed.status === "invalid") {
      setPasteError(parsed.message);
      requestAnimationFrame(() => pasteRef.current?.focus());
      return;
    }
    const changed: string[] = [];
    for (const [key, next, setter, label] of [
      ["entityId", parsed.values.entityId, setEntityId, "entity ID"],
      ["stateKind", parsed.values.stateKind, setStateKind, "current state"],
      ["deviceClass", parsed.values.deviceClass, setDeviceClass, "device class"],
      ["stateClass", parsed.values.stateClass, setStateClass, "state class"],
      ["unit", parsed.values.unit, setUnit, "unit"],
    ] as const) {
      if (next !== undefined) { (setter as (value: never) => void)(next as never); changed.push(label); }
    }
    setPasteError(null);
    setNotice(changed.length ? `Imported ${changed.join(", ")}.` : "No supported attributes were found.");
  }

  function validate() {
    const checks = [
      ["entityId", entityId, entityRef],
      ["deviceClass", deviceClass, deviceRef],
      ["stateClass", stateClass, stateClassRef],
      ["unit", unit, unitRef],
    ] as const;
    const nextErrors: typeof errors = {};
    for (const [field, value] of checks) {
      const message = fieldLengthError(field, value);
      if (message) nextErrors[field] = message;
    }
    setErrors(nextErrors);
    const first = checks.find(([field]) => nextErrors[field]);
    if (first) requestAnimationFrame(() => first[2].current?.focus());
    return !first;
  }

  function submit(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    setNotice(null);
    clearResult();
    if (!validate()) return;
    try {
      const next = evaluateEnergyEntity({ role, entityId, stateKind, deviceClass, stateClass, unit, counterBehavior });
      if (next.status === "invalid") {
        setFailed(true);
        requestAnimationFrame(() => failureRef.current?.focus());
        return;
      }
      setResult(next);
      requestAnimationFrame(() => resultRef.current?.focus());
    } catch {
      setFailed(true);
      requestAnimationFrame(() => failureRef.current?.focus());
    }
  }

  function reset() {
    setRole(defaults.role); setEntityId(defaults.entityId); setStateKind(defaults.stateKind); setDeviceClass(defaults.deviceClass);
    setStateClass(defaults.stateClass); setUnit(defaults.unit); setCounterBehavior(defaults.counterBehavior); setPasted("");
    setPasteError(null); setErrors({}); setResult(null); setFailed(false); setNotice(null); removeStateParameter();
    requestAnimationFrame(() => roleGroupRef.current?.querySelector<HTMLElement>("[role='radio'], input")?.focus());
  }

  return (
    <section aria-label="Energy entity checker inputs and results" className={styles.tool} data-tool-workbench>
      <form className={styles.form} onSubmit={submit}>
        <div ref={roleGroupRef}>
          <ToolChoiceGroup label="Intended Energy field" onChange={(next) => change(setRole, next as EnergyEntityRole)} options={Object.entries(ENERGY_ROLE_LABELS).map(([id, label]) => toolOption(id, label))} value={role} />
        </div>

        <ToolDisclosure label="Paste attributes">
          <div className={styles.pasteArea}>
            <ToolTextArea autoCapitalize="none" error={pasteError} inputRef={pasteRef} label="Pasted attributes" onChange={(next) => { setPasted(next); setPasteError(null); clearResult(); }} placeholder={"entity_id: sensor.grid_import\ndevice_class: energy\nstate_class: total\nunit_of_measurement: kWh"} rows={7} spellCheck={false} value={pasted} />
            <ToolButton onPress={importAttributes} type="button">Import attributes</ToolButton>
          </div>
        </ToolDisclosure>

        <div className={styles.fields}>
          <ToolTextField error={errors.entityId} inputRef={entityRef} label="Entity ID" onChange={(next) => { setErrors((current) => ({ ...current, entityId: undefined })); change(setEntityId, next); }} spellCheck={false} value={entityId} />
          <ToolSelect label="Current state" onChange={(next) => change(setStateKind, next as EnergyEntityStateKind)} options={STATE_OPTIONS} value={stateKind} />
          <ToolTextField error={errors.deviceClass} inputRef={deviceRef} label="Device class" onChange={(next) => { setErrors((current) => ({ ...current, deviceClass: undefined })); change(setDeviceClass, next); }} spellCheck={false} value={deviceClass} />
          <ToolTextField error={errors.stateClass} inputRef={stateClassRef} label="State class" onChange={(next) => { setErrors((current) => ({ ...current, stateClass: undefined })); change(setStateClass, next); }} spellCheck={false} value={stateClass} />
          <ToolTextField error={errors.unit} inputRef={unitRef} label="Unit" onChange={(next) => { setErrors((current) => ({ ...current, unit: undefined })); change(setUnit, next); }} spellCheck={false} value={unit} />
          {role === "power" ? null : <ToolSelect label="Counter behavior" onChange={(next) => change(setCounterBehavior, next as EnergyCounterBehavior)} options={COUNTER_OPTIONS} value={counterBehavior} />}
        </div>

        <p className={styles.privacy}>Inputs stay in this browser.</p>
        {notice ? <ToolStatus>{notice}</ToolStatus> : null}
        <ToolActionRow>
          <ToolButton onPress={reset} type="button"><RotateCcw aria-hidden="true" size={18} /> Reset</ToolButton>
          <ToolButton type="submit" variant="primary">Check entity</ToolButton>
        </ToolActionRow>
      </form>

      {failed ? <section className={styles.failure} ref={failureRef} role="alert" tabIndex={-1}><ToolStatus tone="danger">The check could not run. Your inputs are still here.</ToolStatus><ToolButton onPress={() => submit()} type="button">Try again</ToolButton></section> : null}
      {result ? <Result result={result} resultRef={resultRef} /> : null}
    </section>
  );
}
