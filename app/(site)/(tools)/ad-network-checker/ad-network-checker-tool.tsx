"use client";

import Link from "next/link";
import { CalendarDays, ExternalLink, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent, type MouseEvent, type ReactNode, type RefObject } from "react";
import { AdSection, SectionNote } from "@/app/ui/ad-networks/section";
import { NetworkLogo } from "@/app/ui/ad-networks/network-logo";
import { checkerHref, domainAge, nicheName } from "@/app/ui/ad-networks/site-format";
import {
  AdsTxtNumbers,
  AdsTxtPreview,
  BlockSubheading,
  FactMuted,
  SimilarSites,
  SiteFacts,
  SiteNetworksTable,
  type SiteFact,
} from "@/app/ui/ad-networks/site-view";
import { TrafficMeter } from "@/app/ui/ad-networks/traffic-meter";
import { RankedBars, StackBar } from "@/app/ui/ad-networks/viz/bars";
import { formatNumber, formatShare, type VizTone } from "@/app/ui/ad-networks/viz/format";
import { HistoryGantt, type GanttRow } from "@/app/ui/ad-networks/viz/history-gantt";
import { EventsList } from "@/app/ui/ad-networks/viz/lists";
import { UiButton, UiShareAction, UiTextField } from "@/app/ui/controls";
import { UiActionRow, UiStatus } from "@/app/ui/display";
import { ToolbarSearch } from "@/app/ui/table-toolbar";
import { ToolResult, ToolWorkbench } from "@/app/ui/tools/tool-workbench";
import type { AdNetworkCheckerSiteView, AdNetworkRef, AdNetworkSiteResponse } from "@/lib/ad-networks-types";
import {
  EXAMPLE_SITE,
  adsTxtUrl,
  eventsFor,
  evidenceOf,
  firstCheck,
  formatDay,
  formatMonth,
  hasChanges,
  isManager,
  leadFor,
  monthKey,
  names,
  normalizeSite,
  saysLabel,
  similarNetworks,
  sortedRelationships,
  statusLabel,
} from "./ad-network-checker-view";
import styles from "./ad-network-checker.module.css";

/** Network slug to its logo path, read from `public/ad-networks/logos` by the server page. */
export type NetworkLogos = Readonly<Record<string, string>>;

type Outcome =
  | { kind: "found"; view: AdNetworkCheckerSiteView }
  | { domain: string; kind: "missing" }
  | { domain: string; kind: "error"; message: string };

class FieldError extends Error {}

async function fetchSite(domain: string, signal: AbortSignal): Promise<AdNetworkSiteResponse> {
  const response = await fetch(`/api/ad-networks/site?domain=${encodeURIComponent(domain)}`, { signal });
  const data = await response.json().catch(() => null);
  if (response.status === 400) throw new FieldError(typeof data?.error === "string" ? data.error : "Enter a domain such as example.com.");
  if (!response.ok || !data) throw new Error("The check didn't finish. Try again in a moment.");
  return data as AdNetworkSiteResponse;
}

