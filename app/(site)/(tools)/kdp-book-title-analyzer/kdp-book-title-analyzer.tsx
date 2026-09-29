"use client";

import { RotateCcw } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { UiButton, UiDisclosure, UiTextArea, UiTextField } from "@/app/ui/controls";
import { UiActionRow, UiKeyValueList, UiResultLead, UiStatus } from "@/app/ui/display";
import {
  reviewKdpBookTitle,
  type KdpBookTitleField,
  type KdpBookTitleFieldErrors,
  type KdpBookTitleInput,
  type KdpBookTitleResult,
} from "@/lib/kdp/book-title.ts";
import styles from "../../../ui/tools/kdp-tool.module.css";
import pageStyles from "./kdp-book-title-analyzer.module.css";

const INITIAL_INPUT: KdpBookTitleInput = { title: "", subtitle: "", topic: "", intendedReader: "", targetPhrases: "" };

function firstError(errors: KdpBookTitleFieldErrors): KdpBookTitleField | null {
  return (["title", "subtitle", "topic", "intendedReader", "targetPhrases"] as const).find((key) => errors[key]) ?? null;
}

function TermList({ label, values, emptyText }: { label: string; values: readonly string[]; emptyText: string }) {
  return (
    <div className={pageStyles.termGroup}>
      <h4>{label}</h4>
      {values.length ? <ul className={styles.plainList}>{values.map((value) => <li key={value}><q>{value}</q></li>)}</ul> : <p className={styles.notice}>{emptyText}</p>}
    </div>
  );
}

