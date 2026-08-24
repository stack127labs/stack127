import { proseClassName, proseFlowClassName } from "../../../prose";
import styles from "./ceph-capacity-calculator.module.css";

export function CephCapacityGuide() {
  return (
    <article className={`${styles.guide} ${proseClassName} ${proseFlowClassName}`}>
      <h2>Replicated and EC use different capacity ratios</h2>
      <p>
        Replication models one data copy divided by the replica size. Erasure coding models the
        data chunk count divided by the total chunk count. The planner also checks the distinct
        failure domains needed by the selected profile.
      </p>
      <div className={styles.guideTableScroll} tabIndex={0}>
        <table className={styles.guideTable}>
          <thead>
            <tr>
              <th scope="col">Mode</th>
              <th scope="col">Capacity ratio</th>
              <th scope="col">Domain check</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th data-label="Mode" scope="row">Replicated</th>
              <td data-label="Capacity ratio"><code>1 / replica size</code></td>
              <td data-label="Domain check">Replica size distinct domains</td>
            </tr>
            <tr>
              <th data-label="Mode" scope="row">Erasure coding</th>
              <td data-label="Capacity ratio"><code>k / (k + m)</code></td>
              <td data-label="Domain check"><code>k + m</code> distinct domains</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>What this model leaves out</h2>
      <p>
        This calculation does not inspect live CRUSH buckets, pool rules, PG counts, <code>min_size</code>,
        object overhead, BlueStore overhead, recovery, IOPS, or actual <code>ceph df</code> output.
        It also does not prove durability after a domain failure. The loss scenario is a planning
        model that removes the largest entered domain and keeps the selected ratio.
      </p>
      <p>
        Reserve is a planning policy, not a Ceph nearfull threshold. Read the
        <a href="https://docs.ceph.com/en/latest/rados/configuration/pool-pg-config-ref/">Ceph pool configuration reference</a>
        when live pool settings affect the question.
      </p>

      <h2>Verify the plan against a real cluster</h2>
      <p>
        Compare the entered batches with the real OSD and CRUSH hierarchy before acting on the
        estimate. Check the pool rule and profile as well as the capacity view.
      </p>
      <ul>
        <li><code>ceph osd tree</code> and <code>ceph osd crush tree</code> show the actual hierarchy.</li>
        <li><code>ceph osd pool get &lt;pool&gt; size</code> and <code>min_size</code> show pool policy.</li>
        <li><code>ceph osd erasure-code-profile get &lt;profile&gt;</code> shows live EC settings.</li>
        <li><code>ceph df</code> shows the cluster view after deployment.</li>
      </ul>
      <p>
        See the <a href="https://docs.ceph.com/en/latest/rados/operations/crush-map/">Ceph CRUSH map documentation</a>
        and <a href="https://docs.ceph.com/en/latest/rados/operations/erasure-code-profile/">EC profile documentation</a>.
        For adjacent storage planning, return to <a href="/storage-tools">storage tools</a> or compare a
        <a href="/zfs-capacity-calculator">ZFS capacity calculator</a>.
      </p>

      <h2>Sharing keeps the calculation explicit</h2>
      <p>
        Calculation stays in your browser, and the tool makes no calculation request. Share is
        explicit: it puts normalized inputs in a versioned URL. Anyone with that URL can read the
        entered inventory labels and capacities.
      </p>
    </article>
  );
}