export function AdNetworkCheckerTool({ initialSite = "", logos = {} }: { initialSite?: string; logos?: NetworkLogos }) {
  const [site, setSite] = useState(initialSite || EXAMPLE_SITE);
  const [error, setError] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [loading, setLoading] = useState(false);
  const [edited, setEdited] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const resultRef = useRef<HTMLElement>(null);
  const request = useRef<AbortController | null>(null);
  const focusTitle = useRef(false);

  async function check(raw: string, focus = true) {
    const input = normalizeSite(raw);
    if (!input.ok) {
      setError(input.message);
      requestAnimationFrame(() => inputRef.current?.focus());
      return;
    }
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setError(null);
    setEdited(false);
    setLoading(true);
    try {
      const data = await fetchSite(input.domain, controller.signal);
      setOutcome(data.found && data.site ? { kind: "found", view: data.site } : { domain: data.domain, kind: "missing" });
      focusTitle.current = focus;
    } catch (caught) {
      if (controller.signal.aborted) return;
      if (caught instanceof FieldError) {
        setError(caught.message);
        requestAnimationFrame(() => inputRef.current?.focus());
      } else {
        setOutcome({ domain: input.domain, kind: "error", message: caught instanceof Error ? caught.message : "The check didn't finish." });
        focusTitle.current = focus;
      }
    } finally {
      if (request.current === controller) {
        request.current = null;
        setLoading(false);
      }
    }
  }

  // A shared link checks its site right away. A clean URL waits for the button.
  useEffect(() => {
    if (initialSite) void check(initialSite, false);
  }, [initialSite]); // eslint-disable-line react-hooks/exhaustive-deps

  // Stop a check still running when the tool goes away. A remount starts its own check.
  useEffect(() => () => request.current?.abort(), []);

  useEffect(() => {
    if (!focusTitle.current || loading) return;
    focusTitle.current = false;
    titleRef.current?.focus({ preventScroll: true });
  }, [outcome, loading]);

  function submit(event: FormEvent) {
    event.preventDefault();
    void check(site);
  }

  /** Checks another site from inside the result, then brings the result back into view. */
  function checkFromResult(domain: string) {
    setSite(domain);
    resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    void check(domain);
  }

  function reset() {
    request.current?.abort();
    setSite(EXAMPLE_SITE);
    setError(null);
    setOutcome(null);
    setEdited(false);
    setLoading(false);
  }

  const stale = loading || (edited && outcome !== null);

  return (
    <ToolWorkbench label="Ad network checker">
      <form className={styles.form} noValidate onSubmit={submit}>
        <UiTextField
          autoCapitalize="none"
          error={error}
          hint="A domain or any page address on the site."
          inputMode="url"
          inputRef={inputRef}
          label="Website"
          name="site"
          onChange={(value) => {
            setSite(value);
            setEdited(true);
            if (error) setError(null);
          }}
          placeholder="example.com"
          required
          spellCheck={false}
          value={site}
        />
        <UiActionRow>
          {loading ? <UiStatus>Checking site...</UiStatus> : stale ? <UiStatus>Inputs changed</UiStatus> : null}
          <UiButton aria-busy={loading} type="submit" variant="primary">Check site</UiButton>
          <UiButton onPress={reset} type="button" variant="secondary">
            <RotateCcw aria-hidden="true" size={17} />
            Reset
          </UiButton>
        </UiActionRow>
      </form>

      <ToolResult aria-busy={loading || undefined} className={styles.result} label="Ad network result" ref={resultRef} stale={stale}>
        {outcome?.kind === "found" ? (
          <FoundResult logos={logos} onCheck={checkFromResult} titleRef={titleRef} view={outcome.view} />
        ) : outcome?.kind === "missing" ? (
          <MissingResult domain={outcome.domain} titleRef={titleRef} />
        ) : outcome?.kind === "error" ? (
          <ErrorResult domain={outcome.domain} message={outcome.message} onRetry={() => void check(outcome.domain)} titleRef={titleRef} />
        ) : (
          <EmptyResult />
        )}
        {outcome ? <CheckAnother onCheck={checkFromResult} /> : null}
      </ToolResult>
    </ToolWorkbench>
  );
}

/* ---------------- header ---------------- */

type TitleRef = RefObject<HTMLHeadingElement | null>;

/** The site's name as the result's title, with when we checked it and a link to the site (mockup page header). */
function SiteHeader({ checkedAt, children, domain, favicon, share, title, titleRef }: {
  checkedAt?: string | null;
  children?: ReactNode;
  domain: string | null;
  favicon?: string | null;
  share?: boolean;
  title?: ReactNode;
  titleRef?: TitleRef;
}) {
  return (
    <header className={styles.header}>
      <div aria-atomic="true" aria-live="polite" className={styles.titleRow}>
        <h2 className={styles.title} ref={titleRef} tabIndex={-1}>
          {title ?? (
            <>
              {domain ? <NetworkLogo logo={favicon ? { src: favicon } : null} name={domain} size="title" /> : null}
              Ad networks on <mark>{domain ?? "—"}</mark>
            </>
          )}
        </h2>
        {share && domain ? <UiShareAction params={{ site: domain }} /> : null}
      </div>
      <div className={styles.meta}>
        {checkedAt !== undefined ? (
          <span><CalendarDays aria-hidden="true" size={15} />Checked {checkedAt ? formatDay(checkedAt) : "—"}</span>
        ) : null}
        {domain ? (
          <a href={`https://${domain}`} rel="noopener noreferrer nofollow" target="_blank">
            <ExternalLink aria-hidden="true" size={15} />
            {domain}
          </a>
        ) : null}
      </div>
      {children}
    </header>
  );
}

const networkHref = (network: AdNetworkRef) => `/ad-networks/${network.slug}`;

