import type { ComponentPropsWithoutRef } from "react";
import { NewTabContentLink } from "@/app/ui/content-elements";
import { proseClassName, proseFlowClassName } from "@/app/ui/site/prose";
import Corrections from "./content/corrections.mdx";
import FreeListings from "./content/free-listings.mdx";
import HowWeCheck from "./content/how-we-check.mdx";
import LaunchTiming from "./content/launch-timing.mdx";
import LinkTypes from "./content/link-types.mdx";
import RecommendedOrder from "./content/recommended-order.mdx";
import styles from "./launch-directories.module.css";

// The results header links to these two headings, so each file's h2 keeps a fixed id.
function headingWithId(id: string) {
  return function Heading(props: ComponentPropsWithoutRef<"h2">) {
    return <h2 {...props} id={id} />;
  };
}

// Source links open in a new tab, so visitors keep their filtered list.
const a = NewTabContentLink;

export function LaunchDirectoryGuide() {
  return <section aria-labelledby="how-we-check" className={`${proseClassName} ${proseFlowClassName} ${styles.guide}`}>
    <HowWeCheck components={{ a, h2: headingWithId("how-we-check") }} />
    <RecommendedOrder components={{ a, h2: headingWithId("recommended-order") }} />
    <LinkTypes components={{ a }} />
    <FreeListings components={{ a }} />
    <LaunchTiming components={{ a }} />
    <Corrections components={{ a }} />
  </section>;
}
