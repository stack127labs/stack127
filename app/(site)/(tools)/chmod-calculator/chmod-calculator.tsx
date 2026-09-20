"use client";

import { Check, Copy } from "lucide-react";
import { useRef, useState, type FormEvent } from "react";
import {
  ToolActionRow,
  ToolButton,
  ToolCheckbox,
  ToolCodeOutput,
  ToolDataTable,
  ToolResultLead,
  ToolStatus,
  ToolTextArea,
  ToolTextField,
} from "@/app/tool-ui/tool-controls";
import {
  DEFAULT_CHMOD_BITS,
  bitsFromMode,
  calculateChmod,
  formatOctalMode,
  modeFromBits,
  parseOctalMode,
  type ChmodBits,
  type ChmodCalculationResult,
  type ChmodValidResult,
} from "./chmod-calculator-engine";
import styles from "./chmod-calculator.module.css";

type BitKey = keyof ChmodBits;
type CopyKind = "mode" | "command";

const EMPTY_BITS = bitsFromMode(0);
const PRESETS = ["644", "755", "600"] as const;

const CLASS_GROUPS = [
  { label: "Owner", keys: ["ownerRead", "ownerWrite", "ownerExecute"] as const },
  { label: "Group", keys: ["groupRead", "groupWrite", "groupExecute"] as const },
  { label: "Others", keys: ["othersRead", "othersWrite", "othersExecute"] as const },
] as const;

const SPECIAL_BITS = [
  ["setuid", "Setuid"],
  ["setgid", "Setgid"],
  ["sticky", "Sticky"],
] as const;

const COPY_FAILURE = "Copy failed. Select the text to copy it.";

async function copyText(value: string) {
  try {
    if (!navigator.clipboard?.writeText) throw new Error("Clipboard API unavailable");
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const textarea = document.createElement("textarea");
    textarea.value = value;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    let copied = false;
    try {
      copied = document.execCommand("copy");
    } catch {
      copied = false;
    } finally {
      document.body.removeChild(textarea);
      previousFocus?.focus({ preventScroll: true });
    }
    return copied;
  }
}

function CopyAction({ kind, label, value }: { kind: CopyKind; label: string; value: string }) {
  const [state, setState] = useState<"ready" | "copied" | "failed">("ready");
  const fallbackLabel = `Copy this ${kind}`;
  const status = state === "copied" ? "Copied" : state === "failed" ? COPY_FAILURE : "";

  async function copy() {
    const copied = await copyText(value);
    setState(copied ? "copied" : "failed");
    if (copied) window.setTimeout(() => setState("ready"), 1600);
  }

  return (
    <div className={styles.copyControl}>
      <ToolButton aria-label={state === "failed" ? `Retry copy ${kind}` : state === "copied" ? "Copied" : label} onPress={copy} variant="ghost">
        {state === "copied" ? <Check aria-hidden="true" size={17} /> : <Copy aria-hidden="true" size={17} />}
        {state === "failed" ? `Retry copy ${kind}` : state === "copied" ? "Copied" : label}
      </ToolButton>
      <span aria-live="polite" className={styles.copyStatus}>{status}</span>
      {state === "failed" ? <ToolTextArea label={fallbackLabel} readOnly rows={3} value={value} /> : null}
    </div>
  );
}

function resultFromCalculation(calculation: ChmodCalculationResult): ChmodValidResult | null {
  return calculation.status === "valid" ? calculation : null;
}

function permissionLabel(group: string, label: string) {
  return <><span className={styles.visuallyHidden}>{group} </span>{label}</>;
}

