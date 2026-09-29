"use client";

import { RotateCcw } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { UiButton, UiCopyAction, UiDisclosure, UiTextArea, UiTextField } from "@/app/ui/controls";
import { UiActionRow, UiResultLead, UiStatus } from "@/app/ui/display";
import {
  buildKdpBackendKeywords,
  KDP_BACKEND_KEYWORD_DEFAULT_CAP,
  type KdpBackendKeywordsFieldErrors,
  type KdpBackendKeywordsInput,
  type KdpBackendKeywordsResult,
} from "@/lib/kdp/backend-keywords.ts";
import styles from "../../../ui/tools/kdp-tool.module.css";
import pageStyles from "./kdp-backend-keywords-builder.module.css";

const INITIAL_INPUT: KdpBackendKeywordsInput = {
  candidatePhrases: "",
  planningCapText: String(KDP_BACKEND_KEYWORD_DEFAULT_CAP),
  title: "",
  subtitle: "",
  categories: "",
};

function firstError(errors: KdpBackendKeywordsFieldErrors): keyof KdpBackendKeywordsInput | null {
  return (["candidatePhrases", "planningCapText", "title", "subtitle", "categories"] as const).find((key) => errors[key]) ?? null;
}

function FindingList({ title, findings }: { title: string; findings: readonly { line: number; phrase: string; message: string }[] }) {
  if (!findings.length) return null;
  return (
    <section className={pageStyles.findings}>
      <h3>{title}</h3>
      <ul className={styles.plainList}>
        {findings.map((finding, index) => (
          <li key={`${finding.line}-${index}`}>
            <strong>Line {finding.line}: </strong><q>{finding.phrase}</q>: {finding.message}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function KdpBackendKeywordsBuilder() {
  const [input, setInput] = useState<KdpBackendKeywordsInput>(INITIAL_INPUT);
  const [result, setResult] = useState<Extract<KdpBackendKeywordsResult, { status: "built" }> | null>(null);
  const [errors, setErrors] = useState<KdpBackendKeywordsFieldErrors>({});
  const [status, setStatus] = useState("");
  const [failure, setFailure] = useState("");
  const [pendingFocus, setPendingFocus] = useState<keyof KdpBackendKeywordsInput | "result" | null>(null);
  const candidateRef = useRef<HTMLTextAreaElement>(null);
  const capRef = useRef<HTMLInputElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const subtitleRef = useRef<HTMLInputElement>(null);
  const categoriesRef = useRef<HTMLTextAreaElement>(null);
  const resultRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const refs = {
      candidatePhrases: candidateRef,
      planningCapText: capRef,
      title: titleRef,
      subtitle: subtitleRef,
      categories: categoriesRef,
    };
    if (pendingFocus === "result") resultRef.current?.focus();
    else if (pendingFocus) refs[pendingFocus].current?.focus();
    if (pendingFocus) setPendingFocus(null);
  }, [pendingFocus, result]);

  function update<K extends keyof KdpBackendKeywordsInput>(key: K, value: KdpBackendKeywordsInput[K]) {
    const hadOutput = Boolean(result || failure || Object.keys(errors).length);
    setInput((current) => ({ ...current, [key]: value }));
    setResult(null);
    setErrors({});
    setFailure("");
    if (hadOutput) setStatus("Draft cleared. Build the keyword fields again to use these changes.");
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFailure("");
    try {
      const next = buildKdpBackendKeywords(input);
      if (next.status === "invalid") {
        setResult(null);
        setErrors(next.fieldErrors);
        setStatus("Correct the highlighted field and build the keyword fields again.");
        setPendingFocus(firstError(next.fieldErrors));
        return;
      }
      setErrors({});
      setResult(next);
      setStatus("Keyword fields built.");
      setPendingFocus("result");
    } catch {
      setResult(null);
      setErrors({});
      setFailure("The local organizer could not build these fields. Your text is still here; try again.");
      setStatus("The keyword draft could not be built. Your text is still here; try again.");
      setPendingFocus("candidatePhrases");
    }
  }

  function reset() {
    setInput(INITIAL_INPUT);
    setResult(null);
    setErrors({});
    setFailure("");
    setStatus("Inputs and keyword draft cleared.");
    setPendingFocus("candidatePhrases");
  }

  const partial = Boolean(result && (result.unplaced.length || result.needsEdit.length));
  return (
    <section aria-label="KDP keyword field inputs and draft" className={styles.tool} data-tool-workbench>
      <form className={styles.form} onSubmit={submit}>
        <UiTextArea
          description="One phrase per line. Commas stay within a phrase. Your text is processed in this browser."
          error={errors.candidatePhrases}
          inputRef={candidateRef}
          label="Candidate phrases"
          onChange={(value) => update("candidatePhrases", value)}
          placeholder={"cozy cat mystery\nsmall town secrets"}
          required
          rows={8}
          spellCheck
          value={input.candidatePhrases}
        />
        <div className={styles.grid}>
          <UiTextField
            dataFocusKey="planningCapText"
            description="Local planning cap. Check the limit in your current KDP field."
            error={errors.planningCapText}
            inputMode="numeric"
            inputRef={capRef}
            label="Planning cap (characters per field)"
            onChange={(value) => update("planningCapText", value)}
            required
            value={input.planningCapText}
          />
          <p className={`${styles.notice} ${pageStyles.capNote}`}>This cap controls local packing only. KDP does not publish a universal numeric field limit in its keyword help.</p>
        </div>
        <fieldset className={pageStyles.optional}>
          <legend>Compare with book details (optional)</legend>
          <div className={styles.grid}>
            <UiTextField
              dataFocusKey="title"
              error={errors.title}
              inputRef={titleRef}
              label="Book title"
              onChange={(value) => update("title", value)}
              value={input.title}
            />
            <UiTextField
              dataFocusKey="subtitle"
              error={errors.subtitle}
              inputRef={subtitleRef}
              label="Subtitle"
              onChange={(value) => update("subtitle", value)}
              value={input.subtitle}
            />
            <UiTextArea
              description="One chosen category label per line. This adds comparison words only; it does not suggest categories."
              error={errors.categories}
              inputRef={categoriesRef}
              label="Chosen category labels"
              onChange={(value) => update("categories", value)}
              rows={3}
              value={input.categories}
            />
          </div>
        </fieldset>
        <UiActionRow>
          <UiButton type="submit" variant="primary">Build keyword fields</UiButton>
          <UiButton onPress={reset} type="button"><RotateCcw aria-hidden="true" size={17} /> Reset</UiButton>
        </UiActionRow>
        {status ? <UiStatus tone={failure ? "danger" : "neutral"}>{status}</UiStatus> : null}
        {errors.candidatePhrases && !input.candidatePhrases.trim() ? <p className={styles.caption}>Paste relevant phrases you have already researched.</p> : null}
      </form>

      {failure ? <section aria-label="Organizer unavailable" className={styles.failure} role="alert"><p className={styles.resultLead}>{failure}</p><UiButton onPress={() => submit({ preventDefault() {} } as FormEvent<HTMLFormElement>)} type="button">Build keyword fields again</UiButton></section> : null}

      {result ? (
        <section aria-label="Keyword field draft" className={styles.result}>
          <UiResultLead inputRef={resultRef}>{result.placedCount} of {result.distinctCount} distinct phrases placed</UiResultLead>
          <p className={pageStyles.stateLabel}>{partial ? "Partial draft" : "Draft for review"}</p>
          <ol aria-label="Seven KDP keyword field drafts" className={pageStyles.fieldList}>
            {result.fields.map((field) => (
              <li className={pageStyles.keywordField} key={field.index}>
                <div className={pageStyles.fieldHeading}>
                  <h3>Keyword {field.index}</h3>
                  <span>{field.characters} / {result.planningCap} characters</span>
                </div>
                <p className={pageStyles.phraseText}>{field.text || <span className={pageStyles.emptyField}>No phrase placed</span>}</p>
                {field.text ? <UiCopyAction label={`Copy keyword ${field.index}`} value={field.text} withManualFallback /> : null}
              </li>
            ))}
          </ol>

          {result.duplicates.length ? <section className={pageStyles.findings}><h3>Omitted duplicate phrases</h3><ul className={styles.plainList}>{result.duplicates.map((item) => <li key={`${item.line}-${item.firstLine}`}><strong>Line {item.line}: </strong><q>{item.phrase}</q> repeats line {item.firstLine} after local punctuation and spacing normalization.</li>)}</ul></section> : null}
          {result.needsEdit.length ? <section className={pageStyles.findings}><h3>Needs edit</h3><ul className={styles.plainList}>{result.needsEdit.map((item) => <li key={item.line}>Line {item.line} has no letters or numbers. Edit or remove it.</li>)}</ul></section> : null}
          {result.unplaced.length ? <section className={pageStyles.findings}><h3>Not placed</h3><ul className={styles.plainList}>{result.unplaced.map((item) => <li key={item.line}><strong>Line {item.line}: </strong><q>{item.phrase}</q>: {item.reason === "over-cap" ? `${item.characters} characters, above the selected cap.` : `${item.characters} characters; no field had enough room.`}</li>)}</ul></section> : null}
          <FindingList findings={result.kdpFindings} title="KDP guidance signals to review" />
          <FindingList findings={result.localFindings} title="Local organization prompts" />
          {!result.metadataCompared ? <p className={styles.notice}>Overlap with a title, subtitle, or chosen category was not checked because those details were not entered.</p> : null}
          <p className={styles.notice}>Review each phrase for relevance and permission before entering it in KDP. These drafts do not predict search demand or guarantee acceptance.</p>
          <p className={styles.notice}>After reviewing the phrase fields, check the finished listing with the <a href="/kdp-metadata-checker">KDP metadata checker</a>.</p>
          <UiDisclosure label="KDP guidance and local limits">
            <div className={styles.plainList}>
              <p>KDP says to use up to seven accurate, reader-focused keywords, suggests short phrases of about two to three words, and recommends checking Amazon search suggestions. Its public help does not state a universal numeric per-field character limit. Reviewed 2026-09-28.</p>
              <ul>
                <li><a href="https://kdp.amazon.com/en_US/help/topic/G201298500" rel="noreferrer" target="_blank">KDP keyword guidance</a></li>
                <li><a href="https://kdp.amazon.com/en_US/help/topic/G201097560" rel="noreferrer" target="_blank">KDP metadata guidelines</a></li>
              </ul>
              <p>The 50-character default and first-fit packing order are local planning choices. Change the cap to match what you see in your KDP field. Review prompts are limited checks, not a complete policy or search analysis.</p>
            </div>
          </UiDisclosure>
        </section>
      ) : null}
    </section>
  );
}
