import type { ComponentPropsWithoutRef } from "react";
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

export function LaunchDirectoryGuide() {
  return <div className={`${proseClassName} ${proseFlowClassName} ${styles.guide}`}>
    <HowWeCheck components={{ h2: headingWithId("how-we-check") }} />
    <RecommendedOrder components={{ h2: headingWithId("recommended-order") }} />
    <LinkTypes />
    <FreeListings />
    <LaunchTiming />
    <Corrections />
  </div>;
}
