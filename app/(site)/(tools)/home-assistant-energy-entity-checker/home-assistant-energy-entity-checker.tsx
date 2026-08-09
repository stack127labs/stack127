"use client";

import { RotateCcw } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
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
import styles from "./home-assistant-energy-entity-checker.module.css";

const roles: ReadonlyArray<readonly [EnergyEntityRole, string]> = [
  ["grid_import", "Grid import"],
  ["grid_export", "Grid export"],
  ["solar", "Solar"],
  ["battery_charge", "Battery charge"],
  ["battery_discharge", "Battery discharge"],
  ["individual_device", "Individual device"],
  ["power", "Power"],
  ["gas", "Gas"],
  ["water", "Water"],
];

const defaults = Object.freeze({
  role: "grid_import" as EnergyEntityRole,
  entityId: "sensor.grid_import",
  stateKind: "numeric" as EnergyEntityStateKind,
  deviceClass: "energy",
  stateClass: "total",
  unit: "kWh",
  counterBehavior: "never_resets" as EnergyCounterBehavior,
});

const fieldLabels = Object.freeze({
  domain: "Domain",
  state: "Current state",
  device_class: "Device class",
  state_class: "State class",
  unit: "Unit",
});

const scopeLabels = Object.freeze({
  both: "Both",
  energy: "Energy",
  statistics: "Statistics",
});

function removeStateParameter() {
  const url = new URL(window.location.href);
  if (!url.searchParams.has("state")) return false;
  url.searchParams.delete("state");
  const query = url.searchParams.toString();
  history.replaceState(null, "", `${url.pathname}${query ? `?${query}` : ""}${url.hash}`);
  return true;
}

