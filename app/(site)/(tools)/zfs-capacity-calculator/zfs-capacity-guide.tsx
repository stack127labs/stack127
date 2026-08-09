import { proseClassName, proseFlowClassName } from "../../../prose";
import styles from "./zfs-capacity-calculator.module.css";

export function ZfsCapacityGuide() {
  return (
    <article className={`${styles.guide} ${proseClassName} ${proseFlowClassName}`}>
      <h2>Each vdev is its own failure boundary</h2>
      <p>
        A ZFS pool can combine several top-level vdevs, but each vdev keeps its own capacity and
        redundancy rules. A six-drive RAIDZ2 and a two-drive mirror should not be flattened into
        one generic disk group. The calculator models them separately, then adds their data
        contributions. Losing a complete top-level vdev can still lose the pool. Read the official
        <a href="https://openzfs.github.io/openzfs-docs/Basic%20Concepts/Pool%20Structure/VDEVs.html"> OpenZFS vdev overview</a>
        before choosing a production topology.
      </p>
      <div className={styles.guideTableScroll} tabIndex={0}>
        <table className={styles.guideTable}>
          <thead><tr><th>Layout</th><th>Minimum drives</th><th>Per-vdev tolerance</th></tr></thead>
          <tbody>
            <tr><td>Mirror</td><td>2</td><td>Any members except the last copy</td></tr>
            <tr><td>RAIDZ1</td><td>2</td><td>1 drive</td></tr>
            <tr><td>RAIDZ2</td><td>3</td><td>2 drives</td></tr>
            <tr><td>RAIDZ3</td><td>4</td><td>3 drives</td></tr>
          </tbody>
        </table>
      </div>

      <h2>What the estimate includes</h2>
      <p>
        Every capacity is converted to exact bytes. The result shows mixed-size waste, mirror or
        parity cost, block allocation losses, OpenZFS slop, estimated writable capacity, and your
        separate planning target. Auxiliary devices remain inventory because they do not normally
        add general data capacity.
      </p>
      <div className={styles.guideTableScroll} tabIndex={0}>
        <table className={styles.guideTable}>
          <thead><tr><th>Role</th><th>What it does</th><th>General data</th></tr></thead>
          <tbody>
            <tr><td>Spare</td><td>Waits to replace a failed member</td><td>No</td></tr>
            <tr><td>SLOG</td><td>Holds the separate intent log</td><td>No</td></tr>
            <tr><td>L2ARC</td><td>Caches reads</td><td>No</td></tr>
            <tr><td>Special</td><td>Stores selected block classes</td><td>Separate envelope</td></tr>
          </tbody>
        </table>
      </div>

      <h2>Why ashift and block size change RAIDZ capacity</h2>
      <p>
        <code>ashift</code> sets the physical allocation sector size. <code>recordsize</code> applies
        to filesystems, while <code>volblocksize</code> applies to zvols. RAIDZ divides each selected
        logical block into sectors, adds parity, and rounds the allocation. Smaller blocks can
        therefore use a different proportion of the pool. The result models every block at the one
        size you select, not the varied block mix of a real workload. See the
        <a href="https://openzfs.github.io/openzfs-docs/Basic%20Concepts/Pool%20Structure/RAIDZ.html"> OpenZFS RAIDZ allocation guide</a>.
      </p>

      <h2>Slop and planning headroom are different</h2>
      <p>
        Slop is capacity OpenZFS keeps unavailable for normal allocation so important operations
        can continue near a full pool. The default model uses a 1/32 shift with the documented
        floor and cap. Planning headroom is the extra percentage you choose not to fill. It changes
        the planning target, not estimated writable capacity. The
        <a href="https://openzfs.github.io/openzfs-docs/Performance%20and%20Tuning/Module%20Parameters.html#spa-slop-shift"> OpenZFS module parameter reference</a>
        describes the slop setting.
      </p>

      <h2>Why an installed pool can show less free space</h2>
      <p>
        This is a fresh-pool planning estimate, not a promise for <code>zpool list</code>,
        <code>zfs list</code>, TrueNAS, or another appliance. Partitioning, labels, metadata,
        fragmentation, snapshots, reservations, real block sizes, and allocation history can all
        change reported space. Previously expanded RAIDZ vdevs also keep historical allocation
        behavior. Use the generated <code>zpool create -n</code> command as a review aid only, then
        trust the values reported by the real pool after creation.
      </p>
    </article>
  );
}