/** The mockup's ads.txt wording holds only when every network was confirmed from the file. */
const allFromAdsTxt = (view: AdNetworkCheckerSiteView) =>
  view.relationships.every((row) => ["manager", "seller"].includes(evidenceOf(row)));

function Lead({ view }: { view: AdNetworkCheckerSiteView }) {
  const parts = leadFor(view);
  return (
    <p className={styles.lead}>
      {parts.map((part, index) => (
        <span key={index}>
          {part.manager ? <>{view.site.domain} runs <Link href={networkHref(part.manager)} prefetch={false}>{part.manager.name}</Link></> : null}
          {part.text}
        </span>
      ))}
    </p>
  );
}

/* ---------------- sections ---------------- */

function facts(view: AdNetworkCheckerSiteView): SiteFact[] {
  const { site } = view;
  const age = domainAge(site);
  const niche = nicheName(site.niche);
  const items: (SiteFact | null)[] = [
    // Only a MANAGERDOMAIN line names the main ad network.
    site.managed_by ? { label: "main ad network", value: <Link href={networkHref(site.managed_by)} prefetch={false}>{site.managed_by.name}</Link> } : null,
    // data-gate: the traffic, niche, platform, domain-age, and publisher-names runs fill these facts.
    site.traffic_group ? { label: "traffic", value: <TrafficMeter group={site.traffic_group} muted={false} /> } : null,
    niche && site.niche ? { label: "niche", value: <Link href={`/ad-networks/niches/${site.niche}`} prefetch={false}>{niche}</Link> } : null,
    site.platform ? { label: "platform", value: site.platform } : null,
    age ? { label: "domain registered", value: <>{age.year}{age.years !== null ? <> <FactMuted>· {age.years} {age.years === 1 ? "yr" : "yrs"}</FactMuted></> : null}</> } : null,
    site.publisher_name ? { label: "publisher", value: site.publisher_name } : null,
  ];
  return items.filter((item): item is SiteFact => item !== null);
}

function NetworksSection({ logos, view }: { logos: NetworkLogos; view: AdNetworkCheckerSiteView }) {
  const { domain, managed_by: manager } = view.site;
  const rows = sortedRelationships(view);
  return (
    <AdSection
      description={allFromAdsTxt(view)
        ? "Networks from our list that its ads.txt file names, and whether our latest checks still find them."
        : "Networks from our list that we found on the site, and whether our latest checks still find them."}
      id="checker-networks"
      title={`Which ad networks does ${domain} use?`}
    >
      <SiteNetworksTable
        caption={`Ad networks on ${domain}`}
        rows={rows.map((row) => ({
          confirmed: row.status === "confirmed",
          href: networkHref(row),
          logo: logos[row.slug] ? { src: logos[row.slug] } : null,
          name: row.name,
          says: saysLabel(view, row),
          since: row.first_confirmed_at ? formatMonth(row.first_confirmed_at) : undefined,
          status: statusLabel(row),
        }))}
      />
      {/* data-gate: the ads-txt-summary run saves the full seller list that fills this count. */}
      {view.other_sellers ? (
        <SectionNote>
          Its ads.txt also lists {formatNumber(view.other_sellers)} other ad {view.other_sellers === 1 ? "seller" : "sellers"}.
          {manager ? ` Most of them work through ${manager.name}, so we don't count them as separate networks.` : " We don't count them as separate networks."}
        </SectionNote>
      ) : null}
    </AdSection>
  );
}

function ganttTone(view: AdNetworkCheckerSiteView, row: AdNetworkCheckerSiteView["relationships"][number]): VizTone {
  if (row.status === "ended") return "n1";
  if (row.status === "stale") return "n2";
  return isManager(view, row) ? "ac" : "ac2";
}

