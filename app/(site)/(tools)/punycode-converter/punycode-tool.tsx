"use client";

import { useState, type FormEvent } from "react";
import { StatePill } from "../../(catalogs)/domain-tools/domain-lookup-client";
import type { LabelResult } from "@/lib/domain/punycode.ts";
import type { CharacterDetail, ScriptAnalysis } from "@/lib/domain/unicode.ts";

type Analysed = {
  label: LabelResult;
  scripts: ScriptAnalysis;
  characters: CharacterDetail[];
  octets: number;
};

type Outcome = {
  unicode: string;
  ascii: string;
  labels: Analysed[];
  problems: string[];
  problemText: string[];
  unicodeVersion: string;
};

export function PunycodeTool() {
  const [value, setValue] = useState("");
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) {
      setError("Enter a domain name.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      // The Unicode tables are large, so they load only when someone actually
      // converts something. Nothing leaves the browser either way.
      const [punycode, unicode] = await Promise.all([
        import("@/lib/domain/punycode.ts"),
        import("@/lib/domain/unicode.ts"),
      ]);

      let host = trimmed;
      if (/^[a-z][a-z0-9+.-]*:\/\//i.test(host)) {
        try {
          host = new URL(host).hostname;
        } catch {
          setError("That looks like a web address but it could not be read.");
          setBusy(false);
          return;
        }
      }
      host = host.split("/")[0].replace(/\.$/, "");

      const converted = punycode.convertName(host, unicode.mapLabel);
      setOutcome({
        unicode: converted.unicode,
        ascii: converted.ascii,
        unicodeVersion: unicode.UNICODE_VERSION,
        problems: converted.problems,
        problemText: converted.problems.map((problem) => punycode.LABEL_PROBLEM_TEXT[problem]),
        labels: converted.labels.map((label) => ({
          label,
          scripts: unicode.analyzeScripts(label.unicode),
          characters: /^[\x00-\x7f]*$/.test(label.unicode) ? [] : unicode.describeCharacters(label.unicode),
          octets: punycode.octetLength(label.ascii),
        })),
      });
    } catch {
      setError("Something went wrong converting that name.");
    } finally {
      setBusy(false);
    }
  }

  const suspicious = outcome?.labels.filter((entry) => entry.scripts.latinMixedWithOther) ?? [];

  return (
    <section className="domain-tool" aria-label="Punycode and IDN converter">
      <form className="domain-form" onSubmit={submit}>
        <label className="domain-name-field">
          <span>Domain name, in either form</span>
          <input
            autoCapitalize="none"
            autoComplete="off"
            onChange={(event) => setValue(event.target.value)}
            placeholder="münchen.de or xn--mnchen-3ya.de"
            spellCheck={false}
            value={value}
          />
        </label>
        <button className="domain-submit" disabled={busy}>
          {busy ? "Converting..." : "Convert it"}
        </button>
        {error ? (
          <p className="domain-form-error" role="alert">
            {error}
          </p>
        ) : null}
      </form>

      {outcome ? (
        <section className="domain-results" aria-live="polite">
          <div className="domain-answer">
            <div className="domain-answer-head">
              {suspicious.length ? (
                <StatePill tone="bad">Mixes writing systems</StatePill>
              ) : outcome.problems.length ? (
                <StatePill tone="warn">Not a valid domain name</StatePill>
              ) : outcome.labels.some((entry) => entry.label.converted) ? (
                <StatePill tone="good">Converted, single script</StatePill>
              ) : (
                <StatePill tone="quiet">Plain ASCII</StatePill>
              )}
            </div>
            <p className="domain-answer-lead">
              <code>{outcome.unicode}</code> is <code>{outcome.ascii}</code>
            </p>
            {suspicious.length ? (
              <p>
                {suspicious.length === 1 ? "One part of this name mixes" : "Some parts of this name mix"} writing
                systems: {suspicious.map((entry) => entry.scripts.scripts.join(" and ")).join("; ")}. That is the shape
                used to make one domain look like another. It is a reason to look closely at the characters below, not
                proof of anything on its own.
              </p>
            ) : outcome.labels.some((entry) => entry.label.converted) ? (
              <p>Nothing about this name mixes writing systems.</p>
            ) : (
              <p>This name is plain ASCII, so both forms are the same and there is nothing to convert.</p>
            )}
            <p className="domain-meta">
              Converted in your browser. Nothing was sent anywhere. Unicode {outcome.unicodeVersion}.
            </p>
          </div>

          {outcome.problemText.length ? (
            <div className="domain-findings">
              {outcome.problemText.map((text) => (
                <div className="domain-finding" data-tone="warn" key={text}>
                  <p>{text}</p>
                </div>
              ))}
            </div>
          ) : null}

          <section>
            <h2>Part by part</h2>
            <div className="domain-table-scroll">
              <table className="domain-table">
                <thead>
                  <tr>
                    <th>Readable</th>
                    <th>As DNS carries it</th>
                    <th>Writing system</th>
                    <th>Bytes</th>
                  </tr>
                </thead>
                <tbody>
                  {outcome.labels.map((entry, index) => (
                    <tr key={`${entry.label.ascii}-${index}`}>
                      <td>
                        <code>{entry.label.unicode}</code>
                      </td>
                      <td>
                        <code>{entry.label.ascii}</code>
                        {entry.label.converted ? null : <small> (unchanged)</small>}
                      </td>
                      <td>{entry.scripts.scripts.length ? entry.scripts.scripts.join(", ") : "ASCII only"}</td>
                      <td>
                        {entry.octets > 63 ? (
                          <StatePill tone="bad">{entry.octets} of 63</StatePill>
                        ) : entry.octets > 50 ? (
                          <StatePill tone="warn">{entry.octets} of 63</StatePill>
                        ) : (
                          <span className="domain-state-quiet">{entry.octets} of 63</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {outcome.labels.some((entry) => entry.characters.length) ? (
            <section>
              <h2>Every character that is not plain ASCII</h2>
              <div className="domain-table-scroll">
                <table className="domain-table">
                  <thead>
                    <tr>
                      <th>Character</th>
                      <th>Code point</th>
                      <th>Writing system</th>
                    </tr>
                  </thead>
                  <tbody>
                    {outcome.labels.flatMap((entry, labelIndex) =>
                      entry.characters.map((character, index) => {
                        // In a Latin name, a character from another script is the one
                        // doing the impersonating. Point straight at it.
                        const odd = entry.scripts.latinMixedWithOther && character.script !== "Latin"
                          && character.script !== "Common" && character.script !== "Inherited";
                        return (
                          <tr key={`${labelIndex}-${index}`}>
                            <td>
                              <code>{character.character}</code>
                            </td>
                            <td>
                              <code>{character.codePoint}</code>
                            </td>
                            <td>
                              {character.name}{" "}
                              {odd ? <StatePill tone="bad">Not Latin</StatePill> : null}
                            </td>
                          </tr>
                        );
                      }),
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}
        </section>
      ) : null}
    </section>
  );
}
