import { ArrowRight, Columns3 } from "lucide-react";
import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";
import { NewTabContentLink } from "@/app/ui/content-elements";
import { proseClassName, proseFlowClassName } from "@/app/ui/site/prose";
import Corrections from "./content/corrections.mdx";
import FreeListings from "./content/free-listings.mdx";
import HowWeCheck from "./content/how-we-check.mdx";
import LaunchKit from "./content/launch-kit.mdx";
import LaunchTiming from "./content/launch-timing.mdx";
import LinkTypes from "./content/link-types.mdx";
import RecommendedOrder from "./content/recommended-order.mdx";
import styles from "./launch-directories.module.css";

// Other pages link to these headings, so each file's h2 keeps a fixed id.
function headingWithId(id: string) {
  return function Heading(props: ComponentPropsWithoutRef<"h2">) {
    return <h2 {...props} id={id} />;
  };
}

// Source links open in a new tab, so visitors keep their filtered list.
const a = NewTabContentLink;

/** Product Hunt's published sizes, which most other places accept. */
const kit = [
  { name: "Square logo", spec: "240 × 240", note: "PNG or SVG", shape: "square" },
  { name: "Screenshots", spec: "1270 × 760", note: "3 to 5", shape: "wide" },
  { name: "Social image", spec: "1200 × 630", note: "For link previews", shape: "social" },
  { name: "Tagline", spec: "60 characters", note: "What it does", shape: "line" },
  { name: "Description", spec: "260 characters", note: "Who it's for", shape: "lines" },
] as const;

export function CompareCallout() {
  return <Link className={styles.callout} href="/launch-directories/compare" prefetch={false}>
    <span aria-hidden="true" className={styles.calloutIcon}><Columns3 size={20} strokeWidth={2} /></span>
    <span>
      <b>Compare up to three places</b>
      <span>Cost, review time, link type, and domain rating side by side.</span>
    </span>
    <ArrowRight aria-hidden="true" className={styles.calloutArrow} size={18} strokeWidth={2.2} />
  </Link>;
}

export function LaunchDirectoryGuide() {
  return <div className={styles.guide}>
    <section aria-labelledby="launch-kit" className={styles.kitSection}>
      <div className={`${proseClassName} ${proseFlowClassName}`}>
        <LaunchKit components={{ a, h2: headingWithId("launch-kit") }} />
      </div>
      <ul className={styles.kit}>
        {kit.map((item) => <li key={item.name}>
          <span aria-hidden="true" className={styles.kitFrame} data-shape={item.shape}>
            {item.shape === "line" || item.shape === "lines" ? <><i /><i /><i /></> : null}
          </span>
          <b>{item.name}</b>
          <span>{item.spec} · {item.note}</span>
        </li>)}
      </ul>
    </section>
    <section aria-labelledby="how-we-check" className={`${proseClassName} ${proseFlowClassName}`}>
      <HowWeCheck components={{ a, h2: headingWithId("how-we-check") }} />
      <LinkTypes components={{ a, h2: headingWithId("link-types") }} />
      <FreeListings components={{ a }} />
      <LaunchTiming components={{ a }} />
      <RecommendedOrder components={{ a, h2: headingWithId("recommended-order") }} />
      <Corrections components={{ a }} />
    </section>
  </div>;
}
