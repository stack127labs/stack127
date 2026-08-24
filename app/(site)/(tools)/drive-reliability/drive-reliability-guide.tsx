import Link from "next/link";
import { proseClassName, proseSectionFlowClassName } from "../../../prose";
import styles from "./drive-reliability.module.css";

export function DriveReliabilityGuide() {
  return (
    <article className={`${styles.guide} ${proseClassName} ${proseSectionFlowClassName}`}>
      <section>
        <h2>Choose a period that matches the question</h2>
        <p>
          Quarterly, annual, and lifetime are separate Backblaze source periods. Keep a comparison
          inside one period, then use the exact model and capacity filters that match the drives you
          are considering. The source has different inclusion thresholds for each period, so a
          missing model result is better treated as no data than filled with a value from another scope.
        </p>
        <p>
          Rows below the source threshold stay out of the normal result set. Turn on <strong>Show
          small cohorts</strong> only when you want to inspect one, and read its <strong>Thin cohort</strong>
          label as a warning that one failure can move the point rate sharply.
        </p>
      </section>

      <section>
        <h2>AFR uses drive days, not drive count</h2>
        <p>
          The explorer calculates annualized failure rate as <code>failures / (drive days / 365) × 100</code>.
          Drive days are the exposure, so two models with the same drive count can still have different
          evidence when their observation time differs.
        </p>
        <p>
          The point rate is paired with an approximate 95% evidence range based on the same failures
          and exposure. Zero observed failures makes the point rate <code>0.00%</code>, but it does not
          prove that another drive will not fail. Treat the range, failures, and drive days as one answer.
        </p>
      </section>

      <section>
        <h2>Treat fleet evidence as one input, then verify your own drive</h2>
        <p>
          Backblaze reports an operational data-center cohort with its own workload, age mix, and
          observation period. This page does not inspect SMART history, firmware, workload, warranty
          terms, or your NAS topology, and its fleet result is not a personal failure forecast.
        </p>
        <p>
          Filtering and selection use the bundled snapshot locally in this browser, with no network
          request during exploration. Share state puts only bounded filters and selected model IDs in
          the URL. Before acting on a result, check the drive's current SMART history and firmware,
          confirm the warranty or return path, and keep a tested backup. Continue with the
          <Link href="/storage-tools" prefetch={false}> storage tools</Link> or the
          <Link href="/zfs-capacity-calculator" prefetch={false}> ZFS pool capacity calculator</Link> when the next
          question is pool planning. The
          <a
            href="https://www.backblaze.com/cloud-storage/resources/hard-drive-test-data"
            rel="noreferrer"
            target="_blank"
          >
            official Backblaze Drive Stats data page
          </a>{" "}
          is the source for the published cohort data.
        </p>
      </section>
    </article>
  );
}
