"use client";

import { Download } from "lucide-react";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { websiteFaviconUrl } from "@/lib/dns/favicon.ts";
import type { DomainRegistration } from "@/lib/domain/types.ts";

export { humanDuration } from "@/lib/domain/duration.ts";

export type Tone = "good" | "warn" | "bad" | "quiet";

/**
 * The pill is where the eye lands first. Same 14% tint the DNS diagnostics use,
 * so a result reads the same way across both tool families.
 */
export function StatePill({ tone, children }: { tone: Tone; children: ReactNode }) {
  return (
    <span className="domain-state" data-tone={tone}>
      {children}
    </span>
  );
}

export function DomainFavicon({ hostname }: { hostname: string }) {
  const [state, setState] = useState<"loading" | "loaded" | "failed">("loading");
  const src = websiteFaviconUrl(hostname);
  if (!src || state === "failed") return null;
  return (
    <img
      alt=""
      className={`domain-favicon${state === "loaded" ? " domain-favicon-loaded" : ""}`}
      decoding="async"
      height="32"
      onError={() => setState("failed")}
      onLoad={() => setState("loaded")}
      referrerPolicy="no-referrer"
      src={src}
      width="32"
    />
  );
}

export function ResultHeader({
  hostname,
  action,
  children,
}: {
  hostname: string;
  action?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header className="domain-result-header">
      <div>
        <div className="domain-result-title">
          <DomainFavicon hostname={hostname} />
          <h2>{hostname}</h2>
        </div>
        {children}
      </div>
      {action ?? null}
    </header>
  );
}

export function DownloadReportButton({ filename, contents }: { filename: string; contents: string }) {
  function save() {
    const url = URL.createObjectURL(new Blob([contents], { type: "application/json;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }
  return (
    <button className="domain-download" onClick={save} type="button">
      <Download aria-hidden="true" size={16} />
      Download report
    </button>
  );
}

export function reportJson(tool: string, result: object) {
  return JSON.stringify({ tool, reportVersion: 1, ...result }, null, 2);
}

/**
 * How far through its current term a domain is. Shows the shape of the answer
 * before the reader has parsed any dates, and turns amber then red as the expiry
 * approaches or passes.
 */
export function Timeline({
  start,
  end,
  startLabel = "Registered",
  endLabel = "Registry expiry",
}: {
  start: string | null;
  end: string | null;
  startLabel?: string;
  endLabel?: string;
}) {
  if (!start || !end) return null;
  const from = new Date(start).getTime();
  const to = new Date(end).getTime();
  const now = Date.now();
  if (Number.isNaN(from) || Number.isNaN(to) || to <= from) return null;

  const progress = Math.min(100, Math.max(0, ((now - from) / (to - from)) * 100));
  const daysLeft = Math.round((to - now) / 86_400_000);
  const tone = daysLeft < 0 ? "bad" : daysLeft <= 30 ? "warn" : "good";

  return (
    <figure className="domain-timeline">
      <div className="domain-timeline-track" data-tone={tone}>
        <div className="domain-timeline-fill" style={{ width: `${progress}%` }} />
      </div>
      <figcaption className="domain-timeline-labels">
        <span>
          {startLabel}
          <strong>{formatDate(start)}</strong>
        </span>
        <span>
          {daysLeft < 0 ? `Passed ${Math.abs(daysLeft)} days ago` : `${daysLeft} days left`}
          <strong>
            {endLabel}: {formatDate(end)}
          </strong>
        </span>
      </figcaption>
    </figure>
  );
}

/** Shared submit-a-domain behaviour. Each tool renders its own view of the result. */
export function useDomainLookup<T = DomainRegistration>(endpoint = "/api/domain/lookup") {
  const [result, setResult] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const run = useCallback(
    async (payload: Record<string, unknown>) => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data?.error?.message ?? "That lookup did not work.");
        setResult(data as T);
      } catch (caught) {
        setResult(null);
        setError(caught instanceof Error ? caught.message : "That lookup did not work.");
      } finally {
        setLoading(false);
      }
    },
    [endpoint],
  );

  return { result, error, loading, run, setError };
}

export function DomainForm({
  value,
  onChange,
  onSubmit,
  loading,
  error,
  invalid = false,
  label = "Domain name",
  placeholder = "example.com",
  busyLabel = "Looking it up...",
  submitLabel = "Look it up",
  children,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (event: FormEvent) => void;
  loading: boolean;
  error: string | null;
  invalid?: boolean;
  label?: string;
  placeholder?: string;
  busyLabel?: string;
  submitLabel?: string;
  children?: ReactNode;
}) {
  const errorId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (invalid) inputRef.current?.focus();
  }, [invalid]);

  return (
    <form aria-busy={loading} className="domain-form" onSubmit={onSubmit}>
      <label className="domain-name-field">
        <span>{label}</span>
        <input
          aria-describedby={invalid && error ? errorId : undefined}
          aria-invalid={invalid}
          autoCapitalize="none"
          autoComplete="off"
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          ref={inputRef}
          spellCheck={false}
          value={value}
        />
      </label>
      {children}
      {error ? (
        <p className="domain-form-error" id={errorId} role="alert">
          {error}
        </p>
      ) : null}
      <button aria-busy={loading} className="domain-submit" disabled={loading}>
        {loading ? busyLabel : submitLabel}
      </button>
    </form>
  );
}

