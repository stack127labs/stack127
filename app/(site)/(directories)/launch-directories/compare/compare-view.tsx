"use client";

import { ArrowRight, Plus, Search, X } from "lucide-react";
import Link from "next/link";
import { createContext, useContext, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { UiCopyAction, UiSwitch } from "@/app/ui/controls";
import { sidebarPanelClassName, sidebarPanelHeadingClassName, sidebarPanelTitleClassName } from "@/app/ui/site/sidebar-panel";
import type { LaunchDirectory } from "@/lib/launch-directories";
import { LaunchCard, LaunchGrid, launchHref, type LaunchCategory } from "../launch-card";
import { costShort, formatDate, formatPrice, isSubmitReady, linkShort, shortUrl, submitStatusText, trafficLabels, trafficSteps, waitShort } from "../launch-format";
import { LaunchLogo } from "../launch-logo";
import { AhrefsCredit } from "../ahrefs-credit";
import styles from "./compare.module.css";

export type CompareRecord = Pick<LaunchDirectory,
  "slug" | "name" | "icon_url" | "website_url" | "submit_url" | "submission_status" | "categories" | "cost_kind" | "cost_label"
  | "lowest_paid_price_usd" | "review_wait" | "review_time_label" | "eligibility_label" | "link_type_kind" | "link_type_label"
  | "domain_rating" | "traffic_bucket" | "listing_indexed" | "checked_on" | "summary" | "best_for" | "price_tiers"> & {
  /** False when the place has no published page yet. */
  has_page: boolean;
};

const billingWords: Record<string, string> = { once: "once", week: "a week", month: "a month", year: "a year", listing: "per listing" };

/**
 * Paid prices can be ranked only when each one states the same billing period. A missing period
 * counts as unknown, never as a match.
 */
function sharedBilling(records: CompareRecord[]) {
  const billings = records.map(lowestBilling);
  return billings.length && billings.every((billing) => billing && billing === billings[0]) ? billings[0] : null;
}

/** The billing period of the lowest paid price, when a pricing tier with that price states one. */
function lowestBilling(record: CompareRecord) {
  const price = record.lowest_paid_price_usd;
  if (price === null) return null;
  return record.price_tiers.find((tier) => tier.price_usd === price)?.billing ?? null;
}

const MAX = 3;
const route = "/launch-directories/compare";
// Shown in the empty state, in this order, when they aren't picked yet.
const suggested = ["product-hunt", "uneed", "devhunt", "betalist", "peerlist-launchpad", "microlaunch", "fazier"];

type PicksState = {
  records: CompareRecord[];
  bySlug: Map<string, CompareRecord>;
  picks: string[];
  toggle: (slug: string) => void;
};

const PicksContext = createContext<PicksState | null>(null);

function usePicks() {
  const state = useContext(PicksContext);
  if (!state) throw new Error("usePicks needs a ComparePicksProvider.");
  return state;
}

function readPicks(bySlug: Map<string, CompareRecord>) {
  const raw = new URLSearchParams(window.location.search).get("d") ?? "";
  return [...new Set(raw.split(",").map((slug) => slug.trim()).filter((slug) => bySlug.has(slug)))].slice(0, MAX);
}

/**
 * The page is static and opens empty. Picks come from `?d=a,b,c` after hydration, and each change
 * rewrites that address in place so the comparison can be shared. These URLs stay noindex.
 */
export function ComparePicksProvider({ children, records }: { children: ReactNode; records: CompareRecord[] }) {
  const bySlug = useMemo(() => new Map(records.map((record) => [record.slug, record])), [records]);
  const [picks, setPicks] = useState<string[]>([]);
  // Set by a pick or removal, so the address updates after that render. Reading the URL on load
  // or on back and forward doesn't write it again.
  const changedByUser = useRef(false);

  useEffect(() => {
    const sync = () => setPicks(readPicks(bySlug));
    sync();
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, [bySlug]);

  useEffect(() => {
    if (!changedByUser.current) return;
    changedByUser.current = false;
    window.history.replaceState(window.history.state, "", picks.length ? `${route}?d=${picks.join(",")}` : route);
  }, [picks]);

  const value = useMemo<PicksState>(() => ({
    records, bySlug, picks,
    toggle: (slug) => {
      changedByUser.current = true;
      setPicks((current) => current.includes(slug) ? current.filter((item) => item !== slug) : current.length < MAX ? [...current, slug] : current);
    },
  }), [records, bySlug, picks]);

  return <PicksContext.Provider value={value}>{children}</PicksContext.Provider>;
}

/* ---------- Sidebar ---------- */

export function ComparePicker({ categories }: { categories: LaunchCategory[] }) {
  const { bySlug, picks, records, toggle } = usePicks();
  const [query, setQuery] = useState("");
  const search = query.trim().toLowerCase();
  const full = picks.length >= MAX;
  const groups = categories.map((category) => ({
    category,
    items: records
      .filter((record) => record.categories[0] === category.value)
      .filter((record) => !search || `${record.name} ${record.slug}`.toLowerCase().includes(search))
      .sort((left, right) => left.name.localeCompare(right.name, "en", { sensitivity: "base" })),
  })).filter((group) => group.items.length);

  return <div className={sidebarPanelClassName}>
    <div className={sidebarPanelHeadingClassName}>
      <p className={sidebarPanelTitleClassName}>Compare</p>
    </div>
    <section aria-label="Picked places" className={styles.picked}>
      <p className={styles.sideLabel}>Picked <span>{picks.length} of {MAX}</span></p>
      {picks.length ? <ul>
        {picks.map((slug) => {
          const record = bySlug.get(slug);
          return record ? <li key={slug}>
            <LaunchLogo iconUrl={record.icon_url} name={record.name} size="row" />
            <span>{record.name}</span>
            <button aria-label={`Remove ${record.name}`} onClick={() => toggle(slug)} type="button"><X aria-hidden="true" size={14} /></button>
          </li> : null;
        })}
      </ul> : <p className={styles.sideEmpty}>Nothing picked yet.</p>}
    </section>
    <label className="directory-search">
      <span>Find a place</span>
      <span className="directory-search-field">
        <Search aria-hidden="true" size={16} strokeWidth={2.2} />
        <input onChange={(event) => setQuery(event.target.value)} placeholder="Search by name" type="search" value={query} />
      </span>
    </label>
    <div className={styles.pickList}>
      {records.some((record) => record.domain_rating !== null) ? <p className={styles.sideEmpty}>Numbers are <AhrefsCredit /></p> : null}
      {groups.length ? groups.map(({ category, items }) => <fieldset key={category.value}>
        <legend>{category.label}</legend>
        {items.map((record) => {
          const on = picks.includes(record.slug);
          return <label data-on={on || undefined} key={record.slug}>
            <input checked={on} disabled={!on && full} onChange={() => toggle(record.slug)} type="checkbox" />
            <span>{record.name}</span>
            <span className={styles.pickDr}>{record.domain_rating ?? ""}</span>
          </label>;
        })}
      </fieldset>) : <p className={styles.sideEmpty}>No place matches that.</p>}
    </div>
  </div>;
}

/* ---------- Facts ---------- */

type Row = {
  id: string;
  label: string;
  note?: ReactNode;
  /** What decides "same" for the differences toggle. */
  key: (record: CompareRecord) => string;
  cell: (record: CompareRecord, context: Context) => ReactNode;
};

/** `comparable` is false when the picked prices don't share one known billing period: no bars, no highlight. */
type Context = { comparable: boolean; maxPrice: number; lowPrice: number | null; maxDr: number };

const Unknown = ({ children = "Not stated" }: { children?: ReactNode }) => <span className={styles.unknown}>{children}</span>;

function Bar({ share }: { share: number }) {
  return <span aria-hidden="true" className={styles.bar}><i style={{ width: `${Math.max(3, Math.min(100, share * 100))}%` }} /></span>;
}

const groups: Array<{ title: string; rows: Row[] }> = [
  {
    title: "Cost",
    rows: [
      {
        id: "cost", label: "Cost",
        key: (record) => costShort(record) ?? "",
        cell: (record) => costShort(record) ? <><b>{costShort(record)}</b>{record.cost_label.trim().toLowerCase() !== costShort(record)?.toLowerCase() ? <small>{record.cost_label}</small> : null}</> : <Unknown />,
      },
      {
        id: "price", label: "Cheapest paid option",
        key: (record) => `${record.lowest_paid_price_usd ?? (record.cost_kind === "free" ? "none" : "")} ${lowestBilling(record) ?? ""}`,
        cell: (record, context) => record.lowest_paid_price_usd !== null
          ? <><b data-low={(context.comparable && record.lowest_paid_price_usd === context.lowPrice) || undefined}>{formatPrice(record.lowest_paid_price_usd)}{lowestBilling(record) ? <span className={styles.unit}> {billingWords[lowestBilling(record)!]}</span> : null}</b>{context.comparable ? <Bar share={record.lowest_paid_price_usd / Math.max(1, context.maxPrice)} /> : null}</>
          : record.cost_kind === "free" ? <Unknown>No paid option</Unknown> : <Unknown />,
      },
    ],
  },
  {
    title: "Getting listed",
    rows: [
      {
        id: "review", label: "Review time", note: "free path",
        key: (record) => waitShort(record) ?? "",
        cell: (record) => waitShort(record) ? <><b>{waitShort(record)}</b>{record.review_time_label.trim().toLowerCase() !== waitShort(record)?.toLowerCase() ? <small>{record.review_time_label}</small> : null}</> : <Unknown />,
      },
      {
        id: "eligibility", label: "Who can submit",
        key: (record) => record.eligibility_label,
        cell: (record) => <span className={styles.text}>{record.eligibility_label}</span>,
      },
      {
        id: "submit", label: "Submit page",
        key: (record) => String(isSubmitReady(record)),
        cell: (record) => isSubmitReady(record)
          ? <a href={record.submit_url ?? undefined} rel="noopener noreferrer" target="_blank">{shortUrl(record.submit_url ?? "")}</a>
          : <Unknown>{submitStatusText(record)}</Unknown>,
      },
    ],
  },
  {
    title: "What you get",
    rows: [
      {
        id: "link", label: "Link type",
        key: (record) => record.link_type_kind,
        cell: (record) => linkShort(record) ? <b>{linkShort(record)}</b> : <Unknown>Couldn&apos;t verify</Unknown>,
      },
      {
        id: "dr", label: "Domain rating", note: <AhrefsCredit />,
        key: (record) => String(record.domain_rating ?? ""),
        cell: (record, context) => record.domain_rating !== null
          ? <><b>{record.domain_rating}<span className={styles.unit}> / 100</span></b><Bar share={record.domain_rating / Math.max(1, context.maxDr)} /></>
          : <Unknown>Not checked yet</Unknown>,
      },
      {
        id: "popularity", label: "Popularity", note: "Tranco list",
        key: (record) => record.traffic_bucket ?? "",
        cell: (record) => record.traffic_bucket
          ? <><b>{trafficLabels[record.traffic_bucket]}</b><span aria-hidden="true" className={styles.meter}>{[1, 2, 3, 4, 5].map((step) => <i data-on={step <= trafficSteps[record.traffic_bucket!] || undefined} key={step} />)}</span></>
          : <Unknown>Not checked yet</Unknown>,
      },
      {
        id: "indexed", label: "Listing pages indexed", note: "in Google",
        key: (record) => String(record.listing_indexed),
        cell: (record) => record.listing_indexed === null ? <Unknown>Not checked yet</Unknown> : <b>{record.listing_indexed ? "Yes" : "No"}</b>,
      },
      {
        id: "checked", label: "Last checked",
        key: (record) => record.checked_on ?? "",
        cell: (record) => record.checked_on ? <b>{formatDate(record.checked_on)}</b> : <Unknown />,
      },
    ],
  },
];

/* ---------- Quick read ---------- */

function Names({ records }: { records: CompareRecord[] }) {
  return <>{records.map((record, index) => <span className={styles.name} key={record.slug}>
    {index ? <span className={styles.and}>and</span> : null}
    <LaunchLogo iconUrl={record.icon_url} name={record.name} size="row" />{record.name}
  </span>)}</>;
}

function QuickRead({ records }: { records: CompareRecord[] }) {
  const total = records.length;
  const missing = (count: number, what: string) => count ? ` ${count} of ${total} ${what}.` : "";

  // Free is a stated fact, so any free way in wins outright. Paid prices win only when every place
  // states a price with the same known billing period. Unknown costs are counted on their own.
  const free = records.filter((record) => record.cost_kind === "free" || record.cost_kind === "free_and_paid");
  const paidOnly = records.filter((record) => record.cost_kind === "paid").length;
  const unknownCost = records.filter((record) => record.cost_kind === "unknown").length;
  const priced = records.filter((record) => record.lowest_paid_price_usd !== null);
  const billing = sharedBilling(priced);
  let cheapest: Winner | null = null;
  if (free.length) {
    cheapest = {
      records: free,
      text: free.length === total ? `All ${total} start free` : null,
      why: `Free to submit.${missing(paidOnly, "charge for every listing")}${missing(unknownCost, "don't state a cost")}`,
    };
  } else if (priced.length === total && billing) {
    const lowest = Math.min(...priced.map((record) => record.lowest_paid_price_usd ?? Infinity));
    cheapest = {
      records: priced.filter((record) => record.lowest_paid_price_usd === lowest),
      text: null,
      why: `Lowest stated price, ${formatPrice(lowest)} ${billingWords[billing]}.`,
    };
  } else if (priced.length) {
    cheapest = {
      records: [],
      text: "Can't call it",
      why: priced.length < total ? `${total - priced.length} of ${total} don't state a price.`
        : "Their prices don't share a stated billing period. See the rows below.",
    };
  }

  const timed = records.filter((record) => record.review_wait?.max_days !== null && record.review_wait?.max_days !== undefined);
  const fastestDays = timed.length ? Math.min(...timed.map((record) => record.review_wait?.max_days ?? Infinity)) : null;
  const fastestRecords = timed.filter((record) => record.review_wait?.max_days === fastestDays);
  const fastest = fastestDays === null ? null : {
    records: fastestRecords,
    text: null,
    why: `${fastestRecords[0]?.review_wait?.label}, as stated on their site.${missing(total - timed.length, "state no time")}`,
  };

  const ranked = records.filter((record) => record.traffic_bucket);
  const top = ranked.length ? Math.max(...ranked.map((record) => trafficSteps[record.traffic_bucket!])) : null;
  const topRecords = ranked.filter((record) => trafficSteps[record.traffic_bucket!] === top);
  const popular = top === null ? null : {
    records: topRecords,
    text: null,
    why: `${trafficLabels[topRecords[0]!.traffic_bucket!]} by traffic.${missing(total - ranked.length, "aren't checked yet")}`,
  };

  const cell = (label: string, pick: Winner | null) => <div>
    <dt>{label}</dt>
    {pick ? <><dd>{pick.text ?? <Names records={pick.records} />}</dd><dd className={styles.why}>{pick.why}</dd></> : <dd className={styles.unknown}>None of them state it</dd>}
  </div>;

  return <dl className={styles.quick}>
    {cell("Cheapest", cheapest)}
    {cell("Fastest stated review", fastest)}
    {cell("Most visited, of those checked", popular)}
  </dl>;
}

type Winner = { records: CompareRecord[]; text: string | null; why: string };

/* ---------- Main view ---------- */

export function CompareView({ categories }: { categories: LaunchCategory[] }) {
  const { bySlug, picks, records, toggle } = usePicks();
  const [onlyDifferent, setOnlyDifferent] = useState(false);
  const [origin, setOrigin] = useState("");
  const picked = picks.map((slug) => bySlug.get(slug)).filter((record): record is CompareRecord => Boolean(record));
  const categoryMap = Object.fromEntries(categories.map((category) => [category.value, category]));

  useEffect(() => { setOrigin(window.location.origin); }, []);
  const href = origin ? `${origin}${route}?d=${picks.join(",")}` : "";

  if (picked.length < 2) {
    const ideas = suggested.filter((slug) => bySlug.has(slug) && !picks.includes(slug)).slice(0, 4).map((slug) => bySlug.get(slug)!);
    return <div className={styles.empty}>
      <h2>{picked.length ? `Pick one more to compare with ${picked[0]?.name}` : "Pick two or three to compare"}</h2>
      <p>Choose from the list, or start with one of these.</p>
      <div className={styles.chips}>
        {ideas.map((record) => <button key={record.slug} onClick={() => toggle(record.slug)} type="button">
          <LaunchLogo iconUrl={record.icon_url} name={record.name} size="row" />{record.name}<Plus aria-hidden="true" size={14} />
        </button>)}
      </div>
    </div>;
  }

  const prices = picked.map((record) => record.lowest_paid_price_usd).filter((price): price is number => price !== null);
  const pricedPicks = picked.filter((record) => record.lowest_paid_price_usd !== null);
  const context: Context = {
    comparable: pricedPicks.length > 1 && sharedBilling(pricedPicks) !== null,
    maxPrice: Math.max(1, ...prices),
    lowPrice: prices.length > 1 ? Math.min(...prices) : null,
    maxDr: 100,
  };
  const differs = (row: Row) => new Set(picked.map(row.key)).size > 1;
  const firstCategory = picked[0]?.categories[0] ?? "";
  const more = records.filter((record) => !picks.includes(record.slug) && record.categories.includes(firstCategory))
    .sort((left, right) => (right.domain_rating ?? -1) - (left.domain_rating ?? -1)).slice(0, 3);
  const columns = { gridTemplateColumns: `minmax(150px, 0.9fr) repeat(${picked.length}, minmax(0, 1fr))`, "--picked": picked.length } as CSSProperties;

  return <div className={styles.view}>
    <div className={styles.toolbar}>
      <UiSwitch isSelected={onlyDifferent} onChange={setOnlyDifferent}>Only show differences</UiSwitch>
      {href ? <UiCopyAction label="Copy link" successLabel="Link copied" value={href} variant="ghost" /> : null}
    </div>

    <QuickRead records={picked} />

    <div className={styles.table} role="table" aria-label={`Comparison of ${picked.map((record) => record.name).join(", ")}`}>
      <div className={styles.heads} role="row" style={columns}>
        <div className={styles.headLabel} role="columnheader">{picked.length} of {MAX} picked</div>
        {picked.map((record) => <div className={styles.head} key={record.slug} role="columnheader">
          <LaunchLogo iconUrl={record.icon_url} name={record.name} />
          <div>
            {record.has_page ? <Link className={styles.headName} href={launchHref(record.slug)} prefetch={false}>{record.name}</Link> : <span className={styles.headName}>{record.name}</span>}
            <span className={styles.headCategory}>{categoryMap[record.categories[0] ?? ""]?.label}</span>
            {isSubmitReady(record) ? <a className={styles.headSubmit} href={record.submit_url ?? undefined} rel="noopener noreferrer" target="_blank">Submit <ArrowRight aria-hidden="true" size={12} /></a> : null}
          </div>
          <button aria-label={`Remove ${record.name}`} className={styles.remove} onClick={() => toggle(record.slug)} type="button"><X aria-hidden="true" size={14} /></button>
        </div>)}
      </div>
      {groups.map((group) => {
        const rows = group.rows.filter((row) => !onlyDifferent || differs(row));
        if (!rows.length) return null;
        return <div key={group.title} role="rowgroup">
          <div className={styles.group} role="row"><span role="rowheader">{group.title}</span></div>
          {rows.map((row) => <div className={styles.row} key={row.id} role="row" style={columns}>
            <div className={styles.rowLabel} role="rowheader">
              <span>{row.label}{row.note ? <small>{row.note}</small> : null}</span>
              {differs(row) ? <span aria-label="Values differ" className={styles.diff} title="Values differ">≠</span> : null}
            </div>
            {picked.map((record) => <div className={styles.cell} key={record.slug} role="cell">{row.cell(record, context)}</div>)}
          </div>)}
        </div>;
      })}
    </div>

    {more.length ? <section aria-labelledby="add-one-more" className={styles.more}>
      <div className={styles.moreHead}>
        <h2 id="add-one-more">Add one more</h2>
        <Link href={`/launch-directories?category=${firstCategory}`} prefetch={false}>All {categoryMap[firstCategory]?.label.toLowerCase() ?? "places"} <ArrowRight aria-hidden="true" size={13} /></Link>
      </div>
      <p className={styles.moreNote}>
        {picks.length >= MAX ? `You can compare ${MAX} at a time, so picking one swaps out ${picked.at(-1)?.name}.` : `More like ${picked[0]?.name}, strongest sites first.`}
      </p>
      <LaunchGrid>
        {more.map((record) => <LaunchCard
          action={<button className={styles.addButton} onClick={() => {
            if (picks.length >= MAX) toggle(picks[picks.length - 1]!);
            toggle(record.slug);
          }} type="button"><Plus aria-hidden="true" size={13} />Compare</button>}
          category={categoryMap[record.categories[0] ?? ""]}
          directory={record}
          key={record.slug}
          linked={record.has_page}
        />)}
      </LaunchGrid>
    </section> : null}

    <p className={styles.footnote}>Facts come from each place&apos;s own pages, with the dates on its page. <AhrefsCredit /></p>
  </div>;
}