export function ChmodCalculator() {
  const [octalText, setOctalText] = useState("644");
  const [bits, setBits] = useState<ChmodBits>(DEFAULT_CHMOD_BITS);
  const [result, setResult] = useState<ChmodValidResult | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [unexpectedError, setUnexpectedError] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const octalRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLParagraphElement>(null);
  const draft = parseOctalMode(octalText);
  const gridUnavailable = draft.status === "invalid";

  function clearResult(message = "Inputs changed.") {
    setResult(null);
    setUnexpectedError("");
    setAnnouncement(message);
  }

  function updateOctal(value: string) {
    setOctalText(value);
    setFieldError(null);
    const next = parseOctalMode(value);
    if (next.status === "valid") setBits(bitsFromMode(next.mode));
    else setBits(EMPTY_BITS);
    clearResult();
  }

  function updateBit(key: BitKey, selected: boolean) {
    const next = { ...bits, [key]: selected };
    setBits(next);
    setOctalText(formatOctalMode(modeFromBits(next)));
    setFieldError(null);
    clearResult();
  }

  function loadPreset(mode: string) {
    const parsed = parseOctalMode(mode);
    if (parsed.status !== "valid") return;
    setOctalText(mode);
    setBits(bitsFromMode(parsed.mode));
    setFieldError(null);
    setUnexpectedError("");
    setResult(null);
    setAnnouncement(`Mode ${mode} loaded.`);
  }

  function calculate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldError(null);
    setUnexpectedError("");
    const parsed = parseOctalMode(octalText);
    if (parsed.status === "invalid") {
      setResult(null);
      setFieldError(parsed.message);
      setAnnouncement(parsed.message);
      requestAnimationFrame(() => octalRef.current?.focus());
      return;
    }
    try {
      if (process.env.NODE_ENV !== "production" && typeof window !== "undefined" && (window as typeof window & { __STACK127_TEST_FORCE_CHMOD_FAILURE?: boolean }).__STACK127_TEST_FORCE_CHMOD_FAILURE) {
        throw new Error("guarded test failure");
      }
      const next = resultFromCalculation(calculateChmod(bitsFromMode(parsed.mode)));
      if (!next) throw new Error("invalid calculation");
      setResult(next);
      setAnnouncement(`Mode ${next.octal} is ${next.symbolic}.`);
      requestAnimationFrame(() => resultRef.current?.focus());
    } catch {
      setResult(null);
      setUnexpectedError("Couldn't calculate permissions. Try again.");
      setAnnouncement("Couldn't calculate permissions. Try again.");
    }
  }

  function reset() {
    setOctalText("644");
    setBits(DEFAULT_CHMOD_BITS);
    setResult(null);
    setFieldError(null);
    setUnexpectedError("");
    setAnnouncement("Calculator reset.");
    requestAnimationFrame(() => octalRef.current?.focus());
  }

  return (
    <section aria-label="chmod calculator inputs and results" className={styles.tool} data-tool-workbench>
      <form className={styles.form} noValidate onSubmit={calculate}>
        <ToolTextField
          autoCapitalize="none"
          description={gridUnavailable && !fieldError ? "Enter a valid octal mode or choose an example to edit the permission boxes." : undefined}
          error={fieldError}
          inputMode="numeric"
          inputRef={octalRef}
          label="Octal mode"
          onChange={updateOctal}
          required
          spellCheck={false}
          value={octalText}
        />

        <div aria-label="Examples" className={styles.examples}>
          <span className={styles.examplesLabel}>Examples</span>
          <div className={styles.exampleButtons}>
            {PRESETS.map((preset) => (
              <ToolButton
                aria-label={`Load mode ${preset}`}
                key={preset}
                onPress={() => loadPreset(preset)}
                type="button"
                variant="ghost"
              >
                {preset}
              </ToolButton>
            ))}
          </div>
        </div>

        <div className={styles.permissionGroups}>
          {CLASS_GROUPS.map((group) => (
            <fieldset className={styles.permissionGroup} disabled={gridUnavailable} key={group.label}>
              <legend>{group.label}</legend>
              <div className={styles.checkboxList}>
                {(["Read", "Write", "Execute"] as const).map((label, index) => (
                  <ToolCheckbox
                    isDisabled={gridUnavailable}
                    isSelected={bits[group.keys[index]]}
                    key={label}
                    onChange={(selected) => updateBit(group.keys[index], selected)}
                  >
                    {permissionLabel(group.label, label)}
                  </ToolCheckbox>
                ))}
              </div>
            </fieldset>
          ))}
        </div>

        <fieldset className={styles.specialGroup} disabled={gridUnavailable}>
          <legend>Special bits</legend>
          <div className={styles.specialBits}>
            {SPECIAL_BITS.map(([key, label]) => (
              <ToolCheckbox isDisabled={gridUnavailable} isSelected={bits[key]} key={key} onChange={(selected) => updateBit(key, selected)}>
                {label}
              </ToolCheckbox>
            ))}
          </div>
        </fieldset>

        <ToolActionRow>
          <ToolButton type="submit" variant="primary">Calculate permissions</ToolButton>
          <ToolButton onPress={reset} type="button" variant="ghost">Reset</ToolButton>
        </ToolActionRow>
        {unexpectedError ? <ToolStatus tone="danger">{unexpectedError}</ToolStatus> : null}
        <p aria-live="polite" className={styles.visuallyHidden}>{announcement}</p>
      </form>

      {result ? (
        <section aria-label="Permissions result" className={styles.result} data-chmod-result>
          <div className={styles.leadRow}>
            <ToolResultLead inputRef={resultRef}>Mode <code>{result.octal}</code> is <code>{result.symbolic}</code>.</ToolResultLead>
            <CopyAction kind="mode" label="Copy mode" value={result.octal} />
          </div>

          <div className={styles.tableRegion} data-chmod-breakdown>
            <ToolDataTable
              ariaLabel="Permission digit breakdown"
              columns={[{ id: "class", label: "Class" }, { id: "digit", label: "Digit" }, { id: "calculation", label: "Calculation" }]}
              rows={result.classRows.map((row) => ({ id: row.id, cells: { class: row.label, digit: row.digit, calculation: row.calculation } }))}
            />
          </div>

          {result.specialContext.length || result.context.length ? (
            <div className={styles.context}>
              {[...result.specialContext, ...result.context].map((message) => <p key={message}>{message}</p>)}
            </div>
          ) : null}

          <div className={styles.commandRegion} data-chmod-command>
            <ToolCodeOutput actions={<CopyAction kind="command" label="Copy command" value={result.command} />} code={result.command} label="Command example" />
            <p className={styles.note}>Replace the example path with your file&apos;s path. Filesystem effects are not verified by this calculator.</p>
          </div>
        </section>
      ) : null}
    </section>
  );
}
