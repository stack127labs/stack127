import { proseClassName, proseFlowClassName } from "../../../prose";
import styles from "./raidz-expansion-planner.module.css";

export function RaidzExpansionGuide() {
  return (
    <article className={`${styles.guide} ${proseClassName} ${proseFlowClassName}`}>
      <h2>Get the inputs from the vdev you are widening</h2>
      <p>
        Use the values for one RAIDZ vdev, not totals for the whole pool. The exact output depends
        on the physical space already allocated and on the block geometry you choose to represent
        the workload.
      </p>
      <div className={styles.guideTableScroll} tabIndex={0}>
        <table className={styles.guideTable}>
          <thead>
            <tr>
              <th>Input</th>
              <th>What to use</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Current physical allocation</td>
              <td>
                Run <code>zpool list -vp -o name,alloc</code> and use the exact <code>ALLOC</code>
                {" "}value for the RAIDZ vdev you plan to widen.
              </td>
            </tr>
            <tr>
              <td>Member sizes</td>
              <td>
                Use the smallest existing member and the size of each planned added disk. Capacity
                above the smallest member stays outside this model.
              </td>
            </tr>
            <tr>
              <td>Representative block size</td>
              <td>
                Use <code>recordsize</code> for a filesystem or <code>volblocksize</code> for a zvol.
                Choose a size that represents the data you care about.
              </td>
            </tr>
            <tr>
              <td><code>ashift</code></td>
              <td>
                Use the existing vdev&apos;s allocation sector shift. For example,
                <code> ashift=12</code> means 4 KiB sectors.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>Why immediate capacity can be lower than a fresh vdev</h2>
      <p>
        RAIDZ expansion reflows allocated data across the wider device set, but it does not
        logically rewrite old blocks. Those blocks keep their original data-to-parity geometry,
        while blocks written after expansion use the wider geometry. A later rewrite can give data
        new block geometry, but OpenZFS warns that reported capacity can still remain pessimistic.
      </p>
      <p>
        <strong>Current</strong> is the modeled envelope at the starting width.
        <strong> Immediate</strong> keeps old logical payload and uses the wider geometry for free
        physical space. <strong>Fresh</strong> models the whole final envelope at the final width.
        The <strong>geometry gap</strong> is the difference between fresh and immediate, not a
        prediction of <code>zfs list</code> or <code>df</code>.
      </p>

      <h2>Check the pool before you widen the vdev</h2>
      <p>
        The result is a capacity plan, not a safety decision. Verify the real pool and your
        platform before attaching a disk.
      </p>
      <div className={styles.guideTableScroll} tabIndex={0}>
        <table className={styles.guideTable}>
          <thead>
            <tr>
              <th>Check</th>
              <th>Why it matters</th>
              <th>Source</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Supported release</td>
              <td>RAIDZ Expansion arrived in OpenZFS 2.3. Your platform may expose it later.</td>
              <td><a href="https://github.com/openzfs/zfs/releases/tag/zfs-2.3.0">2.3.0 release</a></td>
            </tr>
            <tr>
              <td>Feature available</td>
              <td>Confirm the <code>org.openzfs:raidz_expansion</code> feature is supported.</td>
              <td><a href="https://openzfs.github.io/openzfs-docs/man/master/7/zpool-features.7.html">Feature reference</a></td>
            </tr>
            <tr>
              <td>Healthy vdev</td>
              <td>The target RAIDZ vdev must be healthy before expansion starts.</td>
              <td><a href="https://openzfs.github.io/openzfs-docs/man/master/8/zpool-attach.8.html">Attach reference</a></td>
            </tr>
            <tr>
              <td>Current backup</td>
              <td>Capacity math cannot verify your recovery path or hardware condition.</td>
              <td>Operational check</td>
            </tr>
            <tr>
              <td>Added disk size</td>
              <td>The new disk must be at least as large as the smallest existing member.</td>
              <td><a href="https://openzfs.github.io/openzfs-docs/man/master/8/zpool-attach.8.html">Attach reference</a></td>
            </tr>
            <tr>
              <td>Operation and parity</td>
              <td>Each attach adds one disk. RAIDZ1, RAIDZ2, or RAIDZ3 does not change.</td>
              <td><a href="https://openzfs.github.io/openzfs-docs/Basic%20Concepts/Pool%20Structure/Changing%20Pool%20Layout.html">Layout guide</a></td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>What this model does not know</h2>
      <p>
        Version 1 assumes one current RAIDZ vdev that has never been expanded, followed by
        one-disk steps with no writes, deletes, or rewrites between them. It uses one representative
        block size. Real pools contain many block sizes, metadata, slop, fragmentation,
        compression, snapshots, and allocation history.
      </p>
      <p>
        The planner does not inspect your system or predict live reporting, performance, duration,
        or failure risk. Calculation stays in this browser and does not store or send the inputs.
        Share deliberately puts the normalized configuration in the URL and copies that link. Use
        the <a href="/zfs-capacity-calculator">ZFS pool capacity calculator</a> for a fresh whole-pool
        plan, or <a href="/zfs-padding-calculator">check RAIDZ padding and block geometry</a> for one
        allocation.
      </p>
    </article>
  );
}