function HistorySection({ view }: { view: AdNetworkCheckerSiteView }) {
  const rows: GanttRow[] = sortedRelationships(view)
    .filter((row) => row.first_confirmed_at)
    .map((row) => ({
      from: monthKey(row.first_confirmed_at!),
      label: row.name,
      note: row.status === "stale" ? "not seen lately" : undefined,
      to: row.status === "ended" ? monthKey(row.last_confirmed_at ?? row.ended_at ?? row.first_confirmed_at!) : null,
      tone: ganttTone(view, row),
    }));
  const events = eventsFor(view);
  const fromAdsTxt = allFromAdsTxt(view);
  const start = firstCheck(view);
  const endYear = new Date(view.site.last_checked_at ?? Date.now()).getUTCFullYear();
  return (
    <AdSection description={fromAdsTxt ? "When each network first and last appeared in its ads.txt file." : "When we first and last confirmed each network on the site."} id="checker-history" title="How have its ad networks changed?">
      {rows.length ? <HistoryGantt endYear={endYear} rows={rows} /> : null}
      {events.length ? <EventsList events={events} /> : null}
      {start ? <SectionNote>Our checks of this site started on {formatDay(start)}. A network found on that first check may have been there for years.</SectionNote> : null}
    </AdSection>
  );
}

function AdsTxtSection({ view }: { view: AdNetworkCheckerSiteView }) {
  const { domain, last_checked_at: checkedAt } = view.site;
  // Seller lines of networks confirmed live read brighter; stale and ended networks don't.
  const live = [...new Set(view.relationships.filter((row) => row.status === "confirmed").flatMap((row) => row.ad_system_domains ?? []))];
  const summary = view.ads_txt_summary;
  const preview = view.ads_txt_preview ?? summary?.preview ?? null;
  const split = summary ? summary.direct + summary.reseller : 0;
  const sellers = summary?.top_sellers.slice(0, 5) ?? [];
  const shown = preview ? preview.replace(/\r\n?/g, "\n").split("\n").filter((line) => line.trim()).length : 0;
  const more = summary && preview ? Math.max(0, summary.lines - shown) : 0;
  const numbers = summary ? (
    <div className={styles.block}>
      <AdsTxtNumbers
        items={[
          { label: "lines", value: formatNumber(summary.lines) },
          { label: "companies", value: formatNumber(summary.companies) },
          { label: "direct", value: formatNumber(summary.direct) },
          { label: "resellers", value: formatNumber(summary.reseller) },
        ]}
      />
      {split ? (
        <StackBar
          parts={[
            { display: formatShare(summary.direct / split), label: "direct", tone: "ac", value: summary.direct },
            { display: formatShare(summary.reseller / split), label: "reseller", tone: "n2", value: summary.reseller },
          ]}
        />
      ) : null}
      {sellers.length ? (
        <>
          <BlockSubheading>companies with the most lines</BlockSubheading>
          <RankedBars ariaLabel="Companies with the most lines in its ads.txt file" rows={sellers.map((seller) => ({ label: seller.name, value: seller.lines }))} />
        </>
      ) : null}
    </div>
  ) : null;
  const file = preview ? (
    <div className={styles.block}>
      <AdsTxtPreview
        fileHref={adsTxtUrl(domain)}
        highlight={live}
        label="First lines of the ads.txt file"
        more={more}
        text={preview}
      />
    </div>
  ) : null;
  return (
    <AdSection
      description={checkedAt ? `The public list of companies allowed to sell its ad space, as we read it on ${formatDay(checkedAt)}.` : "The public list of companies allowed to sell its ad space."}
      id="checker-ads-txt"
      title="What is in its ads.txt file?"
    >
      {numbers && file ? <div className={styles.pair}>{numbers}{file}</div> : numbers ?? file}
    </AdSection>
  );
}

