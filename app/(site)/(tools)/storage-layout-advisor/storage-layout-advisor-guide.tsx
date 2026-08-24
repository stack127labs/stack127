import { proseClassName, proseFlowClassName } from "../../../prose";
import styles from "./storage-layout-advisor.module.css";

export function StorageLayoutAdvisorGuide() {
  return (
    <article className={`${styles.guide} ${proseClassName} ${proseFlowClassName}`}>
      <h2>Choose inputs that represent the array</h2>
      <p>
        Use the actual member drives you are planning to place in one array or pool. Keep mixed
        sizes in the order you expect to group them, because the striped-mirror model pairs rows
        in entered order and reports any capacity that cannot be used. Keep TB and TiB distinct:
        they represent different byte quantities even when the label looks similar.
      </p>
      <p>
        Set the protected-failure target from the recovery plan you need to satisfy, then use the
        workload choice as a stated tradeoff preference. It changes the fit rubric and ranking,
        not the byte arithmetic, failure tolerance, or a forecast of speed.
      </p>

      <h2>Read the answer as a bounded layout model</h2>
      <p>
        Every eligible row starts with the raw bytes in the inventory and accounts separately for
        usable space, redundancy, and mixed-size mismatch. Those terms reconcile exactly for the
        modeled layout. The topology shows the group or vdev boundary that makes a nominal failure
        tolerance meaningful.
      </p>
      <p>
        “Best fit” means the selected target and workload rubric produced the highest-ranked
        eligible tradeoff. It is not a universal safety, performance, backup, or health guarantee.
        The model does not inspect partitions, filesystem metadata, snapshots, compression,
        allocation history, rebuild behavior, or live expansion support.
      </p>

      <h2>Verify the platform before building</h2>
      <p>
        Before creating storage, check the running platform's supported layout names, minimum
        width, failure boundary, expansion path, and recovery procedure. Compare the result with
        the <a href="https://docs.kernel.org/admin-guide/md.html">Linux MD documentation</a> or
        the OpenZFS <a href="https://openzfs.github.io/openzfs-docs/Basic%20Concepts/Pool%20Structure/RAIDZ.html">RAIDZ</a>
        and <a href="https://openzfs.github.io/openzfs-docs/Basic%20Concepts/Pool%20Structure/VDEVs.html">vdev</a>
        references before treating a layout label as equivalent on your system.
      </p>
      <p>
        Calculation stays in this browser and the tool does not write inputs to local storage or
        send them to an upstream calculator. Sharing is explicit: it places the normalized choices
        in the URL, so anyone with that link can read them. For the next check, use the{" "}
        <a href="/zfs-capacity-calculator">ZFS capacity calculator</a> for a detailed ZFS model or
        the <a href="/raidz-expansion-planner">RAIDZ expansion planner</a> for a separate expansion
        question.
      </p>
    </article>
  );
}
