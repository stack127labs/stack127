"use client";

import { RotateCcw } from "lucide-react";
import { useRef, useState, type FormEvent } from "react";
import { ToolActionRow, ToolButton, ToolCheckbox, ToolChoiceGroup, ToolCopyAction, ToolKeyValueList, ToolStatus, ToolTextField, toolOption } from "@/app/tool-ui/tool-controls";
import { NGINX_FIXTURE_VERSION, NGINX_PROXY_PASS_FORMULA_VERSION, type LocationType, type ProxyPassInput, type ProxyPassResult, type RewriteState, calculateProxyPassUri } from "@/lib/nginx/proxy-pass-uri";
import styles from "./nginx-proxy-pass-calculator.module.css";

const defaults: ProxyPassInput = { locationType: "prefix", location: "/api/", requestTarget: "/api/users?id=42", proxyPass: "http://backend/", rewriteState: "none", compareSlash: true };
const locationOptions = [toolOption("prefix", "Prefix"), toolOption("exact", "Exact ="), toolOption("regex", "Regex"), toolOption("named", "Named")];
const rewriteOptions = [toolOption("none", "None"), toolOption("break", "break"), toolOption("last", "last"), toolOption("other", "Other")];
const unknownText: Record<Extract<ProxyPassResult, { status: "unknown" }>["reason"], string> = {
  "regex-location": "Regex locations do not define a literal prefix that proxy_pass can replace.",
  "named-location": "Named locations need runtime location processing.", variables: "Variables need runtime values.",
  "rewrite-break": "rewrite break changes URI processing.", "rewrite-last": "rewrite last starts another location search.",
  "rewrite-other": "This rewrite needs runtime processing.", "proxy-query": "Proxy target arguments need live NGINX processing.",
  "normalization-sensitive": "NGINX normalization can change this path before proxy_pass runs.",
};

export function NginxProxyPassCalculator() {
  const [input, setInput] = useState<ProxyPassInput>(defaults);
  const [result, setResult] = useState<ProxyPassResult | null>(null);
  const [failed, setFailed] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const form = useRef<HTMLFormElement>(null);
  const resultRegion = useRef<HTMLElement>(null);
  const locationInput = useRef<HTMLInputElement>(null);
  const failureRegion = useRef<HTMLElement>(null);

  function update<Key extends keyof ProxyPassInput>(key: Key, value: ProxyPassInput[Key]) { setInput((current) => ({ ...current, [key]: value })); setResult(null); setFailed(false); setAnnouncement(""); }
  function toggleSlashComparison(compareSlash: boolean) {
    const nextInput = { ...input, compareSlash }; setInput(nextInput);
    if (result?.status === "success") { const nextResult = calculateProxyPassUri(nextInput); if (nextResult.status === "success") setResult(nextResult); }
    setFailed(false); setAnnouncement("");
  }
  function submit(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault(); setResult(null); setFailed(false); setAnnouncement("");
    try {
      const next = calculateProxyPassUri(input); setResult(next);
      requestAnimationFrame(() => {
        if (next.status === "invalid") { form.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(); return; }
        resultRegion.current?.focus();
      });
    } catch { setFailed(true); requestAnimationFrame(() => failureRegion.current?.focus()); }
  }
  function reset() { setInput(defaults); setResult(null); setFailed(false); setAnnouncement("Calculator reset"); requestAnimationFrame(() => locationInput.current?.focus()); }
  const errors = result?.status === "invalid" ? result.errors : {};

  return <section className={styles.tool} data-tool-workbench aria-label="proxy_pass calculator inputs and results">
    <form ref={form} className={styles.form} onSubmit={submit} noValidate>
      <ToolChoiceGroup label="Location type" onChange={(value) => update("locationType", value as LocationType)} options={locationOptions} value={input.locationType} />
      <div className={styles.fields}>
        <ToolTextField error={errors.location} inputRef={locationInput} label="Matched location" onChange={(value) => update("location", value)} required spellCheck={false} value={input.location} />
        <ToolTextField error={errors.requestTarget} label="Request target" onChange={(value) => update("requestTarget", value)} required spellCheck={false} value={input.requestTarget} />
        <ToolTextField error={errors.proxyPass} label="proxy_pass URL" onChange={(value) => update("proxyPass", value)} required spellCheck={false} value={input.proxyPass} />
      </div>
      <ToolChoiceGroup label="Rewrite before proxy_pass" onChange={(value) => update("rewriteState", value as RewriteState)} options={rewriteOptions} value={input.rewriteState} />
      <ToolCheckbox isSelected={input.compareSlash} onChange={toggleSlashComparison}>Compare the final slash</ToolCheckbox>
      {result?.status === "invalid" ? <ToolStatus tone="danger">Fix the marked inputs. No upstream URL was calculated.</ToolStatus> : null}
      <ToolActionRow><ToolButton onPress={reset} type="button"><RotateCcw aria-hidden="true" size={18} /> Reset</ToolButton><ToolButton type="submit" variant="primary">Calculate upstream URL</ToolButton></ToolActionRow>
      <p aria-live="polite" className={styles.visuallyHidden}>{announcement}</p>
    </form>

    {failed ? <section aria-label="Calculator failure" className={styles.failure} ref={failureRegion} tabIndex={-1}><ToolStatus tone="danger">The calculator could not finish. Your inputs are still here.</ToolStatus><ToolButton onPress={() => submit()} type="button">Try again</ToolButton></section> : null}
    {result?.status === "success" ? <section aria-label="Calculated upstream URL" aria-live="polite" className={styles.result} data-result-kind="success" ref={resultRegion} tabIndex={-1}>
      <div className={result.comparison ? styles.answerBand : styles.answerBandSingle}>
        <div className={styles.answer}><span>Final upstream URL</span><code>{result.finalUrl}</code><ToolCopyAction label="Copy URL" successLabel="URL copied" value={result.finalUrl} /></div>
        {result.comparison ? <div className={styles.alternative}><span>With proxy_pass <code>{result.comparison.proxyPass}</code></span><code>{result.comparison.finalUrl}</code></div> : null}
      </div>
      <ToolKeyValueList rows={[
        { label: "Request path", value: <code>{result.trace.requestPath}</code> },
        { label: "Matched location", value: <code>{result.trace.matchedLocation}</code> },
        { label: "Proxy URI", value: <code>{result.trace.proxyUriPresence === "absent" ? "Absent" : `Present: ${result.trace.replacementUri}`}</code> },
        { label: "Path operation", value: result.trace.proxyUriPresence === "absent" ? "Original request path retained" : "Matched location prefix replaced" },
        ...(result.trace.proxyUriPresence === "present" ? [{ label: "Retained suffix", value: <code key="suffix">{result.trace.retainedSuffix || "(empty)"}</code> }] : []),
        { label: "Final path", value: <code>{result.trace.finalPath}</code> },
        { label: "Arguments", value: <code>{result.trace.requestArguments ?? "(none)"}</code> },
      ]} />
      <p className={styles.provenance}>{NGINX_PROXY_PASS_FORMULA_VERSION} · NGINX fixture {NGINX_FIXTURE_VERSION}</p>
    </section> : null}
    {result?.status === "unknown" ? <section aria-label="Needs live NGINX" className={styles.failure} data-result-kind="unknown" ref={resultRegion} tabIndex={-1}><ToolStatus tone="warning"><strong>Needs live NGINX.</strong> {unknownText[result.reason]} Verify with <code>nginx -T</code> and upstream logs.</ToolStatus></section> : null}
  </section>;
}
