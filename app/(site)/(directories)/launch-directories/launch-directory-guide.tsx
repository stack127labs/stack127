import { DirectoryPageContent } from "@/app/ui/directories/directory-page-content";
import type { Stack127DirectoryPage } from "@/lib/directory-pages";
import type { ReactNode } from "react";
import type { Components } from "react-markdown";
import { UiDataTable } from "@/app/ui/display";
import { proseClassName, proseFlowClassName } from "@/app/ui/site/prose";
import styles from "./launch-directories.module.css";

type MeaningRow = { id: string; label: string; meaning: ReactNode };

const googleLinkGuide = "https://developers.google.com/search/docs/crawling-indexing/qualify-outbound-links";

// Results from a sampled listing's HTML or from the site's own terms.
const linkTypes: MeaningRow[] = [
  { id: "dofollow", label: "Dofollow", meaning: "The sampled link had no nofollow, ugc, or sponsored value, or the site's terms promise that. There's no dofollow HTML attribute, and it doesn't promise indexing, ranking, or traffic." },
  { id: "nofollow", label: "Nofollow", meaning: <>The link asks search engines not to follow it. It doesn&apos;t stop them finding your site through other links. See <a href={googleLinkGuide} rel="noopener noreferrer" target="_blank">Google&apos;s definition</a>.</> },
  { id: "ugc", label: "UGC", meaning: "The link is marked as user-generated content." },
  { id: "sponsored", label: "Sponsored", meaning: "The link is marked as paid." },
  { id: "multiple", label: "Mixed", meaning: "The sampled link carried more than one value, such as ugc and nofollow together. The details name them." },
  { id: "varies", label: "Varies", meaning: "Free, paid, or top-ranked listings get different links. The details say which." },
  { id: "none", label: "No link", meaning: "The sampled listing doesn't link to the maker's own site." },
];

// No confirmed result. Keep these apart from the sampled findings above.
const unconfirmedLinkTypes: MeaningRow[] = [
  { id: "estimated-nofollow", label: "Likely nofollow", meaning: "An estimate, not a checked result. We couldn't read a sampled link, but other evidence points to nofollow. Treat it as unconfirmed." },
  { id: "unknown", label: "Couldn't verify", meaning: "We couldn't open a published listing or read its link. The link type is unknown." },
];

const missingLabels: MeaningRow[] = [
  { id: "not-stated", label: "Not stated on their site", meaning: "The site's own pages don't publish this detail." },
  { id: "unverified", label: "Couldn't verify", meaning: "A page was blocked, needed a login, or didn't load. It doesn't mean the site has closed." },
  { id: "conflicting", label: "Conflicting info", meaning: "Two of the site's own pages disagree. The sources in the details link both." },
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

const guideHeadingComponents: Components = {
  h2: ({ children }) => <h2 id="how-we-check">{children}</h2>,
  h3: ({ children }) => <h3 id={typeof children === "string" && children.includes("recommended order") ? "recommended-order" : undefined}>{children}</h3>,
};

export function LaunchDirectoryGuide({ directoryPage }: { directoryPage: Stack127DirectoryPage }) {
  return <section aria-labelledby="how-we-check" className={`${proseClassName} ${proseFlowClassName} ${styles.guide}`}>
    <DirectoryPageContent page={directoryPage} section="guide-1" components={guideHeadingComponents} />
    <MeaningTable ariaLabel="Link types" rows={linkTypes} />
    <DirectoryPageContent page={directoryPage} section="guide-2" />
    <MeaningTable ariaLabel="Unconfirmed link types" rows={unconfirmedLinkTypes} />

    <DirectoryPageContent page={directoryPage} section="guide-3" />
    <MeaningTable ariaLabel="Missing-detail labels" rows={missingLabels} />

    <DirectoryPageContent page={directoryPage} section="guide-4" />
  </section>;
}
