"use client";

import { Clipboard, RotateCcw } from "lucide-react";
import { FormEvent, useRef, useState } from "react";
import {
  NGINX_FIXTURE_VERSION,
  NGINX_PROXY_PASS_FORMULA_VERSION,
  type LocationType,
  type ProxyPassInput,
  type ProxyPassResult,
  type RewriteState,
  calculateProxyPassUri,
} from "../../../../lib/nginx/proxy-pass-uri";
import styles from "./nginx-proxy-pass-calculator.module.css";

const defaults: ProxyPassInput = {
  locationType: "prefix",
  location: "/api/",
  requestTarget: "/api/users?id=42",
  proxyPass: "http://backend/",
  rewriteState: "none",
  compareSlash: true,
};

const unknownText: Record<Extract<ProxyPassResult, { status: "unknown" }>['reason'], string> = {
  "regex-location": "Regex locations need live NGINX.",
  "named-location": "Named locations need live NGINX.",
  variables: "Variables need runtime values.",
  "rewrite-break": "rewrite break changes URI processing.",
  "rewrite-last": "rewrite last starts another location search.",
  "rewrite-other": "This rewrite needs live NGINX.",
  "proxy-query": "Proxy target arguments are not supported.",
  "normalization-sensitive": "This path needs NGINX normalization.",
};

