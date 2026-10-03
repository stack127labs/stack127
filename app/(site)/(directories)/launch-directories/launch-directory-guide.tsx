import type { ReactNode } from "react";
import { UiDataTable } from "@/app/ui/display";
import { proseClassName, proseFlowClassName } from "@/app/ui/site/prose";
import { correctionEmail } from "./launch-directory-options";
import styles from "./launch-directories.module.css";

type MeaningRow = { id: string; label: string; meaning: ReactNode };

const googleLinkGuide = "https://developers.google.com/search/docs/crawling-indexing/qualify-outbound-links";

// Results from a sampled listing's HTML or from the site's own terms.
const linkTypes: MeaningRow[] = [
  { id: "dofollow", label: "Dofollow", meaning: "The sampled link had no nofollow, ugc, or sponsored value, or the site's terms promise that. There's no dofollow HTML attribute, and it doesn't promise indexing, ranking, or traffic." },
  { id: "nofollow", label: "Nofollow", meaning: <>The link asks search engines not to follow it. It doesn&apos;t stop them finding your site through other links. See <a href={googleLinkGuide} rel="noopener noreferrer" target="_blank">Google&apos;s definition</a>.</> },
  { id: "ugc", label: "UGC", meaning: "The link is marked as user-generated content." },
  { id: "sponsored", label: "Sponsored", meaning: "The link is marked as paid." },
  { id: "multiple", label: "More than one type", meaning: "The sampled link carried more than one value, such as ugc and nofollow together. The card names them." },
  { id: "varies", label: "Varies by plan or listing", meaning: "Free, paid, or top-ranked listings get different links. The card says which." },
  { id: "none", label: "No maker website link", meaning: "The sampled listing doesn't link to the maker's own site." },
];

// No confirmed result. Keep these apart from the sampled findings above.
const unconfirmedLinkTypes: MeaningRow[] = [
  { id: "estimated-nofollow", label: "Likely nofollow", meaning: "An estimate, not a checked result. We couldn't read a sampled link, but other evidence points to nofollow. Treat it as unconfirmed." },
  { id: "unknown", label: "Couldn't verify", meaning: "We couldn't open a published listing or read its link. The link type is unknown." },
];

const missingLabels: MeaningRow[] = [
  { id: "not-stated", label: "Not stated on their site", meaning: "The site's own pages don't publish this detail." },
  { id: "unverified", label: "Couldn't verify", meaning: "A page was blocked, needed a login, or didn't load. It doesn't mean the site has closed." },
  { id: "conflicting", label: "Conflicting info", meaning: "Two of the site's own pages disagree. The card's sources link both." },
  { id: "unavailable", label: "Submission page unavailable", meaning: "We found a submission page, but it didn't load when we checked." },
  { id: "not-found", label: "Submission page not found", meaning: "We couldn't find where submissions start. Check the site itself before you give up on it." },
];

function MeaningTable({ ariaLabel, rows }: { ariaLabel: string; rows: MeaningRow[] }) {
  return <UiDataTable
    ariaLabel={ariaLabel}
    columns={[{ id: "label", label: "Label" }, { id: "meaning", label: "What it means" }]}
    rows={rows.map((row) => ({ id: row.id, cells: { label: row.label, meaning: row.meaning } }))}
  />;
}

export function LaunchDirectoryGuide() {
  return <section aria-labelledby="how-we-check" className={`${proseClassName} ${proseFlowClassName} ${styles.guide}`}>
    <h2 id="how-we-check">How we check each listing</h2>
    <p>
      For each site, we look for its official submission page, pricing, and rules, and use the ones that load. When we can open a
      published listing, we check the link it gives the maker&apos;s site. Some sites blocked us, needed a login, or had no listing we
      could open. Those details stay marked Couldn&apos;t verify or Not stated on their site. We don&apos;t guess them.
    </p>
    <p>
      Open Sources on a card to see each page we used. A source shows its own check date when we have one. The record date is the
      last time we checked anything on the card, so some sources can be older.
    </p>
    <p>Prices, review times, and link rules change. Check the site&apos;s own page before you pay.</p>

    <h3>What do the link types mean?</h3>
    <MeaningTable ariaLabel="Link types" rows={linkTypes} />
    <p>A link result only covers the named sample listing, or the plan the site&apos;s terms describe. Free and paid listings can differ.</p>
    <p>Two labels mean we have no confirmed link result:</p>
    <MeaningTable ariaLabel="Unconfirmed link types" rows={unconfirmedLinkTypes} />

    <h3>What do the missing-detail labels mean?</h3>
    <MeaningTable ariaLabel="Missing-detail labels" rows={missingLabels} />

    <h3>How are app stores different?</h3>
    <p>
      App stores and integration catalogs list software built for their platform, such as a Chrome extension or a Shopify app.
      You register as a developer, accept the platform&apos;s terms, and pass its review. They aren&apos;t a form for an ordinary website.
    </p>

    <h3>Found something wrong?</h3>
    <p>
      Email <a href={`mailto:${correctionEmail}`}>{correctionEmail}</a> with the site name and the page that shows the right answer.
      Each card&apos;s sources list also has a correction link.
    </p>
  </section>;
}