function answerFor(result: ValidEnergyEntityResult) {
  return result.energy.status === "fails_attributes"
    ? "Attributes do not match this Energy field."
    : "Attributes match this Energy field.";
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
  const [pasteError, setPasteError] = useState("");
  const [result, setResult] = useState<ValidEnergyEntityResult | null>(null);
  const [failed, setFailed] = useState(false);
  const [status, setStatus] = useState("");
  const [notice, setNotice] = useState("");
  const firstRoleRef = useRef<HTMLInputElement>(null);
  const pasteRef = useRef<HTMLTextAreaElement>(null);
  const answerRef = useRef<HTMLHeadingElement>(null);
  const failureRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (removeStateParameter()) {
      setNotice("Shared inputs are not supported.");
      setStatus("Shared inputs are not supported.");
    }
  }, []);

  const clearResult = () => {
    setResult(null);
    setFailed(false);
    removeStateParameter();
  };

  const change = <T,>(setter: (value: T) => void, value: T) => {
    setter(value);
    clearResult();
  };

  const submit = (event?: FormEvent) => {
    event?.preventDefault();
    setNotice("");
    setPasteError("");
    try {
      const next = evaluateEnergyEntity({ role, entityId, stateKind, deviceClass, stateClass, unit, counterBehavior });
      if (next.status === "invalid") {
        setResult(null);
        setFailed(false);
        setStatus(next.message);
        firstRoleRef.current?.focus();
        return;
      }
      setResult(next);
      setFailed(false);
      setStatus(answerFor(next));
      requestAnimationFrame(() => answerRef.current?.focus());
    } catch {
      setResult(null);
      setFailed(true);
      setStatus("Check failed.");
      requestAnimationFrame(() => failureRef.current?.focus());
    }
  };

  const importAttributes = () => {
    clearResult();
    const parsed = parseHomeAssistantAttributes(pasted);
    if (parsed.status === "invalid") {
      setPasteError(parsed.message);
      setStatus(parsed.message);
      pasteRef.current?.focus();
      return;
    }
    const values = parsed.values;
    if (values.entityId !== undefined) setEntityId(values.entityId);
    if (values.stateKind !== undefined) setStateKind(values.stateKind);
    if (values.deviceClass !== undefined) setDeviceClass(values.deviceClass);
    if (values.stateClass !== undefined) setStateClass(values.stateClass);
    if (values.unit !== undefined) setUnit(values.unit);
    setPasteError("");
    setNotice("Attributes imported.");
    setStatus("Attributes imported.");
  };

  const reset = () => {
    setRole(defaults.role);
    setEntityId(defaults.entityId);
    setStateKind(defaults.stateKind);
    setDeviceClass(defaults.deviceClass);
    setStateClass(defaults.stateClass);
    setUnit(defaults.unit);
    setCounterBehavior(defaults.counterBehavior);
    setPasted("");
    setPasteError("");
    setResult(null);
    setFailed(false);
    setNotice("");
    setStatus("Checker reset.");
    removeStateParameter();
    firstRoleRef.current?.focus();
  };

  return (
    <section
      aria-label="Energy entity checker inputs and results"
      className={styles.tool}
    >
      <form className={styles.form} onSubmit={submit}>
        <fieldset className={styles.roleFieldset}>
          <legend>Intended Energy field</legend>
          <div className={styles.choiceRow}>
            {roles.map(([value, label], index) => (
              <label className={styles.choice} key={value}>
                <input
                  checked={role === value}
                  name="energy-role"
                  onChange={() => change(setRole, value)}
                  ref={index === 0 ? firstRoleRef : undefined}
                  type="radio"
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className={styles.pasteArea}>
          <label className={styles.field}>
            <span>Pasted attributes</span>
            <textarea
              aria-describedby={pasteError ? "energy-paste-error" : undefined}
              aria-invalid={Boolean(pasteError)}
              onChange={(event) => {
                setPasted(event.target.value);
                setPasteError("");
                clearResult();
              }}
              placeholder={"entity_id: sensor.grid_import\ndevice_class: energy\nstate_class: total\nunit_of_measurement: kWh"}
              ref={pasteRef}
              spellCheck={false}
              value={pasted}
            />
            {pasteError ? <span className={styles.error} id="energy-paste-error">{pasteError}</span> : null}
          </label>
          <button className={styles.secondaryButton} onClick={importAttributes} type="button">Import attributes</button>
        </div>

        <div className={styles.fields}>
          <label className={styles.field}>
            <span>Entity ID</span>
            <input onChange={(event) => change(setEntityId, event.target.value)} spellCheck={false} value={entityId} />
          </label>
          <label className={styles.field}>
            <span>Current state</span>
            <select onChange={(event) => change(setStateKind, event.target.value as EnergyEntityStateKind)} value={stateKind}>
              <option value="numeric">Numeric</option>
              <option value="non_numeric">Non-numeric</option>
              <option value="unknown">Unknown</option>
              <option value="unavailable">Unavailable</option>
            </select>
          </label>
          <label className={styles.field}>
            <span>Device class</span>
            <input onChange={(event) => change(setDeviceClass, event.target.value)} spellCheck={false} value={deviceClass} />
          </label>
          <label className={styles.field}>
            <span>State class</span>
            <input onChange={(event) => change(setStateClass, event.target.value)} spellCheck={false} value={stateClass} />
          </label>
          <label className={styles.field}>
            <span>Unit</span>
            <input onChange={(event) => change(setUnit, event.target.value)} spellCheck={false} value={unit} />
          </label>
          {role === "power" ? null : (
            <label className={styles.field}>
              <span>Counter behavior</span>
              <select onChange={(event) => change(setCounterBehavior, event.target.value as EnergyCounterBehavior)} value={counterBehavior}>
                <option value="never_resets">Never resets</option>
                <option value="resets_to_zero">Resets to zero</option>
                <option value="can_decrease">Can decrease</option>
                <option value="unknown">Unknown</option>
              </select>
            </label>
          )}
        </div>

        <p className={styles.privacy}>Inputs stay in this browser.</p>
        {notice ? <p className={styles.notice}>{notice}</p> : null}
        <div className={styles.actions}>
          <button className={styles.secondaryButton} onClick={reset} type="button">
            <RotateCcw aria-hidden="true" size={18} /> Reset
          </button>
          <button className={styles.primaryButton} type="submit">Check entity</button>
        </div>
      </form>

      {failed ? (
        <section className={styles.failure} role="alert">
          <h2 ref={failureRef} tabIndex={-1}>Check failed.</h2>
          <button className={styles.secondaryButton} onClick={() => submit()} type="button">Try again</button>
        </section>
      ) : null}

      {result ? (
        <section className={styles.result}>
          <h2 ref={answerRef} tabIndex={-1}>{answerFor(result)}</h2>
          <div className={styles.conclusions}>
            <section>
              <h3>Energy picker</h3>
              <p>{result.energy.status === "fails_attributes" ? "Fix the failed rules." : "Attributes match. Check Energy settings."}</p>
              <span>Live validation: not checked</span>
            </section>
            <section>
              <h3>Long-term statistics</h3>
              <p>{result.statistics.status === "fails_attributes" ? "Fix the failed rules." : "Attributes match. Check Statistics."}</p>
              <span>Recorder: not checked</span>
            </section>
          </div>

          {result.counter.status === "not_applicable" ? null : (
            <p className={result.counter.status === "pass" ? styles.counter : styles.counterProblem}>
              Counter: <strong>{result.counter.status}</strong>. {result.counter.reason}
            </p>
          )}

          <table className={styles.ruleTable}>
            <thead>
              <tr><th>Checks</th><th>Rule</th><th>Received</th><th>Accepted</th><th>Result</th></tr>
            </thead>
            <tbody>
              {result.rules.map((entry) => (
                <tr key={`${entry.scope}-${entry.field}`}>
                  <td data-label="Checks">{scopeLabels[entry.scope]}</td>
                  <th data-label="Rule" scope="row">{fieldLabels[entry.field]}</th>
                  <td data-label="Received"><code>{entry.received}</code></td>
                  <td data-label="Accepted"><code>{entry.accepted.join(", ")}</code></td>
                  <td data-label="Result"><strong className={entry.status === "pass" ? styles.pass : styles.fail}>{entry.status === "pass" ? "Pass" : "Fail"}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>

          <ul className={styles.instanceChecks}>
            <li>Statistics metadata: not checked</li>
            <li>Stored units: not checked</li>
            <li>Energy validation: not checked</li>
          </ul>
          <ul aria-label="Rule source versions" className={styles.provenance}>
            <li>Core {HOME_ASSISTANT_CORE_VERSION}</li>
            <li>Frontend {HOME_ASSISTANT_FRONTEND_VERSION}</li>
            <li>Formula v{HOME_ASSISTANT_ENERGY_FORMULA_VERSION}</li>
            <li>Checked {HOME_ASSISTANT_ENERGY_SOURCE_DATE}</li>
          </ul>
        </section>
      ) : null}

      <p aria-live="polite" className={styles.srOnly}>{status}</p>
    </section>
  );
}