export function KdpBookTitleAnalyzer() {
  const [input, setInput] = useState<KdpBookTitleInput>(INITIAL_INPUT);
  const [result, setResult] = useState<Extract<KdpBookTitleResult, { status: "reviewed" }> | null>(null);
  const [errors, setErrors] = useState<KdpBookTitleFieldErrors>({});
  const [status, setStatus] = useState("");
  const [failure, setFailure] = useState("");
  const [pendingFocus, setPendingFocus] = useState<KdpBookTitleField | "result" | null>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const subtitleRef = useRef<HTMLInputElement>(null);
  const topicRef = useRef<HTMLTextAreaElement>(null);
  const readerRef = useRef<HTMLInputElement>(null);
  const phrasesRef = useRef<HTMLTextAreaElement>(null);
  const resultRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const refs = { title: titleRef, subtitle: subtitleRef, topic: topicRef, intendedReader: readerRef, targetPhrases: phrasesRef };
    if (pendingFocus === "result") resultRef.current?.focus();
    else if (pendingFocus) refs[pendingFocus].current?.focus();
    if (pendingFocus) setPendingFocus(null);
  }, [pendingFocus, result]);

  function update<K extends keyof KdpBookTitleInput>(key: K, value: KdpBookTitleInput[K]) {
    const hadOutput = Boolean(result || failure || Object.keys(errors).length);
    setInput((current) => ({ ...current, [key]: value }));
    setResult(null);
    setErrors({});
    setFailure("");
    if (hadOutput) setStatus("Review cleared. Submit again to check these changes.");
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFailure("");
    try {
      const next = reviewKdpBookTitle(input);
      if (next.status === "invalid") {
        setResult(null);
        setErrors(next.fieldErrors);
        setStatus("Correct the highlighted field and review the title again.");
        setPendingFocus(firstError(next.fieldErrors));
        return;
      }
      setErrors({});
      setResult(next);
      setStatus("Title reviewed.");
      setPendingFocus("result");
    } catch {
      setResult(null);
      setErrors({});
      setFailure("The local review is unavailable. Your text is still here; try again.");
      setStatus("The title could not be reviewed. Your text is still here; try again.");
      setPendingFocus("title");
    }
  }

  function reset() {
    setInput(INITIAL_INPUT);
    setResult(null);
    setErrors({});
    setFailure("");
    setStatus("Title inputs and results cleared.");
    setPendingFocus("title");
  }

  let lead = "";
  if (result) {
    if (result.partial) lead = "Title wording checked; book-context fit is unknown.";
    else if (!input.topic.trim() && !input.intendedReader.trim() && result.phraseMatches.length) {
      const matched = result.phraseMatches.filter((phrase) => phrase.status !== "not-found").length;
      lead = `${matched} of ${result.phraseMatches.length} target phrases appear literally in the title or subtitle.`;
    } else {
      const found = result.comparisons.reduce((count, comparison) => count + comparison.found.length, 0);
      lead = found ? `${found} supplied context terms match the draft wording literally.` : "No supplied topic or reader terms match the draft wording literally.";
    }
  }

  return (
    <section aria-label="KDP title inputs and review" className={styles.tool} data-tool-workbench>
      <form className={styles.form} onSubmit={submit}>
        <div className={pageStyles.titleFields}>
          <UiTextField dataFocusKey="title" error={errors.title} inputRef={titleRef} label="Title" onChange={(value) => update("title", value)} required value={input.title} />
          <UiTextField dataFocusKey="subtitle" error={errors.subtitle} inputRef={subtitleRef} label="Subtitle" onChange={(value) => update("subtitle", value)} value={input.subtitle} />
        </div>
        <div className={styles.grid}>
          <UiTextArea description="What the book covers. Exact words are compared; synonyms are not inferred." error={errors.topic} inputRef={topicRef} label="Book topic (optional)" onChange={(value) => update("topic", value)} rows={4} value={input.topic} />
          <UiTextField dataFocusKey="intendedReader" description="Who the book is for. Exact words are compared; this is not a reader-fit score." error={errors.intendedReader} inputRef={readerRef} label="Intended reader (optional)" onChange={(value) => update("intendedReader", value)} value={input.intendedReader} />
        </div>
        <UiTextArea description="Up to three phrases, one per line. A phrase only matches when its words appear together in one field." error={errors.targetPhrases} inputRef={phrasesRef} label="Target phrases (optional)" onChange={(value) => update("targetPhrases", value)} rows={3} value={input.targetPhrases} />
        <UiActionRow>
          <UiButton type="submit" variant="primary">Review title</UiButton>
          <UiButton onPress={reset} type="button"><RotateCcw aria-hidden="true" size={17} /> Reset</UiButton>
        </UiActionRow>
        {status ? <UiStatus tone={failure ? "danger" : "neutral"}>{status}</UiStatus> : null}
      </form>

      {failure ? <section aria-label="Title review unavailable" className={styles.failure} role="alert"><p className={styles.resultLead}>{failure}</p><UiButton onPress={() => submit({ preventDefault() {} } as FormEvent<HTMLFormElement>)} type="button">Review title again</UiButton></section> : null}

      {result ? (
        <section aria-label="Title review results" className={styles.result}>
          <UiResultLead inputRef={resultRef}>{lead}</UiResultLead>
          {result.partial ? <p className={styles.notice}>Subject, reader fit, and target-phrase use remain unknown because those details were not entered.</p> : null}
          {result.comparisons.map((comparison) => (
            <section className={pageStyles.resultGroup} key={comparison.source}>
              <h3>{comparison.source === "topic" ? "Book topic terms" : "Intended reader terms"}</h3>
              <div className={pageStyles.termGrid}>
                <TermList emptyText="No supplied terms matched literally." label="Found in title or subtitle" values={comparison.found} />
                <TermList emptyText="No other meaningful terms to compare." label="Only in supplied context" values={comparison.onlyInContext} />
              </div>
            </section>
          ))}

          {result.phraseMatches.length ? <section className={pageStyles.resultGroup}><h3>Target phrase matches</h3><ul className={pageStyles.phraseList}>{result.phraseMatches.map((phrase) => <li key={phrase.line}><span><strong>Line {phrase.line}:</strong> <q>{phrase.phrase}</q></span><span>{phrase.status === "not-found" ? "Not found" : phrase.status === "both" ? "Both fields" : phrase.status === "title" ? "Title" : "Subtitle"}</span></li>)}</ul></section> : null}

          <section className={pageStyles.resultGroup}>
            <h3>Local counts and KDP length guidance</h3>
            <UiKeyValueList rows={[
              { label: "Title words", value: result.titleWords },
              { label: "Subtitle words", value: result.subtitleWords },
              { label: "Title characters", value: result.titleCharacters },
              { label: "Subtitle characters", value: result.subtitleCharacters },
              { label: "Combined local count", value: `${result.combinedCharacters} / ${200} characters` },
            ]} />
          </section>

          <section className={pageStyles.resultGroup}>
            <h3>Wording and documented guidance prompts</h3>
            {result.prompts.length ? <ul className={styles.issueList}>{result.prompts.map((prompt, index) => <li data-severity={prompt.kind === "kdp-guidance" ? "warning" : undefined} key={`${prompt.field}-${index}`}><strong>{prompt.field === "both" ? "Title and subtitle" : prompt.field}: </strong>{prompt.message}{prompt.text !== "HTML-like tag" ? <> <q>{prompt.text}</q></> : null}</li>)}</ul> : <p className={styles.notice}>No local wording or documented-guidance prompts were found. This does not measure title clarity or demand.</p>}
          </section>

          <p className={styles.notice}>Exact word matches do not establish relevance, clarity, title-cover fit, uniqueness, trademark permission, search demand, ranking, or sales. Review the full listing with the <a href="/kdp-metadata-checker">KDP metadata checker</a>.</p>
          <UiDisclosure label="KDP sources and limits">
            <div className={styles.plainList}>
              <p>Reviewed 2026-09-28. KDP's official pages disagree about the 200-character boundary; its character-count method is not published. Local counts use Unicode code points and include one separator when both title and subtitle are present.</p>
              <ul>
                <li><a href="https://kdp.amazon.com/en_US/help/topic/G201097560" rel="noreferrer" target="_blank">KDP metadata guidelines</a></li>
                <li><a href="https://kdp.amazon.com/en_US/help/topic/GW7J4WEKBVU25YEC" rel="noreferrer" target="_blank">KDP titles and editions</a></li>
                <li><a href="https://kdp.amazon.com/en_US/help/topic/G202172740" rel="noreferrer" target="_blank">KDP book details</a></li>
                <li><a href="https://kdp.amazon.com/en_US/help/topic/G201743260" rel="noreferrer" target="_blank">KDP keyword guidance</a></li>
                <li><a href="https://kdp.amazon.com/en_US/help/topic/GATLM5TG2NFRXQ89" rel="noreferrer" target="_blank">KDP search results</a></li>
              </ul>
            </div>
          </UiDisclosure>
        </section>
      ) : null}
    </section>
  );
}
