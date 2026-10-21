import type { ReactNode } from "react";
import { RankedBars, StackBar } from "@/app/ui/ad-networks/viz/bars";
import { ColumnChart } from "@/app/ui/ad-networks/viz/columns";
import type { LaunchDirectory } from "@/lib/launch-directories";
import { launchDirectoryHasFreeOption } from "@/lib/launch-directories-query";
import { AhrefsCredit } from "./ahrefs-credit";
import { linkOptions } from "./launch-directory-options";
import styles from "./launch-directories.module.css";

const percent = (part: number, whole: number) => `${Math.round((part / Math.max(1, whole)) * 100)}%`;

function Block({ children, description, title }: { children: ReactNode; description: ReactNode; title: string }) {
  return <div className={styles.glanceBlock}>
    <h3>{title}</h3>
    <p>{description}</p>
    {children}
  </div>;
}

/**
 * Four small pictures of the whole list, from the same records as the cards. A block with no data
 * yet stays hidden instead of showing an empty chart.
 */
export function LaunchGlance({ directories }: { directories: LaunchDirectory[] }) {
  const total = directories.length;
  const count = (test: (directory: LaunchDirectory) => boolean) => directories.filter(test).length;

  const free = count((directory) => directory.cost_kind === "free");
  const mixed = count((directory) => directory.cost_kind === "free_and_paid");
  const paid = count((directory) => directory.cost_kind === "paid");
  const unknownCost = total - free - mixed - paid;

  const linkRows = linkOptions
    .filter((option) => option.value !== "unknown")
    .map((option) => ({ label: option.label, value: count((directory) => directory.link_type_kind === option.value) }))
    .filter((row) => row.value > 0)
    .sort((left, right) => right.value - left.value);
  const unknownLinks = count((directory) => directory.link_type_kind === "unknown");

  const rated = directories.filter((directory) => directory.domain_rating !== null);
  const drColumns = Array.from({ length: 10 }, (_, step) => ({
    label: step === 9 ? "90+" : `${step * 10}`,
    value: rated.filter((directory) => Math.min(9, Math.floor((directory.domain_rating ?? 0) / 10)) === step).length,
  }));

  const prices = directories
    .filter((directory) => !launchDirectoryHasFreeOption(directory) && directory.lowest_paid_price_usd !== null)
    .map((directory) => directory.lowest_paid_price_usd ?? 0);
  const priceColumns = [
    { label: "under $10", test: (price: number) => price < 10 },
    { label: "$10–49", test: (price: number) => price >= 10 && price < 50 },
    { label: "$50–99", test: (price: number) => price >= 50 && price < 100 },
    { label: "$100–299", test: (price: number) => price >= 100 && price < 300 },
    { label: "$300+", test: (price: number) => price >= 300 },
  ].map(({ label, test }) => ({ label, value: prices.filter(test).length }));

  return <section aria-labelledby="at-a-glance" className={styles.glance}>
    <h2 id="at-a-glance">At a glance</h2>
    <div className={styles.glanceGrid}>
      <Block description={`How ${total} places charge for a basic listing.`} title="What it costs to get listed">
        <StackBar parts={[
          { label: "Free", value: free, tone: "ac", display: percent(free, total) },
          { label: "Free and paid", value: mixed, tone: "ac3", display: percent(mixed, total) },
          { label: "Paid only", value: paid, tone: "n1", display: percent(paid, total) },
          { label: "Not stated", value: unknownCost, tone: "track", display: percent(unknownCost, total) },
        ]} />
      </Block>
      <Block description={unknownLinks ? `From one live listing on each site. ${unknownLinks} we couldn't verify.` : "From one live listing on each site."} title="What link you get">
        <RankedBars ariaLabel="Places by link type" rows={linkRows} />
      </Block>
      {rated.length >= 10 ? <Block description={<>{rated.length} places, in steps of 10. <AhrefsCredit /></>} title="How strong the sites are">
        <ColumnChart caption="Places by domain rating" height={150} items={drColumns} />
      </Block> : null}
      {prices.length >= 5 ? <Block description={`The cheapest way in for ${prices.length} paid-only places.`} title="What paid listings cost">
        <ColumnChart caption="Paid-only places by lowest price" height={150} items={priceColumns} />
      </Block> : null}
    </div>
  </section>;
}