function SimilarSection({ onCheck, view }: { onCheck: (domain: string) => void; view: AdNetworkCheckerSiteView }) {
  const matched = similarNetworks(view);
  const niche = view.basis === "niche" ? nicheName(view.site.niche) : null;
  const sameSize = Boolean(view.site.traffic_group) && view.similar_sites.every((site) => site.traffic_group === view.site.traffic_group);
  const what = matched.length === 1 ? matched[0].name : "the same networks";
  const kind = niche ? `${niche.toLowerCase()} sites` : "sites";
  // Links to every network read as a wall when a site runs many, so they stay for one or two.
  const links = [
    ...(matched.length <= 2 ? matched.map((network) => ({ href: networkHref(network), label: `${network.name} sites` })) : []),
    ...(niche && view.site.niche ? [{ href: `/ad-networks/niches/${view.site.niche}`, label: `${niche.toLowerCase()} sites` }] : []),
  ];
  // Clicks check the site here; the link itself still opens the checker for that site.
  const intercept = (event: MouseEvent<HTMLDivElement>) => {
    const link = (event.target as HTMLElement).closest("a");
    if (!link || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    const domain = new URL(link.href).searchParams.get("site");
    if (!domain) return;
    event.preventDefault();
    onCheck(domain);
  };
  return (
    <AdSection
      description={`Other ${kind}${sameSize ? " of the same size" : ""} that run ${names(matched, "or")}.`}
      id="checker-similar"
      title={`Which ${niche ? "similar" : "other"} sites use ${what}?`}
    >
      <div onClickCapture={intercept}>
        <SimilarSites sites={view.similar_sites.map((site) => ({ domain: site.domain, href: checkerHref(site.domain), trafficGroup: site.traffic_group }))} />
      </div>
      {links.length ? (
        <SectionNote>
          See all {links.map((link, index) => (
            <span key={link.href}>
              {index ? (index === links.length - 1 ? " or all " : ", ") : null}
              <Link href={link.href} prefetch={false}>{link.label}</Link>
            </span>
          ))}.
        </SectionNote>
      ) : null}
    </AdSection>
  );
}

/* ---------------- states ---------------- */

function FoundResult({ logos, onCheck, titleRef, view }: { logos: NetworkLogos; onCheck: (domain: string) => void; titleRef: TitleRef; view: AdNetworkCheckerSiteView }) {
  const items = facts(view);
  return (
    <>
      <SiteHeader checkedAt={view.site.last_checked_at} domain={view.site.domain} favicon={view.site.favicon} share titleRef={titleRef}>
        <Lead view={view} />
      </SiteHeader>
      {items.length ? <SiteFacts items={items} /> : null}
      <div className={styles.sections}>
        <NetworksSection logos={logos} view={view} />
        {/* data-gate: the API's recorded events (verifier joins and departures, later the Wayback run) fill the history. */}
        {hasChanges(view) ? <HistorySection view={view} /> : null}
        {/* data-gate: the ads-txt-summary run fills the counts, top sellers, and file preview. */}
        {view.ads_txt_summary || view.ads_txt_preview ? <AdsTxtSection view={view} /> : null}
        {view.similar_sites.length ? <SimilarSection onCheck={onCheck} view={view} /> : null}
      </div>
    </>
  );
}

function MissingResult({ domain, titleRef }: { domain: string; titleRef: TitleRef }) {
  return (
    <SiteHeader domain={domain} title={<>We don&apos;t list <mark>{domain}</mark> yet</>} titleRef={titleRef}>
      <p className={styles.lead}>
        We haven&apos;t confirmed an ad network we track on this site.{" "}
        <a href={adsTxtUrl(domain)} rel="noopener noreferrer nofollow" target="_blank">Open its ads.txt file</a> to see who it names.
      </p>
    </SiteHeader>
  );
}

function ErrorResult({ domain, message, onRetry, titleRef }: { domain: string; message: string; onRetry: () => void; titleRef: TitleRef }) {
  return (
    <SiteHeader domain={domain} title={<>Couldn&apos;t check <mark>{domain}</mark></>} titleRef={titleRef}>
      <UiStatus tone="danger">{message}</UiStatus>
      <div><UiButton onPress={onRetry} variant="secondary">Try again</UiButton></div>
    </SiteHeader>
  );
}

/** Before the first check: the result's shape with dashes. */
function EmptyResult() {
  return (
    <>
      <SiteHeader checkedAt={null} domain={null} />
      <SiteFacts
        items={["main ad network", "traffic", "niche", "platform", "domain registered", "publisher"].map((label) => ({ label, value: "—" }))}
      />
    </>
  );
}

function CheckAnother({ onCheck }: { onCheck: (domain: string) => void }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  return (
    <div className={styles.sections}>
      <AdSection id="checker-another" title="Check another site">
        <form
          className={styles.another}
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            const input = normalizeSite(value);
            if (!input.ok) {
              setError(input.message);
              return;
            }
            setError(null);
            setValue("");
            onCheck(input.domain);
          }}
        >
          <ToolbarSearch
            label="Domain"
            onChange={(next) => {
              setValue(next);
              if (error) setError(null);
            }}
            placeholder="example.com"
            size="large"
            value={value}
          />
          <UiButton className={styles.anotherButton} type="submit" variant="primary">Check</UiButton>
        </form>
        {error ? <p className={styles.error} role="alert">{error}</p> : null}
        <SectionNote>We show the ad networks we&apos;ve confirmed on the site, mostly from its ads.txt file.</SectionNote>
      </AdSection>
    </div>
  );
}
