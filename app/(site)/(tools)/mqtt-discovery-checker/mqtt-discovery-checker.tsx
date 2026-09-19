"use client";

import { RotateCcw } from "lucide-react";
import { useRef, useState, type FormEvent } from "react";
import {
  ToolActionRow,
  ToolButton,
  ToolCopyAction,
  ToolDataTable,
  ToolDisclosure,
  ToolResultLead,
  ToolStatus,
  ToolTextArea,
  ToolTextField,
} from "@/app/tool-ui/tool-controls";
import {
  checkMqttDiscovery,
  DEFAULT_MQTT_INPUT,
  formatMqttReport,
  type MqttResult,
} from "@/lib/mqtt-discovery-checker/engine";
import styles from "./mqtt-discovery-checker.module.css";

function defaultPayload() { return DEFAULT_MQTT_INPUT.payload; }

export function MqttDiscoveryChecker() {
  const [topic, setTopic] = useState("");
  const [payload, setPayload] = useState("");
  const [prefix, setPrefix] = useState(DEFAULT_MQTT_INPUT.prefix);
  const [result, setResult] = useState<MqttResult | null>(null);
  const [status, setStatus] = useState("");
  const [errors, setErrors] = useState<{ topic?: string; prefix?: string; payload?: string }>({});
  const resultRef = useRef<HTMLElement>(null);
  const topicRef = useRef<HTMLInputElement>(null);
  const prefixRef = useRef<HTMLInputElement>(null);
  const payloadRef = useRef<HTMLTextAreaElement>(null);

  function clearResult() { setResult(null); setStatus("Inputs changed"); setErrors({}); }

  function focusError(next = errors) {
    if (next.topic) topicRef.current?.focus();
    else if (next.prefix) prefixRef.current?.focus();
    else if (next.payload) payloadRef.current?.focus();
  }

  function submit(event?: FormEvent) {
    event?.preventDefault();
    const next = checkMqttDiscovery({ topic, payload, prefix });
    setResult(next);
    if (next.status !== "invalid") {
      setErrors({});
      setStatus(`${next.status} discovery`);
      requestAnimationFrame(() => resultRef.current?.focus());
    } else {
      setResult(null);
      const fieldErrors: { topic?: string; prefix?: string; payload?: string } = {};
      for (const issue of next.issues) {
        if (issue.code.startsWith("prefix.")) fieldErrors.prefix ??= issue.message;
        else if (issue.code.startsWith("topic.")) fieldErrors.topic ??= issue.message;
        else fieldErrors.payload ??= issue.message;
      }
      setErrors(fieldErrors);
      setStatus("");
      requestAnimationFrame(() => focusError(fieldErrors));
    }
  }

  function loadExample() {
    setTopic(DEFAULT_MQTT_INPUT.topic);
    setPayload(defaultPayload());
    setPrefix(DEFAULT_MQTT_INPUT.prefix);
    setResult(null);
    setErrors({});
    setStatus("Example loaded");
    topicRef.current?.focus();
  }

  function reset() {
    setTopic("");
    setPayload("");
    setPrefix(DEFAULT_MQTT_INPUT.prefix);
    setResult(null);
    setErrors({});
    setStatus("Checker reset");
    topicRef.current?.focus();
  }

  return (
    <section aria-label="MQTT discovery inputs and results" className={styles.tool} data-tool-workbench>
      <form className={styles.form} onSubmit={submit}>
        <div className={styles.inputs}>
          <ToolTextField
            autoCapitalize="none"
            error={errors.topic}
            inputRef={topicRef}
            label="Discovery topic"
            onChange={(value) => { setTopic(value); clearResult(); }}
            placeholder="homeassistant/sensor/demo/config"
            required
            value={topic}
          />
          <ToolTextField
            autoCapitalize="none"
            error={errors.prefix}
            inputRef={prefixRef}
            label="Discovery prefix"
            onChange={(value) => { setPrefix(value); clearResult(); }}
            value={prefix}
          />
          <ToolTextArea
            autoCapitalize="none"
            className={styles.editor}
            error={errors.payload}
            inputRef={payloadRef}
            label="JSON payload"
            onChange={(value) => { setPayload(value); clearResult(); }}
            placeholder="Paste discovery JSON"
            required
            rows={10}
            spellCheck={false}
            value={payload}
          />
        </div>
        <ToolActionRow>
          <ToolButton onPress={loadExample} type="button">Load example</ToolButton>
          <ToolButton onPress={reset} type="button"><RotateCcw aria-hidden="true" size={17} /> Reset</ToolButton>
          <ToolButton type="submit" variant="primary">Check discovery</ToolButton>
        </ToolActionRow>
        {status ? <ToolStatus>{status}</ToolStatus> : null}
      </form>

      {result?.status !== "invalid" && result?.values ? (
        <section aria-label="MQTT discovery result" className={styles.result} ref={resultRef} tabIndex={-1}>
          <div className={styles.resultHeader}>
            <div>
              <ToolResultLead>{`${result.status === "valid" ? "Valid" : "Partial"} ${result.values.component} discovery.`}</ToolResultLead>
              <p className={styles.meta}>{`${result.values.errorCount} errors; ${result.values.warningCount} warnings`}</p>
            </div>
            <ToolCopyAction label="Copy report" successLabel="Report copied" value={formatMqttReport(result)} />
          </div>
          {result.values.findings.length ? (
            <ToolDataTable
              ariaLabel="MQTT discovery findings"
              columns={[{ id: "severity", label: "Severity" }, { id: "path", label: "Path" }, { id: "message", label: "Finding" }]}
              rows={result.values.findings.map((issue) => ({ id: `${issue.code}-${issue.path}`, cells: { severity: <strong className={issue.severity === "error" ? styles.error : styles.warning}>{issue.severity}</strong>, path: <code>{issue.path}</code>, message: issue.message } }))}
            />
          ) : null}
          <ToolDisclosure label="Normalized JSON">
            <pre className={styles.code} tabIndex={0}><code>{result.values.normalizedPayload}</code></pre>
          </ToolDisclosure>
        </section>
      ) : null}
    </section>
  );
}
