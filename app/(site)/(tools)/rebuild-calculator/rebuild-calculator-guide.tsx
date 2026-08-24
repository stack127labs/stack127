import Link from "next/link";
import { proseClassName, proseSectionFlowClassName } from "../../../prose";
import styles from "./rebuild-calculator.module.css";

const sourceRows = [
  ["RAID 1 and RAID 10", "1 source member", "0"],
  ["RAID 5", "N - 1 source members", "0"],
  ["RAID 6", "N - 2 minimum", "1"],
] as const;

export function RebuildCalculatorGuide() {
  return (
    <article className={`${styles.guide} ${proseClassName} ${proseSectionFlowClassName}`}>
      <section>
        <h2>Choose inputs that match the rebuild</h2>
        <p>
          Use the capacity printed for one member and keep the decimal unit that matches it. Rebuild throughput is effective end-to-end speed, not the interface speed on a drive box. For the read-error input, use the nonrecoverable read-error specification from a drive datasheet such as the <a href="https://www.seagate.com/www-content/product-content/ironwolf/en-us/docs/100818527d.pdf" rel="noreferrer" target="_blank">Seagate IronWolf manual</a>.
        </p>
        <p>
          Full member is the default read scope for a generic rebuild. Choose a smaller scope only when your implementation really reads a smaller populated portion. The page cannot infer that behavior from the RAID level alone.
        </p>
      </section>

      <section>
        <h2>Why layouts read different amounts</h2>
        <p>
          The model estimates the source members needed to reconstruct one failed member. It keeps that topology visible instead of hiding it inside a risk label.
        </p>
        <div className={styles.guideTableWrap} tabIndex={0} aria-label="RAID source-read rules">
          <table className={styles.guideTable}>
            <thead>
              <tr>
                <th scope="col">Layout</th>
                <th scope="col">Modeled source read</th>
                <th scope="col">Additional read errors</th>
              </tr>
            </thead>
            <tbody>
              {sourceRows.map(([layout, source, tolerance]) => (
                <tr key={layout}>
                  <th scope="row">{layout}</th>
                  <td data-label="Modeled source read">{source}</td>
                  <td data-label="Additional read errors">{tolerance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          RAID 6 uses a minimum reconstruction-read model of N - 2 full-member equivalents. A real implementation may read more. The <a href="https://cdrdv2-public.intel.com/840787/SWUG_full_featured_entry_RAID.pdf" rel="noreferrer" target="_blank">Intel RAID guide</a> and the <a href="https://www.fujitsu.com/us/imagesgig5/Storage-RAID-Fast-Recovery-whitepaper.pdf" rel="noreferrer" target="_blank">Fujitsu RAID whitepaper</a> explain why parity and mirror rebuilds do not have the same read pattern.
        </p>
      </section>

      <section>
        <h2>Read the result as exposure, not a verdict</h2>
        <p>
          The total degraded window adds replacement delay to copy time. Source media read is the work used for the time estimate, while modeled read-error exposure is the chance of at least one specified read error in that work.
        </p>
        <p>
          The percentage uses a simple independent per-bit model. Read-error tolerance is a separate parity margin. Neither value is data-loss probability, rebuild-success probability, or a guarantee about a controller.
        </p>
      </section>

      <section>
        <h2>What this model leaves out</h2>
        <p>
          This page models one failed member and one rebuild. It does not model a second failure arriving during the window, AFR, MTTDL, fleet correlation, filesystem behavior, controller scheduling, mixed drive sizes, or a drive recommendation.
        </p>
      </section>

      <section>
        <h2>Verify the live rebuild next</h2>
        <p>
          Compare the entered throughput and read scope with the controller or filesystem status while the array is degraded. The <a href="https://www.intel.com/content/www/us/en/support/articles/000024286/server-products/server-boards.html" rel="noreferrer" target="_blank">Intel degraded-array guidance</a> is a useful starting point. This calculation runs only in this browser. Inputs are not stored or put in the URL. For adjacent planning, use the <Link href="/raid-calculator">RAID capacity calculator</Link> or the <Link href="/zfs-capacity-calculator">ZFS capacity calculator</Link>.
        </p>
      </section>
    </article>
  );
}
