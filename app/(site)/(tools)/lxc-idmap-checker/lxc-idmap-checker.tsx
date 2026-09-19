"use client";

import { RotateCcw } from "lucide-react";
import { useRef, useState, type FormEvent } from "react";
import {
  ToolActionRow,
  ToolButton,
  ToolChoiceGroup,
  ToolCopyAction,
  ToolDataTable,
  ToolResultLead,
  ToolStatus,
  ToolTextArea,
  ToolTextField,
  toolOption,
} from "@/app/tool-ui/tool-controls";
import {
  checkLxcIdmap,
  DEFAULT_LXC_INPUT,
  formatLxcReport,
  type LxcQueryType,
  type LxcResult,
} from "@/lib/lxc-idmap-checker/engine";
import styles from "./lxc-idmap-checker.module.css";

type FieldKey = "uidMap" | "gidMap" | "grantOwner" | "uidGrants" | "gidGrants" | "queryId";
type FieldErrors = Partial<Record<FieldKey, string>>;

export function LxcIdmapChecker() {
  const [uidMap, setUidMap] = useState("");
  const [gidMap, setGidMap] = useState("");
  const [grantOwner, setGrantOwner] = useState("");
  const [uidGrants, setUidGrants] = useState("");
  const [gidGrants, setGidGrants] = useState("");
  const [queryType, setQueryType] = useState<LxcQueryType>("uid");
  const [queryId, setQueryId] = useState("");
  const [result, setResult] = useState<LxcResult | null>(null);
  const [status, setStatus] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const resultRef = useRef<HTMLElement>(null);
  const uidRef = useRef<HTMLTextAreaElement>(null);
  const gidRef = useRef<HTMLTextAreaElement>(null);
  const ownerRef = useRef<HTMLInputElement>(null);
  const uidGrantsRef = useRef<HTMLTextAreaElement>(null);
  const gidGrantsRef = useRef<HTMLTextAreaElement>(null);
  const queryRef = useRef<HTMLInputElement>(null);

  function clearResult() { setResult(null); setStatus("Inputs changed"); setErrors({}); }

  function focusError(next = errors) {
    const refs = {
      uidMap: uidRef,
      gidMap: gidRef,
      grantOwner: ownerRef,
      uidGrants: uidGrantsRef,
      gidGrants: gidGrantsRef,
      queryId: queryRef,
    };
    const field = (Object.keys(refs) as FieldKey[]).find((key) => next[key]);
    if (field) refs[field].current?.focus();
  }

  function submit(event?: FormEvent) {
    event?.preventDefault();
    const next = checkLxcIdmap({ uidMap, gidMap, grantOwner, uidGrants, gidGrants, queryType, queryId });
    setResult(next);
    if (next.status === "valid") {
      setErrors({});
      setStatus("Mapping checked");
      requestAnimationFrame(() => resultRef.current?.focus());
    } else {
      setResult(null);
      const fieldErrors: FieldErrors = {};
      for (const issue of next.issues) {
        const field = issue.field === "queryType" || !issue.field ? "uidMap" : issue.field;
        fieldErrors[field] ??= issue.message;
      }
      setErrors(fieldErrors);
      setStatus("");
      requestAnimationFrame(() => focusError(fieldErrors));
    }
  }

  function loadExample() {
    setUidMap(DEFAULT_LXC_INPUT.uidMap);
    setGidMap(DEFAULT_LXC_INPUT.gidMap);
    setGrantOwner(DEFAULT_LXC_INPUT.grantOwner);
    setUidGrants(DEFAULT_LXC_INPUT.uidGrants);
    setGidGrants(DEFAULT_LXC_INPUT.gidGrants);
    setQueryType(DEFAULT_LXC_INPUT.queryType);
    setQueryId(DEFAULT_LXC_INPUT.queryId);
    setResult(null);
    setErrors({});
    setStatus("Example loaded");
    uidRef.current?.focus();
  }

  function reset() {
    setUidMap("");
    setGidMap("");
    setGrantOwner("");
    setUidGrants("");
    setGidGrants("");
    setQueryType("uid");
    setQueryId("");
    setResult(null);
    setErrors({});
    setStatus("Checker reset");
    uidRef.current?.focus();
  }

  return (
    <section aria-label="LXC mapping inputs and results" className={styles.tool} data-tool-workbench>
      <form className={styles.form} onSubmit={submit}>
        <div className={styles.inputs}>
          <ToolTextArea
            autoCapitalize="none"
            className={styles.editor}
            error={errors.uidMap}
            inputRef={uidRef}
            label="UID map"
            onChange={(value) => { setUidMap(value); clearResult(); }}
            placeholder="u 0 100000 65536"
            required
            rows={6}
            spellCheck={false}
            value={uidMap}
          />
          <ToolTextArea
            autoCapitalize="none"
            className={styles.editor}
            error={errors.gidMap}
            inputRef={gidRef}
            label="GID map"
            onChange={(value) => { setGidMap(value); clearResult(); }}
            placeholder="g 0 100000 65536"
            required
            rows={6}
            spellCheck={false}
            value={gidMap}
          />
          <ToolTextField
            autoCapitalize="none"
            error={errors.grantOwner}
            inputRef={ownerRef}
            label="Grant owner"
            onChange={(value) => { setGrantOwner(value); clearResult(); }}
            placeholder="root"
            value={grantOwner}
          />
          <ToolTextArea
            autoCapitalize="none"
            className={styles.editor}
            error={errors.uidGrants}
            inputRef={uidGrantsRef}
            label="UID grants"
            onChange={(value) => { setUidGrants(value); clearResult(); }}
            placeholder="root:100000:65536"
            rows={4}
            spellCheck={false}
            value={uidGrants}
          />
          <ToolTextArea
            autoCapitalize="none"
            className={styles.editor}
            error={errors.gidGrants}
            inputRef={gidGrantsRef}
            label="GID grants"
            onChange={(value) => { setGidGrants(value); clearResult(); }}
            placeholder="root:100000:65536"
            rows={4}
            spellCheck={false}
            value={gidGrants}
          />
          <div className={styles.query}>
            <ToolChoiceGroup
              label="Query type"
              onChange={(value) => { setQueryType(value as LxcQueryType); clearResult(); }}
              options={[toolOption("uid", "UID"), toolOption("gid", "GID")]}
              value={queryType}
            />
            <ToolTextField
              error={errors.queryId}
              inputRef={queryRef}
              inputMode="numeric"
              label="Query ID"
              onChange={(value) => { setQueryId(value); clearResult(); }}
              placeholder="1000"
              required
              value={queryId}
            />
          </div>
        </div>
        <ToolActionRow>
          <ToolButton onPress={loadExample} type="button">Load example</ToolButton>
          <ToolButton onPress={reset} type="button"><RotateCcw aria-hidden="true" size={17} /> Reset</ToolButton>
          <ToolButton type="submit" variant="primary">Check mapping</ToolButton>
        </ToolActionRow>
        {status ? <ToolStatus>{status}</ToolStatus> : null}
      </form>

      {result?.status === "valid" && result.values ? (
        <section aria-label="LXC mapping result" className={styles.result} ref={resultRef} tabIndex={-1}>
          <div className={styles.resultHeader}>
            <div>
              <ToolResultLead>{result.values.query.hostId ? `${result.values.query.type.toUpperCase()} ${result.values.query.id} maps to host ${result.values.query.hostId}.` : `${result.values.query.type.toUpperCase()} ${result.values.query.id} is unmapped.`}</ToolResultLead>
              <p className={styles.meta}>{`Grant status: ${result.values.query.grantStatus}`}</p>
            </div>
            <ToolCopyAction label="Copy diagnosis" successLabel="Diagnosis copied" value={formatLxcReport(result)} />
          </div>
          <ToolDataTable
            ariaLabel="LXC mapping ranges"
            columns={[{ id: "type", label: "Type" }, { id: "container", label: "Container range" }, { id: "host", label: "Host range" }, { id: "length", label: "Length" }]}
            rows={result.values.ranges.map((range) => ({ id: `${range.type}-${range.line}`, cells: { type: range.type.toUpperCase(), container: <code>{range.containerStart} to {range.containerEnd}</code>, host: <code>{range.hostStart} to {range.hostEnd}</code>, length: range.length } }))}
          />
          {result.values.findings.length ? <ToolStatus>{result.values.findings.map((issue) => issue.message).join(" ")}</ToolStatus> : null}
        </section>
      ) : null}
    </section>
  );
}
