import type { SectionNav } from "@/app/ui/site/section-bar";
import { formatCount } from "@/app/ui/ad-networks/site-format";
import styles from "./ad-networks.module.css";

// Words and helpers shared by the ad network pages. Numbers come from the database or
// network-facts.ts; the MDX words never repeat them.

export function adNetworksSectionNav(current: string): SectionNav {
  return {
    label: "ad networks",
    href: "/ad-networks",
    current,
    items: [
      { label: "Directory", href: "/ad-networks" },
      { label: "Niches", href: "/ad-networks/niches" },
      { label: "Stats", href: "/ad-networks/stats" },
      { label: "Checker", href: "/ad-network-checker" },
    ],
  };
}

export { NOT_PUBLIC, joinLabel, joinOrder, joinPhrase, joinRule, joinSentence, joiningNumbers, networkFacts, trafficRule } from "./join-rules";

/** A count in the header lede: mono, and accent-colored for confirmed sites. */
export function Figure({ children, live = false }: { children: number; live?: boolean }) {
  return <b className={styles.figure} data-live={live || undefined}>{formatCount(children)}</b>;
}

/** The sentence after each intro that says how many sites we list and confirm. */
export function CountsLine({ confirmed, listed, noun = "sites" }: { confirmed: number; listed: number; noun?: string }) {
  if (!listed) return <p>We haven't confirmed any {noun} yet. They show up here once we confirm them from their own ads.txt files or ad code.</p>;
  return (
    <p>
      We list <Figure>{listed}</Figure> {listed === 1 ? noun.replace(/\bsites\b/, "site") : noun}, and <Figure live>{confirmed}</Figure> {confirmed === 1 ? "is" : "are"} confirmed live from their own ads.txt files or ad code.
    </p>
  );
}

export function ordinal(value: number) {
  const tens = value % 100;
  if (tens >= 11 && tens <= 13) return `${value}th`;
  return `${value}${{ 1: "st", 2: "nd", 3: "rd" }[value % 10] ?? "th"}`;
}

/** Whole percents, except near the ends: never show 0% or 100% for a value that isn't. */
export { formatPercent as percent } from "@/app/ui/ad-networks/viz/format";
