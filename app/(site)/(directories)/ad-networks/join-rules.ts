// How the ad network pages word joining rules. Pure, so the wording can be checked against every network.
import { adNetworkFacts, type AdNetworkFacts } from "./network-facts";

export const NOT_PUBLIC = "Not public";

export function networkFacts(slug: string): AdNetworkFacts | null {
  return adNetworkFacts[slug] ?? null;
}

/** The traffic rule as a short phrase, or null when the network publishes none. */
export function trafficRule(facts: AdNetworkFacts) {
  const rule = facts.minTraffic;
  if (!rule) return null;
  if (rule.amount === 0) return "No traffic minimum";
  return rule.label ?? `${rule.amount.toLocaleString("en-US")} ${rule.unit} a month`;
}

// Key numbers about pay, fees, or contracts.
const payNumber = /pay|share|split|fee|payout|terms|threshold|notice|timing|schedule|floor|minimums?$/i;
// Key numbers that are a bar to clear: traffic, users, or revenue to join. Others, such as a typical
// CPM or a review time, stay plain key numbers and never become the page's joining rule.
const joinNumber = /join|traffic|users|visitors|pageviews|sessions|revenue benchmark/i;

// Notes that say the number isn't a rule anyone has to meet, such as a benchmark or a referral bar.
const notARule = /not a general minimum|not the main rule|not a joining cutoff|not a confirmed joining cutoff|not a hard joining cutoff|case.study|unconfirmed|dated|unit unclear|not a cutoff|not a threshold|editorial estimate/i;

/** Key numbers that say what it takes to join, such as revenue or traffic to apply. */
export function joiningNumbers(facts: AdNetworkFacts) {
  return facts.keyNumbers.filter((item) => !payNumber.test(item.label) && joinNumber.test(item.label) && !notARule.test(item.note ?? ""));
}

/**
 * A joining key number as one phrase: the value, then the first part of its note, worded the
 * way people say it. "$5,000" with "in annual ad revenue" reads "$5,000 ad revenue a year".
 */
export function joinPhrase(item: AdNetworkFacts["keyNumbers"][number]) {
  let unit = (item.note ?? "").split(";")[0].trim();
  // "monthly ad revenue or 2 million monthly pageviews": keep the first rule.
  unit = unit.replace(/\s+or\s+(?=[^,]*\d).*$/i, "");
  unit = unit.replace(/,.*$/, "").replace(/^in\s+/i, "");
  unit = unit.replace(/^monthly\s+(.+)$/i, "$1 a month").replace(/^annual\s+(.+)$/i, "$1 a year");
  const phrase = unit ? `${item.value} ${unit}` : item.value;
  return /^(suggested|typical)/i.test(item.label) ? `Typically ${phrase.charAt(0).toLowerCase()}${phrase.slice(1)}` : phrase;
}

/** What the card shows under "To join": the rule, "Not public", or "Not listed" before research. */
export function joinLabel(slug: string): { value: string } {
  const facts = networkFacts(slug);
  if (!facts) return { value: "Not listed" };
  const rule = facts.joinSummary ?? trafficRule(facts);
  if (rule) return { value: rule };
  const first = joiningNumbers(facts)[0];
  return { value: first ? joinPhrase(first) : NOT_PUBLIC };
}

/**
 * The rule a network publishes for joining, as a phrase for the header lede, such as
 * `50,000 sessions a month` or `$5,000 ad revenue a year`. Null when it publishes none.
 */
export function joinRule(slug: string): string | null {
  const facts = networkFacts(slug);
  if (!facts) return null;
  const rule = facts.joinSummary ?? trafficRule(facts);
  if (rule) return rule;
  const first = joiningNumbers(facts)[0];
  return first ? joinPhrase(first) : null;
}

/** A short entry summary that also supports program notes and sales-led applications. */
export function joinSentence(rule: string) {
  if (rule === "No traffic minimum") return "It publishes no traffic minimum; each site is reviewed.";
  return `Joining: ${rule.replace(/[.!?]+$/, "")}.`;
}

/** Monthly traffic needed, for ordering by how easy a network is to join. Unknown sorts last. */
export function joinOrder(slug: string) {
  return networkFacts(slug)?.minTraffic?.amount ?? null;
}
