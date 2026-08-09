import { proseClassName, proseFlowClassName } from "../../../prose";
import styles from "./zfs-padding-calculator.module.css";

export function ZfsPaddingGuide() {
  return (
    <article className={`${styles.guide} ${proseClassName} ${proseFlowClassName}`}>
      <h2>What each option changes</h2>
      <p>
        The calculator needs five details about the block and the RAIDZ vdev that will store it.
      </p>
      <div className={styles.guideTableScroll} tabIndex={0}>
        <table className={styles.guideTable}>
          <thead>
            <tr>
              <th>Option</th>
              <th>What it means</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>RAIDZ level</td>
              <td>RAIDZ1, RAIDZ2, or RAIDZ3. The number tells you how many parity sectors each stripe row needs.</td>
            </tr>
            <tr>
              <td>Vdev width</td>
              <td>The total number of drives in this RAIDZ vdev.</td>
            </tr>
            <tr>
              <td>Workload</td>
              <td>Choose a filesystem dataset or a zvol. This decides whether the block setting is called <code>recordsize</code> or <code>volblocksize</code>.</td>
            </tr>
            <tr>
              <td>Block size</td>
              <td>The logical size of the one block being tested.</td>
            </tr>
            <tr>
              <td><code>ashift</code></td>
              <td>The physical sector size ZFS uses for allocation. For example, <code>ashift=12</code> means 4 KiB sectors.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2><code>recordsize</code> and <code>volblocksize</code> describe different blocks</h2>
      <p>
        <code>recordsize</code> is the largest block ZFS normally uses for file data in a dataset.
        A small file or the end of a file can use a smaller block. <code>volblocksize</code> is the
        block size used by a zvol. The calculator changes the name and valid range when you switch
        between these workloads.
      </p>

      <h2>Why an 8 KiB block can occupy 24 KiB</h2>
      <p>
        Consider a six-drive RAIDZ2 vdev with <code>ashift=12</code>. Each sector is 4 KiB, so an
        8 KiB logical block starts as two data sectors. RAIDZ2 adds two parity sectors, then ZFS
        adds two padding sectors to complete the allocation.
      </p>
      <div className={styles.guideTableScroll} tabIndex={0}>
        <table className={styles.guideTable}>
          <thead>
            <tr>
              <th>Part</th>
              <th>Sectors</th>
              <th>Space</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Logical data</td><td>2</td><td>8 KiB</td></tr>
            <tr><td>Sector rounding</td><td>0</td><td>0 B</td></tr>
            <tr><td>Parity</td><td>2</td><td>8 KiB</td></tr>
            <tr><td>Padding</td><td>2</td><td>8 KiB</td></tr>
            <tr><td>Physical allocation</td><td>6</td><td>24 KiB</td></tr>
          </tbody>
        </table>
      </div>

      <h2>Space efficiency is not a performance recommendation</h2>
      <p>
        A block size can use space efficiently in this calculation and still be a poor fit for
        your workload. Block size also affects reads, writes, compression opportunities, and how
        an application accesses data. Use the result to understand allocation, not as a universal
        setting for every system.
      </p>

      <h2>What this calculator leaves out</h2>
      <p>
        This is a theoretical calculation for one uncompressed block on one RAIDZ vdev. It does
        not calculate:
      </p>
      <ul>
        <li>Compression, deduplication, or extra copies.</li>
        <li>Metadata, snapshots, reservations, slop space, or fragmentation.</li>
        <li>Special vdevs, dRAID, gang blocks, or expansion history.</li>
        <li>Whole-pool capacity, real free space, or storage performance.</li>
      </ul>

      <h2>Your calculation stays in your browser</h2>
      <p>
        Typing values and calculating do not send your configuration to a server. Copy and share
        actions use the result only when you choose them. A shared link includes the configuration
        in its URL.
      </p>

      <h2>Need whole-pool capacity?</h2>
      <p>
        Use the <a href="/zfs-capacity-calculator">ZFS pool capacity calculator</a> to
        combine top-level vdevs and estimate writable space, redundancy, slop, and planning
        headroom.
      </p>
    </article>
  );
}
