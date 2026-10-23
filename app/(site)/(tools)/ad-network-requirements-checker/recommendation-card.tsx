"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { useId, useState } from "react";
import { getAdNetworkNiche } from "@/lib/ad-network-niches";
import type { BarFact, GrowthTarget, Lane, Recommendation } from "@/lib/ad-network-requirements/types";
import type { NetworkLogoFile } from "@/app/ui/ad-networks/network-logo-src";
import { NetworkLogo } from "@/app/ui/ad-networks/network-logo";
import { UiButton } from "@/app/ui/controls";
import styles from "./ad-network-requirements-checker.module.css";

export type NetworkInfo = { name: string; logo: NetworkLogoFile | null; directoryHref: string };
export type NameOf = (slug: string) => NetworkInfo;

const count = (n: number) => n.toLocaleString("en-US");
const money = (n: number, currency: BarFact["currency"]) => `${currency === "EUR" ? "€" : "$"}${n.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;

const ROLE: Record<Lane, string> = {
  main: "Replaces your ads",
  add: "Adds alongside your ads",
  setup: "Runs on your own ad setup",
};

const ALSO_NEEDS: Record<string, string> = {
  audience_age: "An audience that isn't mostly under 16",
  content_policies: "Content that follows their policies",
  direct_representation: "You sell the site's ads directly",
  domain_age_4_months: "About 4 months of domain history",
  domain_age_6_months: "A domain at least 6 months old",
  domain_history_4_months_guidance: "About 4 months of domain history",
  english: "An English-language site",
  exclusive: "Their ads only, no other network",
  exclusive_native_widget: "No other recommendation widget",
  ga_access: "Google Analytics access for review",
  google_analytics: "Google Analytics on the site",
  google_standing: "Good standing with Google ads",
  grow_30_days: "Grow running for 30 days",
  https: "HTTPS",
  incubator_limited: "Under 250,000 users, only the small Incubator program",
  invitation_only: "An invitation",
  not_jimdo: "A site not built on Jimdo",
  not_wix: "A site not built on Wix",
  organic_audience_50: "At least half your traffic from organic sources",
  own_domain: "Your own domain, not a subdomain",
  own_gam: "Your own Google Ad Manager account",
  privacy_policy: "A privacy policy",
  recent_content: "New content in the last 4 months",
  replace_adsense_adexchange: "No AdSense or Ad Exchange tags beside theirs",
  server_access: "Server access for ads.txt",
  propel_setup_fee_99_usd: "Propel only: a $99 setup fee",
  site_live_90_days: "A site live at least 90 days",
  propel_six_ad_slots: "Propel only: six ad slots",
  ten_current_articles: "At least 10 current articles",
  three_month_history: "The traffic held for 3 months in a row",
  propel_wordpress_or_blogger: "Propel only: WordPress or Blogger",
};

// Scopes that only restate "the site" add nothing to the sentence.
const QUIET_SCOPES = new Set(["site", "publisher", "publisher site", "publisher website", "website", "publisher audience", "publisher property", "publisher account and every domain", "all sizes subject to review", "all site sizes subject to review", "US", "below regional PV guide", "small publisher discussion", "Elevate"]);

function countries(scope: string) {
  const list = scope.replace(/^traffic from /, "").split(/\s*[/,]\s*/).filter(Boolean).map((c) => c === "CA" ? "Canada" : c === "NZ" ? "New Zealand" : c);
  return list.length > 1 ? `${list.slice(0, -1).join(", ")}, and ${list.at(-1)}` : list[0] ?? "";
}

/** One published bar in plain words, such as "At least 25,000 pageviews a month". */
export function barText(bar: BarFact): string {
  if (bar.metric === "none") return "No published traffic minimum";
  const amount = bar.amount ?? 0;
  const lead = bar.comparator === "more_than" ? "More than" : "At least";
  const period = bar.period === "month" ? " a month" : bar.period === "day" ? " a day" : bar.period === "30_days" ? " in 30 days" : bar.period === "previous_calendar_year" ? " in the previous calendar year" : "";
  const scope = bar.scope && !QUIET_SCOPES.has(bar.scope) ? bar.scope : null;
  switch (bar.metric) {
    case "ad_revenue_month":
    case "ad_revenue_previous_calendar_year":
      return `${bar.kind === "guidance" ? "About" : lead} ${money(amount, bar.currency)} ad revenue${period}`;
    case "tier1_share": {
      const share = `${amount}% of traffic from ${scope && scope.includes("/") ? countries(scope) : "Tier 1 countries"}`;
      // A pageview tier, such as Raptive's "under 100,000 pageviews a month", leads the sentence.
      if (scope && /pageviews/.test(scope)) return `${scope.charAt(0).toUpperCase()}${scope.slice(1)}: at least ${share}`;
      return `${lead} ${share}`;
    }
    case "us_share":
      return `${lead} ${amount}% of traffic from the US`;
    case "tier1_sessions_30d":
      return `${lead} ${count(amount)} sessions from Tier 1 countries${period}`;
    case "us_pageviews":
      return `${lead} ${count(amount)} US pageviews${period}`;
    case "monthly_active_users":
      return `${lead} ${count(amount)} monthly active users${scope ? ` for ${scope}` : ""}`;
    case "organic_unique_visitors_30d":
      return `${lead} ${count(amount)} organic unique visitors from ${scope ? countries(scope) : "the US, UK, and Canada"}${period}`;
    default: {
      const noun = bar.metric === "visits" ? "visits" : bar.metric === "visitors" ? "visitors" : "pageviews";
      const tail = !scope ? "" : scope === "Propel" ? " for Propel" : scope === "typical publisher scale" ? " for a typical publisher" : scope.startsWith("outside") ? ` ${scope}` : scope === "developer sites" || scope === "new sites" ? ` for ${scope}` : ` for traffic from ${scope}`;
      return `${lead} ${count(amount)} ${noun}${period}${tail}`;
    }
  }
}

function shortBar(values: Recommendation["reason"]["values"]): string | null {
  const bar = typeof values.bar === "number" ? values.bar : null;
  if (bar === null) return null;
  switch (values.metric) {
    case "ad_revenue_month": return `${money(bar, "USD")} ad revenue a month`;
    case "ad_revenue_previous_calendar_year": return `${money(bar, "USD")} ad revenue a year`;
    case "tier1_sessions_30d": return `${count(bar)} Tier 1 sessions a month`;
    case "us_pageviews": return `${count(bar)} US pageviews`;
    case "visits": return `${count(bar)} visits a month`;
    case "visitors": return `${count(bar)} visitors a month`;
    case "monthly_active_users": return `${count(bar)} monthly users`;
    case "organic_unique_visitors_30d": return `${count(bar)} organic visitors`;
    default: return `${count(bar)} pageviews`;
  }
}

function yours(values: Recommendation["reason"]["values"]): string | null {
  if (typeof values.yours !== "number") return null;
  return String(values.metric).startsWith("ad_revenue") ? money(values.yours, "USD") : count(values.yours);
}

/** The one-line reason on a card. */
export function reasonText(card: Recommendation, nameOf: NameOf): string {
  const { code, values } = card.reason;
  const bar = shortBar(values);
  const mine = yours(values);
  const currentName = typeof values.current === "string" ? currentLabel(values.current, nameOf) : "your current network";
  switch (code) {
    case "upgrade": return `The next step up from ${currentName}.`;
    case "check_contract": return `Check your ${currentName} contract first.`;
    case "niche_specialist": return `Built for ${getAdNetworkNiche(String(values.niche))?.name.toLowerCase() ?? "sites like yours"} sites.`;
    case "revenue_signal": return "Your ad revenue makes it worth a look. It counts last calendar year's earnings.";
    case "case_by_case": return "Asks for 50,000 pageviews. Smaller sites are reviewed one by one.";
    case "no_minimum": return "No published traffic minimum. Every site is reviewed.";
    case "sales_led": return "No published number. Talks to sites your size.";
    case "fit_estimate": return "No published number. Fits sites your size.";
    case "apply_guidance": return bar ? `Sites usually apply from ${bar}.` : "No fixed number. Fits sites your size.";
    case "revenue_bar":
    case "published_bar":
    case "estimated_bar": {
      if (!bar) return "Fits sites your size.";
      // The comparator comes from the network's own published bar: "more than" or "at least".
      const source = card.detail.bars.find((fact) => fact.metric === values.metric && fact.amount === values.bar);
      const asks = source?.comparator === "more_than" ? `Asks for more than ${bar}.` : `Asks for at least ${bar}.`;
      return mine ? `${asks} You have ${mine}.` : `${asks} You likely have more.`;
    }
  }
}

export function currentLabel(current: string, nameOf: NameOf): string {
  if (current === "snigel") return "Snigel";
  if (current === "other") return "your current network";
  return nameOf(current).name;
}

const STATUS: Record<Recommendation["status"] | "growth_target", string> = {
  good_fit: "Good fit",
  worth_a_try: "Worth a try",
  growth_target: "Growth target",
};

export function StatusText({ status }: { status: keyof typeof STATUS }) {
  return <span className={styles.status} data-status={status}>{STATUS[status]}</span>;
}

function checked(iso: string) {
  const date = new Date(`${iso}T00:00:00Z`);
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

function ApplyLink({ href, name }: { href: string; name: string }) {
  return (
    <a aria-label={`Apply to ${name}`} className={styles.apply} href={href} rel="noopener nofollow" target="_blank">
      Apply
      <ExternalLink aria-hidden="true" size={14} />
    </a>
  );
}

function title(card: { slug: string; program: string | null }, nameOf: NameOf) {
  const info = nameOf(card.slug);
  return card.program ? `${info.name} ${card.program}` : info.name;
}

export function RecommendationCard({ card, nameOf, niche, rank }: { card: Recommendation; nameOf: NameOf; niche: string; rank: number }) {
  const [open, setOpen] = useState(false);
  const detailId = useId();
  const info = nameOf(card.slug);
  const name = title(card, nameOf);
  const required = card.detail.bars.filter((bar) => bar.kind === "requirement");
  // Traffic and revenue bars are alternative routes: clearing any one is enough. Share rules apply on top.
  const routes = required.filter((bar) => !SHARE_METRICS.has(bar.metric));
  const shares = required.filter((bar) => SHARE_METRICS.has(bar.metric));
  const guidance = card.detail.bars.filter((bar) => bar.kind === "guidance");
  // Clickio and Publift: a revenue rule, with traffic levels published as a guide instead.
  const guidanceIsAlternative = routes.length > 0 && routes.every((bar) => bar.metric === "ad_revenue_month") && guidance.some((bar) => bar.metric === "pageviews");
  const allSources = [...new Map(card.detail.sources.map((source) => [source.url, source])).values()];
  const sources = allSources.slice(0, 3);
  const moreSources = allSources.length - sources.length;
  const nicheName = getAdNetworkNiche(niche)?.name.toLowerCase();
  const rows = [
    { label: "What they ask", value: required.length ? <AskList routes={routes} shares={shares} /> : "No published bar" },
    ...(guidance.length ? [{ label: guidanceIsAlternative ? "Or, as a guide" : "Their guidance", value: <BarList bars={guidance} /> }] : []),
    ...(card.detail.alsoNeeds.length ? [{ label: "Also needs", value: <ul className={styles.plainList}>{card.detail.alsoNeeds.map((key) => <li key={key}>{ALSO_NEEDS[key] ?? key}</li>)}</ul> }] : []),
    ...(card.detail.peers !== null && nicheName ? [{ label: "Sites we track", value: `${count(card.detail.peers)} ${nicheName} sites use it` }] : []),
    ...(sources.length ? [{ label: sources.length > 1 ? "Sources" : "Source", value: <ul className={styles.plainList}>{sources.map((source) => <li key={source.url}><a href={source.url} rel="noopener nofollow" target="_blank">{source.label}</a>, checked {checked(source.checkedAt)}</li>)}</ul> }] : []),
  ];
  return (
    <li className={styles.card}>
      <div className={styles.cardRow}>
        <span aria-hidden="true" className={styles.rank}>{rank}</span>
        <NetworkLogo logo={info.logo} name={info.name} />
        <div className={styles.cardMain}>
          <p className={styles.cardTitle}>
            <span className={styles.cardName}>{name}</span>
            <StatusText status={card.status} />
          </p>
          <p className={styles.reason}>{reasonText(card, nameOf)}</p>
          {card.lane === "main" ? null : <p className={styles.meta}>{ROLE[card.lane]}</p>}
        </div>
        <div className={styles.cardActions}>
          <ApplyLink href={card.applyUrl} name={name} />
          <UiButton aria-controls={detailId} aria-expanded={open} onPress={() => setOpen((value) => !value)} type="button" variant="ghost">
            Details
          </UiButton>
        </div>
      </div>
      <div className={styles.detail} hidden={!open} id={detailId}>
        <dl className={styles.facts}>
          {rows.map((row) => (
            <div key={row.label}>
              <dt>{row.label}</dt>
              <dd>{row.value}</dd>
            </div>
          ))}
        </dl>
        <p className={styles.meta}>
          <Link href={info.directoryHref}>{info.name} in the ad networks directory</Link>
          {moreSources > 0 ? `, with ${moreSources} more ${moreSources === 1 ? "source" : "sources"}` : null}
        </p>
      </div>
    </li>
  );
}

const SHARE_METRICS = new Set<BarFact["metric"]>(["tier1_share", "us_share"]);

function AskList({ routes, shares }: { routes: BarFact[]; shares: BarFact[] }) {
  const lines = [
    ...routes.map((bar, index) => {
      const text = barText(bar);
      return index === 0 ? text : `Or ${text.charAt(0).toLowerCase()}${text.slice(1)}`;
    }),
    ...shares.map(barText),
  ];
  if (lines.length === 1) return <>{lines[0]}</>;
  return <ul className={styles.plainList}>{lines.map((line) => <li key={line}>{line}</li>)}</ul>;
}

function BarList({ bars }: { bars: BarFact[] }) {
  if (bars.length === 1) return <>{barText(bars[0])}</>;
  return <ul className={styles.plainList}>{bars.map((bar) => <li key={`${bar.metric}:${bar.amount}:${bar.scope}`}>{barText(bar)}</li>)}</ul>;
}

export function CompactRow({ card, nameOf }: { card: Recommendation; nameOf: NameOf }) {
  const info = nameOf(card.slug);
  const name = title(card, nameOf);
  return (
    <li className={styles.compact}>
      <NetworkLogo logo={info.logo} name={info.name} />
      <div className={styles.cardMain}>
        <p className={styles.cardTitle}>
          <span className={styles.cardName}>{name}</span>
          <StatusText status={card.status} />
        </p>
        <p className={styles.reason}>{reasonText(card, nameOf)}</p>
      </div>
      <div className={styles.cardActions}>
        <ApplyLink href={card.applyUrl} name={name} />
      </div>
    </li>
  );
}

export function GrowthRow({ nameOf, target }: { nameOf: NameOf; target: GrowthTarget }) {
  const info = nameOf(target.slug);
  return (
    <li className={styles.compact}>
      <NetworkLogo logo={info.logo} name={info.name} />
      <div className={styles.cardMain}>
        <p className={styles.cardTitle}>
          <span className={styles.cardName}>{title(target, nameOf)}</span>
          <StatusText status="growth_target" />
        </p>
        <p className={styles.reason}>{barText(target.bar)}</p>
      </div>
      <div className={styles.cardActions}>
        <Link className={styles.apply} href={info.directoryHref}>Details</Link>
      </div>
    </li>
  );
}