export function formatDate(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

export function daysBetween(value: string | null, now = new Date()) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return Math.round((date.getTime() - now.getTime()) / 86_400_000);
}

/** Every result says where it came from and when, including whether it was cached. */
export function SourceNote({ registration }: { registration: DomainRegistration }) {
  const fetch = registration.registryFetch;
  if (!fetch) return null;
  const host = fetch.url ? new URL(fetch.url).host : "the registry";
  return (
    <p className="domain-meta">
      From {host}
      {fetch.fromCache ? ", from our cache" : ""}, fetched {formatDate(fetch.fetchedAt)}.
      {registration.registryDatabaseUpdated
        ? ` The registry last refreshed its own copy on ${formatDate(registration.registryDatabaseUpdated)}.`
        : ""}
    </p>
  );
}

/**
 * Shown instead of a result when the ending has no RDAP service or the lookup
 * failed. Every one of these is quiet or amber, never green and never blank,
 * because "we could not check" must not read like "this name is free".
 */
export function UnavailableNote({ registration }: { registration: DomainRegistration }) {
  if (registration.status === "no_service") {
    return (
      <div className="domain-answer">
        <div className="domain-answer-head">
          <StatePill tone="quiet">Cannot check this ending</StatePill>
        </div>
        <p className="domain-answer-lead">
          We cannot check <code>{registration.query.domain}</code>.
        </p>
        <p>
          We have no lookup service we can use for <code>.{registration.query.tld}</code>. Its registry offers none, or its
          WHOIS server didn't pass our tests. That is a gap in what the ending offers, not a problem with the domain. The{" "}
          <a href="/tld-directory">TLD directory</a> lists which endings we can and cannot check.
        </p>
      </div>
    );
  }
  if (registration.status === "rate_limited" || registration.status === "blocked") {
    return (
      <div className="domain-answer">
        <div className="domain-answer-head">
          <StatePill tone="warn">Check failed</StatePill>
        </div>
        <p className="domain-answer-lead">We could not get an answer just now.</p>
        <p>
          The registry for <code>.{registration.query.tld}</code> is limiting how often we can ask it, so we have paused
          rather than pushing harder and getting blocked for everyone. Try again in a few minutes. This is not an answer
          about the domain either way.
        </p>
      </div>
    );
  }
  if (registration.status === "timeout" || registration.status === "registry_error") {
    return (
      <div className="domain-answer">
        <div className="domain-answer-head">
          <StatePill tone="warn">Check failed</StatePill>
        </div>
        <p className="domain-answer-lead">The registry did not answer properly.</p>
        <p>
          Something went wrong between us and the registry for <code>.{registration.query.tld}</code>. That tells you
          nothing about the domain itself, so it is worth trying again shortly.
        </p>
      </div>
    );
  }
  return null;
}

export function Notes({ notes }: { notes: string[] }) {
  if (!notes.length) return null;
  return (
    <div className="domain-findings">
      {notes.map((note) => (
        <div className="domain-finding" data-tone="quiet" key={note}>
          <p>{note}</p>
        </div>
      ))}
    </div>
  );
}

/** Registry and registrar can disagree, so each raw response keeps its own source. */

export function RawResponses({ registration }: { registration: DomainRegistration }) {
  const responses = [
    { label: "Registry response", fetch: registration.registryFetch },
    { label: "Registrar response", fetch: registration.registrarFetch },
  ].filter((entry) => entry.fetch);

  if (!responses.length) return null;

  return (
    <>
      {responses.map((entry) => (
        <details className="domain-raw" key={entry.label}>
          <summary>
            {entry.label}
            {entry.fetch?.url ? ` from ${new URL(entry.fetch.url).host}` : ""}
          </summary>
          <pre>{JSON.stringify(entry.fetch?.body ?? { error: entry.fetch?.error }, null, 2)}</pre>
        </details>
      ))}
    </>
  );
}