export function NginxProxyPassCalculator() {
  const [input, setInput] = useState<ProxyPassInput>(defaults);
  const [result, setResult] = useState<ProxyPassResult | null>(null);
  const [copyStatus, setCopyStatus] = useState("");
  const form = useRef<HTMLFormElement>(null);
  const resultHeading = useRef<HTMLHeadingElement>(null);
  const locationInput = useRef<HTMLInputElement>(null);

  function update<Key extends keyof ProxyPassInput>(key: Key, value: ProxyPassInput[Key]) {
    setInput((current) => ({ ...current, [key]: value }));
    setResult(null);
    setCopyStatus("");
  }

  function toggleSlashComparison(compareSlash: boolean) {
    const nextInput = { ...input, compareSlash };
    setInput(nextInput);
    if (result?.status === "success") {
      const nextResult = calculateProxyPassUri(nextInput);
      if (nextResult.status === "success") setResult(nextResult);
    }
    setCopyStatus("");
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = calculateProxyPassUri(input);
    setResult(next);
    setCopyStatus("");
    requestAnimationFrame(() => {
      if (next.status === "invalid") {
        const invalidInput = form.current?.querySelector<HTMLElement>('[aria-invalid="true"]');
        if (invalidInput) {
          invalidInput.focus();
          return;
        }
      }
      resultHeading.current?.focus();
    });
  }

  function reset() {
    setInput(defaults);
    setResult(null);
    setCopyStatus("");
    requestAnimationFrame(() => locationInput.current?.focus());
  }

  async function copyUrl() {
    if (result?.status !== "success") return;
    try {
      await navigator.clipboard.writeText(result.finalUrl);
      setCopyStatus("URL copied.");
    } catch {
      setCopyStatus("Copy failed. Select the URL.");
    }
  }

  const errors = result?.status === "invalid" ? result.errors : {};

  return (
    <section className={styles.tool} aria-label="proxy_pass calculator inputs and results">
      <form ref={form} className={styles.form} onSubmit={submit} noValidate>
        <fieldset className={styles.choiceFieldset}>
          <legend>Location type</legend>
          <div className={styles.choiceRow}>
            {(["prefix", "exact", "regex", "named"] as LocationType[]).map((value) => (
              <label className={styles.choice} key={value}>
                <input
                  type="radio"
                  name="locationType"
                  value={value}
                  checked={input.locationType === value}
                  onChange={() => update("locationType", value)}
                />
                <span>{value === "exact" ? "Exact =" : value[0].toUpperCase() + value.slice(1)}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className={styles.fields}>
          <label className={styles.field}>
            <span>Matched location</span>
            <input
              ref={locationInput}
              value={input.location}
              onChange={(event) => update("location", event.target.value)}
              aria-invalid={Boolean(errors.location)}
              aria-describedby={errors.location ? "proxy-location-error" : undefined}
              spellCheck={false}
            />
            {errors.location ? <span className={styles.error} id="proxy-location-error">{errors.location}</span> : null}
          </label>
          <label className={styles.field}>
            <span>Request target</span>
            <input
              value={input.requestTarget}
              onChange={(event) => update("requestTarget", event.target.value)}
              aria-invalid={Boolean(errors.requestTarget)}
              aria-describedby={errors.requestTarget ? "proxy-request-error" : undefined}
              spellCheck={false}
            />
            {errors.requestTarget ? <span className={styles.error} id="proxy-request-error">{errors.requestTarget}</span> : null}
          </label>
          <label className={styles.field}>
            <span>proxy_pass URL</span>
            <input
              value={input.proxyPass}
              onChange={(event) => update("proxyPass", event.target.value)}
              aria-invalid={Boolean(errors.proxyPass)}
              aria-describedby={errors.proxyPass ? "proxy-pass-error" : undefined}
              spellCheck={false}
            />
            {errors.proxyPass ? <span className={styles.error} id="proxy-pass-error">{errors.proxyPass}</span> : null}
          </label>
        </div>

        <fieldset className={styles.choiceFieldset}>
          <legend>Rewrite before proxy_pass</legend>
          <div className={styles.choiceRow}>
            {(["none", "break", "last", "other"] as RewriteState[]).map((value) => (
              <label className={styles.choice} key={value}>
                <input
                  type="radio"
                  name="rewriteState"
                  value={value}
                  checked={input.rewriteState === value}
                  onChange={() => update("rewriteState", value)}
                />
                <span>{value === "none" ? "None" : value === "other" ? "Other" : value}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <label className={styles.checkChoice}>
          <input
            type="checkbox"
            checked={input.compareSlash}
            onChange={(event) => toggleSlashComparison(event.target.checked)}
          />
          <span>Compare the final slash</span>
        </label>

        <div className={styles.actions}>
          <button className={styles.primaryButton} type="submit">Calculate upstream URL</button>
          <button className={styles.secondaryButton} type="button" onClick={reset}>
            <RotateCcw aria-hidden="true" size={18} /> Reset
          </button>
        </div>
      </form>

      {result?.status === "success" ? (
        <div className={styles.result} aria-live="polite">
          <div className={styles.resultHeader}>
            <div className={styles.answer}>
              <h2 ref={resultHeading} tabIndex={-1}>Final upstream URL</h2>
              <code>{result.finalUrl}</code>
            </div>
            <button className={styles.secondaryButton} type="button" onClick={copyUrl}>
              <Clipboard aria-hidden="true" size={18} /> Copy URL
            </button>
          </div>
          <p className={styles.copyStatus} aria-live="polite">{copyStatus}</p>
          <dl className={styles.trace}>
            <div><dt>Request path</dt><dd><code>{result.trace.requestPath}</code></dd></div>
            <div><dt>Matched location</dt><dd><code>{result.trace.matchedLocation}</code></dd></div>
            <div><dt>Retained suffix</dt><dd><code>{result.trace.retainedSuffix || "(empty)"}</code></dd></div>
            <div><dt>Replacement URI</dt><dd><code>{result.trace.replacementUri ?? "(absent)"}</code></dd></div>
            <div><dt>Final path</dt><dd><code>{result.trace.finalPath}</code></dd></div>
            <div><dt>Arguments</dt><dd><code>{result.trace.requestArguments ?? "(none)"}</code></dd></div>
          </dl>
          {result.comparison ? (
            <div className={styles.comparison}>
              <h3>Slash comparison</h3>
              <dl>
                <div><dt>Current</dt><dd><code>{result.finalUrl}</code></dd></div>
                <div><dt>Toggled</dt><dd><code>{result.comparison.finalUrl}</code></dd></div>
              </dl>
            </div>
          ) : null}
          <p className={styles.provenance}>{NGINX_PROXY_PASS_FORMULA_VERSION} · NGINX {NGINX_FIXTURE_VERSION}</p>
        </div>
      ) : null}

      {result?.status === "unknown" ? (
        <div className={styles.failure} aria-live="polite">
          <h2 ref={resultHeading} tabIndex={-1}>Needs live NGINX</h2>
          <p>{unknownText[result.reason]}</p>
          <p>Verify with nginx -T and upstream logs.</p>
        </div>
      ) : null}

      {result?.status === "invalid" ? (
        <div className={styles.failure} aria-live="polite">
          <h2 ref={resultHeading} tabIndex={-1}>Fix the marked input</h2>
          <p>No upstream URL was calculated.</p>
        </div>
      ) : null}
    </section>
  );
}
