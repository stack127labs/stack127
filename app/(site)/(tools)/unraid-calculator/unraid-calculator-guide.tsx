import { proseClassName, proseFlowClassName } from "../../../prose";
import styles from "./unraid-calculator.module.css";

export function UnraidCalculatorGuide() {
  return (
    <article className={`${styles.guide} ${proseClassName} ${proseFlowClassName}`}>
      <h2>Read the headline as array-level data capacity, not filesystem free space</h2>
      <p>
        The headline is a planning envelope from the current data roles you entered. It sums
        those data drives and keeps parity and raw installed capacity visible in the accounting
        below; TB or TiB changes display units, not the underlying bytes. It does not estimate
        filesystem-visible free space.
      </p>

      <h3>Protection modes</h3>
      <div className={styles.guideTableScroll} tabIndex={0}>
        <table className={styles.guideTable}>
          <thead>
            <tr>
              <th scope="col">Mode</th>
              <th scope="col">Failure boundary</th>
              <th scope="col">Capacity rule</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">No parity</th>
              <td>No modeled drive-failure protection</td>
              <td>Data roles stay visible without a parity ceiling</td>
            </tr>
            <tr>
              <th scope="row">Single parity</th>
              <td>One drive under this model</td>
              <td>Parity must meet the largest data drive</td>
            </tr>
            <tr>
              <th scope="row">Dual parity</th>
              <td>Two drives under this model</td>
              <td>Both parity roles must meet the largest data drive</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>Verify a planned disk change in the official Unraid docs</h2>
      <p>
        A blocked future drive is above the current parity ceiling, so this page names the
        undersized parity roles but does not perform a parity swap or rebuild. Check the official{" "}
        <a href="https://docs.unraid.net/unraid-os/using-unraid-to/manage-storage/array/adding-disks-to-array/">
          Unraid adding-disks guide
        </a>{" "}
        and{" "}
        <a href="https://docs.unraid.net/unraid-os/using-unraid-to/manage-storage/array/replacing-disks-in-array/">
          replacing-disks guide
        </a>{" "}
        before making an operational change; for another storage model, use the{" "}
        <a href="/raid-calculator">RAID capacity calculator</a>,{" "}
        <a href="/zfs-capacity-calculator">ZFS capacity calculator</a>, or{" "}
        <a href="/raidz-expansion-planner">RAIDZ expansion planner</a>.
      </p>

      <h2>The model leaves filesystem and operational space unknown</h2>
      <p>
        This array-level model excludes filesystem metadata, partition alignment, system and swap
        reservations, cache pools, share allocation, free-space policies, snapshots, application
        behavior, and performance. Parity is redundancy for the documented failure boundary, but
        parity is not a backup, and the result does not prove what an installed system will report.
      </p>

      <h2>Your drive list stays in the browser</h2>
      <p>
        Local calculation is synchronous: entering roles and calculating does not send a
        request or write the drive list to browser storage. Sharing is explicit, and a share URL
        contains the normalized capacities and roles, so anyone with that link can read the
        configuration.
      </p>
    </article>
  );
}
